"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Trophy, XCircle } from "lucide-react";

import { Button } from "@/app/ui/button";
import { Panel } from "@/app/ui/portal";
import { useToast } from "@/app/ui/toast";
import type { Assessment } from "@/lib/assessments";

interface AnswerValue {
  text?: string;
  option?: number;
}

/**
 * The quiz attached to a lesson.
 *
 * Answers are held in the browser and sent in one request when the learner
 * submits, matching how the exam is graded. A completed attempt shows its
 * result instead of an empty form.
 */
export function LessonQuiz({ assessment }: { assessment: Assessment }) {
  const { exam, questions, totalMarks, result } = assessment;
  const router = useRouter();
  const { toast } = useToast();
  const [started, setStarted] = useState(result !== null);
  const [answers, setAnswers] = useState<Record<string, AnswerValue>>({});
  const [currentIdx, setCurrentIdx] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(result !== null);

  if (done && result) {
    return <QuizResult assessment={assessment} result={result} onRetake={() => {
      setDone(false);
      setStarted(true);
      setAnswers({});
      setCurrentIdx(0);
      router.refresh();
    }} />;
  }

  if (!started) {
    return (
      <Panel className="flex flex-col items-center gap-4 p-8 text-center">
        <span className="flex size-16 items-center justify-center rounded-full bg-primary-muted">
          <Trophy className="size-6 text-primary" />
        </span>
        <div>
          <h3 className="text-lg font-bold text-text-primary">{exam.title || "Module Quiz"}</h3>
          <p className="text-sm text-text-secondary">
            {questions.length} {questions.length === 1 ? "question" : "questions"} &middot; {totalMarks} marks
          </p>
        </div>
        <Button onClick={() => setStarted(true)}>Start Quiz</Button>
      </Panel>
    );
  }

  const answeredCount = Object.keys(answers).length;
  const current = questions[currentIdx];
  const currentOptions = current?.options ?? [];

  function choose(questionId: string, value: AnswerValue) {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  }

  async function submit() {
    setSubmitting(true);
    try {
      const payload = {
        answers: questions.map((question) => ({
          questionId: question.id,
          selectedOption: answers[question.id]?.option,
          answerText: answers[question.id]?.text,
        })),
      };
      const response = await fetch(`/api/exams/${exam.id}/submissions`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) {
        toast({ title: body.error ?? "Could not submit your quiz", variant: "error" });
        return;
      }
      toast({ title: "Quiz submitted", variant: "success" });
      setDone(true);
      router.refresh();
    } catch {
      toast({ title: "Could not reach the server", variant: "error" });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Panel className="overflow-hidden">
      <div className="flex items-center justify-between gap-4 border-b border-border p-4">
        <span className="text-sm text-text-secondary">
          {answeredCount}/{questions.length} answered
        </span>
        <div className="h-2 flex-1 rounded-full bg-bg-primary">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${(answeredCount / questions.length) * 100}%` }}
          />
        </div>
        <Button size="sm" loading={submitting} onClick={submit}>
          Submit
        </Button>
      </div>

      <div className="flex flex-wrap gap-1.5 border-b border-border px-4 py-2">
        {questions.map((question, index) => (
          <button
            key={question.id}
            type="button"
            onClick={() => setCurrentIdx(index)}
            className={`size-7 rounded text-xs font-medium transition-colors ${
              index === currentIdx
                ? "bg-primary text-text-inverse"
                : answers[question.id]
                  ? "bg-primary-muted text-primary"
                  : "bg-bg-primary text-text-secondary"
            }`}
          >
            {index + 1}
          </button>
        ))}
      </div>

      {current ? (
        <div className="p-6">
          <p className="mb-4 text-xs text-text-secondary">
            Question {currentIdx + 1} of {questions.length} &middot; {current.marks} {current.marks === 1 ? "mark" : "marks"}
          </p>
          <p className="mb-6 text-lg font-medium text-text-primary">{current.questionText}</p>

          {current.questionType === "MCQ" && currentOptions.length > 0 ? (
            <div className="flex flex-col gap-2">
              {currentOptions.map((option, optionIndex) => {
                const isSelected = answers[current.id]?.option === optionIndex;
                return (
                  <button
                    key={optionIndex}
                    type="button"
                    onClick={() => choose(current.id, { option: optionIndex })}
                    className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all ${
                      isSelected
                        ? "border-primary bg-primary-muted text-primary"
                        : "border-border bg-bg-primary hover:border-primary/40"
                    }`}
                  >
                    <span className={`flex size-5 shrink-0 items-center justify-center rounded-full border-2 ${isSelected ? "border-primary" : "border-text-muted"}`}>
                      {isSelected ? <span className="size-2.5 rounded-full bg-primary" /> : null}
                    </span>
                    <span className="flex-1 text-sm">{option.text}</span>
                  </button>
                );
              })}
            </div>
          ) : (
            <textarea
              value={answers[current.id]?.text ?? ""}
              onChange={(event) => choose(current.id, { text: event.target.value })}
              placeholder={current.questionType === "ESSAY" ? "Write your answer..." : "Type your answer..."}
              className={`w-full resize-y rounded-xl border border-border bg-bg-primary p-4 text-sm focus:border-primary focus:outline-none ${current.questionType === "ESSAY" ? "min-h-[160px]" : "min-h-[100px]"}`}
            />
          )}

          <div className="mt-6 flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              disabled={currentIdx === 0}
              onClick={() => setCurrentIdx((index) => Math.max(0, index - 1))}
            >
              Previous
            </Button>
            <Button
              size="sm"
              disabled={currentIdx === questions.length - 1}
              onClick={() => setCurrentIdx((index) => Math.min(questions.length - 1, index + 1))}
            >
              Next
            </Button>
          </div>
        </div>
      ) : null}
    </Panel>
  );
}

function QuizResult({
  assessment,
  result,
  onRetake,
}: {
  assessment: Assessment;
  result: NonNullable<Assessment["result"]>;
  onRetake: () => void;
}) {
  const { questions, totalMarks } = assessment;
  const graded = result.status === "GRADED";
  const passed = result.passed === true;

  return (
    <Panel className="p-6">
      <div className="mb-6 text-center">
        <span className={`mb-3 inline-flex size-16 items-center justify-center rounded-full ${graded ? (passed ? "bg-night-success/15" : "bg-night-danger/15") : "bg-primary-muted"}`}>
          {graded ? (
            passed ? <Trophy className="size-6 text-night-success" /> : <XCircle className="size-6 text-night-danger" />
          ) : (
            <Trophy className="size-6 text-primary" />
          )}
        </span>
        <h3 className="mb-1 text-xl font-bold text-text-primary">
          {graded ? (passed ? "Passed!" : "Not Quite") : "Awaiting Marking"}
        </h3>
        <p className="text-3xl font-bold">
          <span className={graded ? (passed ? "text-night-success" : "text-night-danger") : "text-text-primary"}>
            {result.totalScore ?? "—"}
          </span>
          <span className="text-text-secondary"> / {totalMarks}</span>
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {questions.map((question, index) => {
          const answer = result.answers.find((row) => row.questionId === question.id);
          const isCorrect = answer?.isCorrect;
          return (
            <div
              key={question.id}
              className={`rounded-lg p-3 ${isCorrect === null || isCorrect === undefined ? "bg-bg-primary" : isCorrect ? "bg-night-success/10" : "bg-night-danger/10"}`}
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-medium text-text-primary">
                  {index + 1}. {question.questionText}
                </p>
                <span className={`shrink-0 text-xs font-bold ${isCorrect ? "text-night-success" : "text-text-secondary"}`}>
                  {answer?.score ?? "—"}/{question.marks}
                </span>
              </div>
              {question.questionType === "MCQ" && answer ? (
                <p className="mt-1 text-xs text-text-secondary">
                  Your answer: {answer.selectedOption !== null ? question.options[answer.selectedOption]?.text ?? "—" : "No answer"}
                </p>
              ) : null}
              {question.questionType !== "MCQ" && answer?.answerText ? (
                <p className="mt-1 text-xs text-text-secondary">Your answer: {answer.answerText}</p>
              ) : null}
            </div>
          );
        })}
      </div>

      <div className="mt-6 text-center">
        <Button onClick={onRetake}>Retake Quiz</Button>
      </div>
    </Panel>
  );
}
