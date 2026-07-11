import { Prisma } from "@prisma/client";
import { prisma, safeQuery } from "@/lib/prisma";

export async function createNotification(input: {
  userId: string;
  type: string;
  title: string;
  body?: string;
  metadata?: Prisma.InputJsonObject;
}) {
  return safeQuery(() =>
    prisma.notification.create({
      data: {
        userId: input.userId,
        type: input.type,
        title: input.title,
        body: input.body,
        metadata: input.metadata ?? {},
      },
    }),
  );
}
