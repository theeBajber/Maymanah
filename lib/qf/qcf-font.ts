export const QCF_FONT_LAST_PAGE = 604;

export function qcfFontFamily(pageNumber: number): string {
  return `qcf-p${pageNumber}-v2`;
}

export function qcfFontUrl(pageNumber: number): string {
  return `/api/quran/font/${pageNumber}`;
}

export function qcfFontFaceCss(pageNumber: number): string {
  return `@font-face{font-family:"${qcfFontFamily(pageNumber)}";src:url("${qcfFontUrl(pageNumber)}") format("woff2");font-display:block;}`;
}
