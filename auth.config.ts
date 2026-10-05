import type { NextAuthConfig } from "next-auth";

/**
 * Session configuration that does not depend on the database.
 *
 * Kept apart from the provider setup so that request interception can read and
 * verify a session cookie without pulling in the database client, password
 * hashing or the mail transport. Bundling those into the proxy would make every
 * matched request heavier than it needs to be.
 */

export const SESSION_MAX_AGE_SECONDS = 7 * 24 * 60 * 60;

export const authConfig = {
  session: {
    strategy: "jwt",
    maxAge: SESSION_MAX_AGE_SECONDS,
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  // Providers are added where the database is available. This file is imported
  // by request interception, which has no use for them.
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.loginSessionId = user.loginSessionId;
      }
      return token;
    },
    session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as "STUDENT" | "TEACHER" | "ADMIN";
        session.user.loginSessionId = token.loginSessionId as string | undefined;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;