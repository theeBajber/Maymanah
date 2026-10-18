"use client";

import { useCallback, useRef, useState } from "react";
import {
  Bold,
  Italic,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Link as LinkIcon,
  Eye,
  Pencil,
  Minus,
} from "lucide-react";

import { Markdown } from "./markdown";

/**
 * Writes lesson content as markdown.
 *
 * Markdown, rather than a rich-text surface, because markdown is what lessons
 * are stored as and rendered from. Keeping the source visible means what the
 * author types is exactly what readers get, and there is no markup to sanitise
 * on the way in or out.
 *
 * The toolbar wraps the current selection, so a button never discards what was
 * already written — it only adds the marks around it.
 */
export function MarkdownEditor({
  content,
  onChange,
}: {
  content: string;
  onChange: (markdown: string) => void;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [previewing, setPreviewing] = useState(false);

  const wrap = useCallback(
    (before: string, after: string, placeholder: string) => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const { selectionStart, selectionEnd, value } = textarea;
      const selected = value.slice(selectionStart, selectionEnd) || placeholder;

      const next = `${value.slice(0, selectionStart)}${before}${selected}${after}${value.slice(selectionEnd)}`;
      onChange(next);

      // Put the caret back around the text that was just wrapped, so several
      // marks can be applied in a row without reselecting.
      requestAnimationFrame(() => {
        textarea.focus();
        textarea.setSelectionRange(selectionStart + before.length, selectionStart + before.length + selected.length);
      });
    },
    [onChange],
  );

  const prefixLine = useCallback(
    (prefix: string, placeholder: string) => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const { selectionStart, selectionEnd, value } = textarea;
      const lineStart = value.lastIndexOf("\n", selectionStart - 1) + 1;
      const selected = value.slice(lineStart, selectionEnd).trim() || placeholder;

      const prefixed = selected
        .split("\n")
        .map((line) => `${prefix}${line}`)
        .join("\n");

      onChange(`${value.slice(0, lineStart)}${prefixed}${value.slice(selectionEnd)}`);

      requestAnimationFrame(() => {
        textarea.focus();
        textarea.setSelectionRange(lineStart, lineStart + prefixed.length);
      });
    },
    [onChange],
  );

  return (
    <div className="editor-wrapper border border-border rounded-lg overflow-hidden bg-bg-primary">
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-border bg-bg-elevated">
        <ToolbarButton onClick={() => wrap("**", "**", "bold text")} label="Bold">
          <Bold className="size-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => wrap("*", "*", "italic text")} label="Italic">
          <Italic className="size-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => prefixLine("## ", "Heading")} label="Heading 2">
          <Heading2 className="size-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => prefixLine("### ", "Heading")} label="Heading 3">
          <Heading3 className="size-4" />
        </ToolbarButton>

        <ToolbarDivider />

        <ToolbarButton onClick={() => prefixLine("- ", "List item")} label="Bullet list">
          <List className="size-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => prefixLine("1. ", "List item")} label="Ordered list">
          <ListOrdered className="size-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => prefixLine("> ", "Quote")} label="Blockquote">
          <Quote className="size-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => wrap("`", "`", "code")} label="Code">
          <Code className="size-4" />
        </ToolbarButton>

        <ToolbarDivider />

        <ToolbarButton onClick={() => wrap("[", "](https://)", "link text")} label="Link">
          <LinkIcon className="size-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => wrap("", "\n\n---\n\n", "")} label="Horizontal rule">
          <Minus className="size-4" />
        </ToolbarButton>

        <div className="flex-1" />

        <div className="flex items-center gap-1 bg-bg-primary border border-border rounded-lg p-0.5">
          <SegmentedButton active={!previewing} onClick={() => setPreviewing(false)} label="Write">
            <Pencil className="size-3.5" />
            Write
          </SegmentedButton>
          <SegmentedButton active={previewing} onClick={() => setPreviewing(true)} label="Preview">
            <Eye className="size-3.5" />
            Preview
          </SegmentedButton>
        </div>
      </div>

      {previewing ? (
        <div className="min-h-[320px] p-4">
          {content.trim() ? (
            <Markdown content={content} />
          ) : (
            <p className="text-sm text-text-muted">Nothing to preview yet.</p>
          )}
        </div>
      ) : (
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Write the lesson in markdown. Use **bold**, *italic*, ## headings, - lists, and [links](https://example.com)."
          className="w-full min-h-[320px] p-4 bg-transparent font-mono text-sm leading-relaxed text-text-primary placeholder:text-text-muted focus:outline-none resize-y"
        />
      )}
    </div>
  );
}

function ToolbarButton({
  onClick,
  label,
  children,
}: {
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className="p-1.5 rounded-md text-text-secondary hover:text-text-primary hover:bg-bg-hover transition-colors"
    >
      {children}
    </button>
  );
}

function ToolbarDivider() {
  return <div className="w-px h-5 bg-border" />;
}

function SegmentedButton({
  active,
  onClick,
  label,
  children,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
        active ? "bg-primary text-white" : "text-text-secondary hover:text-text-primary"
      }`}
    >
      {children}
      <span>{label}</span>
    </button>
  );
}
