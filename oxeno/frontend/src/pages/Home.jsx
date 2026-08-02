import Hero from "../components/Hero/Hero.jsx";
import Stats from "../components/Stats/Stats.jsx";
import Features from "../components/Features/Features.jsx";
import QRCodeSection from "../components/QRCodeSection/QRCodeSection.jsx";
import DashboardPreview from "../components/DashboardPreview/DashboardPreview.jsx";
import Testimonials from "../components/Testimonials/Testimonials.jsx";
import PricingPreview from "../components/PricingPreview/PricingPreview.jsx";
import CTA from "../components/CTA/CTA.jsx";

export default function Home({ account }) {
  return (
    <main className="font-body text-ink-700 bg-white">
      <Hero />
      <Stats />
      <Features />
      <QRCodeSection />
      <DashboardPreview account={account} />
      <Testimonials />
      <PricingPreview />
      <CTA />
    </main>
  );
}
