const { mapTemperatureToColor } = require('../../src/utils/temperatureColor');

describe('mapTemperatureToColor', () => {
  it('should return deep blue for temperatures at or below 0°C', () => {
    const color = mapTemperatureToColor(0);
    expect(color).toMatch(/^hsl\(/);
    // Hue should be around 240 (blue)
    const hue = parseFloat(color.match(/hsl\((\d+\.?\d*)/)[1]);
    expect(hue).toBeCloseTo(240, 0);
  });

  it('should return deep blue for very negative temperatures', () => {
    const color = mapTemperatureToColor(-20);
    const hue = parseFloat(color.match(/hsl\((\d+\.?\d*)/)[1]);
    expect(hue).toBeCloseTo(240, 0);
  });

  it('should return light purple for 15°C', () => {
    const color = mapTemperatureToColor(15);
    const hue = parseFloat(color.match(/hsl\((\d+\.?\d*)/)[1]);
    // Should be around 270 (purple range)
    expect(hue).toBeGreaterThanOrEqual(260);
    expect(hue).toBeLessThanOrEqual(280);
  });

  it('should return bright red for temperatures at or above 35°C', () => {
    const color = mapTemperatureToColor(35);
    const hue = parseFloat(color.match(/hsl\((\d+\.?\d*)/)[1]);
    // Hue should be 360 (red) or 0
    expect(hue >= 350 || hue <= 10).toBe(true);
  });

  it('should return bright red for very high temperatures', () => {
    const color = mapTemperatureToColor(50);
    const hue = parseFloat(color.match(/hsl\((\d+\.?\d*)/)[1]);
    expect(hue >= 350 || hue <= 10).toBe(true);
  });

  it('should return a color between blue and purple for 7°C', () => {
    const color = mapTemperatureToColor(7);
    const hue = parseFloat(color.match(/hsl\((\d+\.?\d*)/)[1]);
    expect(hue).toBeGreaterThan(240);
    expect(hue).toBeLessThan(280);
  });

  it('should return a color between purple and red for 25°C', () => {
    const color = mapTemperatureToColor(25);
    const hue = parseFloat(color.match(/hsl\((\d+\.?\d*)/)[1]);
    // Between purple (270) and red (360), going through the higher hues
    expect(hue).toBeGreaterThan(280);
    expect(hue).toBeLessThan(360);
  });

  it('should produce monotonically changing colors as temperature increases', () => {
    const temps = [-10, 0, 5, 10, 15, 20, 25, 30, 35, 40];
    const hues = temps.map((t) => {
      const color = mapTemperatureToColor(t);
      let hue = parseFloat(color.match(/hsl\((\d+\.?\d*)/)[1]);
      // Normalize: if hue > 240, it wraps around, so use (hue - 240) mod 360
      if (hue >= 240) hue = hue - 240;
      else hue = hue + 120; // wrap around 0/360 to keep ordering
      return hue;
    });
    for (let i = 1; i < hues.length; i++) {
      expect(hues[i]).toBeGreaterThanOrEqual(hues[i - 1]);
    }
  });

  it('should always return a valid HSL string', () => {
    const temps = [-50, -10, 0, 10, 15, 20, 35, 100];
    temps.forEach((t) => {
      const color = mapTemperatureToColor(t);
      expect(color).toMatch(/^hsl\(\d+\.?\d*, \d+\.?\d*%, \d+\.?\d*%\)$/);
    });
  });

  it('should handle decimal temperatures', () => {
    const color = mapTemperatureToColor(17.5);
    expect(color).toMatch(/^hsl\(/);
  });
});
