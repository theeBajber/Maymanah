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
      className="rounded-lg py-2 px-6 bg-primary text-text-inverse font-semibold hover:bg-primary-dark transition-colors"
    >
      {isEnrolled ? "Continue Learning" : "Enroll Now"}
    </button>
  );
}
