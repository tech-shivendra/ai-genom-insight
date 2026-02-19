import { useState } from "react";

const NavLinks = [
  { href: "#about", label: "About" },
  { href: "#upload", label: "Analyze" },
  { href: "#results", label: "Results" },
  { href: "#explainability", label: "Explainability" },
];

export const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 glass-strong border-b border-border/40"
      aria-label="Main navigation"
    >
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <a href="#" className="flex items-center gap-2.5 group">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-sm group-hover:scale-110 transition-transform"
            style={{ background: "linear-gradient(135deg, hsl(183 100% 40%), hsl(265 70% 55%))" }}
          >
            🧬
          </div>
          <span className="font-black text-foreground">
            Pharma<span className="gradient-text">Guard</span>
          </span>
        </a>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-6">
          {NavLinks.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm text-muted-foreground hover:text-neon-cyan transition-colors duration-200 relative group"
            >
              {l.label}
              <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-neon-cyan group-hover:w-full transition-all duration-300" />
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <a
            href="#upload"
            className="hidden md:inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-lg transition-all duration-300 hover:scale-105"
            style={{
              background: "linear-gradient(135deg, hsl(183 100% 40%), hsl(175 80% 35%))",
              color: "white",
              boxShadow: "var(--glow-cyan)",
            }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Analyze
          </a>

          {/* Mobile menu button */}
          <button
            className="md:hidden glass rounded-lg p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle mobile menu"
            aria-expanded={mobileOpen}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ${
          mobileOpen ? "max-h-64 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="border-t border-border/40 px-4 py-3 space-y-1">
          {NavLinks.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setMobileOpen(false)}
              className="block py-2.5 text-sm text-muted-foreground hover:text-neon-cyan transition-colors"
            >
              {l.label}
            </a>
          ))}
          <a
            href="#upload"
            onClick={() => setMobileOpen(false)}
            className="block py-2.5 text-sm font-semibold text-neon-cyan"
          >
            → Run Analysis
          </a>
        </div>
      </div>
    </nav>
  );
};
