/**
 * Repairs quizzes saved before the answer index was stored.
 *
 * Every admin route used to persist the four options with their ticks but not
 * `correctAnswer`, so `gradeChoice` compared against `null` and marked every
 * answer wrong. The ticks are still in the stored JSON, so most answers can be
 * recovered without touching the question text.
 *
 * Run without flags to see what would change; pass `--apply` to write it.
 *
 *   pnpm quiz:repair
 *   pnpm quiz:repair --apply
 */
import "dotenv/config";

import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@prisma/client";
import { neonConfig } from "@neondatabase/serverless";
import ws from "ws";

import {
  correctAnswerFromStored,
  storedOptionTexts,
} from "../lib/question-options";

neonConfig.webSocketConstructor = ws;

const apply = process.argv.includes("--apply");

const db = new PrismaClient({
  adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL }),
});

/** A pass mark this low only ever came from storing a raw score. */
const RAW_PASS_MARK_CEILING = 10;

async function main(): Promise<void> {
  const [questions, exams] = await Promise.all([
    db.question.findMany({
      select: {
        id: true,
        questionText: true,
        options: true,
        correctAnswer: true,
        exam: { select: { title: true, course: { select: { title: true } } } },
      },
    }),
    db.exam.findMany({
      select: {
        id: true,
        title: true,
        examType: true,
        passMark: true,
        totalMarks: true,
        course: { select: { title: true } },
        questions: { select: { marks: true } },
      },
    }),
  ]);

  const recoverable: { id: string; answer: string; options: { text: string }[] }[] = [];
  const unrecoverable: typeof questions = [];
  let alreadyCorrect = 0;

  for (const question of questions) {
    const answer = correctAnswerFromStored(question.options, question.correctAnswer);
    if (answer === null) {
      unrecoverable.push(question);
      continue;
    }

    const options = storedOptionTexts(question.options);
    const hasMarkers = Array.isArray(question.options)
      ? question.options.some(
          (option) => option && typeof option === "object" && "isCorrect" in option,
        )
      : false;

    if (question.correctAnswer === answer && !hasMarkers) {
      alreadyCorrect += 1;
      continue;
    }

    // `answer === question.correctAnswer` still needs a write when a legacy
    // `isCorrect` marker is left behind: the marker is the answer escaping to
    // the browser.
    recoverable.push({ id: question.id, answer, options });
  }

  const examsWithRawMark = exams.filter(
    (exam) =>
      exam.examType === "QUIZ" &&
      exam.passMark > 0 &&
      exam.passMark <= RAW_PASS_MARK_CEILING,
  );

  const wrongTotals = exams.filter(
    (exam) => exam.questions.reduce((sum, question) => sum + question.marks, 0) !== exam.totalMarks,
  );

  console.log(`Questions: ${questions.length}`);
  console.log(`  already correct: ${alreadyCorrect}`);
  console.log(`  recoverable answer: ${recoverable.length}`);
  console.log(`  no single correct option (needs a human): ${unrecoverable.length}`);
  for (const question of unrecoverable) {
    console.log(
      `    - [${question.exam.course.title} / ${question.exam.title}] ${question.questionText}`,
    );
  }

  console.log(`\nQuiz pass marks stored as raw scores (1–${RAW_PASS_MARK_CEILING}): ${examsWithRawMark.length}`);
  for (const exam of examsWithRawMark.slice(0, 8)) {
    console.log(`  - ${exam.course.title} / ${exam.title}: ${exam.passMark}/${exam.totalMarks}`);
  }
  if (examsWithRawMark.length > 8) {
    console.log(`  …and ${examsWithRawMark.length - 8} more`);
  }

  console.log(`\nExams whose total mark does not match their questions: ${wrongTotals.length}`);
  for (const exam of wrongTotals) {
    const sum = exam.questions.reduce((total, question) => total + question.marks, 0);
    console.log(`  - ${exam.course.title} / ${exam.title}: stored ${exam.totalMarks}, questions ${sum}`);
  }

  if (!apply) {
    console.log("\nDry run. Re-run with --apply to write these changes.");
    return;
  }

  for (const question of recoverable) {
    await db.question.update({
      where: { id: question.id },
      data: { correctAnswer: question.answer, options: question.options },
    });
  }

  for (const exam of examsWithRawMark) {
    await db.exam.update({ where: { id: exam.id }, data: { passMark: 60 } });
  }

  for (const exam of wrongTotals) {
    const totalMarks = exam.questions.reduce((sum, question) => sum + question.marks, 0);
    await db.exam.update({ where: { id: exam.id }, data: { totalMarks } });
  }

  console.log(
    `\nApplied: ${recoverable.length} answers, ${examsWithRawMark.length} pass marks, ${wrongTotals.length} totals.`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$disconnect();
  });
