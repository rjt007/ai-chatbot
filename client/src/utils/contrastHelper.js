/**
 * Client-side WCAG contrast helper.
 * Used as a fallback to ensure text is readable against dynamic backgrounds.
 */

/**
 * Parse an HSL color string to {h, s, l} object.
 */
export function parseHSL(hslString) {
  const match = hslString.match(/hsl\((\d+\.?\d*),\s*(\d+\.?\d*)%,\s*(\d+\.?\d*)%\)/);
  if (!match) return null;
  return {
    h: parseFloat(match[1]),
    s: parseFloat(match[2]),
    l: parseFloat(match[3]),
  };
}

/**
 * Determine if text should be light or dark on a given background.
 * Quick heuristic based on lightness.
 */
export function getTextColorForBackground(bgColor) {
  if (!bgColor) return '#ffffff';
  const parsed = parseHSL(bgColor);
  if (!parsed) return '#ffffff';
  return parsed.l > 55 ? '#000000' : '#ffffff';
}
