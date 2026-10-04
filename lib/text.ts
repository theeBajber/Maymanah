/**
 * Helpers for normalising untrusted text before it is validated or stored.
 *
 * These functions only ever remove or canonicalise characters. They do not
 * enforce length limits: that is the schema's job, so a value that is too long
 * is rejected outright rather than silently truncated. Truncation loses data
 * the user did not intend to discard, and it makes a stored value disagree
 * with what they submitted.
 *
 * Nothing here interprets markup. Text that reaches the page is rendered as
 * React children, which escape it by construction. There is deliberately no
 * HTML sanitizer, because a correct one is a large piece of security-critical
 * code and the correct way to render untrusted content is not to hand it a
 * string of HTML in the first place.
 */

/**
 * Control characters, excluding tab and newline. Also covers the C1 range,
 * which contains characters that render as nothing but survive round-trips
 * through a database.
 */
const CONTROL_CHARACTERS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g;

/** Any whitespace, for collapsing runs down to a single space. */
const ANY_WHITESPACE = /\s+/g;

/** Three or more consecutive newlines, collapsed to a paragraph break. */
const EXCESS_BLANK_LINES = /\n{3,}/g;

/** Runs of horizontal whitespace, collapsed to a single space. */
const PADDED_RUN = /[^\S\n]+/g;

/** Spaces hugging a line break, which are invisible and carry no meaning. */
const SPACE_AROUND_BREAK = / *\n */g;

/**
 * Applies Unicode NFC normalisation, which is what stops two visually identical
 * names from being stored as different records, and stops lookalike sequences
 * from being used to impersonate an existing account.
 */
function normalise(value: string): string {
  return value.normalize("NFC");
}

/**
 * Normalises a value that must occupy a single line, such as a name or an
 * email address. Newlines and tabs are removed rather than replaced with
 * spaces, so a value containing them cannot masquerade as a shorter one.
 */
export function toSingleLine(value: string): string {
  return normalise(value).replaceAll(/[\r\n\t]+/g, "").replace(CONTROL_CHARACTERS, "").replace(ANY_WHITESPACE, " ").trim();
}

/**
 * Normalises a value that may span multiple lines, such as a message or a
 * teacher's notes. Line structure is preserved; runs of more than two
 * newlines are reduced to a single blank line so that pasted text cannot inflate
 * the stored document.
 */
export function toMultiLine(value: string): string {
  return normalise(value)
    .replaceAll("\r\n", "\n")
    .replaceAll("\r", "\n")
    .replace(CONTROL_CHARACTERS, "")
    .replace(PADDED_RUN, " ")
    .replace(SPACE_AROUND_BREAK, "\n")
    .replace(EXCESS_BLANK_LINES, "\n\n")
    .trim();
}

/**
 * Escapes text for interpolation into an HTML string.
 *
 * Only for the places that genuinely produce markup as text — metadata images,
 * transactional email. Prefer rendering React children, which need none of this.
 */
export function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
