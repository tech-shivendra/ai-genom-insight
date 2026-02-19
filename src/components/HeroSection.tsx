import { useEffect, useRef, useState } from "react";
import heroBg from "@/assets/hero-bg.jpg";

const DNAStrand = () => (
  <svg
    className="absolute inset-0 w-full h-full opacity-10"
    viewBox="0 0 400 800"
    preserveAspectRatio="xMidYMid slice"
  >
    {Array.from({ length: 20 }).map((_, i) => {
      const y = i * 40;
      const x1 = 50 + Math.sin((i * Math.PI) / 5) * 80;
      const x2 = 350 - Math.sin((i * Math.PI) / 5) * 80;
      return (
        <g key={i}>
          <circle cx={x1} cy={y} r="4" fill="hsl(183 100% 50%)" opacity={0.8 - i * 0.02} />
          <circle cx={x2} cy={y} r="4" fill="hsl(265 70% 65%)" opacity={0.8 - i * 0.02} />
          <line x1={x1} y1={y} x2={x2} y2={y} stroke="hsl(183 100% 50%)" strokeWidth="1" opacity="0.3" />
        </g>
      );
    })}
  </svg>
);

const FloatingCard = () => (
  <div className="glass-strong rounded-2xl p-5 w-64 animate-float-slow">
    <div className="flex items-center gap-3 mb-4">
      <div className="w-8 h-8 rounded-full bg-neon-cyan/20 flex items-center justify-center">
        <div className="w-3 h-3 rounded-full bg-neon-cyan animate-pulse" />
      </div>
      <div>
        <div className="text-xs text-muted-foreground">Patient ID</div>
        <div className="text-sm font-semibold text-foreground">PG-2847-K</div>
      </div>
      <div className="ml-auto badge-safe px-2 py-0.5 rounded-full text-xs font-medium">Safe</div>
    </div>
    <div className="space-y-2">
      {[
        { gene: "CYP2D6", drug: "Codeine", risk: "safe", pct: 92 },
        { gene: "CYP2C19", drug: "Clopidogrel", risk: "adjust", pct: 61 },
        { gene: "VKORC1", drug: "Warfarin", risk: "toxic", pct: 28 },
      ].map((row) => (
        <div key={row.gene} className="flex items-center gap-2">
          <div className="text-xs text-muted-foreground w-14">{row.gene}</div>
          <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${row.pct}%`,
                background:
                  row.risk === "safe"
                    ? "hsl(145 80% 50%)"
                    : row.risk === "adjust"
                    ? "hsl(45 100% 60%)"
                    : "hsl(0 90% 60%)",
              }}
            />
          </div>
          <div className="text-xs font-medium text-foreground w-8">{row.pct}%</div>
        </div>
      ))}
    </div>
    <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
      <span className="text-xs text-muted-foreground">AI Confidence</span>
      <span className="text-xs font-bold text-neon-cyan">97.4%</span>
    </div>
  </div>
);

export const HeroSection = () => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Parallax background */}
      <div
        className="absolute inset-0 z-0"
        style={{ transform: `translateY(${scrollY * 0.4}px)` }}
      >
        <img src={heroBg} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/50 to-background" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent" />
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 grid-pattern opacity-30 z-0" />

      {/* Floating orbs */}
      <div className="absolute top-20 left-1/4 w-64 h-64 rounded-full bg-neon-cyan/5 blur-3xl animate-pulse-glow pointer-events-none z-0" />
      <div className="absolute bottom-32 right-1/4 w-96 h-96 rounded-full bg-neon-purple/5 blur-3xl animate-pulse-glow-purple pointer-events-none z-0" />

      <div className="container relative z-10 mx-auto px-4 pt-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[80vh]">
          {/* Left content */}
          <div className="space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 text-sm animate-fade-in">
              <div className="w-2 h-2 rounded-full bg-neon-cyan animate-pulse" />
              <span className="text-neon-cyan font-medium">AI-Powered Precision Medicine</span>
            </div>

            {/* Title */}
            <div className="space-y-3 animate-slide-up" style={{ animationDelay: "0.1s" }}>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-black leading-[1.05] tracking-tight">
                <span className="text-foreground">Precision</span>
                <br />
                <span className="gradient-text-purple">Medicine</span>
                <br />
                <span className="text-foreground">Powered by</span>{" "}
                <span className="neon-text">AI</span>
              </h1>
            </div>

            {/* Subtitle */}
            <p
              className="text-lg text-muted-foreground max-w-lg leading-relaxed animate-fade-in"
              style={{ animationDelay: "0.3s" }}
            >
              Upload Genetic Data. Get Personalized Drug Risk Insights. Powered by pharmacogenomic
              analysis aligned with{" "}
              <span className="text-neon-cyan font-medium">CPIC clinical guidelines</span>.
            </p>

            {/* Stats row */}
            <div
              className="flex gap-8 animate-fade-in"
              style={{ animationDelay: "0.4s" }}
            >
              {[
                { label: "Genes Analyzed", value: "2,400+" },
                { label: "Drug Interactions", value: "850+" },
                { label: "Accuracy", value: "97.4%" },
              ].map((s) => (
                <div key={s.label}>
                  <div className="text-2xl font-bold gradient-text">{s.value}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>

            {/* CTA buttons */}
            <div
              className="flex flex-col sm:flex-row gap-4 animate-fade-in"
              style={{ animationDelay: "0.5s" }}
            >
              <a
                href="#upload"
                className="group relative inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-semibold text-primary-foreground overflow-hidden transition-all duration-300 animate-pulse-glow"
                style={{
                  background: "linear-gradient(135deg, hsl(183 100% 40%), hsl(175 80% 35%))",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.transform = "translateY(-2px) scale(1.02)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.transform = "translateY(0) scale(1)";
                }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Analyze Patient Data
              </a>
              <a
                href="#about"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-semibold glass glow-border transition-all duration-300 hover:bg-neon-cyan/10"
              >
                Learn More
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
            </div>
          </div>

          {/* Right: floating card */}
          <div className="hidden lg:flex justify-center items-center">
            <div className="relative">
              <div className="absolute -inset-4 rounded-3xl bg-neon-cyan/5 blur-2xl animate-pulse-glow" />
              <FloatingCard />
              {/* Secondary floating cards */}
              <div className="absolute -top-12 -right-10 glass rounded-xl p-3 animate-float text-xs">
                <div className="text-muted-foreground">Variant Found</div>
                <div className="text-neon-cyan font-bold">CYP2D6*4</div>
              </div>
              <div className="absolute -bottom-10 -left-10 glass rounded-xl p-3 animate-float-delayed text-xs">
                <div className="text-muted-foreground">Risk Level</div>
                <div className="text-neon-green font-bold">✓ Low Risk</div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce-soft">
          <span className="text-xs text-muted-foreground uppercase tracking-widest">Scroll</span>
          <div className="w-5 h-9 glass rounded-full flex items-start justify-center p-1">
            <div className="w-1.5 h-3 bg-neon-cyan rounded-full animate-data-stream" />
          </div>
        </div>
      </div>
    </section>
  );
};
