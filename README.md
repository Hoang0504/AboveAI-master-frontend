# AboveAI Subscription Management

This project implements a subscription management system for AboveAI using Authorize.net payment processing. 

## Features

- Plan selection with multiple tiers
- Secure credit card processing 
- Subscription management (view, update payment method, cancel)
- Responsive design for all devices

## Installation

1. Clone the repository:
   ```sh
   git clone <repository-url>
   cd frontend
   ```

2. Install dependencies:
   ```sh
   npm install
   ```

3. Start the development server:
   ```sh
   npm run dev
   ```

4. Open your browser and navigate to:
   ```
   http://localhost:5173
   ```

## Technical Overview

### Frontend Stack

- **React**: UI library
- **Vite**: Build tool
- **React Router**: Navigation and routing
- **Authorize.net Accept.js**: Secure payment tokenization

### Component Structure

- **SubscriptionPage**: Main container component 
- **PlanSelector**: Display and select subscription plans
- **PaymentForm**: Collect and process payment information
- **SubscriptionStatus**: View and manage active subscriptions
- **UpdatePaymentMethod**: Change payment method for existing subscriptions

### Mock API Integration

For demonstration purposes, this project includes a mock API service that simulates backend functionality. In a production environment, you would replace these with actual API calls to your Python backend.

The mock services are located in:
```
src/features/subscription/services/mockApiService.js
```

### Authorize.net Integration

This project integrates with Authorize.net using the Accept.js library for secure payment processing. Key integration points:

1. **Client-Side Tokenization**: Card details are tokenized using Accept.js and never touch your server
2. **Subscription Creation**: The token is sent to your backend to create a subscription
3. **Subscription Management**: Update payment methods and cancel subscriptions

## Backend Integration (Python)

For a complete implementation, you would need to create the following API endpoints in your Python backend:

1. **Check Subscription Status**:
   ```
   GET /api/subscription/status
   ```

2. **Create Subscription**:
   ```
   POST /api/subscription/create
   ```

3. **Update Payment Method**:
   ```
   POST /api/subscription/update-payment
   ```

4. **Cancel Subscription**:
   ```
   POST /api/subscription/cancel
   ```

## Authorize.net Configuration

To use Authorize.net in production:

1. Replace the placeholder API credentials in the payment components:
   ```js
   apiLoginID: 'YOUR_API_LOGIN_ID',
   clientKey: 'YOUR_CLIENT_KEY'
   ```

2. Implement the server-side Authorize.net API calls in your Python backend using the Authorize.net SDK

## Customization

- Modify plans and pricing in `src/features/subscription/SubscriptionPage.jsx`
- Update styles in `src/features/subscription/styles/subscription.css`
- Add new card types in `src/assets/images/`
