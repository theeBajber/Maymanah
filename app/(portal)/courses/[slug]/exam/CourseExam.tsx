"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimesCircle, faTrophy, faClock, faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";

type QuizOption = { text: string; isCorrect?: boolean };

export type QuestionData = {
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
  attemptNumber: number;
  startedAt: string;
  answers: AnswerData[];
};

type ExamData = {
  id: string;
  title: string;
  description: string | null;
  durationMinutes: number;
  totalMarks: number;
  passMark: number;
  shuffleQuestions: boolean;
  allowReview: boolean;
  examType: string;
  _count: { questions: number };
};

export function CourseExam({
  exam,
  questions,
  submissions,
  courseSlug,
}: {
  exam: ExamData;
  questions: QuestionData[];
  submissions: SubmissionData[];
  courseSlug: string;
}) {
  const router = useRouter();
  const [started, setStarted] = useState(
    submissions.some((s) => s.status === "IN_PROGRESS"),
  );
  const [submissionId, setSubmissionId] = useState<string | null>(
    submissions.find((s) => s.status === "IN_PROGRESS")?.id ?? null,
  );
  const [currentIdx, setCurrentIdx] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const latestGraded = submissions
    .filter((s) => s.status === "GRADED" || s.status === "SUBMITTED")
    .sort((a, b) => b.attemptNumber - a.attemptNumber)[0] ?? null;

  const [submitted, setSubmitted] = useState(!!latestGraded);
  const [result, setResult] = useState<{
    totalScore: number;
    totalMarks: number;
    passed: boolean;
    answers: AnswerData[];
    attemptNumber: number;
    retriesLeft: number;
    needsReset: boolean;
  } | null>(() => {
    if (!latestGraded) return null;
    const totalMarks = questions.reduce((s, q) => s + q.marks, 0);
    const score = latestGraded.totalScore ?? 0;
    const pct = totalMarks > 0 ? (score / totalMarks) * 100 : 0;
    const passed = pct >= exam.passMark;
    const gradedCount = submissions.filter((s) => s.status === "GRADED").length;
    const retriesLeft = Math.max(0, 2 - gradedCount);
    const needsReset = gradedCount >= 2 && !passed;
    return {
      totalScore: score,
      totalMarks,
      passed,
      answers: latestGraded.answers,
      attemptNumber: latestGraded.attemptNumber,
      retriesLeft,
      needsReset,
    };
  });

  const [answers, setAnswers] = useState<
    Record<string, { text?: string; option?: number }>
  >(() => {
    const initial: Record<string, { text?: string; option?: number }> = {};
    const inProgress = submissions.find((s) => s.status === "IN_PROGRESS");
    if (inProgress?.answers) {
      for (const a of inProgress.answers) {
        initial[a.questionId] = {
          text: a.answerText ?? undefined,
          option: a.selectedOption ?? undefined,
        };
      }
    }
    return initial;
  });

  // Timer
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const handleSubmitRef = useRef<() => Promise<void>>(async () => {});

  useEffect(() => {
    if (started && submissionId && !submitted) {
      const inProgress = submissions.find((s) => s.id === submissionId);
      const serverStarted = inProgress?.startedAt ? new Date(inProgress.startedAt).getTime() : null;

      const storedStart = sessionStorage.getItem(`exam_start_${submissionId}`);
      let startTime: number;
      if (serverStarted) {
        startTime = serverStarted;
        if (!storedStart) {
          sessionStorage.setItem(`exam_start_${submissionId}`, String(startTime));
        }
      } else if (storedStart) {
        startTime = parseInt(storedStart);
      } else {
        startTime = Date.now();
        sessionStorage.setItem(`exam_start_${submissionId}`, String(startTime));
      }

      const endTime = startTime + exam.durationMinutes * 60 * 1000;

      const tick = () => {
        const remaining = Math.max(0, Math.floor((endTime - Date.now()) / 1000));
        setTimeLeft(remaining);
        if (remaining <= 0) {
          handleSubmitRef.current();
        }
      };
      tick();
      timerRef.current = setInterval(tick, 1000);
      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }
  }, [started, submissionId, submitted, exam.durationMinutes, submissions]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const saveAnswer = useCallback(
    async (questionId: string, data: { answerText?: string; selectedOption?: number }) => {
      if (!submissionId) return;
      try {
        await fetch(`/api/exams/submissions/${submissionId}/answers`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ questionId, ...data }),
        });
      } catch {}
    },
    [submissionId],
  );

  const handleAnswer = async (
    questionId: string,
    data: { answerText?: string; selectedOption?: number },
  ) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: { text: data.answerText, option: data.selectedOption },
    }));
    if (submissionId) await saveAnswer(questionId, data);
  };

  const startExam = async () => {
    try {
      const res = await fetch(`/api/exams/${exam.id}/submissions`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setSubmissionId(data.id);
        setStarted(true);
        setSubmitted(false);
        setResult(null);
        setAnswers({});
        setCurrentIdx(0);
      } else if (res.status === 403) {
        const data = await res.json();
        alert(data.error);
      }
    } catch {}
  };

  const handleSubmit = async () => {
    if (!submissionId) return;
    if (timerRef.current) clearInterval(timerRef.current);
    setSubmitting(true);

    try {
      for (const [qId, ans] of Object.entries(answers)) {
        if (ans.text !== undefined || ans.option !== undefined) {
          await fetch(`/api/exams/submissions/${submissionId}/answers`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              questionId: qId,
              answerText: ans.text,
              selectedOption: ans.option,
            }),
          });
        }
      }

      const res = await fetch(
        `/api/exams/submissions/${submissionId}/finalize`,
        { method: "POST" },
      );
      if (res.ok) {
        const data = await res.json();
        const totalMarks = questions.reduce((s, q) => s + q.marks, 0);
        const score = data.totalScore ?? 0;
        const pct = totalMarks > 0 ? (score / totalMarks) * 100 : 0;
        const passed = pct >= exam.passMark;
        const gradedCount =
          submissions.filter((s) => s.status === "GRADED").length + 1;
        const retriesLeft = Math.max(0, 2 - gradedCount);
        const needsReset = gradedCount >= 2 && !passed;

        setResult({
          totalScore: score,
          totalMarks,
          passed,
          answers: data.answers || [],
          attemptNumber: gradedCount,
          retriesLeft,
          needsReset,
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

  useEffect(() => {
    handleSubmitRef.current = handleSubmit;
  });

  // Result view
  if (submitted && result) {
    return (
      <div className="rounded-xl border border-border bg-bg-card p-6">
        <div className="text-center mb-6">
          <div
            className={`inline-flex items-center justify-center size-16 rounded-full mb-3 ${
              result.passed ? "bg-success-muted" : "bg-danger-muted"
            }`}
          >
            <FontAwesomeIcon
              icon={result.passed ? faTrophy : result.needsReset ? faExclamationTriangle : faTimesCircle}
              className={`size-6 ${
                result.passed ? "text-success" : "text-danger"
              }`}
            />
          </div>
          <h3 className="text-xl font-bold mb-1">
            {result.passed
              ? "Congratulations — You Passed!"
              : result.needsReset
                ? "Course Reset"
                : "Not Quite"}
          </h3>
          <p className="text-sm text-text-secondary mb-2">
            Attempt {result.attemptNumber}
            {result.retriesLeft > 0 && ` — ${result.retriesLeft} retry left`}
          </p>
          <p className="text-3xl font-bold">
            <span className={result.passed ? "text-success" : "text-danger"}>
              {result.totalScore}
            </span>
            <span className="text-text-secondary"> / {result.totalMarks}</span>
          </p>
        </div>

        {result.needsReset && (
          <div className="mb-6 p-4 rounded-lg bg-danger-muted border border-danger/20 text-center">
            <p className="text-sm font-medium text-danger">
              You have used both attempts. Your course progress has been reset.
              You may re-enroll and retake the course.
            </p>
          </div>
        )}

        {!result.needsReset && !result.passed && result.retriesLeft > 0 && (
          <div className="mb-6 text-center">
            <p className="text-sm text-text-secondary mb-3">
              You have {result.retriesLeft} retry remaining. You can retake the exam once more.
            </p>
            <button
              onClick={startExam}
              className="px-6 py-2.5 rounded-xl bg-primary text-text-inverse font-bold hover:bg-primary-dark transition-all active:scale-95"
            >
              Retry Exam
            </button>
          </div>
        )}

        {exam.allowReview && !result.needsReset && (
          <div className="flex flex-col gap-3">
            {questions.map((q, idx) => {
              const ans = result.answers.find((a) => a.questionId === q.id);
              const isCorrect = ans?.isCorrect;
              return (
                <div
                  key={q.id}
                  className={`p-3 rounded-lg ${
                    isCorrect ? "bg-success-muted/50" : "bg-danger-muted/50"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium">
                      {idx + 1}. {q.questionText}
                    </p>
                    <span
                      className={`shrink-0 text-xs font-bold ${
                        isCorrect ? "text-success" : "text-danger"
                      }`}
                    >
                      {ans?.score ?? 0}/{q.marks}
                    </span>
                  </div>
                  {q.questionType === "MCQ" &&
                    getOptions(q.options).length > 0 && (
                      <div className="mt-1 text-xs text-text-secondary">
                        {getOptions(q.options).map((opt, oi) => {
                          const selected = ans?.selectedOption === oi;
                          const correct = opt.isCorrect;
                          return (
                            <div
                              key={oi}
                              className={`inline-block mr-2 px-2 py-0.5 rounded ${
                                correct
                                  ? "bg-success-muted text-success"
                                  : selected && !correct
                                    ? "bg-danger-muted text-danger"
                                    : ""
                              }`}
                            >
                              {opt.text}
                            </div>
                          );
                        })}
                      </div>
                    )}
                </div>
              );
            })}
          </div>
        )}

        {result.passed && (
          <div className="mt-6 text-center">
            <button
              onClick={() => router.push(`/courses/${courseSlug}`)}
              className="px-6 py-2.5 rounded-xl bg-primary text-text-inverse font-bold hover:bg-primary-dark transition-all active:scale-95"
            >
              Back to Course
            </button>
          </div>
        )}
      </div>
    );
  }

  // Start screen
  if (!started) {
    return (
      <div className="rounded-xl border border-border bg-bg-card p-8 text-center">
        <div className="size-16 rounded-full bg-primary-muted flex items-center justify-center mx-auto mb-4">
          <FontAwesomeIcon icon={faTrophy} className="size-6 text-primary" />
        </div>
        <h3 className="text-lg font-bold mb-2">{exam.title}</h3>
        {exam.description && (
          <p className="text-sm text-text-secondary mb-4">{exam.description}</p>
        )}
        <div className="flex items-center justify-center gap-6 text-sm text-text-secondary mb-6">
          <span>{questions.length} questions</span>
          <span className="flex items-center gap-1">
            <FontAwesomeIcon icon={faClock} className="size-3" />
            {exam.durationMinutes} minutes
          </span>
          <span>Pass: {exam.passMark}%</span>
        </div>
        <button
          onClick={startExam}
          className="px-8 py-3 rounded-xl bg-primary text-text-inverse font-bold hover:bg-primary-dark transition-all active:scale-95 text-lg"
        >
          Start Exam
        </button>
      </div>
    );
  }

  // Exam in progress
  const current = questions[currentIdx];
  const currentOptions = current ? getOptions(current.options) : [];
  const answeredCount = Object.keys(answers).length;
  const isLowTime = timeLeft !== null && timeLeft < 60;

  return (
    <div className="rounded-xl border border-border bg-bg-card">
      {/* Header with timer and progress */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-sm text-text-secondary">
            {answeredCount}/{questions.length} answered
          </span>
          <div className="h-2 w-32 rounded-full bg-bg-primary">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{
                width: `${(answeredCount / questions.length) * 100}%`,
              }}
            />
          </div>
        </div>
        <div className="flex items-center gap-3">
          {timeLeft !== null && (
            <span
              className={`flex items-center gap-1 text-sm font-bold ${
                isLowTime ? "text-danger animate-pulse" : "text-text-secondary"
              }`}
            >
              <FontAwesomeIcon icon={faClock} className="size-3" />
              {formatTime(timeLeft)}
            </span>
          )}
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="px-4 py-1.5 rounded-lg bg-success text-text-inverse text-sm font-medium hover:bg-success/90 transition-colors disabled:opacity-50"
          >
            {submitting ? "Submitting..." : "Submit"}
          </button>
        </div>
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

      {/* Current question */}
      {current && (
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs text-text-secondary">
              Question {currentIdx + 1} of {questions.length} &middot;{" "}
              {current.marks} mark{current.marks !== 1 ? "s" : ""}
            </span>
          </div>
          <p className="text-lg font-medium mb-6">{current.questionText}</p>

          {current.questionType === "MCQ" && currentOptions.length > 0 && (
            <div className="flex flex-col gap-2">
              {currentOptions.map((opt, oi) => {
                const isSelected = answers[current.id]?.option === oi;
                return (
                  <button
                    key={oi}
                    onClick={() =>
                      handleAnswer(current.id, { selectedOption: oi })
                    }
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? "border-primary bg-primary-muted text-primary"
                        : "border-border bg-bg-primary hover:border-primary/40"
                    }`}
                  >
                    <div
                      className={`size-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        isSelected
                          ? "border-primary"
                          : "border-text-muted"
                      }`}
                    >
                      {isSelected && (
                        <div className="size-2.5 rounded-full bg-primary" />
                      )}
                    </div>
                    <span className="flex-1 text-sm">{opt.text}</span>
                  </button>
                );
              })}
            </div>
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
              onClick={() =>
                setCurrentIdx((i) =>
                  Math.min(questions.length - 1, i + 1),
                )
              }
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
