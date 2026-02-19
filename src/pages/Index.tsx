import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";
import { AboutSection } from "@/components/AboutSection";
import { UploadSection } from "@/components/UploadSection";
import { ResultsSection } from "@/components/ResultsSection";
import { ExplainabilitySection } from "@/components/ExplainabilitySection";
import { FooterSection } from "@/components/FooterSection";
import { useScrollReveal } from "@/hooks/use-animations";

interface ResultsData {
  patient_id: string;
  analysis_date: string;
  vcf_variants_found: number;
  drugs_analyzed: string[];
  results: {
    drug: string;
    gene: string;
    diplotype: string;
    phenotype: string;
    risk: "safe" | "adjust" | "toxic";
    recommendation: string;
    explanation: string;
    cpic_level: string;
  }[];
}

const Index = () => {
  const [results, setResults] = useState<ResultsData | null>(null);

  const handleResults = (data: Parameters<typeof setResults>[0]) => {
    setResults(data as ResultsData);
  };

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

    const elements = document.querySelectorAll(".reveal:not(.visible), .reveal-left:not(.visible), .reveal-right:not(.visible)");
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [results]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <HeroSection />
        <AboutSection />
        <UploadSection onResults={handleResults} />
        {results && <ResultsSection results={results} />}
        <ExplainabilitySection />
      </main>
      <FooterSection />
    </div>
  );
};

export default Index;
