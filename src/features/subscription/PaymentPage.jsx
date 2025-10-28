import "./styles/payment.css";

export default function PaymentPage() {
  return (
    <div className="payment__wrapper">
      <h2 className="payment__title">Payment</h2>

      <form className="payment__form">
        {/* Email */}
        <label className="payment__label">Email</label>
        <input
          type="email"
          className="payment__input"
          placeholder="John@example.com"
        />

        {/* Full name */}
        <label className="payment__label">Full Name</label>
        <input type="text" className="payment__input" placeholder="John Doe" />

        {/* Payment Method */}
        <label className="payment__label">Payment Method</label>
        <div className="payment__method-box">
          <button
            type="button"
            className="payment__method payment__method--active"
          >
            <span className="payment__icon">💳</span> Card
          </button>
          <button type="button" className="payment__method">
            <span className="payment__icon">🅿️</span> Amazon Pay
          </button>
        </div>

        <div className="payment__secure">
          <span>🔒 Secure, fast checkout with Link</span>
        </div>

        {/* Card Info */}
        <label className="payment__label">Card Number</label>
        <input
          type="text"
          className="payment__input"
          placeholder="1234 1234 1234 1234"
        />

        <div className="payment__row">
          <div className="payment__column">
            <label className="payment__label">Expiration Date</label>
            <input type="text" className="payment__input" placeholder="MM/YY" />
          </div>
          <div className="payment__column">
            <label className="payment__label">Security Code</label>
            <input type="text" className="payment__input" placeholder="CVC" />
          </div>
        </div>

        {/* Country */}
        <label className="payment__label">Country</label>
        <select className="payment__input">
          <option>Canada</option>
          <option>United States</option>
          <option>Vietnam</option>
        </select>

        {/* Postal Code */}
        <label className="payment__label">Postal Code</label>
        <input
          type="text"
          className="payment__input"
          placeholder="Postal Code"
        />

        <p className="payment__note">
          By providing your card information, you allow Above Technologies
          sandbox to charge your card for future payments in accordance with
          their terms.
        </p>

        {/* Promo Code */}
        <label className="payment__label">Promotional Code (Optional)</label>
        <div className="payment__promo">
          <input
            type="text"
            className="payment__input"
            placeholder="Enter Code"
          />
          <button type="button" className="payment__apply-btn">
            APPLY
          </button>
        </div>

        {/* Summary */}
        <div className="payment__summary">
          <div className="payment__summary-row">
            <span>Plan</span>
            <strong>Unlimited</strong>
          </div>
          <div className="payment__summary-row">
            <span>Price</span>
            <strong>$19 per month</strong>
          </div>
        </div>

        <button type="submit" className="payment__submit">
          SUBSCRIBE NOW
        </button>
      </form>
    </div>
  );
}
