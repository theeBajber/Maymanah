import "server-only";

import mammoth from "mammoth";
import PDFParser from "pdf2json";

/**
 * Turns an uploaded book into lessons.
 *
 * Text extraction is local and deterministic; the language model is used only
 * to find where one lesson ends and the next begins, and to write a short quiz
 * per lesson. Content is produced as markdown, which is what lessons are
 * stored as and rendered from, so nothing here produces markup that would need
 * sanitising.
 */

export type ParsedLesson = { title: string; content: string };

export type QuizQuestion = {
  questionText: string;
  marks: number;
  options: { text: string; isCorrect: boolean }[];
  explanation: string;
};

export type LessonPreview = ParsedLesson & { questions: QuizQuestion[] };

const DEFAULT_BASE_URL = "https://api.groq.com/openai/v1";
const DEFAULT_MODEL = "llama-3.3-70b-versatile";

function aiClient() {
  const apiKey = process.env.AI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "Book import needs an AI key. Set AI_API_KEY, or add the lessons by hand instead.",
    );
  }
  return {
    apiKey,
    baseUrl: process.env.AI_BASE_URL ?? DEFAULT_BASE_URL,
    model: process.env.AI_MODEL ?? DEFAULT_MODEL,
  };
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * One model call, retried on rate limiting.
 *
 * A rate-limited call is worth waiting for rather than failing the whole
 * import partway through, since the caller has already paid the cost of
 * extracting and uploading the book.
 */
async function callAI(systemPrompt: string, userMessage: string, maxTokens?: number): Promise<string> {
  const { apiKey, baseUrl, model } = aiClient();
  const retries = 3;

  const body: Record<string, unknown> = {
    model,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userMessage },
    ],
    temperature: 0.3,
    response_format: { type: "json_object" },
  };
  if (maxTokens) body.max_tokens = maxTokens;

  for (let attempt = 1; attempt <= retries + 1; attempt++) {
    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      const data = (await res.json()) as { choices: { message: { content: string } }[] };
      return data.choices[0].message.content;
    }

    if (res.status === 429 && attempt <= retries) {
      await sleep(Math.min(attempt * 30, 120) * 1000);
      continue;
    }

    throw new Error(`The AI service refused the request (${res.status})`);
  }

  throw new Error("The AI service did not respond after several attempts");
}

// ─── Text extraction ───

function isMostlyNoise(text: string): boolean {
  if (!text || text.length < 20) return true;
  const printable = text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, "").trim();
  return printable.length / text.length < 0.3 || printable.split(/\s+/).filter(Boolean).length < 5;
}

async function extractPdf(buffer: Buffer): Promise<string> {
  const text = await new Promise<string | null>((resolve) => {
    const parser = new PDFParser(null, true);
    const timeout = setTimeout(() => {
      parser.destroy();
      resolve(null);
    }, 30000);

    parser.on("pdfParser_dataError", () => {
      clearTimeout(timeout);
      parser.destroy();
      resolve(null);
    });

    parser.on("pdfParser_dataReady", (data: unknown) => {
      clearTimeout(timeout);
      parser.destroy();
      resolve(rawTextFromPages(data));
    });

    parser.parseBuffer(buffer);
  });

  if (!text || isMostlyNoise(text)) {
    throw new Error(
      "This PDF has no selectable text. It may be a scan or photographs; try a DOCX or TXT file instead.",
    );
  }

  return text;
}

function rawTextFromPages(data: unknown): string {
  const pages = (data as { Pages?: { Texts?: { R?: { T?: string }[]; y?: number }[] }[] }).Pages;
  if (!pages) return "";

  return pages
    .map((page) => {
      const blocks = [...(page.Texts ?? [])].sort((a, b) => (a.y ?? 0) - (b.y ?? 0));
      let pageText = "";
      let lastY: number | null = null;
      for (const block of blocks) {
        const fragment = (block.R ?? [])
          .map((r) => {
            if (!r.T) return "";
            try {
              return decodeURIComponent(r.T);
            } catch {
              return r.T;
            }
          })
          .join("");
        if (!fragment.trim()) continue;
        if (lastY !== null && Math.abs((block.y ?? 0) - lastY) > 5) pageText += "\n";
        pageText += fragment;
        lastY = block.y ?? 0;
      }
      return pageText.trim();
    })
    .filter(Boolean)
    .join("\n\n");
}

export async function extractTextFromFile(buffer: Buffer, filename: string): Promise<string> {
  const ext = filename.split(".").pop()?.toLowerCase();

  switch (ext) {
    case "pdf":
      return extractPdf(buffer);
    case "docx": {
      const result = await mammoth.extractRawText({ buffer });
      return result.value;
    }
    case "txt":
    case "md":
      return new TextDecoder().decode(buffer);
    default:
      throw new Error(`Unsupported file type: .${ext}. Accepted: PDF, DOCX, TXT, MD.`);
  }
}

// ─── Splitting and quiz generation ───

const SPLIT_PROMPT = `You analyse a textbook. Identify ONLY actual lesson or chapter sections with educational content.

SKIP non-content sections entirely: table of contents, foreword, preface, glossary, bibliography, references, index, appendices, copyright page, title page, blank pages, acknowledgments.

For each real lesson return a descriptive title. Aim for 3-12 lessons. If very short, return 1 lesson.

Return JSON: {"lessons":[{"title":"Lesson title"}]}`;

const LESSON_PROMPT = `You edit textbook content and write a multiple-choice quiz. Do two things.

1. Clean and structure the lesson as MARKDOWN, not HTML:
   - Remove non-content noise: page numbers, running headers and footers, table of contents entries, glossary terms, bibliography entries, copyright lines.
   - Use "##" for the lesson heading, ordinary paragraphs, "**" for emphasis, and "-" or "1." for lists.
   - Keep all educational material. Do not summarise it away.

2. Write exactly 5 multiple-choice questions from this lesson only:
   - 4 options each, exactly one correct.
   - Mix easy and challenging; distractors should be plausible.
   - Include a short explanation of why the correct answer is right.

Return JSON:
{
  "content": "## Lesson title\n\nMarkdown body.",
  "questions": [
    { "questionText": "...", "options": [{"text":"...","isCorrect":true}], "marks": 1, "explanation": "..." }
  ]
}`;

/** Finds lesson boundaries by title, or falls back to one whole-lesson split. */
function splitTextAtTitles(fullText: string, titles: string[]): ParsedLesson[] {
  if (titles.length === 0) return [{ title: "Lesson", content: fullText.trim() }];

  type Split = ParsedLesson & { end: number };
  const results: Split[] = [];

  for (let i = 0; i < titles.length; i++) {
    const title = titles[i];
    const fromPos = i === 0 ? 0 : results[results.length - 1].end;
    const remaining = fullText.slice(fromPos);
    const lower = remaining.toLowerCase();
    const titleIndex = lower.indexOf(title.toLowerCase());

    if (titleIndex === -1) continue;

    const contentStart = titleIndex + title.length;
    const absContentStart = fromPos + contentStart;

    if (i < titles.length - 1) {
      let nextIndex = remaining.toLowerCase().indexOf(titles[i + 1].toLowerCase(), contentStart);
      if (nextIndex !== -1 && nextIndex - contentStart < 80) {
        const later = remaining.toLowerCase().indexOf(titles[i + 1].toLowerCase(), nextIndex + 1);
        if (later !== -1) nextIndex = later;
      }
      const endPos = nextIndex !== -1 ? fromPos + nextIndex : fullText.length;
      results.push({ title, content: fullText.slice(absContentStart, endPos).trim(), end: endPos });
    } else {
      results.push({ title, content: fullText.slice(absContentStart).trim(), end: fullText.length });
    }
  }

  if (results.length === 0) return [{ title: "Lesson", content: fullText.trim() }];
  return results.map(({ title, content }) => ({ title, content }));
}

async function splitIntoLessons(text: string): Promise<ParsedLesson[]> {
  const truncated = text.length > 25000 ? `${text.slice(0, 25000)}\n\n[Content truncated.]` : text;

  if (truncated.trim().length <= 500) return [{ title: "Lesson", content: truncated.trim() }];

  const raw = await callAI(SPLIT_PROMPT, truncated, 512);
  const parsed = JSON.parse(raw) as { lessons?: { title?: string }[] };
  const titles = (parsed.lessons ?? []).map((l) => l.title || "Untitled");

  if (titles.length === 0) return [{ title: "Lesson", content: truncated.trim() }];

  return splitTextAtTitles(truncated, titles).filter((l) => l.content.length > 0);
}

async function cleanAndQuiz(
  lessonTitle: string,
  rawContent: string,
): Promise<{ content: string; questions: QuizQuestion[] }> {
  const truncated = rawContent.length > 10000 ? `${rawContent.slice(0, 10000)}\n\n[Content truncated.]` : rawContent;

  if (truncated.trim().length < 200) {
    return { content: `## ${lessonTitle}\n\n${truncated.trim()}`, questions: [] };
  }

  const raw = await callAI(LESSON_PROMPT, `Lesson title: ${lessonTitle}\n\nRaw content:\n${truncated}`, 2048);
  const parsed = JSON.parse(raw) as {
    content?: string;
    questions?: {
      questionText?: string;
      marks?: number;
      options?: { text?: string; isCorrect?: boolean }[];
      explanation?: string;
    }[];
  };

  return {
    content: parsed.content || `## ${lessonTitle}\n\n${truncated.trim()}`,
    questions: (parsed.questions ?? []).map((q) => ({
      questionText: q.questionText || "Untitled question",
      marks: q.marks || 1,
      options: (q.options ?? []).map((o) => ({ text: o.text || "", isCorrect: o.isCorrect || false })),
      explanation: q.explanation || "",
    })),
  };
}

/** Extracts a book and returns the lessons it holds, awaiting confirmation. */
export async function parseCourseBook(buffer: Buffer, filename: string): Promise<LessonPreview[]> {
  const text = await extractTextFromFile(buffer, filename);
  if (!text.trim()) throw new Error("No text could be extracted from this file. It may be empty or scanned.");

  const lessons = await splitIntoLessons(text);

  const withQuizzes: LessonPreview[] = [];
  for (const lesson of lessons) {
    const result = await cleanAndQuiz(lesson.title, lesson.content);
    withQuizzes.push({ title: lesson.title, content: result.content, questions: result.questions });
  }

  return withQuizzes;
}
