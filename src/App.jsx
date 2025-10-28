import { BrowserRouter, Routes, Route, Link, Navigate } from "react-router-dom";

import Header from "./components/layout/Header";
import LoginPage from "./features/subscription/LoginPage";
import SuccessPage from "./features/subscription/SuccessPage";
import PaymentPage from "./features/subscription/PaymentPage";
import SubscriptionPage from "./features/subscription/SubscriptionPage";
import ResetPasswordPage from "./features/subscription/ResetPasswordPage";
import ForgotPasswordPage from "./features/subscription/ForgotPasswordPage";

import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        <Header />

        <main className="app-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/subscription" element={<SubscriptionPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/success" element={<SuccessPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/payment" element={<PaymentPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <footer className="app-footer">
          <p>&copy; {new Date().getFullYear()} AboveAI. All rights reserved.</p>
        </footer>
      </div>
    </BrowserRouter>
  );
}

// Simple Home Page Component
function HomePage() {
  return (
    <div className="home-container">
      <h1>Welcome to Above</h1>
      <p>Discover our revolutionary AI-powered membership plans</p>
      <div className="cta-container">
        <Link to="/subscription" className="cta-button">
          Membership Plans
        </Link>
      </div>
    </div>
  );
}

export default App;
