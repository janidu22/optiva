import { LandingNavbar } from "@/components/landing/navbar";
import { HeroSection } from "@/components/landing/sections/hero-section";
import { TrustSection } from "@/components/landing/sections/trust-section";
import { FeaturesSection } from "@/components/landing/sections/features-section";
import { HowItWorksSection } from "@/components/landing/sections/how-it-works-section";
import { AnalyticsPreviewSection } from "@/components/landing/sections/analytics-preview-section";
import { PricingSection } from "@/components/landing/sections/pricing-section";
import { FaqSection } from "@/components/landing/sections/faq-section";
import { CtaSection } from "@/components/landing/sections/cta-section";
import { FooterSection } from "@/components/landing/sections/footer-section";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <LandingNavbar />
      <main className="flex-1">
        <HeroSection />
        <TrustSection />
        <FeaturesSection />
        <HowItWorksSection />
        <AnalyticsPreviewSection />
        <PricingSection />
        <FaqSection />
        <CtaSection />
      </main>
      <FooterSection />
    </div>
  );
}
