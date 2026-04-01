import { useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../hooks/useChat';
import MessageBubble from '../MessageBubble/MessageBubble';
import ChatInput from '../ChatInput/ChatInput';
import './ChatWindow.css';

const EXAMPLE_PROMPTS = [
  'Tokyo 25°C',
  'Paris -5°C',
  '3.14',
  '42.99',
  'Help! There\'s an emergency!',
  'Tell me about the nature of the soul',
];

export default function ChatWindow() {
  const { user, logout } = useAuth();
  const { messages, isLoading, error, sendMessage, clearChat } = useChat();
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  function handleExampleClick(prompt) {
    sendMessage(prompt);
  }

  return (
    <div className="chat-window" role="main" id="chat-window">
      {/* Header */}
      <header className="chat-header" role="banner">
        <div className="chat-header-left">
          <div className="chat-header-avatar" aria-hidden="true">🧠</div>
          <div className="chat-header-info">
            <h1>Ibn Sina (Avicenna)</h1>
            <p>AI Philosopher • Arabic + English</p>
          </div>
        </div>
        <div className="chat-header-actions">
          <span className="chat-user-email" aria-label={`Logged in as ${user?.email}`}>
            {user?.email}
          </span>
          <button
            className="chat-header-button"
            onClick={clearChat}
            aria-label="Start a new chat"
            id="new-chat-button"
          >
            ✨ New Chat
          </button>
          <button
            className="chat-header-button chat-header-button--danger"
            onClick={logout}
            aria-label="Sign out"
            id="logout-button"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Messages */}
      {messages.length === 0 ? (
        <div className="chat-empty" role="region" aria-label="Welcome message">
          <div className="chat-empty-icon" aria-hidden="true">🕌</div>
          <h2>Welcome, {user?.name || 'Scholar'}</h2>
          <p>
            I am Ibn Sina, the Persian polymath. Ask me anything and I shall respond
            with the wisdom of the ages — in Arabic and English.
          </p>
          <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
            Try different inputs to see dynamic coloring:
          </p>

          <div className="chat-empty-hints" role="list" aria-label="Example prompts">
            {EXAMPLE_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                className="chat-empty-hint"
                onClick={() => handleExampleClick(prompt)}
                role="listitem"
                aria-label={`Send example: ${prompt}`}
              >
                {prompt}
              </button>
            ))}
          </div>

          <div className="chat-legend" role="region" aria-label="Color rule legend">
            <div className="chat-legend-item">
              <div className="chat-legend-swatch" style={{ background: 'linear-gradient(90deg, hsl(240,100%,30%), hsl(0,100%,50%))' }} />
              <span>City + Temp → Blue↔Red</span>
            </div>
            <div className="chat-legend-item">
              <div className="chat-legend-swatch" style={{ background: 'linear-gradient(90deg, hsl(35,25%,95%), hsl(25,30%,10%))' }} />
              <span>Decimal → Sepia</span>
            </div>
            <div className="chat-legend-item">
              <div className="chat-legend-swatch" style={{ background: 'linear-gradient(90deg, hsl(55,80%,85%), hsl(270,100%,50%))' }} />
              <span>Urgency → Yellow↔Violet</span>
            </div>
          </div>
        </div>
      ) : (
        <div
          className="chat-messages"
          ref={messagesContainerRef}
          role="log"
          aria-live="polite"
          aria-label="Chat messages"
          id="chat-messages"
        >
          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}

          {isLoading && (
            <div className="typing-indicator" role="status" aria-label="Ibn Sina is thinking...">
              <span></span>
              <span></span>
              <span></span>
            </div>
          )}

          <div ref={messagesEndRef} aria-hidden="true" />
        </div>
      )}

      {/* Input */}
      <ChatInput onSend={sendMessage} isLoading={isLoading} error={error} />
    </div>
  );
}
