const { mapUrgencyToColor } = require('../../src/utils/urgencyColor');

describe('mapUrgencyToColor', () => {
  it('should return pale yellow for urgency score 0 (completely calm)', () => {
    const color = mapUrgencyToColor(0);
    const hue = parseFloat(color.match(/hsl\((\d+\.?\d*)/)[1]);
    // Pale yellow hue ~55
    expect(hue).toBeGreaterThanOrEqual(45);
    expect(hue).toBeLessThanOrEqual(65);
  });

  it('should return magenta for urgency score 5 (moderate)', () => {
    const color = mapUrgencyToColor(5);
    const hue = parseFloat(color.match(/hsl\((\d+\.?\d*)/)[1]);
    // Magenta hue ~300
    expect(hue).toBeGreaterThanOrEqual(290);
    expect(hue).toBeLessThanOrEqual(310);
  });

  it('should return bright violet for urgency score 10 (emergency)', () => {
    const color = mapUrgencyToColor(10);
    const hue = parseFloat(color.match(/hsl\((\d+\.?\d*)/)[1]);
    // Violet hue ~270
    expect(hue).toBeGreaterThanOrEqual(260);
    expect(hue).toBeLessThanOrEqual(280);
  });

  it('should produce a gradual transition from yellow to magenta (0-5)', () => {
    const color2 = mapUrgencyToColor(2);
    const color4 = mapUrgencyToColor(4);
    const hue2 = parseFloat(color2.match(/hsl\((\d+\.?\d*)/)[1]);
    const hue4 = parseFloat(color4.match(/hsl\((\d+\.?\d*)/)[1]);
    // Both should be between yellow(55) and magenta(300)
    // Since the path goes yellow -> higher hues -> magenta, or wraps around
    expect(hue2).not.toBe(hue4);
  });

  it('should produce a gradual transition from magenta to violet (5-10)', () => {
    const color7 = mapUrgencyToColor(7);
    const hue7 = parseFloat(color7.match(/hsl\((\d+\.?\d*)/)[1]);
    // Should be between magenta(300) and violet(270)
    expect(hue7).toBeGreaterThanOrEqual(265);
    expect(hue7).toBeLessThanOrEqual(305);
  });

  it('should always return a valid HSL string', () => {
    for (let s = 0; s <= 10; s++) {
      const color = mapUrgencyToColor(s);
      expect(color).toMatch(/^hsl\(\d+\.?\d*, \d+\.?\d*%, \d+\.?\d*%\)$/);
    }
  });

  it('should clamp scores below 0 to calm (pale yellow)', () => {
    const color = mapUrgencyToColor(-3);
    const hue = parseFloat(color.match(/hsl\((\d+\.?\d*)/)[1]);
    expect(hue).toBeGreaterThanOrEqual(45);
    expect(hue).toBeLessThanOrEqual(65);
  });

  it('should clamp scores above 10 to emergency (violet)', () => {
    const color = mapUrgencyToColor(15);
    const hue = parseFloat(color.match(/hsl\((\d+\.?\d*)/)[1]);
    expect(hue).toBeGreaterThanOrEqual(260);
    expect(hue).toBeLessThanOrEqual(280);
  });
});
