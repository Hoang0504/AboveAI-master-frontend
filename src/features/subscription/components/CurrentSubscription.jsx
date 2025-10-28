import { useState } from 'react';
import PropTypes from 'prop-types';
import CancelSubscriptionModal from './CancelSubscriptionModal';

const CurrentSubscription = ({ subscription, onCancel, onUpdate, onReactivate }) => {
  const [showCancelModal, setShowCancelModal] = useState(false);
  
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  return (
    <div className="current-membership">
      {/* <div className="above-logo">ABOVE</div> */}
      
      <h2 className="section-title">Your Membership</h2>
      
      <div className="membership-details">
        <div className="detail-row">
          <span className="detail-label">Plan:</span>
          <span className="detail-value">{subscription.plan.title}</span>
        </div>
        
        <div className="detail-row">
          <span className="detail-label">Price:</span>
          <span className="detail-value">
            {subscription.plan.price > 0 ? `$${subscription.plan.price} per ${subscription.plan.billingPeriod}` : 'Free'}
          </span>
        </div>
        
        <div className="detail-row">
          <span className="detail-label">Status:</span>
          <span className="detail-value">
            <span className={`status-badge ${subscription.status.toLowerCase()}`}>
              {subscription.status === 'Cancelled' ? 'Cancelled - Active Until Expiry' : subscription.status}
            </span>
          </span>
        </div>
        
        <div className="detail-row">
          <span className="detail-label">Start Date:</span>
          <span className="detail-value">{formatDate(subscription.startDate || subscription.start_date)}</span>
        </div>
        
        {subscription.status.toLowerCase() === 'active' ? (
          <div className="detail-row">
            <span className="detail-label">Next Billing:</span>
            <span className="detail-value">{formatDate(subscription.nextBillingDate || subscription.expiration_date)}</span>
          </div>
        ) : (
          <div className="detail-row">
            <span className="detail-label">Expires On:</span>
            <span className="detail-value">{formatDate(subscription.expiryDate || subscription.expiration_date)}</span>
          </div>
        )}
      </div>

      {/* Scheduled Plan Change Alert - Show for both active and cancelled subscriptions */}
      {subscription.scheduledPlanChange && (subscription.status.toLowerCase() === 'active' || subscription.status.toLowerCase() === 'cancelled') && (
        <div className="scheduled-change-alert">
          <div className="alert-icon">⚠️</div>
          <div className="alert-content">
            <div className="alert-title">Scheduled Plan Change</div>
            <div className="alert-message">
              Your plan will automatically change to <strong>{subscription.scheduledPlanChange.toUpperCase()}</strong>
              {subscription.scheduledChangePrice > 0 && ` ($${subscription.scheduledChangePrice}/month)`} on{' '}
              <strong>{formatDate(subscription.scheduledChangeDate)}</strong>.
            </div>
          </div>
        </div>
      )}

      {subscription.status.toLowerCase() === 'active' && (
        <div className="button-group">
          <button className="button" onClick={onUpdate}>
            Change Membership
          </button>
          {subscription.plan.price > 0 ? (
            <button
              className="button secondary"
              onClick={() => setShowCancelModal(true)}
            >
              Cancel Membership
            </button>
          ) : (
            <button
              className="button secondary"
              onClick={() => {
                const mobileAppScheme = 'sorceri://';
                const deepLink = `${mobileAppScheme}membership/success?plan=free`;
                window.location.href = deepLink;
              }}
            >
              Navigate to App
            </button>
          )}
        </div>
      )}
      
      {/* Cancel Membership Modal */}
      <CancelSubscriptionModal 
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={onCancel}
        nextBillingDate={subscription.nextBillingDate || subscription.expiration_date}
      />
      
      {subscription.status.toLowerCase() === 'cancelled' && (
        <div className="cancelled-actions">
          {!subscription.scheduledPlanChange && (
            <p className="cancelled-message">
              Your membership has been cancelled. You can continue using your {subscription.plan.title} plan
              until {formatDate(subscription.expiryDate || subscription.expiration_date)}.
            </p>
          )}
          <div className="button-group">
            {!subscription.scheduledPlanChange && (
              <button className="button" onClick={() => onReactivate(subscription.plan.id)}>
                Reactivate Same Plan
              </button>
            )}
            <button className="button secondary" onClick={onUpdate}>
              {subscription.scheduledPlanChange ? 'Change Scheduled Plan' : 'Switch to Different Plan'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

CurrentSubscription.propTypes = {
  subscription: PropTypes.shape({
    plan: PropTypes.shape({
      id: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      price: PropTypes.number.isRequired,
      billingPeriod: PropTypes.string.isRequired,
    }).isRequired,
    startDate: PropTypes.string.isRequired,
    nextBillingDate: PropTypes.string,
    expiryDate: PropTypes.string,
    status: PropTypes.oneOf(['active', 'cancelled']).isRequired,
  }).isRequired,
  onCancel: PropTypes.func.isRequired,
  onUpdate: PropTypes.func.isRequired,
  onReactivate: PropTypes.func,
};

export default CurrentSubscription;
