import { DefaultSession } from "next-auth";
import { UserRole } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole;
      gender?: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    role: UserRole;
    gender?: string | null;
    loginSessionId?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: UserRole;
    gender?: string | null;
    loginSessionId?: string;
  }
}
