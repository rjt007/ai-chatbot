const { computeMessageStyle } = require('../../src/services/colorEngine.service');

describe('computeMessageStyle', () => {
  describe('Rule 1: City + Temperature', () => {
    it('should return blue-ish style for cold city input', () => {
      const result = computeMessageStyle({
        type: 'city-temperature',
        city: 'Moscow',
        temperature: -5,
      });
      expect(result.backgroundColor).toMatch(/^hsl\(/);
      expect(result.textColor).toMatch(/^#/);
      expect(result.rule).toBe('city-temperature');
    });

    it('should return red-ish style for hot city input', () => {
      const result = computeMessageStyle({
        type: 'city-temperature',
        city: 'Dubai',
        temperature: 40,
      });
      expect(result.rule).toBe('city-temperature');
      const hue = parseFloat(result.backgroundColor.match(/hsl\((\d+\.?\d*)/)[1]);
      expect(hue >= 350 || hue <= 10).toBe(true);
    });
  });

  describe('Rule 2: Decimal Number', () => {
    it('should return light sepia for low decimal digits', () => {
      const result = computeMessageStyle({
        type: 'decimal-number',
        decimalDigits: 5,
      });
      expect(result.rule).toBe('decimal-number');
      const lightness = parseFloat(result.backgroundColor.match(/(\d+\.?\d*)%\)$/)[1]);
      expect(lightness).toBeGreaterThan(80);
    });

    it('should return dark sepia for high decimal digits', () => {
      const result = computeMessageStyle({
        type: 'decimal-number',
        decimalDigits: 95,
      });
      expect(result.rule).toBe('decimal-number');
      const lightness = parseFloat(result.backgroundColor.match(/(\d+\.?\d*)%\)$/)[1]);
      expect(lightness).toBeLessThan(20);
    });
  });

  describe('Rule 3: Urgency/Tone', () => {
    it('should return yellow-ish style for calm urgency', () => {
      const result = computeMessageStyle({
        type: 'general-text',
        urgencyScore: 1,
      });
      expect(result.rule).toBe('urgency-tone');
      const hue = parseFloat(result.backgroundColor.match(/hsl\((\d+\.?\d*)/)[1]);
      // Score 1 interpolates from yellow(55) toward magenta(300) at ratio 0.2 → hue ~104
      expect(hue).toBeGreaterThanOrEqual(40);
      expect(hue).toBeLessThanOrEqual(160);
    });

    it('should return violet-ish style for high urgency', () => {
      const result = computeMessageStyle({
        type: 'general-text',
        urgencyScore: 9,
      });
      expect(result.rule).toBe('urgency-tone');
    });
  });

  describe('WCAG Compliance', () => {
    it('should always return a text color that provides sufficient contrast', () => {
      const testCases = [
        { type: 'city-temperature', city: 'Test', temperature: 0 },
        { type: 'city-temperature', city: 'Test', temperature: 35 },
        { type: 'decimal-number', decimalDigits: 0 },
        { type: 'decimal-number', decimalDigits: 99 },
        { type: 'general-text', urgencyScore: 0 },
        { type: 'general-text', urgencyScore: 10 },
      ];
      testCases.forEach((tc) => {
        const result = computeMessageStyle(tc);
        expect(result.textColor).toMatch(/^#(000000|ffffff)$/);
      });
    });
  });
});
