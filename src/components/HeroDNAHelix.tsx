import { useEffect, useRef } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

const HELIX_PAIRS = 24;
const BASE_COLORS = {
  cyan: "183, 100%, 50%",
  purple: "265, 70%, 65%",
};

export const HeroDNAHelix = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Pure CSS animation for max performance
  const rotationDuration = isMobile ? "18s" : "12s";

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-hidden pointer-events-none"
      style={{ zIndex: 1 }}
      aria-hidden="true"
    >
      {/* Glow backdrop */}
      <div
        className="absolute right-[8%] top-1/2 -translate-y-1/2 rounded-full blur-[80px]"
        style={{
          width: isMobile ? "200px" : "320px",
          height: isMobile ? "500px" : "700px",
          background: `radial-gradient(ellipse, hsl(${BASE_COLORS.cyan} / 0.08), hsl(${BASE_COLORS.purple} / 0.04), transparent 70%)`,
        }}
      />

      {/* Rotating helix container */}
      <div
        className="absolute top-1/2 -translate-y-1/2"
        style={{
          right: isMobile ? "2%" : "10%",
          width: isMobile ? "120px" : "180px",
          height: isMobile ? "80vh" : "90vh",
          perspective: "600px",
          opacity: prefersReducedMotion ? 0.1 : 0.15,
          filter: "blur(0.5px)",
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            transformStyle: "preserve-3d",
            animation: prefersReducedMotion
              ? "none"
              : `dna-rotate ${rotationDuration} ease-in-out infinite`,
          }}
        >
          {Array.from({ length: HELIX_PAIRS }).map((_, i) => {
            const yPercent = (i / HELIX_PAIRS) * 100;
            const phase = (i / HELIX_PAIRS) * Math.PI * 4;
            const xLeft = Math.sin(phase) * 50;
            const xRight = Math.sin(phase + Math.PI) * 50;
            const depthLeft = Math.cos(phase);
            const depthRight = Math.cos(phase + Math.PI);

            return (
              <div
                key={i}
                className="absolute w-full"
                style={{ top: `${yPercent}%` }}
              >
                {/* Left nucleotide */}
                <div
                  className="absolute rounded-full"
                  style={{
                    width: isMobile ? "6px" : "8px",
                    height: isMobile ? "6px" : "8px",
                    left: `calc(50% + ${xLeft}px)`,
                    background: `hsl(${BASE_COLORS.cyan} / ${0.4 + depthLeft * 0.5})`,
                    boxShadow: depthLeft > 0
                      ? `0 0 ${6 + depthLeft * 8}px hsl(${BASE_COLORS.cyan} / ${0.2 + depthLeft * 0.3})`
                      : "none",
                    transform: `scale(${0.6 + Math.abs(depthLeft) * 0.4})`,
                  }}
                />
                {/* Right nucleotide */}
                <div
                  className="absolute rounded-full"
                  style={{
                    width: isMobile ? "6px" : "8px",
                    height: isMobile ? "6px" : "8px",
                    left: `calc(50% + ${xRight}px)`,
                    background: `hsl(${BASE_COLORS.purple} / ${0.4 + depthRight * 0.5})`,
                    boxShadow: depthRight > 0
                      ? `0 0 ${6 + depthRight * 8}px hsl(${BASE_COLORS.purple} / ${0.2 + depthRight * 0.3})`
                      : "none",
                    transform: `scale(${0.6 + Math.abs(depthRight) * 0.4})`,
                  }}
                />
                {/* Connector */}
                <div
                  className="absolute top-[3px] h-[1px]"
                  style={{
                    left: `calc(50% + ${Math.min(xLeft, xRight)}px)`,
                    width: `${Math.abs(xLeft - xRight)}px`,
                    background: `linear-gradient(90deg, hsl(${BASE_COLORS.cyan} / ${0.15 + Math.abs(depthLeft) * 0.15}), hsl(${BASE_COLORS.purple} / ${0.15 + Math.abs(depthRight) * 0.15}))`,
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* CSS animation keyframes */}
      <style>{`
        @keyframes dna-rotate {
          0% { transform: rotateX(0deg); }
          50% { transform: rotateX(180deg); }
          100% { transform: rotateX(360deg); }
        }
        @media (prefers-reduced-motion: reduce) {
          .dna-rotate { animation: none !important; }
        }
      `}</style>
    </div>
  );
};
