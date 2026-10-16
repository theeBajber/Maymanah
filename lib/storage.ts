import "server-only";

import { put } from "@vercel/blob";

/**
 * Whether object storage is configured.
 *
 * A single predicate rather than scattered environment reads, so every caller
 * degrades the same way when there is nowhere to upload to.
 */
export function isStorageConfigured(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

/**
 * Stores a file where it can be served publicly.
 *
 * Names get a random suffix from the provider, so two uploads never collide
 * even when they arrive with the same filename in the same millisecond.
 */
export async function uploadPublicFile(
  pathname: string,
  data: Blob | File | Buffer,
  contentType?: string,
): Promise<string> {
  if (!isStorageConfigured()) {
    throw new Error("Object storage is not configured. Set BLOB_READ_WRITE_TOKEN to enable uploads.");
  }

  const blob = await put(pathname, data, {
    access: "public",
    contentType,
    addRandomSuffix: true,
  });

  return blob.url;
}
