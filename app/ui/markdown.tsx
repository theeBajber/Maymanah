import type { ReactNode } from "react";

/**
 * Renders the markdown lessons are written in as components.
 *
 * Deliberately small: headings, emphasis, lists, links, quotes, and code.
 * Anything richer belongs in a dedicated renderer, not in one that must stay
 * predictable. Raw HTML is never interpreted, so content can never become
 * markup — which is why there is nothing here to sanitise.
 */
export function Markdown({ content }: { content: string }) {
  const blocks = content.split(/\n{2,}/);

  return (
    <div className="flex flex-col gap-4 text-[15px] leading-relaxed text-text-secondary">
      {blocks.map((block, index) => (
        <MarkdownBlock key={index} block={block.trim()} />
      ))}
    </div>
  );
}

function MarkdownBlock({ block }: { block: string }) {
  if (block.startsWith("### ")) {
    return <h4 className="text-base font-bold text-text-primary">{inline(block.slice(4))}</h4>;
  }
  if (block.startsWith("## ")) {
    return <h3 className="text-lg font-bold text-text-primary">{inline(block.slice(3))}</h3>;
  }
  if (block.startsWith("# ")) {
    return <h2 className="text-xl font-bold text-text-primary">{inline(block.slice(2))}</h2>;
  }
  if (block.startsWith("> ")) {
    return (
      <blockquote className="border-l-2 border-primary/50 pl-4 italic">
        {inline(block.replace(/^> ?/gm, ""))}
      </blockquote>
    );
  }
  if (/^(-|\*) /m.test(block)) {
    return (
      <ul className="flex list-disc flex-col gap-1.5 pl-5">
        {block.split("\n").map((line, i) => (
          <li key={i}>{inline(line.replace(/^(-|\*) /, ""))}</li>
        ))}
      </ul>
    );
  }
  if (/^\d+\. /m.test(block)) {
    return (
      <ol className="flex list-decimal flex-col gap-1.5 pl-5">
        {block.split("\n").map((line, i) => (
          <li key={i}>{inline(line.replace(/^\d+\. /, ""))}</li>
        ))}
      </ol>
    );
  }
  return <p>{inline(block)}</p>;
}

function inline(text: string): ReactNode {
  // Links first, so their brackets are not mistaken for emphasis.
  const parts = text.split(/(\[.+?\]\(.+?\)|\*\*.+?\*\*|\*[^*]+?\*|`[^`]+?`)/g);

  return parts.map((part, index) => {
    const link = /^\[(.+?)\]\((.+?)\)$/.exec(part);
    if (link) {
      const href = link[2];
      const safe = href.startsWith("http://") || href.startsWith("https://") || href.startsWith("/");
      return safe ? (
        <a key={index} href={href} className="font-medium text-primary hover:underline">
          {link[1]}
        </a>
      ) : (
        <span key={index}>{link[1]}</span>
      );
    }
    const bold = /^\*\*(.+)\*\*$/.exec(part);
    if (bold) {
      return (
        <strong key={index} className="font-semibold text-text-primary">
          {bold[1]}
        </strong>
      );
    }
    const italic = /^\*([^]+)\*$/.exec(part);
    if (italic) {
      return <em key={index}>{italic[1]}</em>;
    }
    const code = /^`([^`]+)`$/.exec(part);
    if (code) {
      return (
        <code key={index} className="rounded bg-bg-hover px-1.5 py-0.5 font-mono text-[13px] text-text-primary">
          {code[1]}
        </code>
      );
    }
    return <span key={index}>{part}</span>;
  });
}
