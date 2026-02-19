import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";
import { AboutSection } from "@/components/AboutSection";
import { UploadSection } from "@/components/UploadSection";
import { ResultsSection } from "@/components/ResultsSection";
import { ExplainabilitySection } from "@/components/ExplainabilitySection";
import { FooterSection } from "@/components/FooterSection";
import { useScrollReveal } from "@/hooks/use-animations";
import { AnalysisResult } from "@/lib/pharmacogenomics";

const Index = () => {
  const [results, setResults] = useState<AnalysisResult | null>(null);

  // Initialize scroll reveal
  useScrollReveal();

  // Re-run observer whenever results change (new elements appear)
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );

    const elements = document.querySelectorAll(
      ".reveal:not(.visible), .reveal-left:not(.visible), .reveal-right:not(.visible)"
    );
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [results]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <HeroSection />
        <AboutSection />
        <UploadSection onResults={setResults} />
        {results && <ResultsSection results={results} />}
        <ExplainabilitySection />
      </main>
      <FooterSection />
    </div>
  );
};

export default Index;
