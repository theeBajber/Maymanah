"use client";

import { signOut } from "next-auth/react";

import { Button } from "@/app/ui/button";

export function SignOutButton() {
  return (
    <Button variant="ghost" size="md" onClick={() => signOut({ redirect: true, redirectTo: "/login" })}>
      Sign out
    </Button>
  );
}
