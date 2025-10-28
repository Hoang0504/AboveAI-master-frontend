import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import '../styles/subscription.css';

const UpdatePaymentMethod = ({ subscription, onPaymentUpdated, onCancel }) => {
  const [formData, setFormData] = useState({
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cardCode: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cardType, setCardType] = useState(null);
  
  // Generate month options
  const months = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    return {
      value: month.toString().padStart(2, '0'),
      label: month.toString().padStart(2, '0')
    };
  });
  
  // Generate year options (current year + 10 years)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => {
    const year = currentYear + i;
    return {
      value: year.toString().slice(-2),
      label: year.toString()
    };
  });

  // Load Accept.js script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://js.authorize.net/v1/Accept.js';
    script.async = true;
    
    document.body.appendChild(script);
    
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);
  
  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Detect card type based on the first digits
    if (name === 'cardNumber') {
      detectCardType(value);
    }
  };
  
  // Detect credit card type
  const detectCardType = (cardNumber) => {
    const visaPattern = /^4/;
    const mastercardPattern = /^5[1-5]/;
    const amexPattern = /^3[47]/;
    const discoverPattern = /^6(?:011|5)/;
    
    if (visaPattern.test(cardNumber)) {
      setCardType('visa');
    } else if (mastercardPattern.test(cardNumber)) {
      setCardType('mastercard');
    } else if (amexPattern.test(cardNumber)) {
      setCardType('amex');
    } else if (discoverPattern.test(cardNumber)) {
      setCardType('discover');
    } else {
      setCardType(null);
    }
  };
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    // Basic form validation
    if (!formData.cardNumber || !formData.expiryMonth || !formData.expiryYear || !formData.cardCode) {
      setError('Please fill in all required payment fields');
      setLoading(false);
      return;
    }
    
    // Make sure Accept.js is loaded
    if (typeof window.Accept === 'undefined') {
      setError('Payment system is still loading. Please try again.');
      setLoading(false);
      return;
    }
    
    // Set up the payment data for Authorize.net
    const secureData = {
      authData: {
        apiLoginID: 'YOUR_API_LOGIN_ID', // Replace with your actual API Login ID
        clientKey: 'YOUR_CLIENT_KEY'     // Replace with your actual Client Key
      },
      cardData: {
        cardNumber: formData.cardNumber,
        month: formData.expiryMonth,
        year: formData.expiryYear,
        cardCode: formData.cardCode
      }
    };
    
    // Send card data to Authorize.net for tokenization
    window.Accept.dispatchData(secureData, responseHandler);
  };
  
  // Handle the response from Authorize.net
  const responseHandler = (response) => {
    if (response.messages.resultCode === 'Error') {
      let errorMessage = 'Payment processing error';
      
      if (response.messages.message && response.messages.message.length > 0) {
        errorMessage = response.messages.message[0].text;
      }
      
      setError(`Payment Error: ${errorMessage}`);
      setLoading(false);
      return;
    }
    
    // Success - we have the payment nonce/token
    // Now send to our backend
    const paymentData = {
      dataDescriptor: response.opaqueData.dataDescriptor,
      dataValue: response.opaqueData.dataValue,
      subscriptionId: subscription.id,
      customerId: subscription.customerId,
      paymentProfileId: subscription.paymentProfileId
    };
    
    // Call the parent component's function to handle the update
    onPaymentUpdated(paymentData);
  };
  
  return (
    <div className="update-payment-form-container">
      <div className="update-payment-header">
        <h3 className="update-payment-title">
          Update Payment Method
        </h3>
        <div className="update-payment-description">
          Enter your new credit card information to update your payment method.
        </div>
      </div>
      
      {error && (
        <div className="payment-error-message">
          <svg className="payment-error-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="update-payment-form">
        <div className="form-group">
          <label htmlFor="cardNumber" className="form-label">
            Card Number
          </label>
          <div className="card-input-container">
            <input
              type="text"
              id="cardNumber"
              name="cardNumber"
              value={formData.cardNumber}
              onChange={handleChange}
              placeholder="1234 5678 9012 3456"
              className="form-input"
              required
            />
            {cardType && (
              <div className="card-type-icon">
                {cardType === 'visa' && <span>Visa</span>}
                {cardType === 'mastercard' && <span>Mastercard</span>}
                {cardType === 'amex' && <span>Amex</span>}
                {cardType === 'discover' && <span>Discover</span>}
              </div>
            )}
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="expiryMonth" className="form-label">
              Month
            </label>
            <select
              id="expiryMonth"
              name="expiryMonth"
              value={formData.expiryMonth}
              onChange={handleChange}
              className="form-select"
              required
            >
              <option value="">Month</option>
              {months.map(month => (
                <option key={month.value} value={month.value}>
                  {month.label}
                </option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="expiryYear" className="form-label">
              Year
            </label>
            <select
              id="expiryYear"
              name="expiryYear"
              value={formData.expiryYear}
              onChange={handleChange}
              className="form-select"
              required
            >
              <option value="">Year</option>
              {years.map(year => (
                <option key={year.value} value={year.value}>
                  {year.label}
                </option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="cardCode" className="form-label">
              CVV
            </label>
            <input
              type="text"
              id="cardCode"
              name="cardCode"
              value={formData.cardCode}
              onChange={handleChange}
              placeholder="123"
              className="form-input"
              required
            />
          </div>
        </div>
        
        <div className="update-payment-actions">
          <button
            type="button"
            onClick={onCancel}
            className="update-payment-cancel-button"
          >
            Cancel
          </button>
          
          <button
            type="submit"
            disabled={loading}
            className="update-payment-submit-button"
          >
            {loading ? (
              <>
                <div className="payment-spinner"></div>
                Updating...
              </>
            ) : (
              'Update Payment Method'
            )}
          </button>
        </div>
        
        <div className="payment-form-disclaimer">
          Your payment information is secured by Authorize.net.
        </div>
      </form>
    </div>
  );
};

UpdatePaymentMethod.propTypes = {
  subscription: PropTypes.shape({
    id: PropTypes.string.isRequired,
    customerId: PropTypes.string,
    paymentProfileId: PropTypes.string
  }).isRequired,
  onPaymentUpdated: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired
};

export default UpdatePaymentMethod;
