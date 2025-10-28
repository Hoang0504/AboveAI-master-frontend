import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { verifyResetToken, resetPassword } from './services/apiService';
import './SubscriptionPage.css';

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isValidToken, setIsValidToken] = useState(null);
  const [userEmail, setUserEmail] = useState('');
  
  const token = searchParams.get('token');

  // Verify token on mount
  useEffect(() => {
    const checkToken = async () => {
      if (!token) {
        setError('Invalid or missing reset token');
        setIsValidToken(false);
        return;
      }
      
      try {
        const result = await verifyResetToken(token);
        if (result.valid) {
          setIsValidToken(true);
          setUserEmail(result.email || '');
        } else {
          setIsValidToken(false);
          setError(result.message || 'Invalid or expired reset token');
        }
      } catch (error) {
        console.error('Token verification error:', error);
        setIsValidToken(false);
        setError('Invalid or expired reset token');
      }
    };
    
    checkToken();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    // Validate passwords
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Call backend reset password API
      const data = await resetPassword(token, password);
      
      if (data.status === 'ok') {
        setSuccess(true);
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setError(data.message || 'Failed to reset password. Please try again.');
      }
    } catch (error) {
      console.error('Reset password error:', error);
      setError('Failed to reset password. Please try again or request a new reset link.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Loading state while verifying token
  if (isValidToken === null) {
    return (
      <div className="login-container">
        <div className="loading-message">Verifying reset link...</div>
      </div>
    );
  }
  
  // Invalid token state
  if (isValidToken === false) {
    return (
      <div className="login-container">
        <div className="error-container">
          <h2 className="section-title">Invalid Reset Link</h2>
          <div className="error-message">
            {error || 'This password reset link is invalid or has expired.'}
          </div>
          <p className="form-description">
            Please request a new password reset link.
          </p>
          <div className="form-footer">
            <Link to="/forgot-password" className="button">
              Request New Link
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  // Success state
  if (success) {
    return (
      <div className="login-container">
        <div className="success-container">
          <h2 className="section-title">Password Reset Successful!</h2>
          <div className="success-message">
            <p>Your password has been successfully reset.</p>
            <p>Redirecting you to login...</p>
          </div>
        </div>
      </div>
    );
  }
  
  // Reset password form
  return (
    <div className="login-container">
      <h2 className="section-title">Create New Password</h2>
      
      {userEmail && (
        <p className="form-description">
          Reset password for: <strong>{userEmail}</strong>
        </p>
      )}
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="login-form">
        <div className="form-group">
          <label htmlFor="password" className="form-label">New Password</label>
          <input
            type="password"
            id="password"
            className="form-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter new password"
            minLength="6"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="confirmPassword" className="form-label">Confirm New Password</label>
          <input
            type="password"
            id="confirmPassword"
            className="form-input"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm new password"
            minLength="6"
            required
          />
        </div>
        
        <button 
          type="submit" 
          className="button"
          disabled={isLoading}
        >
          {isLoading ? 'Resetting...' : 'Reset Password'}
        </button>
        
        <div className="form-footer">
          <Link to="/login" className="back-to-login-link">
            ← Back to Login
          </Link>
        </div>
      </form>
    </div>
  );
};

export default ResetPasswordPage;