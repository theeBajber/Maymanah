import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { UserRole } from "@prisma/client";
import { logAuditEvent } from "@/lib/audit";
import { headers } from "next/headers";

export const { handlers, auth, signIn, signOut } = NextAuth({
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

        await prisma.loginSession.create({
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
});
