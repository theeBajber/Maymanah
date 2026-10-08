/**
 * Stands in for Next.js font loading inside the test runner.
 *
 * The real implementation downloads and processes font files at build time,
 * which never happens under Vitest. Anything under test that reaches a font
 * only needs the shape — a `className` string — so a stub returning the font
 * name is enough for every assertion that can meaningfully run here.
 */
function stubFont(name: string) {
  return () => ({ className: `font-${name}`, variable: `--font-${name}`, style: { fontFamily: name } });
}

export const Amiri = stubFont("amiri");
export const El_Messiri = stubFont("el-messiri");
export const IBM_Plex_Sans = stubFont("plex-sans");
export const IBM_Plex_Sans_Arabic = stubFont("plex-arabic");
export const Noto_Naskh_Arabic = stubFont("naskh");
