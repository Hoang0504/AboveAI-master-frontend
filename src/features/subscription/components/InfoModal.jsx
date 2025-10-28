import PropTypes from 'prop-types';

const InfoModal = ({ isOpen, onClose, title, message }) => {
  if (!isOpen) return null;

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
          <h2>{title || 'Information'}</h2>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-body">
          <div className="modal-icon info">
            ℹ️
          </div>
          <p className="modal-message">
            {message}
          </p>
        </div>

        <div className="modal-footer">
          <button
            className="button modal-button"
            onClick={onClose}
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};

InfoModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string,
  message: PropTypes.string.isRequired,
};

export default InfoModal;
