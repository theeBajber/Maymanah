import DOMPurify from "isomorphic-dompurify";

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

export function sanitizeHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOW_DATA_ATTR: true,
    ADD_ATTR: ["target"],
  });
}
