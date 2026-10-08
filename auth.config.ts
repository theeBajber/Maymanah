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
    jwt({ token, user, trigger, session: updated }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.gender = user.gender;
        token.loginSessionId = user.loginSessionId;
      }
      // A profile save refreshes the session so the new name, picture, and
      // gender reach every page without signing in again.
      if (trigger === "update" && updated) {
        if (typeof updated.name === "string") token.name = updated.name;
        if (typeof updated.image === "string") token.picture = updated.image;
        if (typeof updated.gender === "string") token.gender = updated.gender;
      }
      return token;
    },
    session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as "STUDENT" | "TEACHER" | "ADMIN";
        session.user.gender = token.gender as string | undefined;
        session.user.loginSessionId = token.loginSessionId as string | undefined;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;