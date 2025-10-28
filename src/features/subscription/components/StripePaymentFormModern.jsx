import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { validateCoupon } from '../services/apiService';
import SavedPaymentMethods from './SavedPaymentMethods';

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const PaymentFormContent = ({ selectedPlan, onPaymentSuccess, onBack, uid, firebaseToken }) => {
  const stripe = useStripe();
  const elements = useElements();

  const [formData, setFormData] = useState({
    promoCode: '',
    email: '',
    name: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [promoCodeStatus, setPromoCodeStatus] = useState(null);
  const [discount, setDiscount] = useState(null);
  const [validatedPromoCode, setValidatedPromoCode] = useState(null);

  // Saved payment methods state
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState(null);
  const [showNewCardForm, setShowNewCardForm] = useState(false);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };
  
  const handlePromoCodeValidate = async () => {
    if (!formData.promoCode.trim()) {
      setError('Please enter a promotional code');
      return;
    }
    
    setPromoCodeStatus('validating');
    setError(null);
    
    try {
      const result = await validateCoupon(formData.promoCode);
      
      if (result.valid) {
        setPromoCodeStatus('valid');
        setDiscount(result);
        setValidatedPromoCode(formData.promoCode);
      } else {
        setPromoCodeStatus('invalid');
        setError(result.message || 'Invalid promotional code');
        setDiscount(null);
        setValidatedPromoCode(null);
      }
    } catch (err) {
      setPromoCodeStatus('invalid');
      setError('Failed to validate promotional code');
      setDiscount(null);
      setValidatedPromoCode(null);
    }
  };
  
  const handlePromoCodeChange = (e) => {
    const value = e.target.value;
    setFormData({ ...formData, promoCode: value });
    
    // Reset validation status when user modifies the code
    if (value !== validatedPromoCode) {
      setPromoCodeStatus(null);
      setDiscount(null);
    }
  };
  
  const handleSelectPaymentMethod = (methodId) => {
    setSelectedPaymentMethodId(methodId);
    setShowNewCardForm(false);
  };

  const handleAddNewCard = () => {
    setSelectedPaymentMethodId(null);
    setShowNewCardForm(true);
  };

  const calculateDiscountedPrice = () => {
    if (!discount || !selectedPlan.price) return selectedPlan.price;

    let discountedPrice = selectedPlan.price;

    if (discount.discount_type === 'percent') {
      discountedPrice = selectedPlan.price * (1 - discount.discount_value / 100);
    } else if (discount.discount_type === 'amount') {
      discountedPrice = selectedPlan.price - (discount.discount_value / 100);
    }

    return Math.max(0, discountedPrice);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if using a saved payment method
    if (selectedPaymentMethodId && !showNewCardForm) {
      // Use saved payment method
      const paymentData = {
        payment_method_id: selectedPaymentMethodId,
        promoCode: promoCodeStatus === 'valid' ? validatedPromoCode : null
      };
      onPaymentSuccess(paymentData);
      return;
    }

    // Otherwise, create new payment method
    if (!stripe || !elements) {
      setError('Stripe has not loaded yet. Please wait and try again.');
      return;
    }

    // Basic validation
    if (!formData.email) {
      setError('Please enter your email');
      return;
    }

    if (!formData.name) {
      setError('Please enter your name');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      // Confirm the payment using Payment Element
      const { error: submitError } = await elements.submit();
      if (submitError) {
        setError(submitError.message);
        setIsSubmitting(false);
        return;
      }

      // Create payment method
      const { error: paymentError, paymentMethod } = await stripe.createPaymentMethod({
        elements,
        params: {
          billing_details: {
            name: formData.name,
            email: formData.email,
          }
        }
      });

      if (paymentError) {
        setError(paymentError.message);
        setIsSubmitting(false);
        return;
      }

      // Pass the payment method ID to the parent component
      const paymentData = {
        payment_method_id: paymentMethod.id,
        promoCode: promoCodeStatus === 'valid' ? validatedPromoCode : null
      };

      onPaymentSuccess(paymentData);
    } catch (err) {
      setError('Payment processing failed. Please try again.');
      console.error('Payment error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Payment Element options
  const paymentElementOptions = {
    layout: {
      type: 'tabs',
      defaultCollapsed: false,
    },
    wallets: {
      applePay: 'auto',
      googlePay: 'auto'
    }
  };
  
  return (
    <div className="payment-form-container">
      <div className="title-with-back">
        <span className="back-arrow" onClick={onBack}>←</span>
        <h2 className="section-title">Payment</h2>
      </div>
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        {/* Saved Payment Methods */}
        {uid && firebaseToken && (
          <SavedPaymentMethods
            uid={uid}
            firebaseToken={firebaseToken}
            onSelectMethod={handleSelectPaymentMethod}
            onAddNew={handleAddNewCard}
          />
        )}

        {/* Show new card form only if user clicks "Add New" or has no saved methods */}
        {showNewCardForm && (
          <>
            <div className="form-group">
              <label htmlFor="email" className="form-label">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                className="form-input"
                placeholder="john@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="name" className="form-label">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                className="form-input"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            {/* Payment Element - includes Apple Pay, Google Pay, and Card automatically */}
            <div className="form-group">
              <label className="form-label">Payment Method</label>
              <div className="payment-element-wrapper">
                <PaymentElement options={paymentElementOptions} />
              </div>
            </div>
          </>
        )}
        
        <div className="form-group promo-code-group">
          <label htmlFor="promoCode" className="form-label">Promotional Code (Optional)</label>
          <div className="promo-code-input-wrapper">
            <input
              type="text"
              id="promoCode"
              name="promoCode"
              className={`form-input ${
                promoCodeStatus === 'valid' ? 'valid' : 
                promoCodeStatus === 'invalid' ? 'invalid' : ''
              }`}
              placeholder="Enter code"
              value={formData.promoCode}
              onChange={handlePromoCodeChange}
              disabled={promoCodeStatus === 'validating'}
            />
            <button
              type="button"
              className="promo-code-apply-btn"
              onClick={handlePromoCodeValidate}
              disabled={!formData.promoCode || promoCodeStatus === 'validating' || promoCodeStatus === 'valid'}
            >
              {promoCodeStatus === 'validating' ? 'Validating...' : 
               promoCodeStatus === 'valid' ? 'Applied' : 'Apply'}
            </button>
          </div>
          {promoCodeStatus === 'valid' && discount && (
            <div className="promo-code-success">
              ✓ {discount.display_text}
            </div>
          )}
        </div>
        
        <div className="membership-summary">
          <h3>Summary</h3>
          <div className="detail-row">
            <span className="detail-label">Plan:</span>
            <span className="detail-value">{selectedPlan.title}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Plan Price:</span>
            <span className="detail-value">
              {selectedPlan.price > 0 ? `$${selectedPlan.price} per ${selectedPlan.billingPeriod}` : 'Free'}
            </span>
          </div>

          {discount && promoCodeStatus === 'valid' && (
            <>
              <div className="detail-row discount-row">
                <span className="detail-label">Discount:</span>
                <span className="detail-value discount-value">
                  -{discount.display_text}
                </span>
              </div>
              <div className="detail-row total-row">
                <span className="detail-label">Total:</span>
                <span className="detail-value total-value">
                  ${calculateDiscountedPrice().toFixed(2)} per {selectedPlan.billingPeriod}
                </span>
              </div>
            </>
          )}

          {!discount && (
            <div className="detail-row total-row">
              <span className="detail-label">Amount Due Today:</span>
              <span className="detail-value total-value">
                ${selectedPlan.price.toFixed(2)}
              </span>
            </div>
          )}
        </div>
        
        <button 
          type="submit" 
          className="button"
          disabled={isSubmitting || !stripe || !elements}
        >
          {isSubmitting ? 'Processing...' : 'Subscribe Now'}
        </button>
      </form>
    </div>
  );
};

PaymentFormContent.propTypes = {
  selectedPlan: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
    billingPeriod: PropTypes.string.isRequired,
  }).isRequired,
  onPaymentSuccess: PropTypes.func.isRequired,
  onBack: PropTypes.func.isRequired,
  uid: PropTypes.string,
  firebaseToken: PropTypes.string,
};

// Wrapper component with Payment Element options
const StripePaymentFormModern = ({ selectedPlan, onPaymentSuccess, onBack, uid, firebaseToken }) => {
  const [clientSecret, setClientSecret] = useState(null);
  
  useEffect(() => {
    // Create a Setup Intent for collecting payment method
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
    fetch(`${apiUrl}/v1/payment/create-setup-intent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    })
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        setClientSecret(data.client_secret);
      })
      .catch(err => console.error('Error creating setup intent:', err));
  }, []);
  
  const options = clientSecret ? {
    clientSecret,
    paymentMethodCreation: 'manual',
    appearance: {
      theme: 'night',
      variables: {
        colorPrimary: '#0ea5e9',
        colorBackground: '#1a1a2e',
        colorText: '#ffffff',
        colorDanger: '#ef4444',
        fontFamily: 'Montserrat, sans-serif',
      }
    },
  } : undefined;
  
  if (!clientSecret) {
    return (
      <div className="payment-form-container">
        <div className="loading">Loading payment form...</div>
      </div>
    );
  }
  
  return (
    <Elements stripe={stripePromise} options={options}>
      <PaymentFormContent 
        selectedPlan={selectedPlan}
        onPaymentSuccess={onPaymentSuccess}
        onBack={onBack}
        uid={uid}
        firebaseToken={firebaseToken}
      />
    </Elements>
  );
};

StripePaymentFormModern.propTypes = {
  selectedPlan: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
    billingPeriod: PropTypes.string.isRequired,
  }).isRequired,
  onPaymentSuccess: PropTypes.func.isRequired,
  onBack: PropTypes.func.isRequired,
  uid: PropTypes.string,
  firebaseToken: PropTypes.string,
};

export default StripePaymentFormModern;