import {
  LandingHeader,
  HeroSection,
  ProblemSection,
  HowItWorksSection,
  BenefitsSection,
  SpecialtiesSection,
  StatsSection,
  NetworkSection,
  ContactSection,
  LandingFooter,
} from "@/features/landing";

export default function LandingPage() {
  return (
    <div className="min-h-screen font-sans">
      <LandingHeader />
      <main>
        <HeroSection />
        <ProblemSection />
        <HowItWorksSection />
        <NetworkSection />
        <BenefitsSection />
        <StatsSection />
        <SpecialtiesSection />
        <ContactSection />
      </main>
      <LandingFooter />
    </div>
  );
}
