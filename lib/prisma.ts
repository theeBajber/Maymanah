import { PrismaClient } from "@prisma/client";
import { neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import ws from "ws";

neonConfig.webSocketConstructor = ws;

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  adapter?: PrismaNeon;
};

function createAdapter() {
  return new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
}

function createClient() {
  const adapter = createAdapter();
  globalForPrisma.adapter = adapter;
  return new PrismaClient({ adapter });
}

export function isNeonColdStart(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return /closed the connection|connection.*terminated|ECONNREFUSED|ConnectionClosed|clientVersion/i.test(msg);
}

export async function reconnectPrisma() {
  try { await prisma.$disconnect(); } catch {}
  const newClient = createClient();
  try { await newClient.$connect(); } catch {}
  prisma = newClient;
  globalForPrisma.prisma = newClient;
}

export let prisma: PrismaClient = globalForPrisma.prisma || createClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export async function safeQuery<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (err: unknown) {
    if (!isNeonColdStart(err)) throw err;
    await reconnectPrisma();
    return await fn();
  }
}

export async function withRetry<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (err: unknown) {
    if (!isNeonColdStart(err)) throw err;
    await reconnectPrisma();
    return await fn();
  }
}
