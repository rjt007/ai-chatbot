/**
 * Maps a temperature in Celsius to an HSL color string.
 *
 * Color spectrum:
 *   <= 0°C  → Deep Blue    hsl(240, 100%, 30%)
 *     15°C  → Light Purple  hsl(270, 60%, 60%)
 *   >= 35°C → Bright Red    hsl(360, 100%, 50%)
 *
 * Uses piecewise linear interpolation through two segments:
 *   Segment 1: 0°C → 15°C  (blue → purple)
 *   Segment 2: 15°C → 35°C (purple → red)
 */

const COLD_THRESHOLD = 0;
const MID_THRESHOLD = 15;
const HOT_THRESHOLD = 35;

const COLD_COLOR = { h: 240, s: 100, l: 30 };
const MID_COLOR = { h: 270, s: 60, l: 60 };
const HOT_COLOR = { h: 360, s: 100, l: 50 };

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

function mapTemperatureToColor(temperature) {
  const clampedTemp = clamp(temperature, COLD_THRESHOLD, HOT_THRESHOLD);

  let color;

  if (clampedTemp <= MID_THRESHOLD) {
    const ratio = (clampedTemp - COLD_THRESHOLD) / (MID_THRESHOLD - COLD_THRESHOLD);
    color = interpolateHSL(COLD_COLOR, MID_COLOR, ratio);
  } else {
    const ratio = (clampedTemp - MID_THRESHOLD) / (HOT_THRESHOLD - MID_THRESHOLD);
    color = interpolateHSL(MID_COLOR, HOT_COLOR, ratio);
  }

  return `hsl(${color.h}, ${color.s}%, ${color.l}%)`;
}

module.exports = { mapTemperatureToColor };
