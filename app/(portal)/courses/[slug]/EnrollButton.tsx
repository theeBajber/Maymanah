"use client";

import { useRouter } from "next/navigation";

export default function EnrollButton({
  courseSlug,
  isEnrolled,
}: {
  courseSlug: string;
  isEnrolled: boolean;
}) {
  const router = useRouter();

  async function handleClick() {
    if (isEnrolled) {
      router.push(`/courses/${courseSlug}`);
      router.refresh();
      return;
    }

    const res = await fetch(`/api/courses/${courseSlug}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "enroll" }),
    });

    if (res.ok) {
      router.push(`/courses/${courseSlug}`);
      router.refresh();
    } else {
      const data = await res.json();
      alert(data.error || "Something went wrong");
    }
  }

  return (
    <button
      onClick={handleClick}
      className="inline-flex items-center gap-2 rounded-xl py-2.5 px-6 bg-primary text-text-inverse font-semibold text-sm hover:brightness-110 transition-all active:scale-[0.97] shadow-sm shadow-primary/20"
    >
      {isEnrolled ? (
        <>Continue Learning</>
      ) : (
        <>
          Enroll Now
          <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
          </svg>
        </>
      )}
    </button>
  );
}
