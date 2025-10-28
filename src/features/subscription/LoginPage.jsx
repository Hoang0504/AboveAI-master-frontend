import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "./services/apiService";

import "./styles/login.css";
import "./SubscriptionPage.css";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Call backend login API
      const data = await loginUser(email, password);

      if (data.status === "ok" && data.token) {
        console.log("Login successful, storing tokens...");

        // Store tokens and user info
        localStorage.setItem("authToken", data.token);
        localStorage.setItem("userId", data.uid);
        if (data.firebase_token) {
          localStorage.setItem("firebaseToken", data.firebase_token);
        }

        console.log("Redirecting to membership page...");
        // Redirect to membership page
        navigate("/subscription");
      } else {
        setError(data.message || "Login failed. Please try again.");
      }
    } catch (error) {
      console.error("Login error:", error);

      // Extract error message if possible
      let errorMessage =
        "Authentication failed. Please check your credentials and try again.";
      if (error.message && typeof error.message === "string") {
        if (error.message.includes("Invalid credentials")) {
          errorMessage = "Invalid email or password. Please try again.";
        } else if (
          error.message.includes("network") ||
          error.message.includes("connection")
        ) {
          errorMessage =
            "Network error. Please check your internet connection.";
        }
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      {/* <div className="above-logo">ABOVE</div> */}
      <h2 className="section-title">Login to Manage Your Membership</h2>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="login__form-container">
        <div className="form-group">
          <label htmlFor="email" className="login__text-light">
            Email
          </label>
          <input
            type="email"
            id="email"
            className="login__form-input-dark"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="Enter Your Email"
          />
        </div>

        <div className="form-group">
          <label htmlFor="password" className="login__text-light">
            Password
          </label>
          <input
            type="password"
            id="password"
            className="login__form-input-dark"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Enter Your Password"
          />
        </div>

        <div className="login__feature-wrapper">
          <Link to="/forgot-password" className="login__feature-a">
            Forgot Password?
          </Link>
          <div>
            <span>New here?</span>
            <Link to="/register" className="login__feature-primary">
              Create An Account
            </Link>
          </div>
        </div>

        <button type="submit" className="login__button" disabled={isLoading}>
          {isLoading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
};

export default LoginPage;
