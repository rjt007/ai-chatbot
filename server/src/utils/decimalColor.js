/**
 * Maps the first two decimal digits (0-99) to a sepia/warm grayscale HSL color.
 *
 * Spectrum:
 *   .00 → Lightest sepia  hsl(35, 25%, 95%)
 *   .50 → Mid-tone sepia  hsl(30, 20%, 50%)
 *   .99 → Darkest sepia   hsl(25, 30%, 10%)
 *
 * Lightness decreases linearly from 95% to 10%.
 * Hue shifts slightly from 35 to 25 (warm brown tones).
 * Saturation varies subtly for natural sepia feel.
 */

const LIGHTEST = { h: 35, s: 25, l: 95 };
const DARKEST = { h: 25, s: 30, l: 10 };

const MIN_DECIMAL = 0;
const MAX_DECIMAL = 99;

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function lerp(start, end, ratio) {
  return start + (end - start) * ratio;
}

function mapDecimalToColor(decimalDigits) {
  const clamped = clamp(decimalDigits, MIN_DECIMAL, MAX_DECIMAL);
  const ratio = clamped / MAX_DECIMAL;

  const h = Math.round(lerp(LIGHTEST.h, DARKEST.h, ratio) * 10) / 10;
  const s = Math.round(lerp(LIGHTEST.s, DARKEST.s, ratio) * 10) / 10;
  const l = Math.round(lerp(LIGHTEST.l, DARKEST.l, ratio) * 10) / 10;

  return `hsl(${h}, ${s}%, ${l}%)`;
}

module.exports = { mapDecimalToColor };
