// src/pages/SignUp.jsx
import { useState } from "react";
import "../styles/forms.css";
import AuthLayout from "../components/AuthLayout/AuthLayout.jsx";
import { createAccount } from "../services/api.js";
import "./SignUp.css";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const BUSINESS_TYPES = [
  "Restaurant", "Resort", "Hotel", "Café", "Salon", "Spa",
  "Dental Clinic", "Tour & Travel Agency", "Gym", "Retail Store", "Other",
];

const PLANS = [
  {
    id: "starter",
    name: "Starter",
    tagline: "For small businesses.",
    price: "$0",
    whatsapp: "500 messages",
    aiVoiceCalls: "Not included",
    customerLimit: "500 customers",
    features: ["1 QR loyalty program", "Basic analytics"],
  },
  {
    id: "growth",
    name: "Growth",
    tagline: "Most Popular",
    price: "$49",
    whatsapp: "5,000 messages",
    aiVoiceCalls: "200 minutes",
    customerLimit: "10,000 customers",
    features: ["Unlimited QR programs", "AI campaigns & automation", "Advanced analytics"],
    highlight: true,
  },
  {
    id: "pro",
    name: "Pro",
    tagline: "For large businesses.",
    price: "Custom",
    whatsapp: "Unlimited messages",
    aiVoiceCalls: "Unlimited",
    customerLimit: "Unlimited customers",
    features: ["Multi-store management", "Dedicated success manager"],
  },
];

const STEP_LABELS = [
  "Business Information",
  "Business Category",
  "Business Address",
  "Subscription Plan",
  "Verification",
  "Create Account",
];

const initialForm = {
  businessName: "",
  ownerName: "",
  businessEmail: "",
  mobile: "",
  password: "",
  confirmPassword: "",
  businessType: "",
  country: "",
  state: "",
  city: "",
  zip: "",
  address: "",
  plan: "growth",
  emailOtp: "",
  mobileOtp: "",
  agreeTerms: false,
  agreePrivacy: false,
};

export default function SignUp({ onNavigate }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState(null); // null | "success" | "error"

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    update(name, type === "checkbox" ? checked : value);
  }

  function validateStep(current) {
    const next = {};

    if (current === 1) {
      if (!form.businessName.trim()) next.businessName = "Business name is required.";
      if (!form.ownerName.trim()) next.ownerName = "Owner name is required.";
      if (!EMAIL_RE.test(form.businessEmail)) next.businessEmail = "Enter a valid email address.";
      if (!form.mobile.trim()) next.mobile = "Mobile number is required.";
      if (form.password.length < 8) next.password = "Password must be at least 8 characters.";
      if (form.confirmPassword !== form.password) next.confirmPassword = "Passwords do not match.";
    }

    if (current === 2) {
      if (!form.businessType) next.businessType = "Select a business type.";
    }

    if (current === 3) {
      if (!form.country.trim()) next.country = "Country is required.";
      if (!form.state.trim()) next.state = "State is required.";
      if (!form.city.trim()) next.city = "City is required.";
      if (!form.zip.trim()) next.zip = "ZIP / PIN code is required.";
      if (!form.address.trim()) next.address = "Business address is required.";
    }

    if (current === 5) {
      if (!form.emailOtp.trim()) next.emailOtp = "Enter the code sent to your email.";
      if (!form.agreeTerms) next.agreeTerms = "You must agree to the Terms & Conditions.";
      if (!form.agreePrivacy) next.agreePrivacy = "You must agree to the Privacy Policy.";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function goNext() {
    if (validateStep(step)) setStep((s) => Math.min(s + 1, 6));
  }

  function goBack() {
    setErrors({});
    setStep((s) => Math.max(s - 1, 1));
  }

  async function handleCreateAccount() {
    if (!validateStep(5)) return;

    try {
      setStatus("loading");
      setErrors({});
      await createAccount(form);
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setErrors({ form: err.message || "Unable to create your account. Please try again." });
    }
  }

  return (
    <AuthLayout onNavigate={onNavigate}>
      <div className="signup__panel">
        <button
          type="button"
          className="btn btn-secondary btn-sm signup__back"
          onClick={() => onNavigate?.("home")}
        >
          Back to Home
        </button>
        <span className="eyebrow">Sign Up Page</span>
        <h2 className="signup__title">Create your Oxeno account</h2>
        <p className="signup__subtitle">Fast, simple setup for your business.</p>

        {step === 1 && (
          <p className="signup__login-hint">
            Already have an account?{" "}
            <button
              type="button"
              className="signup__link-button"
              onClick={() => onNavigate?.("login")}
            >
              Log in
            </button>
          </p>
        )}

        <ol className="signup__steps">
          {STEP_LABELS.map((label, i) => {
            const n = i + 1;
            return (
              <li
                key={label}
                className={`signup__step ${n === step ? "is-active" : ""} ${n < step ? "is-done" : ""}`}
              >
                <span className="signup__step-num">{n < step ? "✓" : n}</span>
                <span className="signup__step-label">{label}</span>
              </li>
            );
          })}
        </ol>

        {step === 1 && (
          <div className="signup__fields">
            <h2 className="signup__step-title">Step 1 – Business Information</h2>

            <Field label="Business Name" name="businessName" value={form.businessName} onChange={handleChange} error={errors.businessName} />
            <Field label="Owner Full Name" name="ownerName" value={form.ownerName} onChange={handleChange} error={errors.ownerName} />
            <Field label="Business Email" name="businessEmail" type="email" value={form.businessEmail} onChange={handleChange} error={errors.businessEmail} />
            <Field label="Mobile Number" name="mobile" type="tel" value={form.mobile} onChange={handleChange} error={errors.mobile} />
            <Field label="Password" name="password" type="password" value={form.password} onChange={handleChange} error={errors.password} />
            <Field label="Confirm Password" name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} error={errors.confirmPassword} />
          </div>
        )}

        {step === 2 && (
          <div className="signup__fields">
            <h2 className="signup__step-title">Step 2 – Business Category</h2>

            <label className="field">
              <span className="field__label">Choose Business Type</span>
              <select
                name="businessType"
                value={form.businessType}
                onChange={handleChange}
                className={`field__input ${errors.businessType ? "field__input--error" : ""}`}
              >
                <option value="">Select a business type</option>
                {BUSINESS_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              {errors.businessType && <span className="field__error">{errors.businessType}</span>}
            </label>
          </div>
        )}

        {step === 3 && (
          <div className="signup__fields">
            <h2 className="signup__step-title">Step 3 – Business Address</h2>

            <Field label="Country" name="country" value={form.country} onChange={handleChange} error={errors.country} />
            <Field label="State" name="state" value={form.state} onChange={handleChange} error={errors.state} />
            <Field label="City" name="city" value={form.city} onChange={handleChange} error={errors.city} />
            <Field label="ZIP / PIN Code" name="zip" value={form.zip} onChange={handleChange} error={errors.zip} />
            <Field label="Business Address" name="address" value={form.address} onChange={handleChange} error={errors.address} />
          </div>
        )}

        {step === 4 && (
          <div className="signup__fields">
            <h2 className="signup__step-title">Step 4 – Select Subscription Plan</h2>

            <div className="signup__plans">
              {PLANS.map((p) => (
                <label
                  key={p.id}
                  className={`plan-card ${p.highlight ? "plan-card--highlight" : ""} ${form.plan === p.id ? "is-selected" : ""}`}
                >
                  <input
                    type="radio"
                    name="plan"
                    value={p.id}
                    checked={form.plan === p.id}
                    onChange={handleChange}
                    className="plan-card__radio"
                  />
                  {p.tagline === "Most Popular" && <span className="plan-card__badge">Most Popular</span>}
                  <div className="plan-card__name">{p.name}</div>
                  {p.tagline !== "Most Popular" && <div className="plan-card__tagline">{p.tagline}</div>}
                  <div className="plan-card__price">{p.price}{p.price !== "Custom" && <span>/mo</span>}</div>

                  <ul className="plan-card__specs">
                    <li><strong>Monthly Price:</strong> {p.price}</li>
                    <li><strong>WhatsApp Messages:</strong> {p.whatsapp}</li>
                    <li><strong>AI Voice Calls:</strong> {p.aiVoiceCalls}</li>
                    <li><strong>Customer Limit:</strong> {p.customerLimit}</li>
                  </ul>

                  <ul className="plan-card__features">
                    {p.features.map((f) => <li key={f}>✓ {f}</li>)}
                  </ul>
                </label>
              ))}
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="signup__fields">
            <h2 className="signup__step-title">Step 5 – Verification</h2>

            <p className="signup__hint">Security Verification</p>
            <Field label="Email OTP" name="emailOtp" value={form.emailOtp} onChange={handleChange} error={errors.emailOtp} />
            <Field label="Mobile OTP (Optional)" name="mobileOtp" value={form.mobileOtp} onChange={handleChange} />

            <label className="checkbox">
              <input type="checkbox" name="agreeTerms" checked={form.agreeTerms} onChange={handleChange} />
              I Agree to the Terms & Conditions
            </label>
            {errors.agreeTerms && <span className="field__error">{errors.agreeTerms}</span>}

            <label className="checkbox">
              <input type="checkbox" name="agreePrivacy" checked={form.agreePrivacy} onChange={handleChange} />
              I Agree to the Privacy Policy
            </label>
            {errors.agreePrivacy && <span className="field__error">{errors.agreePrivacy}</span>}
          </div>
        )}

        {step === 6 && (
          <div className="signup__fields">
            <h2 className="signup__step-title">Step 6 – Create Account</h2>
            <p className="signup__hint">
              Review your details, then create your account. You'll be taken to
              onboarding setup right after.
            </p>

            {status === "success" ? (
              <p className="signup__success">
                Account created. Redirecting you to onboarding setup…
              </p>
            ) : (
              <>
                {status === "error" && <p className="login__form-error">{errors.form}</p>}
                <button
                  type="button"
                  onClick={handleCreateAccount}
                  className="btn btn-primary btn-lg btn-block"
                  disabled={status === "loading"}
                >
                  {status === "loading" ? "Creating Account..." : "Create My Oxeno Account"}
                </button>
              </>
            )}
          </div>
        )}

        <div className="signup__nav">
          {step > 1 && step < 6 && (
            <button type="button" onClick={goBack} className="btn btn-secondary">
              Back
            </button>
          )}
          {step < 5 && (
            <button type="button" onClick={goNext} className="btn btn-primary">
              Continue
            </button>
          )}
          {step === 5 && (
            <button type="button" onClick={goNext} className="btn btn-primary">
              Verify & Continue
            </button>
          )}
        </div>
      </div>
    </AuthLayout>
  );
}

function Field({ label, name, value, onChange, error, type = "text" }) {
  return (
    <label className="field">
      <span className="field__label">{label}</span>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        className={`field__input ${error ? "field__input--error" : ""}`}
      />
      {error && <span className="field__error">{error}</span>}
    </label>
  );
}
