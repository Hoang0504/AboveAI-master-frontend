import { useState } from "react";
import PropTypes from "prop-types";
import InfoModal from "./InfoModal";

const PlanSelection = ({ plans, onSelectPlan, currentSubscription }) => {
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [infoMessage, setInfoMessage] = useState("");
  const currentPlanId = currentSubscription?.plan?.id;
  const scheduledPlanChange = currentSubscription?.scheduledPlanChange;
  const scheduledChangeDate = currentSubscription?.scheduledChangeDate;

  const formatDate = (dateString) => {
    if (!dateString) return "";
    try {
      const datePart = dateString.split("T")[0];
      const date = new Date(datePart + "T00:00:00");
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const handleSelectPlan = (planId) => {
    // Don't allow selecting the current plan
    if (planId === currentPlanId) {
      return;
    }

    // Check if this plan is already scheduled
    if (scheduledPlanChange === planId) {
      const formattedDate = formatDate(scheduledChangeDate);
      setInfoMessage(
        `You already have a scheduled downgrade to ${
          planId.charAt(0).toUpperCase() + planId.slice(1)
        } plan on ${formattedDate}.`
      );
      setShowInfoModal(true);
      return;
    }

    setSelectedPlanId(planId);
  };

  const handleContinue = () => {
    const selectedPlan = plans.find((plan) => plan.id === selectedPlanId);
    if (selectedPlan) {
      onSelectPlan(selectedPlan);
    }
  };

  return (
    <div className="plan-selection">
      {/* <div className="above-logo">ABOVE</div> */}
      <h2 className="section-title">Choose Your Membership</h2>

      <div className="subscription__plan-cards">
        {plans.map((plan) => {
          const isCurrentPlan = plan.id === currentPlanId;
          const isDisabled = isCurrentPlan;
          const isSelected = selectedPlanId === plan.id;

          return (
            <div
              key={plan.id}
              className={`subscription__card subscription__${plan.id} ${
                isSelected ? "subscription__selected" : ""
              } ${isDisabled ? "subscription__disabled" : ""}`}
              onClick={() => !isDisabled && handleSelectPlan(plan.id)}
            >
              {isCurrentPlan && (
                <div className="subscription__badge">CURRENT PLAN</div>
              )}
              <h3 className="subscription__title">{plan.title}</h3>
              <div className="subscription__price">
                <span className="subscription__currency">$</span>
                {plan.price}
                <span className="subscription__period">
                  /{plan.billingPeriod}
                </span>
              </div>
              <p className="subscription__subtitle">{plan.subtitle}</p>
              <button className="subscription__button">{plan.button}</button>
              <div className="subscription__feature">
                <span className="subscription__check">✓</span> {plan.hours}
              </div>
              {plan.note && (
                <div className="subscription__note">{plan.note}</div>
              )}
            </div>
          );
        })}
      </div>

      <div className="button-container">
        {selectedPlanId && selectedPlanId !== "free" && (
          <button className="button plan__button" onClick={handleContinue}>
            Continue
          </button>
        )}

        {/* Only show "Start Free Plan" if free is selected AND current plan is NOT free */}
        {selectedPlanId === "free" && currentPlanId !== "free" && (
          <button className="button plan__button" onClick={handleContinue}>
            Start Free Plan
          </button>
        )}
      </div>

      {/* Info Modal for already-scheduled plans */}
      <InfoModal
        isOpen={showInfoModal}
        onClose={() => setShowInfoModal(false)}
        title="Plan Already Scheduled"
        message={infoMessage}
      />
    </div>
  );
};

PlanSelection.propTypes = {
  plans: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      subtitle: PropTypes.string,
      description: PropTypes.string.isRequired,
      note: PropTypes.string,
      price: PropTypes.number.isRequired,
      billingPeriod: PropTypes.string.isRequired,
    })
  ).isRequired,
  onSelectPlan: PropTypes.func.isRequired,
  currentSubscription: PropTypes.object,
};

export default PlanSelection;
