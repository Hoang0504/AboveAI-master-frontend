import PropTypes from 'prop-types';

const DowngradeWarningModal = ({ isOpen, onClose, onConfirm, existingPlan, scheduledDate, message }) => {
  if (!isOpen) return null;

  const formatDate = (dateString) => {
    if (!dateString) return '';
    // Extract just the date part from ISO format (e.g., "2025-11-14T10:19:51+00:00" -> "2025-11-14")
    const datePart = dateString.split('T')[0];
    const date = new Date(datePart + 'T00:00:00');
    return date.toLocaleDateString('en-US', {
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
          <h2>Confirm Plan Change</h2>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-body">
          <div className="modal-icon warning">
            ⚠️
          </div>
          <p className="modal-message">
            <strong>Are you sure?</strong>
          </p>
          <p className="modal-info">
            {message || `You already have a scheduled downgrade to ${existingPlan ? existingPlan.charAt(0).toUpperCase() + existingPlan.slice(1) : ''} plan on ${scheduledDate ? formatDate(scheduledDate) : ''}. Switching to Free will lose your prepaid ${existingPlan ? existingPlan.charAt(0).toUpperCase() + existingPlan.slice(1) : ''} plan.`}
          </p>
        </div>

        <div className="modal-footer">
          <button
            className="button secondary modal-button"
            onClick={onClose}
          >
            Keep {existingPlan ? existingPlan.charAt(0).toUpperCase() + existingPlan.slice(1) : 'Current'} Plan
          </button>
          <button
            className="button danger modal-button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            Switch to Free Plan
          </button>
        </div>
      </div>
    </div>
  );
};

DowngradeWarningModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  existingPlan: PropTypes.string,
  scheduledDate: PropTypes.string,
  message: PropTypes.string,
};

export default DowngradeWarningModal;
