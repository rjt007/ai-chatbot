import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './components/LoginPage/LoginPage';
import ChatWindow from './components/ChatWindow/ChatWindow';
import './App.css';

function AppContent() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="app-loading" role="status" aria-label="Loading application">
        <div className="app-loading-spinner" aria-hidden="true" />
        <span className="visually-hidden">Loading...</span>
      </div>
    );
  }

  return isAuthenticated ? <ChatWindow /> : <LoginPage />;
}

export default function App() {
  return (
    <AuthProvider>
      {/* Skip link for keyboard users (WCAG 2.0) */}
      <a href="#chat-message-input" className="skip-link">
        Skip to chat input
      </a>
      <AppContent />
    </AuthProvider>
  );
}
