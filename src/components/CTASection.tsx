import { motion } from "framer-motion";
import { StaggerContainer, StaggerItem } from "@/components/ui/stagger-wrapper";

export const CTASection = () => {
  return (
    <section className="py-28 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 section-divider" />

      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full bg-neon-cyan/3 blur-[150px]" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <StaggerContainer className="max-w-2xl mx-auto text-center">
          <StaggerItem>
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4 leading-tight">
              Start your <span className="gradient-text">analysis</span>
            </h2>
          </StaggerItem>

          <StaggerItem>
            <p className="text-muted-foreground max-w-md mx-auto mb-8">
              Upload a VCF file and get CPIC-aligned risk predictions. Client-side only — no data leaves your browser.
            </p>
          </StaggerItem>

          <StaggerItem>
            <div className="flex items-center justify-center gap-3">
              <motion.a
                href="#upload"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-primary-foreground transition-all"
                style={{
                  background: "linear-gradient(135deg, hsl(183 100% 40%), hsl(175 80% 35%))",
                }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Start Analysis
              </motion.a>

              <motion.a
                href="/sample.vcf"
                download="sample_pharmaguard.vcf"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-medium glass border border-border/50 hover:border-neon-cyan/30 text-sm transition-all"
              >
                Download Sample VCF
              </motion.a>
            </div>
          </StaggerItem>
        </StaggerContainer>
      </div>
    </section>
  );
};
