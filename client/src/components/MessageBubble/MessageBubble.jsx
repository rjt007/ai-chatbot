import './MessageBubble.css';

const RULE_LABELS = {
  'city-temperature': 'Temperature',
  'decimal-number': 'Decimal',
  'urgency-tone': 'Urgency',
};

/**
 * Parse the assistant response into Arabic and English parts.
 * Expected format:
 *   [Arabic text]
 *
 *   Translation: [English text]
 */
function parseResponse(content) {
  if (!content) return { arabic: '', english: '' };

  // Try to split on "Translation:" marker
  const translationIndex = content.indexOf('Translation:');
  if (translationIndex !== -1) {
    const arabic = content.substring(0, translationIndex).trim();
    const english = content.substring(translationIndex + 'Translation:'.length).trim();
    return { arabic, english };
  }

  // Fallback: return entire content as-is
  return { arabic: content, english: '' };
}

export default function MessageBubble({ message }) {
  const isUser = message.role === 'user';
  const isAssistant = message.role === 'assistant';

  // Dynamic inline styles for assistant bubbles
  const bubbleStyle = isAssistant && message.backgroundColor
    ? {
        backgroundColor: message.backgroundColor,
        color: message.textColor || '#ffffff',
      }
    : undefined;

  // Parse response for RTL/LTR rendering
  const parsed = isAssistant ? parseResponse(message.content) : null;

  const ruleLabel = message.rule ? RULE_LABELS[message.rule] : null;

  return (
    <article
      className={`message-bubble ${isUser ? 'message-bubble--user' : 'message-bubble--assistant'}`}
      style={bubbleStyle}
      role="article"
      aria-label={
        isUser
          ? `Your message: ${message.content}`
          : `Ibn Sina's response, styled with ${ruleLabel || 'default'} color rule`
      }
    >
      {isUser && (
        <p>{message.content}</p>
      )}

      {isAssistant && parsed && (
        <>
          {parsed.arabic && (
            <div
              className="message-rtl"
              dir="rtl"
              lang="ar"
              aria-label="Response in Arabic"
            >
              {parsed.arabic}
            </div>
          )}
          {parsed.english && (
            <div
              className="message-ltr"
              dir="ltr"
              lang="en"
              aria-label="English translation"
            >
              <strong>Translation:</strong> {parsed.english}
            </div>
          )}
          {!parsed.english && !parsed.arabic && (
            <p>{message.content}</p>
          )}

          {ruleLabel && (
            <span
              className={`message-rule-badge message-rule-badge--${message.rule}`}
              aria-label={`Color rule: ${ruleLabel}`}
            >
              {ruleLabel}
            </span>
          )}

          {message.metadata && (
            <div className="message-metadata" aria-label="Message metadata">
              {message.metadata.city && (
                <span>📍 {message.metadata.city}</span>
              )}
              {message.metadata.temperature !== undefined && (
                <span>🌡️ {message.metadata.temperature}°C</span>
              )}
              {message.metadata.decimalDigits !== undefined && (
                <span>🔢 .{String(message.metadata.decimalDigits).padStart(2, '0')}</span>
              )}
              {message.metadata.urgencyScore !== undefined && (
                <span>⚡ Urgency: {message.metadata.urgencyScore}/10</span>
              )}
            </div>
          )}
        </>
      )}
    </article>
  );
}
