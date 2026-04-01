/**
 * Color Engine Service
 *
 * Orchestrates the mapping of classified input to styled message properties.
 * Combines the appropriate color mapper with WCAG contrast utilities.
 */

const { mapTemperatureToColor } = require('../utils/temperatureColor');
const { mapDecimalToColor } = require('../utils/decimalColor');
const { mapUrgencyToColor } = require('../utils/urgencyColor');
const { getAccessibleTextColor } = require('../utils/contrastUtils');

/**
 * Compute the visual style for a chatbot response message.
 *
 * @param {{ type: string, [key: string]: any }} classifiedInput
 *   - type: 'city-temperature' → requires { temperature }
 *   - type: 'decimal-number'   → requires { decimalDigits }
 *   - type: 'general-text'     → requires { urgencyScore }
 *
 * @returns {{ backgroundColor: string, textColor: string, rule: string }}
 */
function computeMessageStyle(classifiedInput) {
  let backgroundColor;
  let rule;

  switch (classifiedInput.type) {
    case 'city-temperature':
      backgroundColor = mapTemperatureToColor(classifiedInput.temperature);
      rule = 'city-temperature';
      break;

    case 'decimal-number':
      backgroundColor = mapDecimalToColor(classifiedInput.decimalDigits);
      rule = 'decimal-number';
      break;

    case 'general-text':
    default:
      backgroundColor = mapUrgencyToColor(classifiedInput.urgencyScore || 0);
      rule = 'urgency-tone';
      break;
  }

  const textColor = getAccessibleTextColor(backgroundColor);

  return { backgroundColor, textColor, rule };
}

module.exports = { computeMessageStyle };
