import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import PlanSelection from "./components/PlanSelection";
import StripePaymentForm from "./components/StripePaymentFormModern";
import CurrentSubscription from "./components/CurrentSubscription";
import DowngradeWarningModal from "./components/DowngradeWarningModal";
import {
  verifyUserToken,
  getCurrentSubscription,
  createSubscription,
  upgradeSubscription,
  cancelSubscription,
  reactivateSubscription,
} from "./services/apiService";
import "./SubscriptionPage.css";
import "./styles/new__subscription.css";

const SubscriptionPage = () => {
  const [step, setStep] = useState(1);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDowngradeWarning, setShowDowngradeWarning] = useState(false);
  const [warningData, setWarningData] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();

  // Plans data from the mobile app screenshot
  const plans = [
    {
      id: "free",
      title: "Free Trial",
      price: 0,
      billingPeriod: "mo",
      subtitle:
        "Start with a taste. Real-time voice insights. Meet your guides. Begin your journey.",
      hours: "10 hours transcription*",
      note: "*Hours do not roll over to the following month",
      button: "AWAKEN YOUR POTENTIAL",
    },
    {
      id: "elevate",
      title: "Elevate",
      price: 9,
      billingPeriod: "mo",
      subtitle:
        "Consistent reflection. Weekly patterns. Emotional intelligence that builds over time.",
      hours: "40 hours transcription*",
      note: "*Hours do not roll over to the following month",
      button: "DISCOVER YOUR EDGE",
    },
    {
      id: "unlimited",
      title: "Unlimited",
      price: 19,
      billingPeriod: "mo",
      subtitle:
        "Total access. Deeper data. Ideal for coaches, leaders and transformation seekers.",
      hours: "Unlimited transcription",
      note: "*Hours do not roll over to the following month",
      button: "MASTER YOUR EVOLUTION",
    },
  ];

  // useEffect(() => {
  //   async function initialize() {
  //     try {
  //       setLoading(true);
  //       setError(null);

  //       // Extract token from URL
  //       const params = new URLSearchParams(location.search);
  //       const urlToken = params.get('token'); // This is the Firebase token
  //       const urlUid = params.get('uid');

  //       console.log("URL parameters:", { urlToken: urlToken ? "present" : "missing", urlUid });

  //       // Check URL parameters first
  //       if (urlToken && urlUid) {
  //         try {
  //           console.log("Verifying token from URL");
  //           // Verify the Firebase token from URL
  //           const userData = await verifyUserToken(urlToken);

  //           if (userData && userData.uid === urlUid) {
  //             console.log("Token verified successfully, user:", userData.email);

  //             // Store the tokens and user info
  //             localStorage.setItem('authToken', userData.token); // Our session token
  //             localStorage.setItem('userId', userData.uid);
  //             localStorage.setItem('firebaseToken', userData.firebase_token);

  //             setUser(userData);
  //             setToken(userData.token); // Use the session token for API calls

  //             // Get current subscription
  //             console.log("Fetching current membership");
  //             // Store both tokens
  //             setToken(userData.token); // Session token
  //             const firebaseToken = userData.firebase_token; // Firebase token
  //             localStorage.setItem('firebaseToken', firebaseToken);

  //             const subscription = await getCurrentSubscription(userData.uid, userData.token, firebaseToken);
  //             setCurrentSubscription(subscription);
  //             setStep(subscription ? 3 : 1);
  //             setLoading(false);
  //             return;
  //           }
  //         } catch (e) {
  //           console.error("Error verifying token from URL", e);
  //           // Continue to try localStorage if URL verification fails
  //         }
  //       } else {
  //         console.log("No token/uid in URL, checking localStorage");
  //       }

  //       // If no URL parameters or verification failed, try localStorage
  //       const storedToken = localStorage.getItem('firebaseToken');
  //       const storedUid = localStorage.getItem('userId');

  //       if (storedToken && storedUid) {
  //         try {
  //           // Verify stored token
  //           const userData = await verifyUserToken(storedToken);
  //           if (userData && userData.uid === storedUid) {
  //             setUser(userData);
  //             setToken(userData.token); // Use the new token returned from verification

  //             // Get current subscription
  //             const firebaseToken = localStorage.getItem('firebaseToken');
  //             const subscription = await getCurrentSubscription(userData.uid, userData.token, firebaseToken);
  //             setCurrentSubscription(subscription);
  //             setStep(subscription ? 3 : 1);
  //             setLoading(false);
  //             return;
  //           }
  //         } catch (e) {
  //           console.error("Error verifying stored token", e);
  //           // Clear invalid tokens
  //           localStorage.removeItem('authToken');
  //           localStorage.removeItem('userId');
  //         }
  //       }

  //       // No valid token found, redirect to login
  //       navigate('/login');
  //     } catch (error) {
  //       console.error('Error initializing membership page:', error);
  //       setError('Failed to load user data. Please try again.');
  //     } finally {
  //       setLoading(false);
  //     }
  //   }

  //   initialize();
  // }, [location, navigate]);

  const handlePlanSelect = async (plan) => {
    setSelectedPlan(plan);

    // If plan is free, handle immediately
    if (plan.id === "free") {
      handleFreeSubscription(plan);
    } else {
      // No proration - proceed directly to payment form
      setStep(2);
    }
  };

  const handleFreeSubscription = async (plan, forceDowngrade = false) => {
    try {
      setLoading(true);

      const firebaseToken = localStorage.getItem("firebaseToken");

      // Determine if creating new or downgrading from paid plan
      let result;
      if (
        currentSubscription &&
        currentSubscription.status?.toLowerCase() === "active" &&
        ["elevate", "unlimited"].includes(currentSubscription.plan_name)
      ) {
        // User has active paid plan - use upgrade/downgrade endpoint
        result = await upgradeSubscription(
          user.uid,
          token,
          {
            plan_name: plan.id,
            force_downgrade: forceDowngrade,
          },
          firebaseToken
        );
      } else {
        // No active paid plan - create new subscription
        result = await createSubscription(
          user.uid,
          token,
          {
            plan_name: plan.id,
          },
          firebaseToken
        );
      }

      // Handle warning response (requires confirmation)
      if (result.status === "warning" && result.requires_confirmation) {
        setLoading(false);
        // Show modal with warning
        setWarningData({
          plan: plan,
          existingPlan: result.existing_scheduled_plan,
          scheduledDate: result.scheduled_date,
          message: result.message,
        });
        setShowDowngradeWarning(true);
        return;
      }

      if (result.status === "ok") {
        // Check if user already has an active subscription
        if (
          result.message &&
          result.message.includes("already has an active subscription")
        ) {
          // User has an active membership, show error message
          setError(
            `You currently have an active ${result.subscription.plan_name} plan. Please cancel your current membership first before switching to the free plan.`
          );
          setLoading(false);
          return;
        }

        // Successfully created/downgraded to free membership
        setCurrentSubscription(result.data || result.subscription);
        navigate("/success", {
          state: {
            plan: plan.id,
            subscriptionData: result.data || result.subscription,
          },
        });
      } else {
        setError(result.message || "Failed to process membership");
      }
    } catch (error) {
      setError("Error processing membership: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = async (paymentData) => {
    try {
      setLoading(true);

      // Format data for the backend - check if we have payment_method_id (new Stripe flow)
      let subscriptionData;

      if (paymentData.payment_method_id) {
        // New Stripe flow - send payment_method_id
        subscriptionData = {
          plan_name: selectedPlan.id,
          payment_method_id: paymentData.payment_method_id,
        };
      } else {
        // Legacy flow (should not be used in production)
        console.warn(
          "Using legacy payment flow - this should be updated to use Stripe.js"
        );
        subscriptionData = {
          plan_name: selectedPlan.id,
          card_details: {
            card_number: paymentData.cardNumber.replace(/\s/g, ""),
            expiration_date: paymentData.expiryDate,
            card_code: paymentData.cvv,
            address: paymentData.address,
            zip: paymentData.zipCode,
          },
        };
      }

      // Add promo code if provided and validated
      if (paymentData.promoCode) {
        subscriptionData.promo_code = paymentData.promoCode;
      }

      // Determine if creating new or upgrading
      // Use upgrade flow for both Active and Cancelled subscriptions (cancelled still has remaining paid time)
      let result;
      const firebaseToken = localStorage.getItem("firebaseToken");
      if (
        currentSubscription &&
        ["active", "cancelled"].includes(
          currentSubscription.status?.toLowerCase()
        )
      ) {
        result = await upgradeSubscription(
          user.uid,
          token,
          subscriptionData,
          firebaseToken
        );
      } else {
        result = await createSubscription(
          user.uid,
          token,
          subscriptionData,
          firebaseToken
        );
      }

      if (result.status === "ok") {
        // Update with the new membership data
        setCurrentSubscription(result.data || result.subscription);

        // Navigate to success page
        navigate("/success", {
          state: {
            plan: selectedPlan.id,
            subscriptionData: result.data || result.subscription,
          },
        });
      } else {
        setError(result.message || "Failed to process membership");
        setLoading(false);
      }
    } catch (error) {
      setError("Error processing payment: " + error.message);
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    try {
      setLoading(true);

      // Call backend to cancel membership
      const firebaseToken = localStorage.getItem("firebaseToken");
      const result = await cancelSubscription(user.uid, token, firebaseToken);

      if (result.status === "ok") {
        // Update local membership data with cancelled status
        setCurrentSubscription({
          ...currentSubscription,
          status: "Cancelled",
          expiration_date: currentSubscription.expiration_date,
          cancelled_at: new Date().toISOString(),
        });
      } else {
        setError(result.message || "Failed to cancel membership");
      }
    } catch (error) {
      setError("Error cancelling membership: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSubscription = () => {
    // When user clicks to update subscription, show plan selection
    console.log("handleUpdateSubscription called");
    console.log("Current step before update:", step);
    setStep(1);
    console.log("Set step to 1");
  };

  const handleReactivateSubscription = async (planName) => {
    try {
      setLoading(true);
      setError(null);

      // Call backend to reactivate subscription with specific plan name
      const firebaseToken = localStorage.getItem("firebaseToken");
      const result = await reactivateSubscription(
        user.uid,
        token,
        firebaseToken,
        planName
      );

      if (result.status === "ok") {
        // Update local subscription data with reactivated status
        setCurrentSubscription({
          ...currentSubscription,
          status: "Active",
          cancelled_at: null,
          reactivated_at: new Date().toISOString(),
        });

        // Show success message or navigate
        alert(
          "Subscription reactivated successfully! Your plan will continue to renew automatically."
        );
      } else {
        setError(result.message || "Failed to reactivate subscription");
      }
    } catch (error) {
      setError("Error reactivating subscription: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // if (loading) {
  //   return (
  //     <div className="membership-container">
  //       <div className="loading-container">
  //         <div className="loading-spinner"></div>
  //         <p>Loading membership data...</p>
  //       </div>
  //     </div>
  //   );
  // }

  if (error) {
    return (
      <div className="membership-container">
        <div className="error-container">
          {/* <div className="above-logo">ABOVE</div> */}
          <h2>Error</h2>
          <div className="error-message">{error}</div>
          <button className="button" onClick={() => window.location.reload()}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  console.log(
    "Rendering SubscriptionPage with step:",
    step,
    "currentSubscription:",
    currentSubscription?.status
  );

  return (
    <div className="membership-container">
      {step === 1 && (
        <PlanSelection
          plans={plans}
          onSelectPlan={handlePlanSelect}
          currentSubscription={
            currentSubscription &&
            currentSubscription.status.toLowerCase() === "active"
              ? {
                  plan: {
                    id: currentSubscription.plan_name,
                    title: currentSubscription.plan_name.toUpperCase(),
                    price: currentSubscription.price || 0,
                    billingPeriod: "month",
                  },
                  nextBillingDate: currentSubscription.expiration_date,
                  status: currentSubscription.status.toLowerCase(),
                  scheduledPlanChange:
                    currentSubscription.scheduled_plan_change,
                  scheduledChangeDate:
                    currentSubscription.scheduled_change_date,
                }
              : null
          }
        />
      )}

      {step === 2 && user && (
        <StripePaymentForm
          selectedPlan={selectedPlan}
          onPaymentSuccess={handlePaymentSuccess}
          onBack={() => setStep(1)}
          uid={user.uid}
          firebaseToken={localStorage.getItem("firebaseToken")}
        />
      )}

      {step === 3 && currentSubscription && (
        <CurrentSubscription
          subscription={{
            plan: {
              id: currentSubscription.plan_name,
              title: currentSubscription.plan_name.toUpperCase(),
              price: currentSubscription.price || 0,
              billingPeriod: "month",
            },
            startDate: currentSubscription.subscribed_at,
            nextBillingDate: currentSubscription.expiration_date,
            expiryDate: currentSubscription.expiration_date,
            status: currentSubscription.status.toLowerCase(),
            scheduledPlanChange: currentSubscription.scheduled_plan_change,
            scheduledChangeDate: currentSubscription.scheduled_change_date,
            scheduledChangePrice: currentSubscription.scheduled_change_price,
          }}
          onCancel={handleCancelSubscription}
          onUpdate={handleUpdateSubscription}
          onReactivate={handleReactivateSubscription}
        />
      )}

      {/* Downgrade Warning Modal */}
      <DowngradeWarningModal
        isOpen={showDowngradeWarning}
        onClose={() => setShowDowngradeWarning(false)}
        onConfirm={() => {
          if (warningData && warningData.plan) {
            handleFreeSubscription(warningData.plan, true);
          }
        }}
        existingPlan={warningData?.existingPlan}
        scheduledDate={warningData?.scheduledDate}
        message={warningData?.message}
      />
    </div>
  );
};

export default SubscriptionPage;
