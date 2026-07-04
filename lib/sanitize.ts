const ALLOWED_TAGS = [
  "h1", "h2", "h3", "h4", "h5", "h6",
  "p", "br", "hr",
  "ul", "ol", "li",
  "dl", "dt", "dd",
  "blockquote", "pre", "code",
  "strong", "em", "b", "i", "u", "s", "mark", "sub", "sup",
  "a",
  "img",
  "table", "thead", "tbody", "tfoot", "tr", "th", "td", "caption", "colgroup", "col",
  "div", "span",
  "section", "article", "header", "footer",
  "figure", "figcaption",
  "video", "audio", "source",
  "iframe",
];

const ALLOWED_ATTR = [
  "href", "target", "rel",
  "src", "alt", "width", "height",
  "class",
  "id",
  "style",
  "data-*",
  "dir",
  "lang",
  "title",
  "type",
  "controls", "autoplay", "loop", "muted",
  "allowfullscreen", "frameborder",
  "colspan", "rowspan",
  "start",
];

const ALLOWED_TAG_SET = new Set(ALLOWED_TAGS);
const ALLOWED_ATTR_SET = new Set(ALLOWED_ATTR);
const BOOLEAN_ATTRS = new Set([
  "controls",
  "autoplay",
  "loop",
  "muted",
  "allowfullscreen",
]);
const URI_ATTRS = new Set(["href", "src"]);
const VOID_TAGS = new Set(["br", "hr", "img", "source", "col"]);
const DANGEROUS_BLOCK_RE = /<\s*(script|style|template)[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi;
const TAG_RE = /<\s*(\/?)([a-zA-Z][a-zA-Z0-9:-]*)([^>]*)>/g;
const ATTR_RE = /([^\s"'<>\/=]+)(?:\s*=\s*(?:"([^"<]*)"|'([^'<]*)'|([^\s"'=<>]+)))?/g;

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function isAllowedAttr(name: string) {
  return ALLOWED_ATTR_SET.has(name) || name.startsWith("data-");
}

function isSafeUri(value: string) {
  const trimmed = value.trim().replace(/[\u0000-\u001F\u007F\s]+/g, "");
  if (!trimmed) return false;
  if (
    trimmed.startsWith("#") ||
    trimmed.startsWith("/") ||
    trimmed.startsWith("./") ||
    trimmed.startsWith("../")
  ) {
    return true;
  }

  try {
    const url = new URL(trimmed, "https://maymanah.local");
    return ["http:", "https:", "mailto:", "tel:"].includes(url.protocol);
  } catch {
    return false;
  }
}

function sanitizeAttrs(rawAttrs: string) {
  const attrs: string[] = [];

  for (const match of rawAttrs.matchAll(ATTR_RE)) {
    const name = match[1]?.toLowerCase();
    if (!name || name.startsWith("on") || !isAllowedAttr(name)) continue;

    const value = match[2] ?? match[3] ?? match[4] ?? "";
    if (URI_ATTRS.has(name) && !isSafeUri(value)) continue;

    if (BOOLEAN_ATTRS.has(name) && !value) {
      attrs.push(name);
      continue;
    }

    if (name === "target") {
      attrs.push(`${name}="${escapeHtml(value || "_blank")}"`);
      if (!rawAttrs.toLowerCase().includes("rel=")) {
        attrs.push('rel="noopener noreferrer"');
      }
      continue;
    }

    attrs.push(`${name}="${escapeHtml(value)}"`);
  }

  return attrs.length > 0 ? ` ${attrs.join(" ")}` : "";
}

export function sanitizeHtml(dirty: string): string {
  return dirty
    .replace(DANGEROUS_BLOCK_RE, "")
    .replace(TAG_RE, (match, closing: string, tagName: string, attrs: string) => {
      const tag = tagName.toLowerCase();
      if (!ALLOWED_TAG_SET.has(tag)) return escapeHtml(match);
      if (closing) return VOID_TAGS.has(tag) ? "" : `</${tag}>`;
      return `<${tag}${sanitizeAttrs(attrs)}${VOID_TAGS.has(tag) ? " /" : ""}>`;
    });
}
