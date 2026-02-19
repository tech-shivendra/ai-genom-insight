import { useRef } from "react";
import { useTiltEffect } from "@/hooks/use-animations";

const variants = [
  {
    gene: "CYP2D6",
    variant: "c.100C>T",
    rsid: "rs1065852",
    impact: "Reduced Function",
    drugs: ["Codeine", "Tramadol", "Antidepressants"],
    mechanism: "Loss of enzyme activity reduces conversion of prodrugs to active metabolites, leading to therapeutic failure.",
    color: "red",
  },
  {
    gene: "VKORC1",
    variant: "-1639G>A",
    rsid: "rs9923231",
    impact: "Increased Sensitivity",
    drugs: ["Warfarin", "Acenocoumarol"],
    mechanism: "Promoter variant reduces VKORC1 expression, decreasing vitamin K epoxide reductase activity and increasing warfarin sensitivity.",
    color: "yellow",
  },
  {
    gene: "CYP2C19",
    variant: "c.681G>A",
    rsid: "rs4244285",
    impact: "Normal Function",
    drugs: ["Clopidogrel", "PPIs", "Antifungals"],
    mechanism: "Wild-type allele maintains standard CYP2C19 enzyme activity for normal drug metabolism.",
    color: "green",
  },
];

const timeline = [
  {
    step: "1",
    title: "Genomic Variant Identification",
    desc: "AI parses the VCF file and identifies pharmacogenomically relevant variants using curated databases (PharmGKB, ClinVar).",
    icon: "🧬",
  },
  {
    step: "2",
    title: "Diplotype Assignment",
    desc: "Star allele nomenclature assigned using population-specific haplotype phasing algorithms.",
    icon: "🔗",
  },
  {
    step: "3",
    title: "Phenotype Prediction",
    desc: "Activity scores calculated to assign metabolizer status: poor, intermediate, normal, or ultrarapid.",
    icon: "📈",
  },
  {
    step: "4",
    title: "CPIC Guideline Lookup",
    desc: "Real-time cross-reference with CPIC level A/B guidelines for drug-gene pair recommendations.",
    icon: "📋",
  },
  {
    step: "5",
    title: "AI Risk Synthesis",
    desc: "Deep learning model integrates variant data, phenotype, and clinical context to generate risk score and narrative explanation.",
    icon: "🤖",
  },
];

const VariantCard = ({ variant }: { variant: typeof variants[0] }) => {
  const ref = useRef<HTMLDivElement>(null);
  useTiltEffect(ref as React.RefObject<HTMLElement>);

  const colorMap = {
    red: { border: "border-neon-red/30 hover:border-neon-red/60", text: "text-neon-red", bg: "bg-neon-red/10", shadow: "shadow-glow-red" },
    yellow: { border: "border-neon-yellow/30 hover:border-neon-yellow/60", text: "text-neon-yellow", bg: "bg-neon-yellow/10", shadow: "shadow-glow-yellow" },
    green: { border: "border-neon-green/30 hover:border-neon-green/60", text: "text-neon-green", bg: "bg-neon-green/10", shadow: "shadow-glow-green" },
  };

  const cfg = colorMap[variant.color as keyof typeof colorMap];

  return (
    <div
      ref={ref}
      className={`tilt-card glass rounded-2xl p-6 border ${cfg.border} transition-all duration-300 group`}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className={`text-xl font-black ${cfg.text} font-mono`}>{variant.gene}</div>
          <div className="text-sm text-muted-foreground font-mono mt-0.5">{variant.variant}</div>
        </div>
        <div className={`${cfg.bg} ${cfg.text} text-xs font-bold px-3 py-1.5 rounded-full border border-current/30`}>
          {variant.impact}
        </div>
      </div>

      <div className="text-xs text-muted-foreground font-mono mb-3">
        rsID: <span className="text-foreground">{variant.rsid}</span>
      </div>

      <p className="text-sm text-muted-foreground leading-relaxed mb-4">{variant.mechanism}</p>

      <div>
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Affected Drugs</div>
        <div className="flex flex-wrap gap-1.5">
          {variant.drugs.map((drug) => (
            <span key={drug} className="text-xs glass rounded-full px-2.5 py-1 text-foreground">
              {drug}
            </span>
          ))}
        </div>
      </div>

      <div className={`mt-4 h-0.5 ${cfg.bg} rounded-full transition-all duration-500 group-hover:shadow-lg`}
        style={{ background: `linear-gradient(90deg, transparent, ${variant.color === 'red' ? 'hsl(0 90% 60%)' : variant.color === 'yellow' ? 'hsl(45 100% 60%)' : 'hsl(145 80% 50%)'}, transparent)` }}
      />
    </div>
  );
};

export const ExplainabilitySection = () => {
  return (
    <section id="explainability" className="py-24 relative">
      <div className="absolute top-0 left-0 right-0 section-divider" />

      <div className="container mx-auto px-4">
        <div className="text-center mb-16 reveal">
          <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 text-sm mb-6">
            <div className="w-2 h-2 rounded-full bg-neon-purple animate-pulse" />
            <span className="text-neon-purple font-medium">AI Explainability</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-display font-black mb-4">
            Variant <span className="neon-text-purple">Insights</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Transparent, interpretable AI — every prediction is backed by mechanistic explanation
            and clinical evidence.
          </p>
        </div>

        {/* Variant cards */}
        <div className="grid md:grid-cols-3 gap-5 mb-20">
          {variants.map((v, i) => (
            <div key={v.gene} className="reveal" style={{ transitionDelay: `${i * 0.1}s` }}>
              <VariantCard variant={v} />
            </div>
          ))}
        </div>

        {/* Timeline */}
        <div className="max-w-3xl mx-auto reveal" style={{ transitionDelay: "0.3s" }}>
          <h3 className="text-2xl font-bold text-center mb-10">
            Analysis <span className="gradient-text">Pipeline</span>
          </h3>
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-neon-cyan/50 via-neon-purple/50 to-transparent" />

            <div className="space-y-6">
              {timeline.map((item, i) => (
                <div
                  key={item.step}
                  className="reveal flex gap-6 items-start"
                  style={{ transitionDelay: `${i * 0.1 + 0.4}s` }}
                >
                  <div className="relative flex-shrink-0 w-12 h-12 glass glow-border rounded-full flex items-center justify-center text-xl z-10">
                    {item.icon}
                  </div>
                  <div className="glass rounded-xl p-5 flex-1 hover:glow-border transition-all duration-300">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-bold text-neon-cyan">STEP {item.step}</span>
                    </div>
                    <h4 className="font-bold text-foreground mb-1">{item.title}</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
