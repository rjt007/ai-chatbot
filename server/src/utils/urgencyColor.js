/**
 * Maps an urgency score (0-10) to an HSL color string.
 *
 * Spectrum:
 *   0 (calm)      → Pale Yellow    hsl(55, 80%, 85%)
 *   5 (moderate)  → Magenta        hsl(300, 70%, 50%)
 *   10 (emergency)→ Bright Violet  hsl(270, 100%, 50%)
 *
 * Uses piecewise linear interpolation:
 *   Segment 1: 0→5 (yellow → magenta)
 *   Segment 2: 5→10 (magenta → violet)
 */

const CALM_COLOR = { h: 55, s: 80, l: 85 };
const MODERATE_COLOR = { h: 300, s: 70, l: 50 };
const EMERGENCY_COLOR = { h: 270, s: 100, l: 50 };

const MIN_SCORE = 0;
const MID_SCORE = 5;
const MAX_SCORE = 10;

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function lerp(start, end, ratio) {
  return start + (end - start) * ratio;
}

function interpolateHSL(colorA, colorB, ratio) {
  return {
    h: Math.round(lerp(colorA.h, colorB.h, ratio) * 10) / 10,
    s: Math.round(lerp(colorA.s, colorB.s, ratio) * 10) / 10,
    l: Math.round(lerp(colorA.l, colorB.l, ratio) * 10) / 10,
  };
}

function mapUrgencyToColor(score) {
  const clampedScore = clamp(score, MIN_SCORE, MAX_SCORE);

  let color;

  if (clampedScore <= MID_SCORE) {
    const ratio = clampedScore / MID_SCORE;
    color = interpolateHSL(CALM_COLOR, MODERATE_COLOR, ratio);
  } else {
    const ratio = (clampedScore - MID_SCORE) / (MAX_SCORE - MID_SCORE);
    color = interpolateHSL(MODERATE_COLOR, EMERGENCY_COLOR, ratio);
  }

  return `hsl(${color.h}, ${color.s}%, ${color.l}%)`;
}

module.exports = { mapUrgencyToColor };
