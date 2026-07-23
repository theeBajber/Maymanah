import NextAuth, { type Session } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma, isNeonColdStart, reconnectPrisma } from "@/lib/prisma";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { UserRole } from "@prisma/client";
import { logAuditEvent } from "@/lib/audit";
import { headers } from "next/headers";

const { handlers: _handlers, auth: _auth, signIn: _signIn, signOut: _signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt", maxAge: 7 * 24 * 60 * 60 },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        otpCode: { label: "2FA Code", type: "text" },
      },
      authorize: async (credentials) => {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user || !user.password) {
          await logAuditEvent({
            action: "LOGIN_FAILED",
            email: credentials.email as string,
          });
          return null;
        }

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.password,
        );

        if (!isValid) {
          await logAuditEvent({
            action: "LOGIN_FAILED",
            email: credentials.email as string,
          });
          return null;
        }

        if (!user.emailVerified) {
          return null;
        }

        if (user.twoFactorEnabled) {
          const otpCode = credentials.otpCode as string | undefined;
          if (!otpCode) {
            return null;
          }

          const otpRecord = await prisma.twoFactorOTP.findFirst({
            where: {
              userId: user.id,
              usedAt: null,
              expiresAt: { gte: new Date() },
            },
            orderBy: { createdAt: "desc" },
          });

          if (!otpRecord) {
            return null;
          }

          const isValidOTP = await bcrypt.compare(otpCode, otpRecord.code);
          if (!isValidOTP) {
            return null;
          }

          await prisma.twoFactorOTP.update({
            where: { id: otpRecord.id },
            data: { usedAt: new Date() },
          });
        }

        await logAuditEvent({
          action: "LOGIN_SUCCESS",
          userId: user.id,
          email: user.email,
        });

        const headerStore = await headers();
        const ip = headerStore.get("x-forwarded-for")?.split(",")[0]?.trim()
          ?? headerStore.get("x-real-ip")
          ?? "unknown";
        const userAgent = headerStore.get("user-agent") ?? "unknown";

        const loginSession = await prisma.loginSession.create({
          data: {
            userId: user.id,
            deviceName: userAgent,
            ipAddress: ip,
          },
        });

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
          gender: user.gender,
          loginSessionId: loginSession.id,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user, trigger, session: updateData }) {
      if (user) {
        token.id = user.id!;
        token.role = user.role;
        token.gender = user.gender;
        token.loginSessionId = user.loginSessionId;
      }
      if (trigger === "update" && updateData) {
        if (updateData.name) token.name = updateData.name;
        if (updateData.image) token.picture = updateData.image;
        if (updateData.gender) token.gender = updateData.gender;
      }
      return token;
    },
    session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
        session.user.gender = token.gender as string | undefined;
      }
      return session;
    },
  },
  events: {
    async signOut(message) {
      const token = "token" in message ? message.token : null;
      if (!token?.loginSessionId) return;
      await prisma.loginSession.updateMany({
        where: { id: token.loginSessionId, isActive: true },
        data: { isActive: false },
      }).catch(() => {});
    },
  },
});

async function authWithRetry(): Promise<Session | null> {
  try {
    return await _auth();
  } catch (err: unknown) {
    if (!isNeonColdStart(err)) throw err;
    await reconnectPrisma();
    return _auth();
  }
}

export const handlers = _handlers;
export const auth = authWithRetry as () => Promise<Session | null>;
export const signIn = _signIn;
export const signOut = _signOut;
