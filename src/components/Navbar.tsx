import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import generxLogo from "@/assets/generx-logo.png";

const NavLinks = [
  { href: "#about", label: "About" },
  { href: "#upload", label: "Analyze" },
  { href: "#results", label: "Results" },
  { href: "#explainability", label: "Explainability" },
];

export const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "glass-strong border-b border-border/40 py-2"
          : "bg-transparent py-4"
      }`}
      aria-label="Main navigation"
    >
      <div className="container mx-auto px-4 flex items-center justify-between">
        <a href="#" className="flex items-center gap-2.5 group">
          <img
            src={generxLogo}
            alt="GeneRx logo"
            className="w-8 h-8 rounded-lg group-hover:scale-110 transition-transform"
          />
          <span className="font-display font-bold text-foreground tracking-tight">
            Gene<span className="gradient-text">Rx</span>
          </span>
        </a>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          {NavLinks.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 relative group"
            >
              {l.label}
              <span className="absolute -bottom-1 left-0 w-0 h-px bg-neon-cyan group-hover:w-full transition-all duration-300" />
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <motion.a
            href="#upload"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="hidden md:inline-flex items-center gap-1.5 text-sm font-semibold px-5 py-2 rounded-lg transition-all duration-300"
            style={{
              background: "linear-gradient(135deg, hsl(183 100% 40%), hsl(175 80% 35%))",
              color: "white",
            }}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Analyze
          </motion.a>

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
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden overflow-hidden"
          >
            <div className="border-t border-border/40 px-4 py-3 space-y-1 glass-strong">
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
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};
