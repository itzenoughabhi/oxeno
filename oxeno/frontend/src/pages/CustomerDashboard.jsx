import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import CustomerNavbar from "../components/CustomerDashboard/CustomerNavbar.jsx";
import CustomerSidebar from "../components/CustomerDashboard/CustomerSidebar.jsx";
import DashboardSkeleton from "../components/CustomerDashboard/DashboardSkeleton.jsx";
import FavoriteStores from "../components/CustomerDashboard/FavoriteStores.jsx";
import HeroCard from "../components/CustomerDashboard/HeroCard.jsx";
import Loyalty from "../components/CustomerDashboard/Loyalty.jsx";
import MembershipCard from "../components/CustomerDashboard/MembershipCard.jsx";
import NotificationsPanel from "../components/CustomerDashboard/NotificationsPanel.jsx";
import Offers from "../components/CustomerDashboard/Offers.jsx";
import Profile from "../components/CustomerDashboard/Profile.jsx";
import QuickStats from "../components/CustomerDashboard/QuickStats.jsx";
import Rewards from "../components/CustomerDashboard/Rewards.jsx";
import Reviews from "../components/CustomerDashboard/Reviews.jsx";
import Coupons from "../components/CustomerDashboard/Coupons.jsx";
import VisitHistory from "../components/CustomerDashboard/VisitHistory.jsx";
import { buildCustomerExperience } from "../components/CustomerDashboard/dashboardData.js";
import { getCustomerDashboardData } from "../services/api.js";
import "./CustomerDashboard.css";

export default function CustomerDashboard({
  account,
  onNavigate,
  onLogout,
  onSessionExpired,
}) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeSection, setActiveSection] = useState("overview");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [redeemedOfferIds, setRedeemedOfferIds] = useState([]);
  const [claimedRewardIds, setClaimedRewardIds] = useState([]);
  const [copiedCoupon, setCopiedCoupon] = useState("");
  const [toast, setToast] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      setIsLoading(true);
      try {
        const response = await getCustomerDashboardData();
        if (!cancelled) setData(response);
      } catch (requestError) {
        if (requestError.status === 401) {
          onSessionExpired?.();
          return;
        }
        if (!cancelled) {
          setError(
            requestError.message ||
              "We could not refresh your live rewards right now.",
          );
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadDashboard();
    return () => {
      cancelled = true;
    };
  }, [account?.user?.id, onSessionExpired]);

  useEffect(() => {
    if (!toast) return undefined;
    const timeout = window.setTimeout(() => setToast(""), 3000);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const experience = useMemo(
    () => buildCustomerExperience(data, account),
    [data, account],
  );

  function selectSection(section) {
    setActiveSection(section);
    setMobileMenuOpen(false);
    const target = document.getElementById(section);
    if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
    if (section === "support")
      setToast("Our member-care team is ready to help.");
  }

  function redeemOffer(offerId) {
    setRedeemedOfferIds((current) =>
      current.includes(offerId) ? current : [...current, offerId],
    );
    setToast("Offer saved to your wallet.");
  }

  function redeemReward(rewardId) {
    setClaimedRewardIds((current) =>
      current.includes(rewardId) ? current : [...current, rewardId],
    );
    setToast("Your reward is ready for the next visit.");
  }

  async function copyCoupon(code) {
    try {
      await navigator.clipboard?.writeText(code);
    } catch {
      // The code remains visible to copy manually if the browser blocks clipboard access.
    }
    setCopiedCoupon(code);
    setToast(`${code} copied to your clipboard.`);
  }

  return (
    <div className="customer-shell">
      <CustomerSidebar
        activeSection={activeSection}
        onNavigate={selectSection}
        onLogout={onLogout}
        mobileOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />
      {mobileMenuOpen && (
        <button
          className="customer-shell__scrim"
          type="button"
          onClick={() => setMobileMenuOpen(false)}
          aria-label="Close menu"
        />
      )}
      <div className="customer-shell__content">
        <CustomerNavbar
          business={experience.business}
          customer={experience.customer}
          unreadCount={3}
          onMenu={() => setMobileMenuOpen(true)}
          onNotifications={() => selectSection("notifications")}
          onProfile={() => selectSection("profile")}
          onLogout={onLogout}
        />
        <main className="customer-main">
          {error && (
            <div className="customer-live-notice">
              <span>
                Live data is temporarily unavailable; showing your member
                preview.
              </span>
              <button type="button" onClick={() => setError("")}>
                <X size={16} />
              </button>
            </div>
          )}
          {isLoading ? (
            <DashboardSkeleton />
          ) : (
            <>
              <HeroCard
                experience={experience}
                onRedeem={() => redeemOffer(experience.offers[0].id)}
                redeemed={redeemedOfferIds.includes(experience.offers[0].id)}
              />
              <QuickStats experience={experience} />
              <Offers
                offers={experience.offers}
                onRedeem={redeemOffer}
                redeemedOfferIds={redeemedOfferIds}
              />
              <Coupons onCopy={copyCoupon} copied={copiedCoupon} />
              <Loyalty experience={experience} />
              <VisitHistory experience={experience} />
              <Rewards
                rewards={experience.rewards}
                points={experience.points}
                onRedeemReward={redeemReward}
                claimedRewardIds={claimedRewardIds}
              />
              <Reviews businessName={experience.business.name} />
              <FavoriteStores business={experience.business} />
              <NotificationsPanel />
              <Profile
                customer={experience.customer}
                membership={experience.membership}
              />
              <MembershipCard experience={experience} />
              <footer className="customer-footer">
                <span>© 2026 Oxeno</span>
                <div>
                  <button type="button">Privacy</button>
                  <button type="button">Terms</button>
                  <button
                    type="button"
                    onClick={() => selectSection("support")}
                  >
                    Support
                  </button>
                </div>
                <button type="button" onClick={() => onNavigate?.("home")}>
                  Back to Oxeno
                </button>
              </footer>
            </>
          )}
        </main>
      </div>
      {toast && (
        <div className="customer-toast" role="status">
          {toast}
        </div>
      )}
    </div>
  );
}
