const { mapDecimalToColor } = require('../../src/utils/decimalColor');

describe('mapDecimalToColor', () => {
  it('should return the lightest color for decimal .00', () => {
    const color = mapDecimalToColor(0);
    const lightness = parseFloat(color.match(/(\d+\.?\d*)%\)$/)[1]);
    expect(lightness).toBeGreaterThanOrEqual(90);
  });

  it('should return a mid-tone for decimal .50', () => {
    const color = mapDecimalToColor(50);
    const lightness = parseFloat(color.match(/(\d+\.?\d*)%\)$/)[1]);
    expect(lightness).toBeGreaterThanOrEqual(40);
    expect(lightness).toBeLessThanOrEqual(60);
  });

  it('should return the darkest color for decimal .99', () => {
    const color = mapDecimalToColor(99);
    const lightness = parseFloat(color.match(/(\d+\.?\d*)%\)$/)[1]);
    expect(lightness).toBeLessThanOrEqual(15);
  });

  it('should return a nearly light color for decimal .01', () => {
    const color = mapDecimalToColor(1);
    const lightness = parseFloat(color.match(/(\d+\.?\d*)%\)$/)[1]);
    expect(lightness).toBeGreaterThanOrEqual(85);
  });

  it('should have decreasing lightness as decimal increases', () => {
    const decimals = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 99];
    const lightnesses = decimals.map((d) => {
      const color = mapDecimalToColor(d);
      return parseFloat(color.match(/(\d+\.?\d*)%\)$/)[1]);
    });
    for (let i = 1; i < lightnesses.length; i++) {
      expect(lightnesses[i]).toBeLessThanOrEqual(lightnesses[i - 1]);
    }
  });

  it('should return a valid HSL string', () => {
    for (let d = 0; d <= 99; d += 10) {
      const color = mapDecimalToColor(d);
      expect(color).toMatch(/^hsl\(\d+\.?\d*, \d+\.?\d*%, \d+\.?\d*%\)$/);
    }
  });

  it('should have a sepia/warm hue component', () => {
    const color = mapDecimalToColor(50);
    const hue = parseFloat(color.match(/hsl\((\d+\.?\d*)/)[1]);
    // Sepia tones are around hue 30-40
    expect(hue).toBeGreaterThanOrEqual(20);
    expect(hue).toBeLessThanOrEqual(45);
  });

  it('should clamp values below 0 to lightest', () => {
    const color = mapDecimalToColor(-5);
    const lightness = parseFloat(color.match(/(\d+\.?\d*)%\)$/)[1]);
    expect(lightness).toBeGreaterThanOrEqual(90);
  });

  it('should clamp values above 99 to darkest', () => {
    const color = mapDecimalToColor(150);
    const lightness = parseFloat(color.match(/(\d+\.?\d*)%\)$/)[1]);
    expect(lightness).toBeLessThanOrEqual(15);
  });
});
