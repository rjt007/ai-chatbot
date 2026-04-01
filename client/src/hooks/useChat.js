import { useState, useCallback, useRef } from 'react';
import api from '../utils/api';

export function useChat() {
  const [messages, setMessages] = useState([]);
  const [sessionId, setSessionId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const abortControllerRef = useRef(null);

  const sendMessage = useCallback(async (messageText) => {
    if (!messageText.trim() || isLoading) return;

    setError(null);

    // Add user message to state immediately
    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: messageText.trim(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      abortControllerRef.current = new AbortController();

      const response = await api.post(
        '/chat/message',
        {
          message: messageText.trim(),
          sessionId,
        },
        { signal: abortControllerRef.current.signal }
      );

      const data = response.data.data;

      // Update session ID if new
      if (data.sessionId) {
        setSessionId(data.sessionId);
      }

      // Add assistant message with styling
      const assistantMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: data.response,
        backgroundColor: data.backgroundColor,
        textColor: data.textColor,
        rule: data.rule,
        metadata: data.metadata,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      if (err.name !== 'CanceledError') {
        const errorMsg = err.response?.data?.error || 'Failed to send message. Please try again.';
        setError(errorMsg);
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  }, [sessionId, isLoading]);

  const clearChat = useCallback(() => {
    setMessages([]);
    setSessionId(null);
    setError(null);
  }, []);

  const cancelRequest = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  return {
    messages,
    isLoading,
    error,
    sessionId,
    sendMessage,
    clearChat,
    cancelRequest,
  };
}
