import { useState } from 'react';
import PropTypes from 'prop-types';
import '../styles/subscription.css';

const PlanSelector = ({ plans, onSelectPlan }) => {
  const [selectedPlan, setSelectedPlan] = useState(null);

  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan.id);
    onSelectPlan(plan);
  };

  return (
    <div className="plan-selector">
      <div className="plan-grid">
        {plans.map((plan) => (
          <div 
            key={plan.id}
            className={`plan-card ${plan.popular ? 'plan-card-popular' : ''} ${selectedPlan === plan.id ? 'selected' : ''}`}
            onClick={() => handleSelectPlan(plan)}
          >
            {/* Popular tag */}
            {plan.popular && (
              <div className="plan-popular-tag">
                Most Popular
              </div>
            )}
            
            <div className="plan-card-content">
              <h3 className="plan-name">{plan.name}</h3>
              
              <div className="plan-price">
                <span className="price-amount">${plan.price}</span>
                <span className="price-period">/month</span>
              </div>
              
              <ul className="plan-features">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="plan-feature-item">
                    <svg className="feature-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
              
              <button
                className={`plan-select-button ${plan.popular ? 'plan-select-button-primary' : 'plan-select-button-secondary'}`}
              >
                Select {plan.name}
              </button>
            </div>
          </div>
        ))}
      </div>
      
      <div className="custom-plan-info">
        <div className="custom-plan-content">
          <svg className="custom-plan-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <div>
            <h3 className="custom-plan-title">Need a custom plan?</h3>
            <p className="custom-plan-description">
              For organizations with special requirements, we offer custom plans. Contact our sales team for more information.
            </p>
            <a href="#" className="custom-plan-link">
              Contact Sales
              <svg className="custom-plan-link-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

PlanSelector.propTypes = {
  plans: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      price: PropTypes.number.isRequired,
      features: PropTypes.arrayOf(PropTypes.string).isRequired,
      popular: PropTypes.bool
    })
  ).isRequired,
  onSelectPlan: PropTypes.func.isRequired
};

export default PlanSelector;
