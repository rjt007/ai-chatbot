import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import './LoginPage.css';

export default function LoginPage() {
  const { login, register } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const emailRef = useRef(null);
  const nameRef = useRef(null);

  useEffect(() => {
    // Focus first field on mode switch
    if (isRegister && nameRef.current) {
      nameRef.current.focus();
    } else if (!isRegister && emailRef.current) {
      emailRef.current.focus();
    }
  }, [isRegister]);

  function validateForm() {
    const newErrors = {};

    if (isRegister && !formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!formData.email.toLowerCase().endsWith('@petasight.com')) {
      newErrors.email = 'Only @petasight.com emails are allowed';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setServerError('');

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      if (isRegister) {
        await register(formData.name.trim(), formData.email.trim().toLowerCase(), formData.password);
      } else {
        await login(formData.email.trim().toLowerCase(), formData.password);
      }
    } catch (err) {
      const message = err.response?.data?.error || 'An error occurred. Please try again.';
      setServerError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleChange(field) {
    return (e) => {
      setFormData((prev) => ({ ...prev, [field]: e.target.value }));
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: '' }));
      }
    };
  }

  function toggleMode() {
    setIsRegister((prev) => !prev);
    setErrors({});
    setServerError('');
    setFormData({ name: '', email: '', password: '' });
  }

  return (
    <main className="login-page" role="main">
      <div className="login-card" role="region" aria-label={isRegister ? 'Create Account' : 'Sign In'}>
        <header className="login-header">
          <div className="login-logo" aria-hidden="true">🤖</div>
          <h1 className="login-title">
            {isRegister ? 'Create Account' : 'Welcome Back'}
          </h1>
          <p className="login-subtitle">
            {isRegister
              ? 'Join the AI Chatbot powered by the wisdom of Ibn Sina'
              : 'Sign in to continue your conversation with Ibn Sina'}
          </p>
          <div className="login-domain-badge" aria-label="Restricted to Petasight email addresses">
            🔒 @petasight.com only
          </div>
        </header>

        {serverError && (
          <div className="alert-error" role="alert" aria-live="assertive" id="server-error">
            {serverError}
          </div>
        )}

        <form className="login-form" onSubmit={handleSubmit} noValidate>
          {isRegister && (
            <div className="form-group">
              <label className="form-label" htmlFor="register-name">
                Full Name
              </label>
              <input
                ref={nameRef}
                id="register-name"
                className={`form-input ${errors.name ? 'input-error' : ''}`}
                type="text"
                placeholder="Your full name"
                value={formData.name}
                onChange={handleChange('name')}
                aria-required="true"
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? 'name-error' : undefined}
                autoComplete="name"
              />
              {errors.name && (
                <span className="form-error" id="name-error" role="alert">
                  {errors.name}
                </span>
              )}
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="login-email">
              Email Address
            </label>
            <input
              ref={emailRef}
              id="login-email"
              className={`form-input ${errors.email ? 'input-error' : ''}`}
              type="email"
              placeholder="you@petasight.com"
              value={formData.email}
              onChange={handleChange('email')}
              aria-required="true"
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? 'email-error' : 'email-hint'}
              autoComplete="email"
            />
            {errors.email ? (
              <span className="form-error" id="email-error" role="alert">
                {errors.email}
              </span>
            ) : (
              <span className="form-hint" id="email-hint">
                Must be a @petasight.com email address
              </span>
            )}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="login-password">
              Password
            </label>
            <input
              id="login-password"
              className={`form-input ${errors.password ? 'input-error' : ''}`}
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange('password')}
              aria-required="true"
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? 'password-error' : 'password-hint'}
              autoComplete={isRegister ? 'new-password' : 'current-password'}
              minLength={8}
            />
            {errors.password ? (
              <span className="form-error" id="password-error" role="alert">
                {errors.password}
              </span>
            ) : (
              <span className="form-hint" id="password-hint">
                Minimum 8 characters
              </span>
            )}
          </div>

          <button
            className="login-button"
            type="submit"
            disabled={isSubmitting}
            aria-busy={isSubmitting}
          >
            {isSubmitting && <span className="spinner" aria-hidden="true" />}
            {isSubmitting
              ? 'Please wait...'
              : isRegister
                ? 'Create Account'
                : 'Sign In'}
          </button>
        </form>

        <div className="login-toggle">
          {isRegister ? 'Already have an account? ' : "Don't have an account? "}
          <button onClick={toggleMode} type="button">
            {isRegister ? 'Sign In' : 'Create Account'}
          </button>
        </div>
      </div>
    </main>
  );
}
