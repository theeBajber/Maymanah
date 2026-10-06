"use server";

import { redirect } from "next/navigation";

import { signOut } from "@/lib/auth";

/**
 * Ends the current session.
 *
 * Revoking the device happens in the sign-out event, so a sign-out that arrives
 * through any route revokes the same way.
 */
export async function signOutAction(): Promise<void> {
  await signOut({ redirectTo: "/" });
  redirect("/");
}