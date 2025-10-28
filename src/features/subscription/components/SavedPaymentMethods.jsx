import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { getPaymentMethods, removePaymentMethod } from '../services/apiService';

// Card brand logos mapping
const cardBrandLogos = {
  visa: '/src/assets/images/visa.svg',
  mastercard: '/src/assets/images/mastercard.svg',
  amex: '/src/assets/images/amex.svg',
  discover: '/src/assets/images/discover.svg',
};

const SavedPaymentMethods = ({ uid, firebaseToken, onSelectMethod, onAddNew }) => {
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState(null);

  useEffect(() => {
    fetchPaymentMethods();
  }, [uid]);

  const fetchPaymentMethods = async () => {
    try {
      setLoading(true);
      const methods = await getPaymentMethods(uid, firebaseToken);
      setPaymentMethods(methods);
      
      // Auto-select default method if exists
      const defaultMethod = methods.find(m => m.is_default);
      if (defaultMethod) {
        setSelectedMethod(defaultMethod.id);
        onSelectMethod(defaultMethod.id);
      }
    } catch (error) {
      console.error('Error fetching payment methods:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectMethod = (methodId) => {
    setSelectedMethod(methodId);
    onSelectMethod(methodId);
  };

  const handleRemoveMethod = async (methodId, e) => {
    e.stopPropagation(); // Prevent selecting the card when removing
    
    if (window.confirm('Are you sure you want to remove this payment method?')) {
      try {
        setRemoving(methodId);
        await removePaymentMethod(uid, methodId, firebaseToken);
        
        // Remove from local state
        setPaymentMethods(paymentMethods.filter(m => m.id !== methodId));
        
        // If removed method was selected, clear selection
        if (selectedMethod === methodId) {
          setSelectedMethod(null);
          onSelectMethod(null);
        }
      } catch (error) {
        console.error('Error removing payment method:', error);
        alert('Failed to remove payment method');
      } finally {
        setRemoving(null);
      }
    }
  };

  if (loading) {
    return (
      <div className="saved-methods-loading">
        <p>Loading saved payment methods...</p>
      </div>
    );
  }

  return (
    <div className="saved-payment-methods">
      {paymentMethods.length > 0 && (
        <>
          <h3 className="saved-methods-title">Saved Payment Methods</h3>
          <div className="payment-methods-list">
            {paymentMethods.map((method) => (
              <div
                key={method.id}
                className={`payment-method-card ${selectedMethod === method.id ? 'selected' : ''}`}
                onClick={() => handleSelectMethod(method.id)}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={selectedMethod === method.id}
                  onChange={() => handleSelectMethod(method.id)}
                  className="method-radio"
                />
                
                <div className="method-details">
                  <img 
                    src={cardBrandLogos[method.brand] || cardBrandLogos.visa} 
                    alt={method.brand}
                    className="card-brand-logo"
                  />
                  <div className="card-info">
                    <span className="card-brand">{method.brand.toUpperCase()}</span>
                    <span className="card-last4">•••• {method.last4}</span>
                    <span className="card-expiry">Exp: {method.exp_month}/{method.exp_year}</span>
                    {method.is_default && <span className="default-badge">Default</span>}
                  </div>
                </div>
                
                <button
                  className="remove-method-btn"
                  onClick={(e) => handleRemoveMethod(method.id, e)}
                  disabled={removing === method.id}
                  title="Remove this payment method"
                >
                  {removing === method.id ? '...' : '×'}
                </button>
              </div>
            ))}
          </div>
          
          <div className="payment-method-divider">
            <span>OR</span>
          </div>
        </>
      )}
      
      <button
        className="add-new-method-btn"
        onClick={() => {
          setSelectedMethod('new');
          onAddNew();
        }}
      >
        {paymentMethods.length > 0 ? '+ Add New Payment Method' : 'Add Payment Method'}
      </button>
    </div>
  );
};

SavedPaymentMethods.propTypes = {
  uid: PropTypes.string.isRequired,
  firebaseToken: PropTypes.string.isRequired,
  onSelectMethod: PropTypes.func.isRequired,
  onAddNew: PropTypes.func.isRequired,
};

export default SavedPaymentMethods;