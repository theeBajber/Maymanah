import "server-only";

import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@prisma/client";
import { neonConfig } from "@neondatabase/serverless";
import ws from "ws";

import { env } from "./env";

// The Neon driver opens its connection over a WebSocket when running on Node,
// and `ws` supplies the implementation. Without this the driver has no way to
// open a socket outside an edge runtime.
neonConfig.webSocketConstructor = ws;

/**
 * Cached on `globalThis` outside production so that hot module replacement in
 * development does not construct a new pool on every edit. Without this, each
 * reload leaks a connection pool until the database refuses new clients.
 */
const globalForDb = globalThis as unknown as { db?: PrismaClient };

function createDb(): PrismaClient {
  const adapter = new PrismaNeon({ connectionString: env().DATABASE_URL });
  return new PrismaClient({ adapter });
}

export const db: PrismaClient = globalForDb.db ?? createDb();

if (env().NODE_ENV !== "production") {
  globalForDb.db = db;
}
