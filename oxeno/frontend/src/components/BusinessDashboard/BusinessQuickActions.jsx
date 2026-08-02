import { useEffect, useState } from "react";
import { Award, Gift, LoaderCircle, Plus, Sparkles, X } from "lucide-react";
import {
  awardLoyaltyPoints,
  createBusinessOffer,
  getBusinessOffers,
  getLoyaltyAwardOptions,
} from "../../services/api.js";
import "./BusinessQuickActions.css";

const defaultPointForm = {
  customerId: "",
  loyaltyProgramId: "",
  points: "",
  note: "",
};
const defaultOfferForm = {
  title: "",
  discountLabel: "",
  couponCode: "",
  expiresAt: "",
  description: "",
};

export default function BusinessQuickActions() {
  const [panel, setPanel] = useState("");
  const [options, setOptions] = useState({
    customers: [],
    loyaltyPrograms: [],
  });
  const [offers, setOffers] = useState([]);
  const [pointForm, setPointForm] = useState(defaultPointForm);
  const [offerForm, setOfferForm] = useState(defaultOfferForm);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    getBusinessOffers()
      .then((data) => {
        if (!cancelled) setOffers(data.offers || []);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  async function openPoints() {
    setPanel("points");
    setMessage("");
    setError("");
    setLoading(true);
    try {
      const data = await getLoyaltyAwardOptions();
      setOptions(data);
      setPointForm((current) => ({
        ...current,
        customerId: current.customerId || data.customers?.[0]?.id || "",
        loyaltyProgramId:
          current.loyaltyProgramId || data.loyaltyPrograms?.[0]?.id || "",
      }));
    } catch (requestError) {
      setError(requestError.message || "Could not load your customers.");
    } finally {
      setLoading(false);
    }
  }

  function openOffers() {
    setPanel("offer");
    setMessage("");
    setError("");
  }

  function closePanel() {
    if (!isSubmitting) setPanel("");
  }

  async function submitPoints(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");
    setMessage("");
    try {
      const response = await awardLoyaltyPoints({
        ...pointForm,
        loyaltyProgramId: pointForm.loyaltyProgramId || undefined,
        points: Number(pointForm.points),
      });
      setMessage(
        `${response.result.customerName} now has ${response.result.pointsBalance} points.`,
      );
      setPointForm((current) => ({ ...current, points: "", note: "" }));
    } catch (requestError) {
      setError(requestError.message || "Could not add loyalty points.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function submitOffer(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");
    setMessage("");
    try {
      const response = await createBusinessOffer(offerForm);
      setOffers((current) => [response.offer, ...current]);
      setMessage(`${response.offer.title} is now live for your customers.`);
      setOfferForm(defaultOfferForm);
    } catch (requestError) {
      setError(requestError.message || "Could not publish the offer.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="business-actions" aria-label="Business quick actions">
      <div className="business-actions__heading">
        <div>
          <span>REWARDS STUDIO</span>
          <h2>Delight customers, in a moment.</h2>
        </div>
        {offers.length > 0 && (
          <p>
            <Sparkles size={15} /> {offers.length} published offer
            {offers.length === 1 ? "" : "s"}
          </p>
        )}
      </div>
      <div className="business-actions__grid">
        <button
          className="business-action-card business-action-card--points"
          type="button"
          onClick={openPoints}
        >
          <span>
            <Award size={22} />
          </span>
          <div>
            <strong>Award loyalty points</strong>
            <small>Add points after a visit, purchase or special moment.</small>
          </div>
          <Plus size={18} />
        </button>
        <button
          className="business-action-card business-action-card--offer"
          type="button"
          onClick={openOffers}
        >
          <span>
            <Gift size={22} />
          </span>
          <div>
            <strong>Create an offer</strong>
            <small>Publish a polished member offer in just a few fields.</small>
          </div>
          <Plus size={18} />
        </button>
      </div>

      {panel && (
        <div
          className="business-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="business-action-title"
        >
          <button
            className="business-modal__scrim"
            type="button"
            onClick={closePanel}
            aria-label="Close dialog"
          />
          <div className="business-modal__card">
            <button
              className="business-modal__close"
              type="button"
              onClick={closePanel}
              aria-label="Close dialog"
            >
              <X size={19} />
            </button>
            {panel === "points" ? (
              <PointsForm
                options={options}
                form={pointForm}
                setForm={setPointForm}
                loading={loading}
                submitting={isSubmitting}
                onSubmit={submitPoints}
              />
            ) : (
              <OfferForm
                form={offerForm}
                setForm={setOfferForm}
                submitting={isSubmitting}
                onSubmit={submitOffer}
              />
            )}
            {error && <p className="business-modal__error">{error}</p>}
            {message && <p className="business-modal__success">{message}</p>}
          </div>
        </div>
      )}
    </section>
  );
}

function PointsForm({ options, form, setForm, loading, submitting, onSubmit }) {
  const update = (field) => (event) =>
    setForm((current) => ({ ...current, [field]: event.target.value }));
  return (
    <form onSubmit={onSubmit}>
      <span className="business-modal__eyebrow">LOYALTY</span>
      <h2 id="business-action-title">Award points with care.</h2>
      <p className="business-modal__intro">
        Every point is recorded in the customer’s loyalty history.
      </p>
      {loading ? (
        <div className="business-modal__loading">
          <LoaderCircle size={19} /> Loading customers…
        </div>
      ) : (
        <div className="business-modal__fields">
          <label>
            Customer
            <select
              value={form.customerId}
              onChange={update("customerId")}
              required
            >
              <option value="">Select a customer</option>
              {options.customers.map((customer) => (
                <option value={customer.id} key={customer.id}>
                  {customer.name} · {customer.mobile || customer.email}
                </option>
              ))}
            </select>
          </label>
          <label>
            Loyalty program
            <select
              value={form.loyaltyProgramId}
              onChange={update("loyaltyProgramId")}
            >
              <option value="">Default rewards program</option>
              {options.loyaltyPrograms.map((program) => (
                <option value={program.id} key={program.id}>
                  {program.name} · reward at {program.rewardThreshold} points
                </option>
              ))}
            </select>
          </label>
          <label>
            Points to award
            <input
              type="number"
              min="1"
              max="100000"
              value={form.points}
              onChange={update("points")}
              placeholder="For example, 25"
              required
            />
          </label>
          <label>
            Internal note <em>(optional)</em>
            <textarea
              value={form.note}
              onChange={update("note")}
              placeholder="For example, purchased lunch"
              maxLength="300"
            />
          </label>
        </div>
      )}
      <button
        className="business-modal__submit"
        type="submit"
        disabled={loading || submitting || !options.customers.length}
      >
        {submitting ? "Adding points…" : "Add loyalty points"}
      </button>
    </form>
  );
}

function OfferForm({ form, setForm, submitting, onSubmit }) {
  const update = (field) => (event) =>
    setForm((current) => ({ ...current, [field]: event.target.value }));
  const tomorrow = new Date(Date.now() + 86_400_000).toISOString().slice(0, 10);
  return (
    <form onSubmit={onSubmit}>
      <span className="business-modal__eyebrow">MEMBER OFFER</span>
      <h2 id="business-action-title">Create a reason to return.</h2>
      <p className="business-modal__intro">
        Your active customers will see this on their rewards dashboard.
      </p>
      <div className="business-modal__fields">
        <label>
          Offer title
          <input
            value={form.title}
            onChange={update("title")}
            placeholder="Weekend members’ treat"
            maxLength="120"
            required
          />
        </label>
        <label>
          Discount
          <span className="business-modal__field-help">
            Shown prominently to customers
          </span>
          <input
            value={form.discountLabel}
            onChange={update("discountLabel")}
            placeholder="Flat 20% OFF"
            maxLength="60"
            required
          />
        </label>
        <label>
          Coupon code <em>(optional)</em>
          <input
            value={form.couponCode}
            onChange={update("couponCode")}
            placeholder="WEEKEND20"
            maxLength="40"
          />
        </label>
        <label>
          Expires on
          <input
            type="date"
            min={tomorrow}
            value={form.expiresAt}
            onChange={update("expiresAt")}
            required
          />
        </label>
        <label className="business-modal__full">
          Short description <em>(optional)</em>
          <textarea
            value={form.description}
            onChange={update("description")}
            placeholder="Give members a little context for this offer."
            maxLength="600"
          />
        </label>
      </div>
      <button
        className="business-modal__submit"
        type="submit"
        disabled={submitting}
      >
        {submitting ? "Publishing…" : "Publish offer"}
      </button>
    </form>
  );
}
