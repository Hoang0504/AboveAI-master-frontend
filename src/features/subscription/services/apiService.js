/**
 * API Service for Subscription Management
 * This service connects to the Sorceri backend for subscription operations
 */

// Replace with your actual backend URL in production
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8080';

// Helper function to handle API responses
const handleResponse = async (response) => {
  if (!response.ok) {
    try {
      const text = await response.text();
      console.error('Error response:', text);
      
      let errorMessage = 'API request failed';
      if (text) {
        try {
          const errorData = JSON.parse(text);
          errorMessage = errorData?.detail || errorData?.message || errorMessage;
        } catch (e) {
          // Not JSON, use the text as error message
          errorMessage = text;
        }
      }
      throw new Error(errorMessage);
    } catch (e) {
      throw new Error(`Request failed with status ${response.status}: ${e.message}`);
    }
  }
  
  // Try to parse JSON response
  try {
    const text = await response.text();
    console.log('Response text:', text.substring(0, 100) + (text.length > 100 ? '...' : ''));
    
    if (!text || !text.trim()) {
      console.warn('Empty response received');
      return {}; // Return empty object for empty responses
    }
    
    try {
      return JSON.parse(text);
    } catch (jsonError) {
      console.error('Error parsing JSON:', jsonError);
      console.log('Invalid JSON response:', text);
      throw new Error('Invalid JSON response from server');
    }
  } catch (error) {
    console.error('Error reading response:', error);
    throw error;
  }
};

/**
 * Verify user token from mobile app
 * @param {string} token - Token from mobile app deep link
 * @returns {Promise<Object>} User data
 */
export const verifyUserToken = async (token) => {
  try {
    console.log(`Verifying token at ${API_BASE_URL}/v1/auth/verify-token`);
    
    const response = await fetch(`${API_BASE_URL}/v1/auth/verify-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
      // Try without credentials
      // credentials: 'include'
    });
    
    console.log('Token verification response status:', response.status);
    const data = await handleResponse(response);
    console.log('Token verification response data:', data);
    return data.user;
  } catch (error) {
    console.error('Error verifying token:', error);
    throw error;
  }
};

/**
 * Login with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object>} Auth data including token and user ID
 */
export const loginUser = async (email, password) => {
  try {
    console.log(`Attempting to login with email ${email} to ${API_BASE_URL}/v1/auth/login`);
    
    // Use JSON format only to avoid multiple body reads on the server
    // Change credentials mode to 'same-origin' to avoid CORS issues with credentials
    const response = await fetch(`${API_BASE_URL}/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      // Try without credentials for now
      // credentials: 'include'
    });
      
    console.log('Login response status:', response.status);
    
    if (response.ok) {
      try {
        const text = await response.text();
        console.log('Raw response text:', text);
        
        // Try to parse JSON only if there's content
        if (text && text.trim()) {
          try {
            return JSON.parse(text);
          } catch (jsonError) {
            console.error('Error parsing JSON response:', jsonError);
            console.log('Invalid JSON response:', text);
            throw new Error('Invalid JSON response from server');
          }
        } else {
          console.log('Empty response received');
          throw new Error('Empty response received from server');
        }
      } catch (textError) {
        console.error('Error reading response text:', textError);
        throw new Error('Could not read response from server');
      }
    } else {
      return handleResponse(response);
    }
  } catch (error) {
    console.error('Error logging in:', error);
    throw error;
  }
};

/**
 * Get current subscription status
 * @param {string} uid - User ID
 * @param {string} token - Auth token
 * @returns {Promise<Object>} Current subscription if any
 */
export const getCurrentSubscription = async (uid, token, firebaseToken) => {
  try {
    console.log(`Fetching subscription for user ${uid}`);
    const response = await fetch(`${API_BASE_URL}/v1/users/${uid}/subscriptions/current`, {
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${firebaseToken}`  // Use the Firebase token for auth
      }
      // Try without credentials
      // credentials: 'include'
    });
    
    console.log('Subscription response status:', response.status);
    const data = await handleResponse(response);
    return data.status === 'ok' ? data.subscription : null;
  } catch (error) {
    console.error('Error fetching current subscription:', error);
    return null;
  }
};

/**
 * Create a new subscription
 * @param {string} uid - User ID
 * @param {string} token - Auth token
 * @param {Object} subscriptionData - Subscription and payment details
 * @returns {Promise<Object>} New subscription data
 */
export const createSubscription = async (uid, token, subscriptionData, firebaseToken) => {
  try {
    console.log(`Creating subscription for user ${uid}`, subscriptionData);
    const response = await fetch(`${API_BASE_URL}/v1/users/${uid}/subscriptions`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${firebaseToken}`  // Use the Firebase token for auth
      },
      body: JSON.stringify(subscriptionData)
      // Try without credentials
      // credentials: 'include'
    });
    
    console.log('Create subscription response status:', response.status);
    return await handleResponse(response);
  } catch (error) {
    console.error('Error creating subscription:', error);
    throw error;
  }
};

/**
 * Upgrade subscription plan
 * @param {string} uid - User ID
 * @param {string} token - Auth token
 * @param {Object} subscriptionData - Subscription and payment details
 * @returns {Promise<Object>} Updated subscription data
 */
export const upgradeSubscription = async (uid, token, subscriptionData, firebaseToken) => {
  try {
    console.log(`Upgrading subscription for user ${uid}`, subscriptionData);
    const response = await fetch(`${API_BASE_URL}/v1/users/${uid}/subscriptions/upgrade-subscription`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${firebaseToken}`  // Use the Firebase token for auth
      },
      body: JSON.stringify(subscriptionData)
      // Try without credentials
      // credentials: 'include'
    });
    
    console.log('Upgrade subscription response status:', response.status);
    return await handleResponse(response);
  } catch (error) {
    console.error('Error upgrading subscription:', error);
    throw error;
  }
};

/**
 * Cancel an existing subscription
 * @param {string} uid - User ID
 * @param {string} token - Auth token
 * @returns {Promise<Object>} Cancellation result
 */
export const cancelSubscription = async (uid, token, firebaseToken) => {
  try {
    console.log(`Cancelling subscription for user ${uid}`);
    const response = await fetch(`${API_BASE_URL}/v1/users/${uid}/subscriptions/cancel-subscription`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${firebaseToken}`  // Use the Firebase token for auth
      }
      // Try without credentials
      // credentials: 'include'
    });

    console.log('Cancel subscription response status:', response.status);
    return await handleResponse(response);
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    throw error;
  }
};

/**
 * Reactivate a cancelled subscription
 * @param {string} uid - User ID
 * @param {string} token - Auth token
 * @param {string} firebaseToken - Firebase auth token
 * @param {string} planName - Specific plan name to reactivate
 * @returns {Promise<Object>} Reactivation result
 */
export const reactivateSubscription = async (uid, token, firebaseToken, planName) => {
  try {
    console.log(`Reactivating subscription for user ${uid} with plan ${planName}`);
    const response = await fetch(`${API_BASE_URL}/v1/users/${uid}/subscriptions/reactivate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${firebaseToken}`  // Use the Firebase token for auth
      },
      body: JSON.stringify({ plan_name: planName })
    });

    console.log('Reactivate subscription response status:', response.status);
    return await handleResponse(response);
  } catch (error) {
    console.error('Error reactivating subscription:', error);
    throw error;
  }
};

/**
 * Get saved payment methods for a user
 * @param {string} uid - User ID
 * @param {string} firebaseToken - Firebase auth token
 * @returns {Promise<Array>} List of saved payment methods
 */
export const getPaymentMethods = async (uid, firebaseToken) => {
  try {
    console.log(`Fetching payment methods for user ${uid}`);
    const response = await fetch(`${API_BASE_URL}/v1/payment/users/${uid}/payment-methods`, {
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${firebaseToken}`
      }
    });
    
    if (response.ok) {
      return await response.json();
    }
    return [];
  } catch (error) {
    console.error('Error fetching payment methods:', error);
    return [];
  }
};

/**
 * Set a payment method as default
 * @param {string} uid - User ID  
 * @param {string} paymentMethodId - Payment method ID to set as default
 * @param {string} firebaseToken - Firebase auth token
 * @returns {Promise<Object>} Result of the operation
 */
export const setDefaultPaymentMethod = async (uid, paymentMethodId, firebaseToken) => {
  try {
    const response = await fetch(`${API_BASE_URL}/v1/payment/users/${uid}/payment-methods/${paymentMethodId}/set-default`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${firebaseToken}`
      }
    });
    
    return await handleResponse(response);
  } catch (error) {
    console.error('Error setting default payment method:', error);
    throw error;
  }
};

/**
 * Remove a payment method
 * @param {string} uid - User ID
 * @param {string} paymentMethodId - Payment method ID to remove
 * @param {string} firebaseToken - Firebase auth token
 * @returns {Promise<Object>} Result of the operation
 */
export const removePaymentMethod = async (uid, paymentMethodId, firebaseToken) => {
  try {
    const response = await fetch(`${API_BASE_URL}/v1/payment/users/${uid}/payment-methods/${paymentMethodId}`, {
      method: 'DELETE',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${firebaseToken}`
      }
    });
    
    return await handleResponse(response);
  } catch (error) {
    console.error('Error removing payment method:', error);
    throw error;
  }
};

/**
 * Validate a promotional coupon code
 * @param {string} promoCode - The promotional code to validate
 * @returns {Promise<Object>} Validation result with discount details
 */
export const validateCoupon = async (promoCode) => {
  try {
    console.log(`Validating coupon code: ${promoCode}`);
    const response = await fetch(`${API_BASE_URL}/v1/users/validate-coupon`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ promo_code: promoCode })
    });
    
    console.log('Validate coupon response status:', response.status);
    return await handleResponse(response);
  } catch (error) {
    console.error('Error validating coupon:', error);
    throw error;
  }
};

/**
 * Request password reset email
 * @param {string} email - User's email address
 * @returns {Promise<Object>} Response from server
 */
export const forgotPassword = async (email) => {
  try {
    console.log('Requesting password reset for:', email);
    const response = await fetch(`${API_BASE_URL}/v1/auth/forgot-password`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email })
    });
    
    console.log('Forgot password response status:', response.status);
    return await handleResponse(response);
  } catch (error) {
    console.error('Error requesting password reset:', error);
    throw error;
  }
};

/**
 * Verify password reset token
 * @param {string} token - Reset token from email
 * @returns {Promise<Object>} Token validity and email
 */
export const verifyResetToken = async (token) => {
  try {
    console.log('Verifying reset token...');
    const response = await fetch(`${API_BASE_URL}/v1/auth/verify-reset-token`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ token })
    });
    
    console.log('Verify token response status:', response.status);
    return await handleResponse(response);
  } catch (error) {
    console.error('Error verifying reset token:', error);
    throw error;
  }
};

/**
 * Reset password with token
 * @param {string} token - Reset token from email
 * @param {string} newPassword - New password
 * @returns {Promise<Object>} Response from server
 */
export const resetPassword = async (token, newPassword) => {
  try {
    console.log('Resetting password...');
    const response = await fetch(`${API_BASE_URL}/v1/auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        token,
        new_password: newPassword
      })
    });

    console.log('Reset password response status:', response.status);
    return await handleResponse(response);
  } catch (error) {
    console.error('Error resetting password:', error);
    throw error;
  }
};

