"use client";

import {
  faCircleCheck,
  faCircleExclamation,
  faCircleInfo,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type ToastVariant = "success" | "error" | "warning" | "info";

type ToastInput = {
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
};

type ToastItem = ToastInput & {
  id: string;
  variant: ToastVariant;
  duration: number;
};

type ToastContextValue = {
  toast: (input: ToastInput) => string;
  dismiss: (id: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const variantStyles: Record<ToastVariant, string> = {
  success: "border-success/30 bg-success-muted text-success",
  error: "border-danger/30 bg-danger-muted text-danger",
  warning: "border-warning/30 bg-warning-muted text-warning",
  info: "border-info/30 bg-info-muted text-info",
};

const variantIcons = {
  success: faCircleCheck,
  error: faCircleExclamation,
  warning: faCircleExclamation,
  info: faCircleInfo,
} as const;

function createToastId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(
    new Map(),
  );

  const dismiss = useCallback((id: string) => {
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }

    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const toast = useCallback(
    (input: ToastInput) => {
      const id = createToastId();
      const nextToast: ToastItem = {
        id,
        title: input.title,
        description: input.description,
        variant: input.variant ?? "info",
        duration: input.duration ?? 5000,
      };

      setToasts((current) => [...current, nextToast]);

      const timer = setTimeout(() => dismiss(id), nextToast.duration);
      timersRef.current.set(id, timer);

      return id;
    },
    [dismiss],
  );

  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      timers.forEach((timer) => clearTimeout(timer));
      timers.clear();
    };
  }, []);

  const value = useMemo(() => ({ toast, dismiss }), [toast, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }

  return context;
}

function ToastViewport({
  toasts,
  onDismiss,
}: {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}) {
  return (
    <div
      aria-live="polite"
      aria-relevant="additions"
      className="pointer-events-none fixed top-4 right-4 z-[100] flex w-full max-w-sm flex-col gap-3 p-4 sm:top-6 sm:right-6"
    >
      {toasts.map((item) => (
        <div
          key={item.id}
          role="status"
          className={`pointer-events-auto rounded-xl border p-4 shadow-lg backdrop-blur-sm transition-all duration-300 ${variantStyles[item.variant]}`}
        >
          <div className="flex items-start gap-3">
            <FontAwesomeIcon
              icon={variantIcons[item.variant]}
              className="mt-0.5 shrink-0"
            />
            <div className="min-w-0 flex-1">
              <p className="font-bold leading-snug">{item.title}</p>
              {item.description ? (
                <p className="mt-1 text-sm opacity-90">{item.description}</p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={() => onDismiss(item.id)}
              className="shrink-0 opacity-70 transition-opacity hover:opacity-100"
              aria-label="Dismiss notification"
            >
              <FontAwesomeIcon icon={faXmark} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
