/**
 * Input Classifier Service
 *
 * Classifies user input into one of three categories (in order of precedence):
 * 1. City + Temperature — e.g. "Tokyo 25°C", "New York -5 degrees"
 * 2. Decimal Number    — e.g. "3.14", "100.75"
 * 3. General Text      — everything else (passed to LLM for tone analysis)
 */

// Regex: One or more capitalized words (city name) followed by a number with optional
// negative sign, optional decimal, and optional °C/degrees suffix
const CITY_TEMP_PATTERN =
  /^([A-Z][a-zA-Z]+(?:\s[A-Z][a-zA-Z]+)*)\s+(-?\d+\.?\d*)(?:\s*°?[Cc]|\s*degrees?)?\s*$/;

// Regex: A standalone decimal number (must contain a dot with digits after it)
const DECIMAL_PATTERN = /^-?\d+\.(\d+)\s*$/;

/**
 * Classify user input into a categorized result.
 *
 * @param {string} input - Raw user input
 * @returns {{ type: string, [key: string]: any }}
 */
function classifyInput(input) {
  const trimmed = (input || '').trim();

  if (!trimmed) {
    return { type: 'general-text', text: trimmed };
  }

  // Rule 1: City + Temperature (highest precedence)
  const cityTempMatch = trimmed.match(CITY_TEMP_PATTERN);
  if (cityTempMatch) {
    return {
      type: 'city-temperature',
      city: cityTempMatch[1],
      temperature: parseFloat(cityTempMatch[2]),
    };
  }

  // Rule 2: Standalone decimal number
  const decimalMatch = trimmed.match(DECIMAL_PATTERN);
  if (decimalMatch) {
    const decimalPart = decimalMatch[1];
    // Take first two digits, pad with trailing zero if only one digit
    const firstTwo = decimalPart.length === 1
      ? parseInt(decimalPart + '0', 10)
      : parseInt(decimalPart.substring(0, 2), 10);
    return {
      type: 'decimal-number',
      decimalDigits: firstTwo,
    };
  }

  // Rule 3: General text (lowest precedence)
  return { type: 'general-text', text: trimmed };
}

module.exports = { classifyInput };
