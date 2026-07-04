const API_KEY = process.env.AI_API_KEY;
const BASE_URL = process.env.AI_BASE_URL || "https://api.groq.com/openai/v1";
const MODEL = process.env.AI_MODEL || "llama-3.3-70b-versatile";

export type ParsedLesson = {
  title: string;
  content: string;
};

export type QuizQuestion = {
  questionText: string;
  marks: number;
  options: { text: string; isCorrect: boolean }[];
  explanation: string;
};

function getClient() {
  if (!API_KEY) {
    throw new Error(
      "AI_API_KEY not configured. Set it in .env or use a Groq/OpenAI-compatible key.",
    );
  }
  return { apiKey: API_KEY, baseUrl: BASE_URL, model: MODEL };
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function callAI(
  systemPrompt: string,
  userMessage: string,
  maxTokens?: number,
  retries = 3,
): Promise<string> {
  const { apiKey, baseUrl, model } = getClient();

  const body: Record<string, unknown> = {
    model,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userMessage },
    ],
    temperature: 0.3,
    response_format: { type: "json_object" },
  };

  if (maxTokens) {
    body.max_tokens = maxTokens;
  }

  for (let attempt = 1; attempt <= retries + 1; attempt++) {
    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      const data = await res.json();
      return data.choices[0].message.content;
    }

    if (res.status === 429 && attempt <= retries) {
      const wait = Math.min((attempt * 30) + Math.random() * 5, 120);
      console.warn(
        `AI rate limited. Retrying in ${wait.toFixed(0)}s (attempt ${attempt}/${retries})`,
      );
      await sleep(wait * 1000);
      continue;
    }

    const err = await res.text();
    throw new Error(`AI API error (${res.status}): ${err}`);
  }

  throw new Error("AI API request failed after all retries");
}

const splitSystemPrompt = `You analyze a textbook. Identify ONLY actual lesson/chapter sections with educational content.

SKIP these non-content sections entirely: table of contents, foreword, preface, glossary, bibliography, references, index, appendices, copyright page, title page, blank pages, acknowledgments.

For each real lesson return a descriptive title. Aim for 3-12 lessons. If very short, return 1 lesson.

Return JSON: {"lessons":[{"title":"Lesson title"}]}`;

const quizSystemPrompt = `You are an educational assessment creator. Generate multiple-choice quiz questions based on the provided lesson content.

Return a JSON object with this exact structure:
{
  "questions": [
    {
      "questionText": "The question text",
      "options": [
        { "text": "Option A", "isCorrect": false },
        { "text": "Option B", "isCorrect": true },
        { "text": "Option C", "isCorrect": false },
        { "text": "Option D", "isCorrect": false }
      ],
      "marks": 1,
      "explanation": "Brief explanation of why the correct answer is right"
    }
  ]
}

Guidelines:
- Questions should test understanding, not just verbatim recall
- Each question must have exactly 4 options with exactly one correct
- Mix difficulty levels (some easy, some challenging)
- Generate exactly 5 questions per lesson
- Make distractors plausible but incorrect
- Keep question text concise
- Explanation should reference specific content from the lesson`;

function splitTextAtTitles(
  fullText: string,
  titles: string[],
): ParsedLesson[] {
  if (titles.length === 0) {
    return [{ title: "Lesson", content: fullText.trim() }];
  }

  type SplitEntry = ParsedLesson & { end: number };
  const results: SplitEntry[] = [];

  for (let i = 0; i < titles.length; i++) {
    const title = titles[i];
    const fromPos = i === 0 ? 0 : results[results.length - 1].end;
    const remaining = fullText.slice(fromPos);
    const lower = remaining.toLowerCase();
    let titleIndex = lower.indexOf(title.toLowerCase());

    if (titleIndex === -1) {
      continue;
    }

    const contentStart = titleIndex + title.length;
    const absContentStart = fromPos + contentStart;

    if (i < titles.length - 1) {
      const nextTitle = titles[i + 1];
      let nextIndex = remaining
        .toLowerCase()
        .indexOf(nextTitle.toLowerCase(), contentStart);

      if (nextIndex !== -1 && nextIndex - contentStart < 80) {
        const later = remaining.toLowerCase().indexOf(nextTitle.toLowerCase(), nextIndex + 1);
        if (later !== -1) nextIndex = later;
      }

      const endPos = nextIndex !== -1
        ? fromPos + nextIndex
        : fullText.length;

      results.push({
        title,
        content: fullText.slice(absContentStart, endPos).trim(),
        end: endPos,
      });
    } else {
      results.push({
        title,
        content: fullText.slice(absContentStart).trim(),
        end: fullText.length,
      });
    }
  }

  if (results.length === 0) {
    return [{ title: "Lesson", content: fullText.trim() }];
  }

  return results.map(({ title, content }) => ({ title, content }));
}

export async function splitDocumentIntoLessons(
  text: string,
): Promise<ParsedLesson[]> {
  const maxChars = 25000;
  const truncated = text.length > maxChars
    ? text.slice(0, maxChars) + "\n\n[Content truncated.]"
    : text;

  const enoughForSplit = truncated.trim().length > 500;

  if (!enoughForSplit) {
    return [{ title: "Lesson", content: truncated.trim() }];
  }

  const raw = await callAI(splitSystemPrompt, truncated, 512);
  const parsed = JSON.parse(raw);
  const titlesRaw = parsed.lessons;

  if (!Array.isArray(titlesRaw) || titlesRaw.length === 0) {
    return [{ title: "Lesson", content: truncated.trim() }];
  }

  const titles: string[] = titlesRaw.map(
    (l: { title?: string }) => l.title || "Untitled",
  );

  const lessons = splitTextAtTitles(truncated, titles);

  return lessons.filter((l) => l.content.length > 0);
}

const cleanAndQuizSystemPrompt = `You edit textbook content and create MCQ quizzes. Do TWO things:

1. CLEAN & STRUCTURE as HTML:
   - Remove all non-content noise: page numbers, headers/footers, TOC entries, glossary terms, bibliography/index entries, copyright lines
   - Use <h2>, <p>, <strong>, <ul>/<ol>, <br> tags. Wrap in <div>.
   - Keep all educational material — do not summarize.

2. GENERATE exactly 5 MCQ questions based ONLY on this lesson:
   - 4 options each, exactly 1 correct
   - Mix easy and challenging
   - Plausible distractors

Return JSON:
{
  "content": "<h2>Title</h2><p>...</p>",
  "questions": [
    {
      "questionText": "Question?",
      "options": [{"text":"Option","isCorrect":false}],
      "marks": 1,
      "explanation": "Why correct"
    }
  ]
}`;

export async function cleanAndGenerateQuiz(
  lessonTitle: string,
  rawContent: string,
): Promise<{ content: string; questions: QuizQuestion[] }> {
  const maxChars = 10000;
  const truncated = rawContent.length > maxChars
    ? rawContent.slice(0, maxChars) + "\n\n[Content truncated.]"
    : rawContent;

  if (truncated.trim().length < 200) {
    return {
      content: `<h2>${lessonTitle}</h2><p>${truncated.trim()}</p>`,
      questions: [],
    };
  }

  const userMessage = `Lesson title: ${lessonTitle}\n\nRaw content:\n${truncated}`;

  const raw = await callAI(cleanAndQuizSystemPrompt, userMessage, 2048);
  const parsed = JSON.parse(raw);

  const content = parsed.content || `<h2>${lessonTitle}</h2><p>${truncated.trim()}</p>`;

  const questions = Array.isArray(parsed.questions) ? parsed.questions : [];

  return {
    content,
    questions: questions.map(
      (q: {
        questionText?: string;
        marks?: number;
        options?: { text?: string; isCorrect?: boolean }[];
        explanation?: string;
      }) => ({
        questionText: q.questionText || "Untitled question",
        marks: q.marks || 1,
        options: (q.options || []).map((o) => ({
          text: o.text || "",
          isCorrect: o.isCorrect || false,
        })),
        explanation: q.explanation || "",
      }),
    ),
  };
}
