// src/pages/Login.jsx
import { useState } from "react";
import "../styles/forms.css";
import AuthLayout from "../components/AuthLayout/AuthLayout.jsx";
import "./Login.css";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Login({ onNavigate }) {
  const [form, setForm] = useState({ email: "", password: "", rememberMe: false });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState(null); // null | "success" | "error"

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

    // TODO: replace with a real API call. Expected checks server-side:
    // correct password, active account, active subscription.
    try {
      setStatus(null);
      // const res = await api.login(form);
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setErrors({ form: "Login failed. Check your email and password and try again." });
    }
  }

  return (
    <AuthLayout onNavigate={onNavigate}>
      <div className="login__panel">
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

          <button type="submit" className="btn btn-primary btn-block btn-lg">
            Login
          </button>

          <button type="button" className="btn btn-secondary btn-block">
            Continue with Google
          </button>

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
      </div>
    </AuthLayout>
  );
}