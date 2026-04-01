const { classifyInput } = require('../../src/services/inputClassifier.service');

describe('classifyInput', () => {
  describe('Rule 1: City + Temperature (highest precedence)', () => {
    it('should detect "Tokyo 25°C" as city-temperature', () => {
      const result = classifyInput('Tokyo 25°C');
      expect(result.type).toBe('city-temperature');
      expect(result.city).toBe('Tokyo');
      expect(result.temperature).toBe(25);
    });

    it('should detect "Paris -5°C" with negative temperature', () => {
      const result = classifyInput('Paris -5°C');
      expect(result.type).toBe('city-temperature');
      expect(result.city).toBe('Paris');
      expect(result.temperature).toBe(-5);
    });

    it('should detect "London 15 degrees" with word format', () => {
      const result = classifyInput('London 15 degrees');
      expect(result.type).toBe('city-temperature');
      expect(result.city).toBe('London');
      expect(result.temperature).toBe(15);
    });

    it('should detect "New York 30°C"', () => {
      const result = classifyInput('New York 30°C');
      expect(result.type).toBe('city-temperature');
      expect(result.city).toBe('New York');
      expect(result.temperature).toBe(30);
    });

    it('should detect "Mumbai 35"', () => {
      const result = classifyInput('Mumbai 35');
      expect(result.type).toBe('city-temperature');
      expect(result.city).toBe('Mumbai');
      expect(result.temperature).toBe(35);
    });

    it('should detect "Berlin -10°C"', () => {
      const result = classifyInput('Berlin -10°C');
      expect(result.type).toBe('city-temperature');
      expect(result.temperature).toBe(-10);
    });

    it('should detect "San Francisco 18.5°C" with decimal temp', () => {
      const result = classifyInput('San Francisco 18.5°C');
      expect(result.type).toBe('city-temperature');
      expect(result.city).toBe('San Francisco');
      expect(result.temperature).toBe(18.5);
    });

    it('should take precedence over decimal rule when city is present', () => {
      const result = classifyInput('Delhi 22.50');
      expect(result.type).toBe('city-temperature');
    });
  });

  describe('Rule 2: Decimal Number', () => {
    it('should detect "3.14" as decimal', () => {
      const result = classifyInput('3.14');
      expect(result.type).toBe('decimal-number');
      expect(result.decimalDigits).toBe(14);
    });

    it('should detect "100.75" as decimal', () => {
      const result = classifyInput('100.75');
      expect(result.type).toBe('decimal-number');
      expect(result.decimalDigits).toBe(75);
    });

    it('should detect "0.00" as decimal', () => {
      const result = classifyInput('0.00');
      expect(result.type).toBe('decimal-number');
      expect(result.decimalDigits).toBe(0);
    });

    it('should detect "42.99" as decimal', () => {
      const result = classifyInput('42.99');
      expect(result.type).toBe('decimal-number');
      expect(result.decimalDigits).toBe(99);
    });

    it('should extract only first two decimal digits from "1.23456"', () => {
      const result = classifyInput('1.23456');
      expect(result.type).toBe('decimal-number');
      expect(result.decimalDigits).toBe(23);
    });

    it('should handle single decimal digit "5.7" as "70"', () => {
      const result = classifyInput('5.7');
      expect(result.type).toBe('decimal-number');
      expect(result.decimalDigits).toBe(70);
    });

    it('should NOT classify integers without decimals as decimal-number', () => {
      const result = classifyInput('42');
      expect(result.type).toBe('general-text');
    });
  });

  describe('Rule 3: General Text (lowest precedence)', () => {
    it('should classify regular text as general-text', () => {
      const result = classifyInput('How are you today?');
      expect(result.type).toBe('general-text');
      expect(result.text).toBe('How are you today?');
    });

    it('should classify emotional text as general-text', () => {
      const result = classifyInput('Help! There is an emergency!');
      expect(result.type).toBe('general-text');
    });

    it('should classify greetings as general-text', () => {
      const result = classifyInput('Hello, nice to meet you');
      expect(result.type).toBe('general-text');
    });
  });

  describe('Edge cases', () => {
    it('should handle empty string as general-text', () => {
      const result = classifyInput('');
      expect(result.type).toBe('general-text');
    });

    it('should handle whitespace-only input', () => {
      const result = classifyInput('   ');
      expect(result.type).toBe('general-text');
    });
  });
});
