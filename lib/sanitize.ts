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

let _purify: typeof import("isomorphic-dompurify") | null = null;

function getPurify() {
  if (!_purify) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    _purify = require("isomorphic-dompurify") as typeof import("isomorphic-dompurify");
  }
  return _purify;
}

export function sanitizeHtml(dirty: string): string {
  return getPurify().sanitize(dirty, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOW_DATA_ATTR: true,
    ADD_ATTR: ["target"],
  }) as string;
}
