import { useState } from "react";
import AuthLayout from "../components/AuthLayout/AuthLayout.jsx";
import { loginCustomer } from "../services/api.js";
import "../styles/forms.css";
import "./CustomerAuth.css";

export default function CustomerLogin({ onNavigate, onLogin }) {
  const [form, setForm] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [status, setStatus] = useState("ready");
  const [error, setError] = useState("");
  const [showCreateAccount, setShowCreateAccount] = useState(false);

  function handleChange(event) {
    const { checked, name, type, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setShowCreateAccount(false);
    setStatus("submitting");

    try {
      const response = await loginCustomer(form);
      onLogin?.(response.account, form.rememberMe, response.accessToken);
    } catch (requestError) {
      if (requestError.code === "customer_not_found") {
        setShowCreateAccount(true);
        setStatus("ready");
        return;
      }

      setError(requestError.message || "The email or password is incorrect.");
      setStatus("ready");
    }
  }

  return (
    <AuthLayout onNavigate={onNavigate}>
      <section className="customer-auth customer-auth--compact">
        <button
          type="button"
          className="customer-auth__back"
          onClick={() => onNavigate?.("home")}
        >
          Back to home
        </button>
        <span className="eyebrow">Customer login</span>
        <h1 className="customer-auth__title">Welcome back</h1>
        <p className="customer-auth__subtitle">
          Sign in with the email and password used to create your customer
          account.
        </p>

        <form className="customer-auth__form" onSubmit={handleSubmit}>
          <label className="field">
            <span className="field__label">Email address</span>
            <input
              className="field__input"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
              autoComplete="email"
            />
          </label>

          <label className="field">
            <span className="field__label">Password</span>
            <input
              className="field__input"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              required
              autoComplete="current-password"
            />
          </label>

          <label className="checkbox">
            <input
              type="checkbox"
              name="rememberMe"
              checked={form.rememberMe}
              onChange={handleChange}
            />
            Remember me on this device
          </label>

          {error && <p className="login__form-error">{error}</p>}
          <button
            className="btn btn-primary btn-block btn-lg"
            disabled={status === "submitting"}
          >
            {status === "submitting" ? "Logging in..." : "Customer login"}
          </button>
        </form>

        {showCreateAccount && (
          <div className="customer-auth__create-prompt" role="status">
            <h2>No customer account found</h2>
            <p>
              This email address is not registered yet. Create an account to
              join a business.
            </p>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => onNavigate?.("customer-signup")}
            >
              Create customer account
            </button>
          </div>
        )}

        <p className="customer-auth__switch">
          New customer?{" "}
          <button type="button" onClick={() => onNavigate?.("customer-signup")}>
            Create an account
          </button>
        </p>
      </section>
    </AuthLayout>
  );
}
