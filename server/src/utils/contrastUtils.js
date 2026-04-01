/**
 * WCAG 2.0 contrast ratio utilities.
 *
 * Provides functions to:
 *   - Convert hex/HSL colors to RGB
 *   - Calculate relative luminance
 *   - Calculate contrast ratio between two colors
 *   - Determine accessible text color (black or white) for a given background
 */

const WCAG_AA_RATIO = 4.5;

/**
 * Convert a hex color string to an RGB object.
 * @param {string} hex - e.g. "#ff5733"
 * @returns {{ r: number, g: number, b: number }}
 */
function hexToRgb(hex) {
  const cleaned = hex.replace('#', '');
  return {
    r: parseInt(cleaned.substring(0, 2), 16),
    g: parseInt(cleaned.substring(2, 4), 16),
    b: parseInt(cleaned.substring(4, 6), 16),
  };
}

/**
 * Convert HSL values to an RGB object.
 * @param {number} h - Hue (0-360)
 * @param {number} s - Saturation (0-100)
 * @param {number} l - Lightness (0-100)
 * @returns {{ r: number, g: number, b: number }}
 */
function hslToRgb(h, s, l) {
  const sNorm = s / 100;
  const lNorm = l / 100;

  const chroma = (1 - Math.abs(2 * lNorm - 1)) * sNorm;
  const hPrime = h / 60;
  const x = chroma * (1 - Math.abs((hPrime % 2) - 1));
  const m = lNorm - chroma / 2;

  let r1 = 0;
  let g1 = 0;
  let b1 = 0;

  if (hPrime >= 0 && hPrime < 1) {
    r1 = chroma; g1 = x; b1 = 0;
  } else if (hPrime >= 1 && hPrime < 2) {
    r1 = x; g1 = chroma; b1 = 0;
  } else if (hPrime >= 2 && hPrime < 3) {
    r1 = 0; g1 = chroma; b1 = x;
  } else if (hPrime >= 3 && hPrime < 4) {
    r1 = 0; g1 = x; b1 = chroma;
  } else if (hPrime >= 4 && hPrime < 5) {
    r1 = x; g1 = 0; b1 = chroma;
  } else if (hPrime >= 5 && hPrime <= 6) {
    r1 = chroma; g1 = 0; b1 = x;
  }

  return {
    r: Math.round((r1 + m) * 255),
    g: Math.round((g1 + m) * 255),
    b: Math.round((b1 + m) * 255),
  };
}

/**
 * Calculate relative luminance of an RGB color per WCAG 2.0.
 * @param {{ r: number, g: number, b: number }} rgb
 * @returns {number} Relative luminance (0–1)
 */
function getRelativeLuminance({ r, g, b }) {
  const [rSrgb, gSrgb, bSrgb] = [r, g, b].map((channel) => {
    const normalized = channel / 255;
    return normalized <= 0.03928
      ? normalized / 12.92
      : Math.pow((normalized + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rSrgb + 0.7152 * gSrgb + 0.0722 * bSrgb;
}

/**
 * Calculate contrast ratio between two RGB colors per WCAG 2.0.
 * @param {{ r: number, g: number, b: number }} color1
 * @param {{ r: number, g: number, b: number }} color2
 * @returns {number} Contrast ratio (1–21)
 */
function getContrastRatio(color1, color2) {
  const lum1 = getRelativeLuminance(color1);
  const lum2 = getRelativeLuminance(color2);
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Parse an HSL string and return RGB.
 * @param {string} hslString - e.g. "hsl(240, 100%, 30%)"
 * @returns {{ r: number, g: number, b: number }}
 */
function parseHslString(hslString) {
  const match = hslString.match(/hsl\((\d+\.?\d*),\s*(\d+\.?\d*)%,\s*(\d+\.?\d*)%\)/);
  if (!match) {
    throw new Error(`Invalid HSL string: ${hslString}`);
  }
  return hslToRgb(parseFloat(match[1]), parseFloat(match[2]), parseFloat(match[3]));
}

/**
 * Determine accessible text color (black or white) for a given background.
 * Ensures WCAG AA compliance (contrast ratio >= 4.5:1).
 *
 * @param {string} bgColor - HSL color string, e.g. "hsl(240, 100%, 30%)"
 * @returns {string} "#000000" or "#ffffff"
 */
function getAccessibleTextColor(bgColor) {
  const bgRgb = parseHslString(bgColor);

  const whiteRgb = { r: 255, g: 255, b: 255 };
  const blackRgb = { r: 0, g: 0, b: 0 };

  const whiteContrast = getContrastRatio(whiteRgb, bgRgb);
  const blackContrast = getContrastRatio(blackRgb, bgRgb);

  // Prefer whichever gives better contrast; both should meet AA for most colors
  return whiteContrast >= blackContrast ? '#ffffff' : '#000000';
}

module.exports = {
  hexToRgb,
  hslToRgb,
  getRelativeLuminance,
  getContrastRatio,
  getAccessibleTextColor,
  parseHslString,
  WCAG_AA_RATIO,
};
