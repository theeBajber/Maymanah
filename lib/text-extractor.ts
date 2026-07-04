import PDFParser from "pdf2json";
import mammoth from "mammoth";
import { execSync } from "child_process";
import { writeFile, unlink } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";

function isMostlyNoise(text: string): boolean {
  if (!text || text.length < 20) return true;

  const printable = text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, "").trim();
  const ratio = printable.length / text.length;

  return ratio < 0.3 || printable.split(/\s+/).filter(Boolean).length < 5;
}

function extractTextFromPages(data: {
  Pages?: Array<{
    Texts?: Array<{
      R?: Array<{ T?: string }>;
    }>;
  }>;
}): string {
  if (!data?.Pages) return "";

  const lines: string[] = [];

  for (const page of data.Pages) {
    if (!page.Texts) continue;

    const sorted = [...page.Texts].sort((a, b) => {
      const ay = (a as unknown as { y?: number }).y ?? 0;
      const by = (b as unknown as { y?: number }).y ?? 0;
      return ay - by;
    });

    let pageText = "";
    let lastY: number | null = null;

    for (const textBlock of sorted) {
      const fragments = (textBlock.R || [])
        .map((r) => {
          try {
            return r.T ? decodeURIComponent(r.T) : "";
          } catch {
            return r.T || "";
          }
        })
        .join("");

      if (!fragments.trim()) continue;

      const y = (textBlock as unknown as { y?: number }).y ?? 0;
      if (lastY !== null && Math.abs(y - lastY) > 5) {
        pageText += "\n";
      }

      pageText += fragments;
      lastY = y;
    }

    lines.push(pageText.trim());
  }

  return lines.filter((l) => l.length > 0).join("\n\n");
}

async function extractWithPdf2Json(buffer: Buffer): Promise<string | null> {
  return new Promise<string | null>((resolve) => {
    const parser = new PDFParser(null, true);

    const timeout = setTimeout(() => {
      parser.destroy();
      resolve(null);
    }, 15000);

    parser.on("pdfParser_dataError", () => {
      clearTimeout(timeout);
      parser.destroy();
      resolve(null);
    });

    parser.on("pdfParser_dataReady", (data) => {
      clearTimeout(timeout);
      const text = extractTextFromPages(data);
      parser.destroy();
      resolve(text || null);
    });

    parser.parseBuffer(buffer);
  });
}

async function extractWithPdftotext(buffer: Buffer): Promise<string | null> {
  const tmpPath = join(tmpdir(), `maymanah-import-${Date.now()}.pdf`);
  try {
    await writeFile(tmpPath, buffer);
    const result = execSync(
      `/sbin/pdftotext -layout "${tmpPath}" - 2>/dev/null`,
      { encoding: "utf-8", maxBuffer: 50 * 1024 * 1024, timeout: 30000 },
    );
    return result || null;
  } catch {
    return null;
  } finally {
    try {
      await unlink(tmpPath);
    } catch {}
  }
}

export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  let text = await extractWithPdftotext(buffer);

  if (text && !isMostlyNoise(text)) {
    return text;
  }

  if (!text || isMostlyNoise(text)) {
    text = await extractWithPdf2Json(buffer);
  }

  if (!text || isMostlyNoise(text)) {
    throw new Error(
      "This PDF appears to be a scanned document or image-based file with no selectable text. " +
        "Please upload a PDF with an embedded text layer, or use a DOCX/TXT file instead.",
    );
  }

  return text;
}

export async function extractTextFromDOCX(buffer: Buffer): Promise<string> {
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
}

export function extractTextFromTXT(buffer: Buffer): string {
  return new TextDecoder().decode(buffer);
}

export async function extractTextFromFile(
  buffer: Buffer,
  filename: string,
): Promise<string> {
  const ext = filename.split(".").pop()?.toLowerCase();

  switch (ext) {
    case "pdf":
      return extractTextFromPDF(buffer);
    case "docx":
      return extractTextFromDOCX(buffer);
    case "txt":
    case "md":
      return extractTextFromTXT(buffer);
    default:
      throw new Error(
        `Unsupported file type: .${ext}. Accepted: PDF, DOCX, TXT`,
      );
  }
}
