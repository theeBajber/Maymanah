"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Trophy, XCircle } from "lucide-react";

type QuizOption = { text: string; isCorrect?: boolean };

type QuestionData = {
  id: string;
  questionText: string;
  questionType: string;
  options: Array<Record<string, unknown>> | null;
  marks: number;
  orderIndex: number;
};

function getOptions(options: QuestionData["options"]): QuizOption[] {
  if (!Array.isArray(options)) return [];

  const normalized: QuizOption[] = [];
  for (const option of options) {
    const text = option.text;
    if (typeof text !== "string") continue;

    const normalizedOption: QuizOption = { text };
    if (typeof option.isCorrect === "boolean") {
      normalizedOption.isCorrect = option.isCorrect;
    }
    normalized.push(normalizedOption);
  }

  return normalized;
}

type AnswerData = {
  id: string;
  questionId: string;
  answerText: string | null;
  selectedOption: number | null;
  isCorrect: boolean | null;
  score: number | null;
};

type SubmissionData = {
  id: string;
  status: string;
  totalScore: number | null;
  answers: AnswerData[];
} | null;

type ResultAnswer = AnswerData & { questionId: string };

export function LessonQuiz({
  exam,
  questions,
  submission,
}: {
  exam: { id: string; title: string; durationMinutes: number; totalMarks: number; passMark: number };
  questions: QuestionData[];
  submission: SubmissionData;
}) {
  const router = useRouter();
  const [started, setStarted] = useState(submission?.status === "IN_PROGRESS");
  const [submissionId, setSubmissionId] = useState<string | null>(
    submission?.status === "IN_PROGRESS" ? submission.id : null,
  );
  const [answers, setAnswers] = useState<Record<string, { text?: string; option?: number }>>(() => {
    const initial: Record<string, { text?: string; option?: number }> = {};
    if (submission?.answers) {
      for (const a of submission.answers) {
        initial[a.questionId] = { text: a.answerText ?? undefined, option: a.selectedOption ?? undefined };
      }
    }
    return initial;
  });
  const [currentIdx, setCurrentIdx] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(submission?.status === "GRADED" || submission?.status === "SUBMITTED");
  const [result, setResult] = useState<{
    totalScore: number;
    totalMarks: number;
    passed: boolean;
    answers: ResultAnswer[];
  } | null>(
    submission?.status === "GRADED"
      ? {
          totalScore: submission.totalScore ?? 0,
          totalMarks: questions.reduce((s, q) => s + q.marks, 0),
          passed: (submission.totalScore ?? 0) >= exam.passMark,
          answers: submission.answers,
        }
      : null,
  );

  const saveAnswer = useCallback(async (questionId: string, data: { answerText?: string; selectedOption?: number }) => {
    if (!submissionId) return;
    try {
      await fetch(`/api/exams/submissions/${submissionId}/answers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId, ...data }),
      });
    } catch {}
  }, [submissionId]);

  const handleAnswer = async (questionId: string, data: { answerText?: string; selectedOption?: number }) => {
    setAnswers((prev) => ({ ...prev, [questionId]: { text: data.answerText, option: data.selectedOption } }));
    if (submissionId) await saveAnswer(questionId, data);
  };

  const startQuiz = async () => {
    try {
      const res = await fetch(`/api/exams/${exam.id}/submissions`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setSubmissionId(data.id);
        setStarted(true);
      }
    } catch {}
  };

  const handleSubmit = async () => {
    if (!submissionId) return;
    setSubmitting(true);

    try {
      for (const [qId, ans] of Object.entries(answers)) {
        if (ans.text !== undefined || ans.option !== undefined) {
          await fetch(`/api/exams/submissions/${submissionId}/answers`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ questionId: qId, answerText: ans.text, selectedOption: ans.option }),
          });
        }
      }

      const res = await fetch(`/api/exams/submissions/${submissionId}/finalize`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        const totalMarks = questions.reduce((s, q) => s + q.marks, 0);
        setResult({
          totalScore: data.totalScore ?? 0,
          totalMarks,
          passed: (data.totalScore ?? 0) >= exam.passMark,
          answers: data.answers,
        });
        setSubmitted(true);
        router.refresh();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  // If already completed / graded, show result
  if (submitted && result) {
    return (
      <div className="rounded-xl border border-border bg-bg-card p-6">
        <div className="text-center mb-6">
          <div className={`inline-flex items-center justify-center size-16 rounded-full mb-3 ${result.passed ? "bg-success-muted" : "bg-danger-muted"}`}>
            {result.passed ? <Trophy className={`size-6 text-success`} /> : <XCircle className={`size-6 text-danger`} />}
          </div>
          <h3 className="text-xl font-bold mb-1">{result.passed ? "Passed!" : "Not Quite"}</h3>
          <p className="text-3xl font-bold">
            <span className={result.passed ? "text-success" : "text-danger"}>{result.totalScore}</span>
            <span className="text-text-secondary"> / {result.totalMarks}</span>
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {questions.map((q, idx) => {
            const ans = result.answers.find((a) => a.questionId === q.id);
            const isCorrect = ans?.isCorrect;
            return (
              <div key={q.id} className={`p-3 rounded-lg ${isCorrect ? "bg-success-muted/50" : "bg-danger-muted/50"}`}>
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium">{idx + 1}. {q.questionText}</p>
                  <span className={`shrink-0 text-xs font-bold ${isCorrect ? "text-success" : "text-danger"}`}>
                    {ans?.score ?? 0}/{q.marks}
                  </span>
                </div>
                {q.questionType === "MCQ" && getOptions(q.options).length > 0 && (
                  <div className="mt-1 text-xs text-text-secondary">
                    {getOptions(q.options).map((opt, oi) => {
                      const selected = ans?.selectedOption === oi;
                      const correct = opt.isCorrect;
                      return (
                        <div key={oi} className={`inline-block mr-2 px-2 py-0.5 rounded ${
                          correct ? "bg-success-muted text-success" : selected && !correct ? "bg-danger-muted text-danger" : ""
                        }`}>
                          {opt.text}
                        </div>
                      );
                    })}
                  </div>
                )}
                {(q.questionType === "SHORT_ANSWER" || q.questionType === "ESSAY") && ans?.answerText && (
                  <p className="text-xs text-text-secondary mt-1">Your answer: {ans.answerText}</p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // If not started, show start button
  if (!started) {
    return (
      <div className="rounded-xl border border-border bg-bg-card p-8 text-center">
        <div className="size-16 rounded-full bg-primary-muted flex items-center justify-center mx-auto mb-4">
          <Trophy className="size-6 text-primary" />
        </div>
        <h3 className="text-lg font-bold mb-2">{exam.title || "Module Quiz"}</h3>
        <p className="text-sm text-text-secondary mb-4">{questions.length} questions &middot; {exam.totalMarks} marks</p>
        <button
          onClick={startQuiz}
          className="px-6 py-2.5 rounded-xl bg-primary text-text-inverse font-bold hover:bg-primary-dark transition-all active:scale-95"
        >
          Start Quiz
        </button>
      </div>
    );
  }

  // Quiz in progress
  const current = questions[currentIdx];
  const currentOptions = current ? getOptions(current.options) : [];
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="rounded-xl border border-border bg-bg-card">
      {/* Progress header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <span className="text-sm text-text-secondary">{answeredCount}/{questions.length} answered</span>
        <div className="h-2 flex-1 mx-4 rounded-full bg-bg-primary">
          <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${(answeredCount / questions.length) * 100}%` }} />
        </div>
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="px-4 py-1.5 rounded-lg bg-success text-text-inverse text-sm font-medium hover:bg-success/90 transition-colors disabled:opacity-50"
        >
          {submitting ? "..." : "Submit"}
        </button>
      </div>

      {/* Question navigation dots */}
      <div className="px-4 py-2 border-b border-border flex flex-wrap gap-1.5">
        {questions.map((q, i) => (
          <button
            key={q.id}
            onClick={() => setCurrentIdx(i)}
            className={`size-7 rounded text-xs font-medium transition-colors ${
              i === currentIdx
                ? "bg-primary text-text-inverse"
                : answers[q.id]
                  ? "bg-success-muted text-success"
                  : "bg-bg-primary text-text-secondary"
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>

      {/* Question */}
      {current && (
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs text-text-secondary">Question {currentIdx + 1} of {questions.length} &middot; {current.marks} mark{current.marks !== 1 ? "s" : ""}</span>
          </div>
          <p className="text-lg font-medium mb-6">{current.questionText}</p>

          {current.questionType === "MCQ" && currentOptions.length > 0 && (
            <div className="flex flex-col gap-2">
              {currentOptions.map((opt, oi) => {
                const isSelected = answers[current.id]?.option === oi;
                return (
                  <button
                    key={oi}
                    onClick={() => handleAnswer(current.id, { selectedOption: oi })}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all ${
                      isSelected ? "border-primary bg-primary-muted text-primary" : "border-border bg-bg-primary hover:border-primary/40"
                    }`}
                  >
                    <div className={`size-5 rounded-full border-2 flex items-center justify-center shrink-0 ${isSelected ? "border-primary" : "border-text-muted"}`}>
                      {isSelected && <div className="size-2.5 rounded-full bg-primary" />}
                    </div>
                    <span className="flex-1 text-sm">{opt.text}</span>
                  </button>
                );
              })}
            </div>
          )}

          {current.questionType === "SHORT_ANSWER" && (
            <textarea
              value={answers[current.id]?.text ?? ""}
              onChange={(e) => handleAnswer(current.id, { answerText: e.target.value })}
              placeholder="Type your answer..."
              className="w-full min-h-[100px] p-4 rounded-xl border border-border bg-bg-primary focus:border-primary focus:outline-none resize-y text-sm"
            />
          )}

          {current.questionType === "ESSAY" && (
            <textarea
              value={answers[current.id]?.text ?? ""}
              onChange={(e) => handleAnswer(current.id, { answerText: e.target.value })}
              placeholder="Write your answer..."
              className="w-full min-h-[160px] p-4 rounded-xl border border-border bg-bg-primary focus:border-primary focus:outline-none resize-y text-sm"
            />
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-6">
            <button
              onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
              disabled={currentIdx === 0}
              className="px-4 py-2 rounded-xl border border-border hover:bg-bg-hover transition-colors disabled:opacity-30 text-sm"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentIdx((i) => Math.min(questions.length - 1, i + 1))}
              disabled={currentIdx === questions.length - 1}
              className="px-4 py-2 rounded-xl bg-primary text-text-inverse hover:bg-primary-dark transition-colors disabled:opacity-30 text-sm"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
