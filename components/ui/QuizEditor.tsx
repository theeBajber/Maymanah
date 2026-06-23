"use client";
import { useState } from "react";
import { Plus, Trash2, GripVertical } from "lucide-react";

type Option = { text: string; isCorrect: boolean };

type Question = {
  questionText: string;
  marks: number;
  options: Option[];
};

type QuizData = {
  title: string;
  durationMinutes: number;
  passMark: number;
  questions: Question[];
};

type Props = {
  value: QuizData;
  onChange: (data: QuizData) => void;
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

export function QuizEditor({ value, onChange }: Props) {
  const [expanded, setExpanded] = useState<number | null>(
    value.questions.length > 0 ? 0 : null,
  );

  const update = (updates: Partial<QuizData>) =>
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-text-primary">
          Quiz
        </label>
        <button
          type="button"
          onClick={() =>
            update({
              title: value.title
                ? ""
                : "Lesson Quiz",
              questions: [],
            })
          }
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            value.title
              ? "bg-danger/10 text-danger hover:bg-danger/20"
              : "bg-primary/10 text-primary hover:bg-primary/20"
          }`}
        >
          {value.title ? "Remove Quiz" : "Add Quiz"}
        </button>
      </div>

      {value.title && (
        <>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">
                Title
              </label>
              <input
                type="text"
                value={value.title}
                onChange={(e) => update({ title: e.target.value })}
                className="w-full px-2.5 py-2 rounded-lg border border-border bg-bg-primary text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="Lesson Quiz"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">
                Duration (min)
              </label>
              <input
                type="number"
                value={value.durationMinutes}
                onChange={(e) =>
                  update({ durationMinutes: parseInt(e.target.value) || 10 })
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
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-text-secondary">
                Questions ({value.questions.length})
              </span>
              <button
                type="button"
                onClick={addQuestion}
                className="flex items-center gap-1 text-xs font-medium text-primary hover:text-primary-light transition-colors"
              >
                <Plus className="size-3.5" />
                Add question
              </button>
            </div>

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
                      <div className="flex-1">
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
                        Options
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
                            <span
                              className={`text-[10px] font-semibold w-14 text-center ${
                                opt.isCorrect
                                  ? "text-success"
                                  : "text-text-muted"
                              }`}
                            >
                              {opt.isCorrect ? "Correct" : ""}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
