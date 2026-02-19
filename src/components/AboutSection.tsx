import { useRef } from "react";
import { useTiltEffect } from "@/hooks/use-animations";

const features = [
  {
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" />
      </svg>
    ),
    title: "VCF Parsing",
    desc: "High-fidelity parsing of Variant Call Format files, extracting clinically relevant genomic variants with precision.",
    color: "cyan",
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
      </svg>
    ),
    title: "Variant Detection",
    desc: "Automated detection of pharmacogenomically relevant SNPs, indels, and structural variants across 2,400+ genes.",
    color: "purple",
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-2M12 3v1m0 16v1m0-9h.01" />
      </svg>
    ),
    title: "AI Risk Prediction",
    desc: "Deep learning models trained on population-scale genomic data predict drug toxicity and efficacy with 97.4% accuracy.",
    color: "cyan",
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    title: "CPIC Guidelines",
    desc: "Real-time alignment with Clinical Pharmacogenomics Implementation Consortium guidelines for evidence-based recommendations.",
    color: "purple",
  },
];

const FeatureCard = ({ feature }: { feature: typeof features[0] }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  useTiltEffect(cardRef as React.RefObject<HTMLElement>);

  return (
    <div
      ref={cardRef}
      className="tilt-card glass rounded-2xl p-6 group hover:glow-border transition-all duration-300 cursor-default"
      style={{ transformStyle: "preserve-3d" }}
    >
      <div
        className={`feature-icon w-14 h-14 rounded-xl flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110 ${
          feature.color === "cyan" ? "text-neon-cyan" : "text-neon-purple"
        }`}
        style={{
          background:
            feature.color === "cyan"
              ? "linear-gradient(135deg, hsl(183 100% 50% / 0.15), hsl(175 80% 45% / 0.1))"
              : "linear-gradient(135deg, hsl(265 70% 65% / 0.15), hsl(265 70% 65% / 0.05))",
          border: `1px solid ${feature.color === "cyan" ? "hsl(183 100% 50% / 0.3)" : "hsl(265 70% 65% / 0.3)"}`,
        }}
      >
        {feature.icon}
      </div>
      <h3 className="text-lg font-bold text-foreground mb-2">{feature.title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
      <div
        className={`mt-4 h-0.5 w-12 rounded-full transition-all duration-500 group-hover:w-full ${
          feature.color === "cyan" ? "bg-neon-cyan/50" : "bg-neon-purple/50"
        }`}
      />
    </div>
  );
};

export const AboutSection = () => {
  return (
    <section id="about" className="py-24 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 section-divider" />

      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-neon-purple/3 blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4">
        <div className="text-center mb-16 reveal">
          <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 text-sm mb-6">
            <div className="w-2 h-2 rounded-full bg-neon-purple animate-pulse" />
            <span className="text-neon-purple font-medium">Core Technology</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-display font-black mb-4">
            How <span className="gradient-text-purple">PharmaGuard</span> Works
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            A multi-layered genomic analysis pipeline powered by state-of-the-art AI, turning raw
            genetic data into actionable clinical insights.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 mb-16">
          {features.map((f, i) => (
            <div
              key={f.title}
              className="reveal"
              style={{ transitionDelay: `${i * 0.1}s` }}
            >
              <FeatureCard feature={f} />
            </div>
          ))}
        </div>

        {/* Pipeline visualization */}
        <div className="glass-strong rounded-3xl p-8 reveal">
          <div className="flex items-center justify-between text-center overflow-x-auto gap-4">
            {[
              { step: "01", label: "Upload VCF", icon: "📁" },
              { step: "02", label: "Parse Variants", icon: "🔬" },
              { step: "03", label: "AI Analysis", icon: "🤖" },
              { step: "04", label: "CPIC Lookup", icon: "📋" },
              { step: "05", label: "Risk Report", icon: "📊" },
            ].map((s, i) => (
              <div key={s.step} className="flex items-center gap-4 flex-shrink-0">
                <div className="flex flex-col items-center">
                  <div className="text-2xl mb-2">{s.icon}</div>
                  <div className="w-10 h-10 rounded-full glass glow-border flex items-center justify-center text-xs font-bold text-neon-cyan mb-2">
                    {s.step}
                  </div>
                  <div className="text-xs text-muted-foreground whitespace-nowrap">{s.label}</div>
                </div>
                {i < 4 && (
                  <div className="flex items-center">
                    <div className="w-8 h-px bg-gradient-to-r from-neon-cyan/50 to-neon-purple/50" />
                    <svg className="w-3 h-3 text-neon-cyan" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
