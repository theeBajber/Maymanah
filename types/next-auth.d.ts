import type { DefaultSession } from "next-auth";

/**
 * Adds the fields the application puts on a session.
 *
 * The session type is extended rather than cast at each use, so a place that
 * reads `session.user.role` is type checked against what the callbacks actually
 * assign.
 */
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "STUDENT" | "TEACHER" | "ADMIN";
      loginSessionId?: string;
    } & DefaultSession["user"];
  }

  /** What a credentials provider returns once a sign-in has been verified. */
  interface User {
    role: "STUDENT" | "TEACHER" | "ADMIN";
    /** Identifies the device row, so it can be revoked server-side. */
    loginSessionId?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: "STUDENT" | "TEACHER" | "ADMIN";
    loginSessionId?: string;
  }
}

export {};