"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/components/ui/toast";

const categories = ["Quran", "Fiqh", "History", "Arabic", "Aqeedah"] as const;

type CourseData = {
  id?: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  image: string;
  enrollmentKey: string;
  isPublished: boolean;
  isActive: boolean;
};

export function CourseForm({ course }: { course?: CourseData }) {
  const router = useRouter();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<CourseData>(
    course || {
      title: "",
      slug: "",
      description: "",
      category: "Quran",
      image: "",
      enrollmentKey: "",
      isPublished: true,
      isActive: true,
    },
  );

  const isEditing = !!course?.id;

  const generateSlug = (title: string) =>
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

  const handleTitleChange = (title: string) => {
    setForm((prev) => ({
      ...prev,
      title,
      slug: isEditing ? prev.slug : generateSlug(title),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const url = isEditing
        ? `/api/admin/courses/${course.id}`
        : "/api/admin/courses";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save course");
      }

      router.push("/admin/courses");
      router.refresh();
    } catch (err) {
      toast({ title: err instanceof Error ? err.message : "Something went wrong", variant: "error" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/admin/courses"
          className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-hover transition-colors"
        >
          <ArrowLeft className="size-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-text-primary">
            {isEditing ? "Edit Course" : "New Course"}
          </h1>
          <p className="text-text-secondary mt-1">
            {isEditing
              ? "Update course details"
              : "Create a new course for students"}
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="max-w-2xl space-y-6 bg-bg-card border border-border rounded-xl p-6"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">
              Title
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-border bg-bg-primary text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
              placeholder="Introduction to Tajweed"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">
              Slug
            </label>
            <input
              type="text"
              value={form.slug}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, slug: e.target.value }))
              }
              className="w-full px-3 py-2.5 rounded-lg border border-border bg-bg-primary text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors font-mono"
              placeholder="introduction-to-tajweed"
              required
            />
            <p className="text-xs text-text-muted mt-1">
              URL-friendly identifier. Auto-generated from title.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              rows={4}
              className="w-full px-3 py-2.5 rounded-lg border border-border bg-bg-primary text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors resize-y"
              placeholder="A brief description of the course..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">
                Category
              </label>
              <select
                value={form.category}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, category: e.target.value }))
                }
                className="w-full px-3 py-2.5 rounded-lg border border-border bg-bg-primary text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">
                Enrollment Key (optional)
              </label>
              <input
                type="text"
                value={form.enrollmentKey}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    enrollmentKey: e.target.value,
                  }))
                }
                className="w-full px-3 py-2.5 rounded-lg border border-border bg-bg-primary text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors font-mono"
                placeholder="e.g. TAJWEED-2024"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">
              Image URL
            </label>
            <input
              type="text"
              value={form.image}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, image: e.target.value }))
              }
              className="w-full px-3 py-2.5 rounded-lg border border-border bg-bg-primary text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
              placeholder="https://example.com/course-image.jpg"
            />
          </div>

          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isPublished}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    isPublished: e.target.checked,
                  }))
                }
                className="size-4 rounded border-border text-primary focus:ring-primary"
              />
              <span className="text-sm text-text-primary">Published</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    isActive: e.target.checked,
                  }))
                }
                className="size-4 rounded border-border text-primary focus:ring-primary"
              />
              <span className="text-sm text-text-primary">Active</span>
            </label>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-text-inverse rounded-xl text-sm font-medium hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="size-4" />
            {saving
              ? "Saving..."
              : isEditing
                ? "Update Course"
                : "Create Course"}
          </button>
          <Link
            href="/admin/courses"
            className="px-5 py-2.5 rounded-xl text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-bg-hover transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
