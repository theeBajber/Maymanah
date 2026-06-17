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

export let prisma: PrismaClient = globalForPrisma.prisma || createClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

async function createNewClient() {
  const client = createClient();
  try {
    await client.$connect();
  } catch {
    // Neon might still be waking up; don't throw here
  }
  return client;
}

export async function safeQuery<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (
      /closed the connection|connection.*terminated|ECONNREFUSED|ConnectionClosed/i.test(
        msg,
      )
    ) {
      // Clean up old client
      try {
        await prisma.$disconnect();
      } catch {}

      // Create fresh client with fresh adapter
      const newClient = await createNewClient();
      prisma = newClient;
      globalForPrisma.prisma = newClient;

      return await fn();
    }
    throw err;
  }
}
