import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './SubscriptionPage.css';

const SuccessPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { plan, subscriptionData } = location.state || {};
  const [autoRedirect, setAutoRedirect] = useState(true);
  
  const handleReturnToApp = () => {
    // Get the mobile app scheme from environment variables or use default
    const mobileAppScheme = import.meta.env.VITE_MOBILE_APP_SCHEME || 'sorceri://';
    const deepLink = `${mobileAppScheme}membership/success?plan=${plan || 'unknown'}`;
    
    // Navigate to the mobile app using deep link
    window.location.href = deepLink;
  };
  
  useEffect(() => {
    // Auto redirect after 5 seconds (increased from 3 for better UX)
    if (plan && subscriptionData && autoRedirect) {
      const timer = setTimeout(() => {
        handleReturnToApp();
      }, 5000); // 5 second delay to show success message before auto redirecting
      
      return () => clearTimeout(timer);
    }
  }, [plan, subscriptionData, autoRedirect]);
  
  return (
    <div className="success-container">
      {/* <div className="above-logo">ABOVE</div> */}
      <div className="success-icon">✓</div>
      <h2 className="section-title">Membership Successful!</h2>
      
      {plan && (
        <div className="success-message">
          <p>Thank you for joining the <strong>{plan.toUpperCase()}</strong> membership plan.</p>
          <p>Your membership is now active.</p>
          {autoRedirect && (
            <p className="redirect-message">Redirecting back to the app in a few seconds...</p>
          )}
        </div>
      )}
      
      <button 
        className="button button-primary return-to-app-btn"
        onClick={handleReturnToApp}
      >
        Return to Mobile App
      </button>
      
      <div className="button-group-vertical">
        <button 
          className="button secondary"
          onClick={() => navigate('/subscription')}
        >
          View Subscription Details
        </button>
        
        {autoRedirect && (
          <button 
            className="button text-button"
            onClick={() => setAutoRedirect(false)}
          >
            Stay on this page
          </button>
        )}
      </div>
    </div>
  );
};

export default SuccessPage;
