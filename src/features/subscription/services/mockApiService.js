/**
 * Mock API Service for Authorize.net Integration
 * 
 * This service simulates backend API interactions for testing the UI
 * In a production environment, these calls would go to your Python backend
 */

// Simulated delay to mimic network requests
const simulateNetworkDelay = (ms = 1000) => new Promise(resolve => setTimeout(resolve, ms));

// Mock subscription data
const mockSubscriptions = {
  basic: {
    id: 'sub_123456789',
    planId: 'basic',
    planName: 'Basic Plan',
    amount: 29.99,
    status: 'active',
    nextBillingDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString(),
    cardType: 'Visa',
    cardNumber: '4111111111111111',
    cardExpiry: '12/25',
    cardholderName: 'John Doe',
    customerId: 'cus_123456789',
    paymentProfileId: 'pay_123456789',
    features: [
      'AI-powered property tax analysis',
      'Basic WhatsApp bot integration',
      'Up to 1,000 taxpayers',
      'Standard support'
    ]
  },
  standard: {
    id: 'sub_987654321',
    planId: 'standard',
    planName: 'Standard Plan',
    amount: 79.99,
    status: 'active',
    nextBillingDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString(),
    cardType: 'Mastercard',
    cardNumber: '5555555555554444',
    cardExpiry: '10/26',
    cardholderName: 'John Doe',
    customerId: 'cus_987654321',
    paymentProfileId: 'pay_987654321',
    features: [
      'Everything in Basic Plan',
      'Advanced WhatsApp campaigns',
      'Up to 10,000 taxpayers',
      'Knowledge base integration',
      'Priority support'
    ]
  },
  enterprise: {
    id: 'sub_456789123',
    planId: 'enterprise',
    planName: 'Enterprise Plan',
    amount: 199.99,
    status: 'active',
    nextBillingDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString(),
    cardType: 'Amex',
    cardNumber: '378282246310005',
    cardExpiry: '11/26',
    cardholderName: 'John Doe',
    customerId: 'cus_456789123',
    paymentProfileId: 'pay_456789123',
    features: [
      'Everything in Standard Plan',
      'Unlimited WhatsApp campaigns',
      'Unlimited taxpayers',
      'Custom AI training',
      'Dedicated account manager',
      'API access'
    ]
  }
};

/**
 * Check subscription status
 * @returns {Promise<Object>} Subscription data or null if no subscription exists
 */
export const checkSubscriptionStatus = async () => {
  await simulateNetworkDelay();
  
  // This would normally check with your backend
  // For demo, we'll return a mock subscription or null
  
  // Get from localStorage to persist between page refreshes
  const activePlan = localStorage.getItem('activePlan');
  
  if (activePlan && mockSubscriptions[activePlan]) {
    return { subscription: mockSubscriptions[activePlan] };
  }
  
  return { subscription: null };
};

/**
 * Create a new subscription
 * @param {Object} paymentData - Payment data from Authorize.net
 * @returns {Promise<Object>} New subscription data
 */
export const createSubscription = async (paymentData) => {
  await simulateNetworkDelay(2000); // Longer delay to simulate payment processing
  
  // Simulate 5% chance of payment failure
  if (Math.random() < 0.05) {
    throw new Error('Payment processing failed. Please try again with a different card.');
  }
  
  // Create a new subscription based on the selected plan
  const planId = paymentData.planId;
  
  if (!mockSubscriptions[planId]) {
    throw new Error('Invalid plan selected');
  }
  
  // In a real implementation, this would call your Python backend
  // which would interact with Authorize.net APIs
  
  // Store in localStorage to persist between page refreshes
  localStorage.setItem('activePlan', planId);
  
  return {
    success: true,
    subscription: {
      ...mockSubscriptions[planId],
      cardholderName: `${paymentData.customer.firstName} ${paymentData.customer.lastName}`
    }
  };
};

/**
 * Update payment method for an existing subscription
 * @param {Object} paymentData - Payment data from Authorize.net
 * @returns {Promise<Object>} Updated subscription data
 */
export const updatePaymentMethod = async (paymentData) => {
  await simulateNetworkDelay(1500);
  
  // Simulate 5% chance of payment update failure
  if (Math.random() < 0.05) {
    throw new Error('Payment method update failed. Please try again with a different card.');
  }
  
  // Get current subscription
  const activePlan = localStorage.getItem('activePlan');
  
  if (!activePlan || !mockSubscriptions[activePlan]) {
    throw new Error('No active subscription found');
  }
  
  // Update the payment method
  // In a real implementation, this would call your Python backend
  
  return {
    success: true,
    message: 'Payment method updated successfully'
  };
};

/**
 * Cancel an existing subscription
 * @param {Object} data - Subscription data
 * @returns {Promise<Object>} Cancellation result
 */
export const cancelSubscription = async (data) => {
  await simulateNetworkDelay(1000);
  
  // Get current subscription
  const activePlan = localStorage.getItem('activePlan');
  
  if (!activePlan || !mockSubscriptions[activePlan]) {
    throw new Error('No active subscription found');
  }
  
  // Cancel the subscription
  // In a real implementation, this would call your Python backend
  
  // Update local storage
  localStorage.removeItem('activePlan');
  
  return {
    success: true,
    message: 'Subscription cancelled successfully'
  };
};
