import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LogIn, Eye, EyeOff, Shield } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import LanguageToggle from '../../components/common/LanguageToggle';
import './AdminLogin.css';


const AdminLogin = () => {
  const { t } = useTranslation('admin');
  const navigate = useNavigate();
  const { login, loading, error, isAuthenticated, initializing } = useAuth();
  
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);


  useEffect(() => {
    // Only redirect if we're sure user is authenticated and not initializing
    if (isAuthenticated && !initializing) {
      navigate('/admin-dashboard', { replace: true });
    }
  }, [isAuthenticated, initializing, navigate]);


  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(credentials);
      // Navigation will happen via useEffect after state update
    } catch (error) {
      console.error('Login failed:', error);
    }
  };


  const handleChange = (e) => {
    setCredentials(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };


  // Show loading while initializing to prevent flash
  if (initializing) {
    return (
      <div className="login-loading-container">
        <div className="loading-content">
          <div className="loading-spinner"></div>
          <p className="loading-text">Loading...</p>
        </div>
      </div>
    );
  }


  // Don't render login form if user is authenticated
  if (isAuthenticated) {
    return null;
  }


  return (
    <div className="login-container">
      <div className="language-toggle-wrapper">
        <LanguageToggle />
      </div>
      
      <div className="login-card">
        {/* Header */}
        <div className="login-header">
          <div className="login-icon-wrapper">
            <Shield className="login-icon" />
          </div>
          <h1 className="login-title">
            {t('login.title')}
          </h1>
          <p className="login-subtitle">
            {t('login.subtitle')}
          </p>
        </div>


        {/* Error Message */}
        {error && (
          <div className="error-alert">
            {error}
          </div>
        )}


        {/* Login Form */}
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label className="form-label">
              {t('login.username')}
            </label>
            <input
              type="text"
              name="username"
              value={credentials.username}
              onChange={handleChange}
              placeholder={t('login.usernamePlaceholder')}
              required
              className="form-input"
            />
          </div>


          <div className="form-group">
            <label className="form-label">
              {t('login.password')}
            </label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={credentials.password}
                onChange={handleChange}
                placeholder={t('login.passwordPlaceholder')}
                required
                className="form-input password-input"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="password-toggle-btn"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>


          <button
            type="submit"
            disabled={loading}
            className="submit-btn"
          >
            {loading ? (
              <div className="submit-spinner" />
            ) : (
              <>
                <LogIn size={20} />
                {t('login.submit')}
              </>
            )}
          </button>
        </form>


        {/* Footer */}
        <div className="login-footer">
          {t('login.footer')}
        </div>
      </div>
    </div>
  );
};


export default AdminLogin;
