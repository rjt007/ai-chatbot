import { useState, useRef } from 'react';
import './ChatInput.css';

const MAX_CHARS = 1000;

export default function ChatInput({ onSend, isLoading, error }) {
  const [message, setMessage] = useState('');
  const textareaRef = useRef(null);

  function handleSubmit(e) {
    e.preventDefault();
    if (!message.trim() || isLoading) return;
    onSend(message);
    setMessage('');
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  }

  function handleChange(e) {
    const value = e.target.value;
    if (value.length <= MAX_CHARS) {
      setMessage(value);
      // Auto-resize textarea
      const textarea = textareaRef.current;
      if (textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 150) + 'px';
      }
    }
  }

  return (
    <div className="chat-input-container">
      {error && (
        <div className="chat-error" role="alert" aria-live="assertive">
          {error}
        </div>
      )}
      <form className="chat-input-form" onSubmit={handleSubmit}>
        <div className="chat-input-wrapper">
          <textarea
            ref={textareaRef}
            className="chat-input"
            placeholder="Ask Ibn Sina anything... (e.g., 'Tokyo 25°C', '3.14', or a question)"
            value={message}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            rows={1}
            aria-label="Type your message"
            aria-describedby="char-count"
            disabled={isLoading}
            id="chat-message-input"
          />
          <span
            className="chat-input-char-count"
            id="char-count"
            aria-live="polite"
            aria-atomic="true"
          >
            {message.length}/{MAX_CHARS}
          </span>
        </div>
        <button
          className="chat-send-button"
          type="submit"
          disabled={!message.trim() || isLoading}
          aria-label={isLoading ? 'Sending message...' : 'Send message'}
          id="chat-send-button"
        >
          {isLoading ? '⏳' : '➤'}
        </button>
      </form>
    </div>
  );
}
