import { describe, expect, it } from "vitest";

import { escapeHtml, toMultiLine, toSingleLine } from "./text";

/** Characters that render as nothing but survive a round-trip through storage. */
const NUL = String.fromCharCode(0x00);
const BELL = String.fromCharCode(0x07);
const COMBINING_ACUTE = String.fromCharCode(0x0301);

const WITH_CONTROL_CHARACTERS = `Amina${NUL}${BELL}`;

/** "e" followed by a combining acute, which NFC folds into a single codepoint. */
const DECOMPOSED = `e${COMBINING_ACUTE}`;

/** The precomposed form of DECOMPOSED. */
const COMPOSED = String.fromCharCode(0x00e9);

describe("toSingleLine", () => {
  it("trims surrounding whitespace", () => {
    expect(toSingleLine("  Amina  ")).toBe("Amina");
  });

  it("collapses internal whitespace to single spaces", () => {
    expect(toSingleLine("Amina   Yusuf")).toBe("Amina Yusuf");
  });

  it("keeps the space between words", () => {
    expect(toSingleLine("hello world")).toBe("hello world");
  });

  it("removes line breaks and tabs rather than replacing them with spaces", () => {
    expect(toSingleLine("Amina\nYusuf")).toBe("AminaYusuf");
    expect(toSingleLine("Amina\tYusuf")).toBe("AminaYusuf");
  });

  it("strips control characters that render as nothing", () => {
    expect(toSingleLine(WITH_CONTROL_CHARACTERS)).toBe("Amina");
  });

  it("folds decomposed characters, so lookalike names resolve to one record", () => {
    expect(DECOMPOSED).not.toBe(COMPOSED);
    expect(toSingleLine(DECOMPOSED)).toBe(COMPOSED);
  });

  it("returns an empty string when only removable characters were supplied", () => {
    expect(toSingleLine("\n\t  ")).toBe("");
  });
});

describe("toMultiLine", () => {
  it("preserves line structure", () => {
    expect(toMultiLine("first\nsecond")).toBe("first\nsecond");
  });

  it("converts windows and classic mac line endings", () => {
    expect(toMultiLine("first\r\nsecond")).toBe("first\nsecond");
    expect(toMultiLine("first\rsecond")).toBe("first\nsecond");
  });

  it("keeps the space between words on a line", () => {
    expect(toMultiLine("hello world")).toBe("hello world");
  });

  it("collapses runs of blank lines to a single paragraph break", () => {
    expect(toMultiLine("first\n\n\n\n\nsecond")).toBe("first\n\nsecond");
  });

  it("keeps a deliberate blank line", () => {
    expect(toMultiLine("first\n\nsecond")).toBe("first\n\nsecond");
  });

  it("removes whitespace hugging a line break", () => {
    expect(toMultiLine("first   \n   second")).toBe("first\nsecond");
  });

  it("strips control characters without joining the lines around them", () => {
    expect(toMultiLine(`first${NUL}\nsecond`)).toBe("first\nsecond");
  });

  it("trims the document as a whole without touching interior blank lines", () => {
    expect(toMultiLine("\n\nfirst\n\nsecond\n\n")).toBe("first\n\nsecond");
  });
});

describe("escapeHtml", () => {
  it("escapes every character that could break out of markup", () => {
    expect(escapeHtml("<script>alert('x')</script>")).toBe(
      "&lt;script&gt;alert(&#39;x&#39;)&lt;/script&gt;",
    );
  });

  it("escapes ampersands before the entities it introduces", () => {
    expect(escapeHtml("Tom & Jerry")).toBe("Tom &amp; Jerry");
  });

  it("escapes both quote styles", () => {
    expect(escapeHtml(`"'`)).toBe("&quot;&#39;");
  });

  it("leaves ordinary text untouched", () => {
    expect(escapeHtml("The Quran Without Borders")).toBe("The Quran Without Borders");
  });
});
