// src/pages/Login.jsx
import { useCallback, useState } from "react";
import "../styles/forms.css";
import AuthLayout from "../components/AuthLayout/AuthLayout.jsx";
import GoogleSignInButton from "../components/Auth/GoogleSignInButton.jsx";
import { login, loginWithGoogle } from "../services/api.js";
import "./Login.css";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Login({ onNavigate, onLogin }) {
  const [form, setForm] = useState({ email: "", password: "", rememberMe: false });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState(null); // null | "success" | "error"
  const [showCreateAccountPrompt, setShowCreateAccountPrompt] = useState(false);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  }

  function validate() {
    const next = {};

    if (!EMAIL_RE.test(form.email)) {
      next.email = "Enter a valid email address.";
    }
    if (!form.password) {
      next.password = "Password is required.";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

    try {
      setStatus("loading");
      setErrors({});
      const response = await login(form);
      setStatus("success");
      onLogin?.(response.account, form.rememberMe);
    } catch (err) {
      setStatus("error");
      setErrors({ form: err.message || "Login failed. Check your email and password and try again." });
    }
  }

  const handleGoogleCredential = useCallback(async (credential) => {
    try {
      setStatus("loading");
      setErrors({});
      const response = await loginWithGoogle(credential);
      setStatus("success");
      onLogin?.(response.account, form.rememberMe);
    } catch (err) {
      if (err.code === "account_not_found") {
        setStatus(null);
        setShowCreateAccountPrompt(true);
        return;
      }

      setStatus("error");
      setErrors({ form: err.message || "Google login failed. Please try again." });
    }
  }, [form.rememberMe, onLogin]);

  const handleGoogleError = useCallback((message) => {
    setStatus("error");
    setErrors({ form: message });
  }, []);

  return (
    <AuthLayout onNavigate={onNavigate}>
      <div className="login__panel">
        <button
          type="button"
          className="btn btn-secondary btn-sm login__back"
          onClick={() => onNavigate?.("home")}
        >
          Back to Home
        </button>
        <span className="eyebrow">Login Form</span>
        <h2 className="login__title">Welcome back</h2>
        <p className="login__subtitle">Log in to manage your Oxeno account.</p>

        <form className="login__form" onSubmit={handleSubmit} noValidate>
          <label className="field">
            <span className="field__label">Email Address</span>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@business.com"
              className={`field__input ${errors.email ? "field__input--error" : ""}`}
            />
            {errors.email && <span className="field__error">{errors.email}</span>}
          </label>

          <label className="field">
            <span className="field__label">Password</span>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              className={`field__input ${errors.password ? "field__input--error" : ""}`}
            />
            {errors.password && <span className="field__error">{errors.password}</span>}
          </label>

          <div className="login__options">
            <label className="checkbox">
              <input
                type="checkbox"
                name="rememberMe"
                checked={form.rememberMe}
                onChange={handleChange}
              />
              Remember Me
            </label>
            <a href="#" className="login__link">Forgot Password?</a>
          </div>

          {errors.form && <p className="login__form-error">{errors.form}</p>}
          {status === "success" && (
            <p className="login__form-success">Logged in successfully.</p>
          )}

          <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={status === "loading"}>
            {status === "loading" ? "Logging in..." : "Login"}
          </button>

          <GoogleSignInButton
            onCredential={handleGoogleCredential}
            onError={handleGoogleError}
          />

          <p className="login__signup">
            New to Oxeno?{" "}
            <button
              type="button"
              className="login__link login__link--button"
              onClick={() => onNavigate?.("signup")}
            >
              Create New Account
            </button>
          </p>
        </form>

        {showCreateAccountPrompt && (
          <div className="login__modal-backdrop" role="presentation">
            <section
              className="login__modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="google-account-not-found-title"
            >
              <h3 id="google-account-not-found-title">Create an Oxeno account</h3>
              <p>This Google email does not have an Oxeno account yet.</p>
              <div className="login__modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowCreateAccountPrompt(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => onNavigate?.("signup")}
                >
                  Create Account
                </button>
              </div>
            </section>
          </div>
        )}
      </div>
    </AuthLayout>
  );
}
