import { useEffect, useState } from "react";
import AuthLayout from "../components/AuthLayout/AuthLayout.jsx";
import {
  createCustomerAccount,
  getCustomerBusinessCategories,
  getCustomerBusinesses,
} from "../services/api.js";
import "../styles/forms.css";
import "./CustomerAuth.css";

const initialForm = {
  category: "",
  businessId: "",
  fullName: "",
  email: "",
  whatsappNumber: "",
  birthDate: "",
  isMarried: false,
  anniversaryDate: "",
  gender: "",
  city: "",
  password: "",
  confirmPassword: "",
};

export default function CustomerSignUp({ onNavigate, onLogin }) {
  const [form, setForm] = useState(initialForm);
  const [categories, setCategories] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadCategories() {
      try {
        const response = await getCustomerBusinessCategories();
        if (!cancelled) {
          setCategories(response.categories);
          setStatus("ready");
        }
      } catch (requestError) {
        if (!cancelled) {
          setError(
            requestError.message || "Unable to load business categories.",
          );
          setStatus("error");
        }
      }
    }

    loadCategories();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!form.category) {
      setBusinesses([]);
      return undefined;
    }

    let cancelled = false;

    async function loadBusinesses() {
      try {
        const response = await getCustomerBusinesses(form.category);
        if (!cancelled) {
          setBusinesses(response.businesses);
        }
      } catch (requestError) {
        if (!cancelled) {
          setError(requestError.message || "Unable to load businesses.");
        }
      }
    }

    loadBusinesses();
    return () => {
      cancelled = true;
    };
  }, [form.category]);

  function update(name, value) {
    setForm((current) => ({
      ...current,
      [name]: value,
      ...(name === "category" ? { businessId: "" } : {}),
      ...(name === "isMarried" && !value ? { anniversaryDate: "" } : {}),
    }));
  }

  function handleChange(event) {
    const { checked, name, type, value } = event.target;
    update(name, type === "checkbox" ? checked : value);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setStatus("submitting");

    try {
      const response = await createCustomerAccount(form);
      onLogin?.(response.account, false, response.accessToken);
    } catch (requestError) {
      setError(
        requestError.message || "Unable to create your customer account.",
      );
      setStatus("ready");
    }
  }

  return (
    <AuthLayout onNavigate={onNavigate}>
      <section className="customer-auth">
        <button
          type="button"
          className="customer-auth__back"
          onClick={() => onNavigate?.("home")}
        >
          Back to home
        </button>
        <span className="eyebrow">Customer account</span>
        <h1 className="customer-auth__title">Join a business you love</h1>
        <p className="customer-auth__subtitle">
          Select your business, then create an account to receive loyalty
          benefits and updates.
        </p>

        <form className="customer-auth__form" onSubmit={handleSubmit}>
          <div className="customer-auth__section">
            <h2>Choose your business</h2>
            <div className="customer-auth__grid">
              <label className="field">
                <span className="field__label">Business category</span>
                <select
                  className="field__input"
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  required
                  disabled={status === "loading"}
                >
                  <option value="">Select a category</option>
                  {categories.map(({ category }) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </label>

              <label className="field">
                <span className="field__label">Business name</span>
                <select
                  className="field__input"
                  name="businessId"
                  value={form.businessId}
                  onChange={handleChange}
                  required
                  disabled={!form.category || status === "loading"}
                >
                  <option value="">Select a business</option>
                  {businesses.map((business) => (
                    <option key={business.id} value={business.id}>
                      {business.name}
                      {business.city ? ` — ${business.city}` : ""}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          <div className="customer-auth__section">
            <h2>Your details</h2>
            <div className="customer-auth__grid">
              <Field
                label="Full name"
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                required
              />
              <Field
                label="Email address"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                required
              />
              <Field
                label="WhatsApp number"
                name="whatsappNumber"
                type="tel"
                value={form.whatsappNumber}
                onChange={handleChange}
                required
              />
              <Field
                label="City"
                name="city"
                value={form.city}
                onChange={handleChange}
                required
              />
              <Field
                label="Date of birth"
                name="birthDate"
                type="date"
                value={form.birthDate}
                onChange={handleChange}
                required
              />

              <label className="field">
                <span className="field__label">Gender</span>
                <select
                  className="field__input"
                  name="gender"
                  value={form.gender}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select gender</option>
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                  <option value="non_binary">Non-binary</option>
                  <option value="prefer_not_to_say">Prefer not to say</option>
                  <option value="other">Other</option>
                </select>
              </label>
            </div>

            <label className="checkbox customer-auth__married">
              <input
                type="checkbox"
                name="isMarried"
                checked={form.isMarried}
                onChange={handleChange}
              />
              I am married
            </label>

            {form.isMarried && (
              <Field
                label="Anniversary date"
                name="anniversaryDate"
                type="date"
                value={form.anniversaryDate}
                onChange={handleChange}
                required
              />
            )}
          </div>

          <div className="customer-auth__section">
            <h2>Secure your account</h2>
            <div className="customer-auth__grid">
              <Field
                label="Password"
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                required
              />
              <Field
                label="Confirm password"
                name="confirmPassword"
                type="password"
                value={form.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {error && <p className="login__form-error">{error}</p>}
          {status === "loading" && (
            <p className="customer-auth__notice">Loading businesses…</p>
          )}

          <button
            className="btn btn-primary btn-block btn-lg"
            disabled={status === "loading" || status === "submitting"}
          >
            {status === "submitting"
              ? "Creating account..."
              : "Create customer account"}
          </button>
        </form>

        <p className="customer-auth__switch">
          Already registered?{" "}
          <button type="button" onClick={() => onNavigate?.("customer-login")}>
            Customer login
          </button>
        </p>
      </section>
    </AuthLayout>
  );
}

function Field({
  label,
  name,
  type = "text",
  value,
  onChange,
  required = false,
}) {
  return (
    <label className="field">
      <span className="field__label">{label}</span>
      <input
        className="field__input"
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
      />
    </label>
  );
}
