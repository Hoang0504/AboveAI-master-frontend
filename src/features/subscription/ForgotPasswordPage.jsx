import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { forgotPassword } from "./services/apiService";
import "./styles/forgot_password.css";
import "./SubscriptionPage.css";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setIsLoading(true);

    try {
      // Call backend forgot password API
      const data = await forgotPassword(email);

      if (data.status === "ok") {
        setSuccess(true);
        // Clear form
        setEmail("");
      } else {
        setError(
          data.message || "Failed to send reset email. Please try again."
        );
      }
    } catch (error) {
      console.error("Forgot password error:", error);
      setError(
        "Failed to send reset email. Please check your email and try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h2 className="section-title">Reset Your Password</h2>

      {!success ? (
        <>
          <p className="form-description">
            Enter your email address and we'll send you a link to reset your
            password.
          </p>

          {error && <div className="error-message">{error}</div>}

          <div className="forgot-password__form-container">
            <form
              onSubmit={handleSubmit}
              className="forgot-password__login-form"
            >
              <div className="forgot-password__form-group">
                <label
                  htmlFor="email"
                  className="forgot-password__form-label forgot-password__text-light"
                >
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  className="forgot-password__form-input forgot-password__form-input-dark"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter Your Email"
                  required
                />
              </div>

              <button
                type="submit"
                className="forgot-password__button forgot-password__button-green"
                disabled={isLoading}
              >
                {isLoading ? "Sending..." : "SEND RESET LINK"}
              </button>

              <div className="forgot-password__form-footer">
                <Link
                  to="/login"
                  className="forgot-password__back-to-login-link forgot-password__footer-link-green"
                >
                  Back to Login
                </Link>
              </div>
            </form>
          </div>
        </>
      ) : (
        <div className="forgot-password__container">
          <div className="forgot-password__sub-container">
            {/* Thêm container cho icon Checkmark */}
            <div className="forgot-password__checkmark-icon">
              {/* Trong môi trường thực tế, đây sẽ là một component Icon (SVG) */}
              <span className="forgot-password__checkmark-symbol">✓</span>
            </div>

            <div className="forgot-password__success-message">
              <h3 className="forgot-password__title">Check Your Email</h3>
              <p className="forgot-password__text">
                We've sent a password reset link to your email address. Please
                check your inbox and follow the instructions to reset your
                password.
              </p>
              <p className="forgot-password__note">
                If you don't see the email, please check your spam folder.
              </p>
            </div>
          </div>

          {/* Đã loại bỏ form-footer và đặt Link trực tiếp để đơn giản hóa */}
          <Link to="/login" className="forgot-password__button-outline-green">
            BACK TO LOGIN
          </Link>
        </div>
      )}
    </div>
  );
};

export default ForgotPasswordPage;
