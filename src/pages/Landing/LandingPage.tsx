import Header from "@/components/Header";
import HeroSection from "./components/HeroSection";
import ValueSection from "./components/ValueSection";
import StepsSection from "./components/StepsSection";

export default function LandingPage() {
  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-bg-page">
      <Header />

      <main className="min-h-0 flex-1 snap-y snap-mandatory overflow-y-auto">
        <HeroSection />
        <ValueSection />
        <StepsSection />
      </main>
    </div>
  );
}
