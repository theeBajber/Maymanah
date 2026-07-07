"use client";
import { useState } from "react";
import { Plus, Trash2, GripVertical } from "lucide-react";

type Option = { text: string; isCorrect: boolean };

type Question = {
  questionText: string;
  marks: number;
  options: Option[];
};

type ExamData = {
  title: string;
  description: string;
  durationMinutes: number;
  passMark: number;
  shuffleQuestions: boolean;
  allowReview: boolean;
  isPublished: boolean;
  questions: Question[];
};

type Props = {
  value: ExamData;
  onChange: (data: ExamData) => void;
};

function emptyQuestion(): Question {
  return {
    questionText: "",
    marks: 1,
    options: [
      { text: "", isCorrect: false },
      { text: "", isCorrect: false },
      { text: "", isCorrect: false },
      { text: "", isCorrect: false },
    ],
  };
}

export function ExamEditor({ value, onChange }: Props) {
  const [expanded, setExpanded] = useState<number | null>(
    value.questions.length > 0 ? 0 : null,
  );

  const update = (updates: Partial<ExamData>) =>
    onChange({ ...value, ...updates });

  const addQuestion = () => {
    const qs = [...value.questions, emptyQuestion()];
    onChange({ ...value, questions: qs });
    setExpanded(qs.length - 1);
  };

  const removeQuestion = (idx: number) => {
    const qs = value.questions.filter((_, i) => i !== idx);
    onChange({ ...value, questions: qs });
    if (expanded === idx) setExpanded(null);
  };

  const updateQuestion = (idx: number, q: Question) => {
    const qs = [...value.questions];
    qs[idx] = q;
    onChange({ ...value, questions: qs });
  };

  const toggleCorrect = (qIdx: number, oIdx: number) => {
    const q = { ...value.questions[qIdx] };
    q.options = q.options.map((opt, i) => ({
      ...opt,
      isCorrect: i === oIdx,
    }));
    updateQuestion(qIdx, q);
  };

  const totalMarks = value.questions.reduce((s, q) => s + q.marks, 0);
  const answeredCount = value.questions.filter((q) => q.questionText.trim()).length;

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-text-primary mb-1">
          Exam Title
        </label>
        <input
          type="text"
          value={value.title}
          onChange={(e) => update({ title: e.target.value })}
          className="w-full px-3 py-2.5 rounded-lg border border-border bg-bg-primary text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          placeholder="e.g. Final Exam – Introduction to Fiqh"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-text-primary mb-1">
          Description
        </label>
        <textarea
          value={value.description}
          onChange={(e) => update({ description: e.target.value })}
          rows={2}
          className="w-full px-3 py-2.5 rounded-lg border border-border bg-bg-primary text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
          placeholder="Instructions or notes for students..."
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1">
            Duration (min)
          </label>
          <input
            type="number"
            value={value.durationMinutes}
            onChange={(e) =>
              update({ durationMinutes: parseInt(e.target.value) || 60 })
            }
            className="w-full px-2.5 py-2 rounded-lg border border-border bg-bg-primary text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            min={1}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1">
            Pass mark (%)
          </label>
          <input
            type="number"
            value={value.passMark}
            onChange={(e) =>
              update({ passMark: parseInt(e.target.value) || 50 })
            }
            className="w-full px-2.5 py-2 rounded-lg border border-border bg-bg-primary text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            min={0}
            max={100}
          />
        </div>
        <div className="flex items-end pb-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={value.shuffleQuestions}
              onChange={(e) =>
                update({ shuffleQuestions: e.target.checked })
              }
              className="size-4 rounded border-border text-primary focus:ring-primary"
            />
            <span className="text-sm text-text-primary">Shuffle</span>
          </label>
        </div>
        <div className="flex items-end pb-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={value.allowReview}
              onChange={(e) =>
                update({ allowReview: e.target.checked })
              }
              className="size-4 rounded border-border text-primary focus:ring-primary"
            />
            <span className="text-sm text-text-primary">Allow Review</span>
          </label>
        </div>
        <div className="flex items-end pb-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={value.isPublished}
              onChange={(e) =>
                update({ isPublished: e.target.checked })
              }
              className="size-4 rounded border-border text-primary focus:ring-primary"
            />
            <span className="text-sm text-text-primary">Published</span>
          </label>
        </div>
      </div>

      <div className="border-t border-border pt-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-sm font-medium text-text-primary">
              Question Bank ({value.questions.length})
            </span>
            {answeredCount > 0 && (
              <span className="ml-3 text-xs text-text-muted">
                {answeredCount} filled &middot; {totalMarks} total marks
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={addQuestion}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
          >
            <Plus className="size-3.5" />
            Add Question
          </button>
        </div>

        <div className="space-y-3">
          {value.questions.map((q, qIdx) => (
            <div
              key={qIdx}
              className="border border-border rounded-lg overflow-hidden"
            >
              <button
                type="button"
                onClick={() =>
                  setExpanded(expanded === qIdx ? null : qIdx)
                }
                className="w-full flex items-center gap-3 px-3 py-2.5 bg-bg-elevated text-left hover:bg-bg-hover transition-colors"
              >
                <GripVertical className="size-3.5 text-text-muted shrink-0" />
                <span className="text-xs font-semibold text-text-muted w-5 shrink-0">
                  #{qIdx + 1}
                </span>
                <span className="flex-1 text-sm text-text-primary truncate">
                  {q.questionText || "New question"}
                </span>
                <span className="text-xs text-text-muted">{q.marks} pt</span>
                <Trash2
                  onClick={(e) => {
                    e.stopPropagation();
                    removeQuestion(qIdx);
                  }}
                  className="size-3.5 text-text-muted hover:text-danger transition-colors"
                />
              </button>

              {expanded === qIdx && (
                <div className="p-3 border-t border-border space-y-3 bg-bg-primary">
                  <div>
                    <label className="block text-xs font-medium text-text-secondary mb-1">
                      Question
                    </label>
                    <textarea
                      value={q.questionText}
                      onChange={(e) =>
                        updateQuestion(qIdx, {
                          ...q,
                          questionText: e.target.value,
                        })
                      }
                      rows={2}
                      className="w-full px-2.5 py-2 rounded-lg border border-border bg-bg-elevated text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                      placeholder="Enter your question..."
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <div>
                      <label className="block text-xs font-medium text-text-secondary mb-1">
                        Marks
                      </label>
                      <input
                        type="number"
                        value={q.marks}
                        onChange={(e) =>
                          updateQuestion(qIdx, {
                            ...q,
                            marks: parseInt(e.target.value) || 1,
                          })
                        }
                        className="w-20 px-2.5 py-2 rounded-lg border border-border bg-bg-elevated text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                        min={1}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-text-secondary mb-1.5">
                      Options <span className="text-text-muted">(select the correct answer)</span>
                    </label>
                    <div className="space-y-1.5">
                      {q.options.map((opt, oIdx) => (
                        <div key={oIdx} className="flex items-center gap-2">
                          <input
                            type="radio"
                            name={`correct-${qIdx}`}
                            checked={opt.isCorrect}
                            onChange={() => toggleCorrect(qIdx, oIdx)}
                            className="size-4 text-primary border-border focus:ring-primary shrink-0"
                          />
                          <input
                            type="text"
                            value={opt.text}
                            onChange={(e) => {
                              const opts = [...q.options];
                              opts[oIdx] = {
                                ...opts[oIdx],
                                text: e.target.value,
                              };
                              updateQuestion(qIdx, { ...q, options: opts });
                            }}
                            className={`flex-1 px-2.5 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 ${
                              opt.isCorrect
                                ? "border-success/40 bg-success/5 text-text-primary"
                                : "border-border bg-bg-elevated text-text-primary"
                            }`}
                            placeholder={`Option ${oIdx + 1}`}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const opts = q.options.filter((_, i) => i !== oIdx);
                              updateQuestion(qIdx, { ...q, options: opts });
                            }}
                            className="p-1 text-text-muted hover:text-danger transition-colors"
                          >
                            <Trash2 className="size-3" />
                          </button>
                        </div>
                      ))}
                      {q.options.length < 6 && (
                        <button
                          type="button"
                          onClick={() => {
                            const opts = [...q.options, { text: "", isCorrect: false }];
                            updateQuestion(qIdx, { ...q, options: opts });
                          }}
                          className="text-xs text-primary hover:text-primary-light transition-colors mt-1"
                        >
                          + Add option
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}

          {value.questions.length === 0 && (
            <div className="text-center py-12 border border-dashed border-border/60 rounded-lg">
              <p className="text-sm text-text-muted mb-3">
                No questions yet. Add your first question.
              </p>
              <button
                type="button"
                onClick={addQuestion}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
              >
                <Plus className="size-4" />
                Add Question
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
