import { useState, useRef } from "react";
import { useTiltEffect } from "@/hooks/use-animations";

interface Result {
  drug: string;
  gene: string;
  diplotype: string;
  phenotype: string;
  risk: "safe" | "adjust" | "toxic";
  recommendation: string;
  explanation: string;
  cpic_level: string;
}

interface ResultsData {
  patient_id: string;
  analysis_date: string;
  vcf_variants_found: number;
  drugs_analyzed: string[];
  results: Result[];
}

const riskConfig = {
  safe: {
    label: "Safe",
    cls: "badge-safe",
    icon: "✓",
    bar: "hsl(145 80% 50%)",
    glow: "shadow-glow-green",
  },
  adjust: {
    label: "Adjust Dosage",
    cls: "badge-adjust",
    icon: "⚠",
    bar: "hsl(45 100% 60%)",
    glow: "shadow-glow-yellow",
  },
  toxic: {
    label: "Toxic / Ineffective",
    cls: "badge-toxic",
    icon: "✕",
    bar: "hsl(0 90% 60%)",
    glow: "shadow-glow-red",
  },
};

const ResultCard = ({ result }: { result: Result }) => {
  const [expanded, setExpanded] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  useTiltEffect(cardRef as React.RefObject<HTMLElement>);
  const cfg = riskConfig[result.risk];

  return (
    <div
      ref={cardRef}
      className={`tilt-card glass rounded-2xl overflow-hidden transition-all duration-300 border ${
        result.risk === "safe"
          ? "border-neon-green/20 hover:border-neon-green/40"
          : result.risk === "adjust"
          ? "border-neon-yellow/20 hover:border-neon-yellow/40"
          : "border-neon-red/20 hover:border-neon-red/40"
      }`}
    >
      {/* Top bar */}
      <div
        className="h-1 w-full"
        style={{ background: cfg.bar, boxShadow: `0 0 10px ${cfg.bar}80` }}
      />

      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-foreground">{result.drug}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm text-muted-foreground">{result.gene}</span>
              <span className="text-muted-foreground">·</span>
              <span className="text-sm text-muted-foreground font-mono">{result.diplotype}</span>
            </div>
          </div>
          <div className={`${cfg.cls} px-3 py-1.5 rounded-full text-sm font-bold flex items-center gap-1.5`}>
            <span>{cfg.icon}</span>
            <span>{cfg.label}</span>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
            <span>Phenotype: <span className="text-foreground font-medium">{result.phenotype}</span></span>
            <span className="glass px-2 py-0.5 rounded-full text-neon-cyan">CPIC {result.cpic_level}</span>
          </div>
        </div>

        {/* Expandable accordion */}
        <div className="space-y-2">
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full text-left text-sm text-muted-foreground hover:text-foreground flex items-center justify-between py-2 border-t border-border/50 transition-colors"
            aria-expanded={expanded}
          >
            <span className="font-medium">View Clinical Details</span>
            <svg
              className={`w-4 h-4 transition-transform duration-300 ${expanded ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          <div
            className={`overflow-hidden transition-all duration-500 ${
              expanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            <div className="space-y-3 pt-2">
              <div className="glass rounded-xl p-4">
                <div className="text-xs font-semibold text-neon-cyan mb-2 uppercase tracking-wider">
                  Clinical Recommendation
                </div>
                <p className="text-sm text-foreground leading-relaxed">{result.recommendation}</p>
              </div>
              <div className="glass rounded-xl p-4">
                <div className="text-xs font-semibold text-neon-purple mb-2 uppercase tracking-wider">
                  AI Explanation
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{result.explanation}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const JsonViewer = ({ data }: { data: ResultsData }) => {
  const [copied, setCopied] = useState(false);
  const json = JSON.stringify(data, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(json);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pharma-guard-${data.patient_id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="glass rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-muted/30">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-neon-red/60" />
          <div className="w-3 h-3 rounded-full bg-neon-yellow/60" />
          <div className="w-3 h-3 rounded-full bg-neon-green/60" />
          <span className="ml-2 text-xs text-muted-foreground font-mono">report.json</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 text-xs glass rounded-lg px-3 py-1.5 hover:text-neon-cyan hover:border-neon-cyan/30 transition-colors"
            aria-label="Copy JSON"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
            </svg>
            {copied ? "Copied!" : "Copy"}
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 text-xs rounded-lg px-3 py-1.5 font-medium transition-all"
            style={{ background: "hsl(183 100% 35% / 0.2)", border: "1px solid hsl(183 100% 50% / 0.4)", color: "hsl(183 100% 60%)" }}
            aria-label="Download JSON"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download
          </button>
        </div>
      </div>
      <pre className="p-5 text-xs font-mono text-muted-foreground overflow-auto max-h-64 leading-relaxed">
        <code>{json}</code>
      </pre>
    </div>
  );
};

interface ResultsSectionProps {
  results: ResultsData | null;
}

export const ResultsSection = ({ results }: ResultsSectionProps) => {
  if (!results) return null;

  const safeCount = results.results.filter((r) => r.risk === "safe").length;
  const adjustCount = results.results.filter((r) => r.risk === "adjust").length;
  const toxicCount = results.results.filter((r) => r.risk === "toxic").length;

  return (
    <section id="results" className="py-24 relative">
      <div className="absolute top-0 left-0 right-0 section-divider" />

      <div className="container mx-auto px-4">
        <div className="text-center mb-12 reveal">
          <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 text-sm mb-6">
            <div className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
            <span className="text-neon-green font-medium">Analysis Complete</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-display font-black mb-4">
            Pharmacogenomic <span className="gradient-text">Risk Report</span>
          </h2>
          <p className="text-muted-foreground">
            Patient ID:{" "}
            <span className="font-mono text-neon-cyan font-medium">{results.patient_id}</span> ·{" "}
            {results.vcf_variants_found} variants found · {results.results.length} drugs analyzed
          </p>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto mb-12 reveal" style={{ transitionDelay: "0.1s" }}>
          {[
            { count: safeCount, label: "Safe", cls: "badge-safe" },
            { count: adjustCount, label: "Adjust Dose", cls: "badge-adjust" },
            { count: toxicCount, label: "Avoid", cls: "badge-toxic" },
          ].map((s) => (
            <div key={s.label} className={`${s.cls} rounded-xl p-4 text-center`}>
              <div className="text-3xl font-black">{s.count}</div>
              <div className="text-xs font-medium mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Result cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 mb-12">
          {results.results.map((r, i) => (
            <div key={r.drug} className="reveal" style={{ transitionDelay: `${i * 0.1}s` }}>
              <ResultCard result={r as Result} />
            </div>
          ))}
        </div>

        {/* JSON output */}
        <div className="max-w-3xl mx-auto reveal" style={{ transitionDelay: "0.3s" }}>
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <span className="text-neon-cyan">{"{ }"}</span>
            Raw JSON Output
          </h3>
          <JsonViewer data={results} />
        </div>
      </div>
    </section>
  );
};
