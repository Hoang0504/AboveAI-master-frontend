import PropTypes from 'prop-types';

const CancelSubscriptionModal = ({ isOpen, onClose, onConfirm, nextBillingDate }) => {
  if (!isOpen) return null;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleBackdropClick = (e) => {
    // Close modal if clicked outside the modal content
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal-content">
        <div className="modal-header">
          <h2>Cancel Membership</h2>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>
        
        <div className="modal-body">
          <div className="modal-icon warning">
            ⚠️
          </div>
          <p className="modal-message">
            Are you sure you want to cancel your membership?
          </p>
          <p className="modal-info">
            You'll continue to have access to all features until <strong>{formatDate(nextBillingDate)}</strong>.
            After that, your account will be downgraded to the free plan.
          </p>
        </div>
        
        <div className="modal-footer">
          <button 
            className="button secondary modal-button"
            onClick={onClose}
          >
            Keep Membership
          </button>
          <button 
            className="button danger modal-button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            Yes, Cancel Membership
          </button>
        </div>
      </div>
    </div>
  );
};

CancelSubscriptionModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  nextBillingDate: PropTypes.string.isRequired,
};

export default CancelSubscriptionModal;