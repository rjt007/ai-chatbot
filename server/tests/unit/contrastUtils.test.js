const {
  getContrastRatio,
  getAccessibleTextColor,
  hexToRgb,
  hslToRgb,
} = require('../../src/utils/contrastUtils');

describe('hexToRgb', () => {
  it('should convert white hex to RGB', () => {
    expect(hexToRgb('#ffffff')).toEqual({ r: 255, g: 255, b: 255 });
  });

  it('should convert black hex to RGB', () => {
    expect(hexToRgb('#000000')).toEqual({ r: 0, g: 0, b: 0 });
  });

  it('should convert a color hex to RGB', () => {
    expect(hexToRgb('#ff5733')).toEqual({ r: 255, g: 87, b: 51 });
  });
});

describe('hslToRgb', () => {
  it('should convert pure red hsl(0, 100%, 50%)', () => {
    const rgb = hslToRgb(0, 100, 50);
    expect(rgb.r).toBe(255);
    expect(rgb.g).toBe(0);
    expect(rgb.b).toBe(0);
  });

  it('should convert white hsl(0, 0%, 100%)', () => {
    const rgb = hslToRgb(0, 0, 100);
    expect(rgb.r).toBe(255);
    expect(rgb.g).toBe(255);
    expect(rgb.b).toBe(255);
  });

  it('should convert black hsl(0, 0%, 0%)', () => {
    const rgb = hslToRgb(0, 0, 0);
    expect(rgb.r).toBe(0);
    expect(rgb.g).toBe(0);
    expect(rgb.b).toBe(0);
  });
});

describe('getContrastRatio', () => {
  it('should return 21:1 for black on white', () => {
    const ratio = getContrastRatio({ r: 0, g: 0, b: 0 }, { r: 255, g: 255, b: 255 });
    expect(ratio).toBeCloseTo(21, 0);
  });

  it('should return 1:1 for same colors', () => {
    const ratio = getContrastRatio({ r: 128, g: 128, b: 128 }, { r: 128, g: 128, b: 128 });
    expect(ratio).toBeCloseTo(1, 0);
  });

  it('should return a ratio > 4.5 for black on mid-grey', () => {
    const ratio = getContrastRatio({ r: 0, g: 0, b: 0 }, { r: 186, g: 186, b: 186 });
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });
});

describe('getAccessibleTextColor', () => {
  it('should return white text on a dark background', () => {
    // Deep blue background
    const textColor = getAccessibleTextColor('hsl(240, 100%, 30%)');
    expect(textColor).toBe('#ffffff');
  });

  it('should return black text on a light background', () => {
    // Light yellow background
    const textColor = getAccessibleTextColor('hsl(55, 80%, 85%)');
    expect(textColor).toBe('#000000');
  });

  it('should always meet WCAG AA contrast ratio of 4.5:1', () => {
    const testColors = [
      'hsl(240, 100%, 30%)',
      'hsl(270, 60%, 60%)',
      'hsl(0, 100%, 50%)',
      'hsl(30, 25%, 50%)',
      'hsl(55, 80%, 85%)',
      'hsl(300, 70%, 50%)',
      'hsl(270, 100%, 50%)',
    ];
    testColors.forEach((bgColor) => {
      const textColor = getAccessibleTextColor(bgColor);
      const textRgb = textColor === '#ffffff'
        ? { r: 255, g: 255, b: 255 }
        : { r: 0, g: 0, b: 0 };
      const hslMatch = bgColor.match(/hsl\((\d+\.?\d*),\s*(\d+\.?\d*)%,\s*(\d+\.?\d*)%\)/);
      const bgRgb = hslToRgb(
        parseFloat(hslMatch[1]),
        parseFloat(hslMatch[2]),
        parseFloat(hslMatch[3])
      );
      const ratio = getContrastRatio(textRgb, bgRgb);
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    });
  });
});
