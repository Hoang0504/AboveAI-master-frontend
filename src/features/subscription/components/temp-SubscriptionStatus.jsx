import { useState } from 'react';
import PropTypes from 'prop-types';
import '../styles/subscription.css';

const SubscriptionStatus = ({ subscription, onUpdatePaymentMethod, onCancelSubscription }) => {
  const [confirmCancel, setConfirmCancel] = useState(false);
  
  // Format date helper function
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Format the next billing date
  const nextBillingDate = formatDate(subscription.nextBillingDate || new Date());
  
  // Get status color and text based on subscription status
  const getStatusDetails = (status) => {
    switch (status) {
      case 'active':
        return {
          color: 'status-active',
          text: 'Active',
          description: 'Your subscription is active and will renew automatically.'
        };
      case 'canceled':
        return {
          color: 'status-inactive',
          text: 'Canceled',
          description: 'Your subscription has been canceled and will not renew.'
        };
      case 'pending':
        return {
          color: 'status-pending',
          text: 'Pending',
          description: 'Your subscription is being processed.'
        };
      case 'suspended':
        return {
          color: 'status-inactive',
          text: 'Suspended',
          description: 'Your subscription has been suspended due to payment issues.'
        };
      default:
        return {
          color: 'status-inactive',
          text: 'Inactive',
          description: 'Your subscription is not active.'
        };
    }
  };
  
  const statusDetails = getStatusDetails(subscription.status);
  
  // Mask credit card number to show only last 4 digits
  const maskCardNumber = (cardNumber) => {
    if (!cardNumber) return 'XXXX-XXXX-XXXX-XXXX';
    return `XXXX-XXXX-XXXX-${cardNumber.slice(-4)}`;
  };
  
  // Handle subscription cancelation
  const handleCancel = () => {
    setConfirmCancel(false);
    onCancelSubscription();
  };
  
  return (
    <div className="subscription-status">
      <div className="subscription-grid">
        {/* Current Plan Details */}
        <div className="subscription-details">
          <h3 className="subscription-section-title">Current Plan</h3>
          
          <div className="subscription-status-indicator">
            <span className={`status-dot ${statusDetails.color}`}></span>
            <span className="status-text">{statusDetails.text}</span>
            <span className="status-description">- {statusDetails.description}</span>
          </div>
          
          <div className="subscription-info-grid">
            <div className="subscription-info-item">
              <h4 className="subscription-info-label">Plan</h4>
              <p className="subscription-info-value">{subscription.planName}</p>
            </div>
            
            <div className="subscription-info-item">
              <h4 className="subscription-info-label">Monthly Price</h4>
              <p className="subscription-info-value price">${subscription.amount}/month</p>
            </div>
            
            <div className="subscription-info-item">
              <h4 className="subscription-info-label">Next Billing Date</h4>
              <p className="subscription-info-value">{nextBillingDate}</p>
            </div>
            
            <div className="subscription-info-item">
              <h4 className="subscription-info-label">Subscription ID</h4>
              <p className="subscription-info-value">{subscription.id}</p>
            </div>
          </div>
          
          {/* Plan Features */}
          <div className="subscription-features">
            <h4 className="subscription-features-title">Plan Includes:</h4>
            <ul className="subscription-features-list">
              {subscription.features?.map((feature, idx) => (
                <li key={idx} className="subscription-feature-item">
                  <svg className="feature-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        {/* Payment Method */}
        <div className="payment-method-section">
          <h3 className="subscription-section-title">Payment Method</h3>
          
          <div className="payment-method-card">
            <div className="payment-card-header">
              <div className="payment-card-type">
                <svg xmlns="http://www.w3.org/2000/svg" className="payment-card-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                <span className="payment-card-brand">{subscription.cardType}</span>
              </div>
              
              <div className="payment-card-expiry">
                {subscription.cardExpiry}
              </div>
            </div>
            
            <div className="payment-card-number">{maskCardNumber(subscription.cardNumber)}</div>
            
            <div className="payment-card-name">
              {subscription.cardholderName}
            </div>
          </div>
          
          <button
            onClick={onUpdatePaymentMethod}
            className="update-payment-button"
          >
            Update Payment Method
          </button>
          
          {/* Subscription Actions */}
          <div className="subscription-actions">
            <h4 className="subscription-section-title">Subscription Actions</h4>
            
            <div className="subscription-action-buttons">
              {confirmCancel ? (
                <div className="cancel-confirmation">
                  <p className="cancel-confirmation-text">Are you sure you want to cancel? This action cannot be undone.</p>
                  <div className="cancel-confirmation-buttons">
                    <button
                      onClick={() => setConfirmCancel(false)}
                      className="cancel-no-button"
                    >
                      No, Keep Subscription
                    </button>
                    <button
                      onClick={handleCancel}
                      className="cancel-yes-button"
                    >
                      Yes, Cancel Subscription
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmCancel(true)}
                  className="cancel-subscription-button"
                >
                  Cancel Subscription
                </button>
              )}
              
              <a
                href="#"
                className="billing-history-button"
              >
                View Billing History
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

SubscriptionStatus.propTypes = {
  subscription: PropTypes.shape({
    id: PropTypes.string.isRequired,
    planName: PropTypes.string.isRequired,
    amount: PropTypes.number.isRequired,
    status: PropTypes.string.isRequired,
    nextBillingDate: PropTypes.string,
    cardType: PropTypes.string,
    cardNumber: PropTypes.string,
    cardExpiry: PropTypes.string,
    cardholderName: PropTypes.string,
    features: PropTypes.arrayOf(PropTypes.string)
  }).isRequired,
  onUpdatePaymentMethod: PropTypes.func.isRequired,
  onCancelSubscription: PropTypes.func.isRequired
};

export default SubscriptionStatus;
