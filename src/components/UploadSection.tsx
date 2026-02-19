import { useState, useRef } from "react";

const DRUGS = [
  "Warfarin", "Clopidogrel", "Codeine", "Tamoxifen", "Simvastatin",
  "Azathioprine", "Irinotecan", "Fluorouracil", "Carbamazepine",
  "Phenytoin", "Abacavir", "Allopurinol", "Sertraline", "Amitriptyline",
  "Metoprolol", "Atomoxetine", "Tacrolimus", "Mercaptopurine",
];

type Risk = "safe" | "adjust" | "toxic";

const MOCK_RESULT: {
  patient_id: string;
  analysis_date: string;
  vcf_variants_found: number;
  drugs_analyzed: string[];
  results: { drug: string; gene: string; diplotype: string; phenotype: string; risk: Risk; recommendation: string; explanation: string; cpic_level: string; }[];
} = {
  patient_id: "PG-2847-K",
  analysis_date: new Date().toISOString(),
  vcf_variants_found: 14,
  drugs_analyzed: ["Warfarin", "Clopidogrel", "Codeine"],
  results: [
    {
      drug: "Warfarin",
      gene: "VKORC1",
      diplotype: "*1/*2",
      phenotype: "Intermediate Metabolizer",
      risk: "adjust",
      recommendation: "Reduce initial dose by 30-40%. Monitor INR closely. Consider genetic-guided dosing algorithms (e.g., IWPC algorithm).",
      explanation: "VKORC1 variant -1639G>A reduces enzyme expression, increasing warfarin sensitivity. Patient carries one copy of the A allele, conferring intermediate sensitivity.",
      cpic_level: "A",
    },
    {
      drug: "Clopidogrel",
      gene: "CYP2C19",
      diplotype: "*1/*1",
      phenotype: "Normal Metabolizer",
      risk: "safe",
      recommendation: "Standard dosing is appropriate. No dose adjustment required. Clopidogrel will achieve expected antiplatelet effect.",
      explanation: "Patient is a normal CYP2C19 metabolizer. Clopidogrel will be activated at expected rates, providing standard antiplatelet efficacy without increased bleeding risk.",
      cpic_level: "A",
    },
    {
      drug: "Codeine",
      gene: "CYP2D6",
      diplotype: "*1/*4",
      phenotype: "Poor Metabolizer",
      risk: "toxic",
      recommendation: "AVOID codeine. Select alternative analgesic (e.g., morphine, oxycodone with dose reduction). Risk of inadequate pain relief.",
      explanation: "CYP2D6*4 allele results in non-functional enzyme. Patient cannot convert codeine to morphine. Standard doses will be ineffective; higher doses risk accumulation of codeine parent compound.",
      cpic_level: "A",
    },
  ],
};

interface UploadSectionProps {
  onResults: (results: typeof MOCK_RESULT) => void;
}

export const UploadSection = ({ onResults }: UploadSectionProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [selectedDrugs, setSelectedDrugs] = useState<string[]>(["Warfarin", "Clopidogrel", "Codeine"]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [drugSearch, setDrugSearch] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredDrugs = DRUGS.filter(
    (d) => d.toLowerCase().includes(drugSearch.toLowerCase()) && !selectedDrugs.includes(d)
  );

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) setUploadedFile(file);
  };

  const toggleDrug = (drug: string) => {
    setSelectedDrugs((prev) =>
      prev.includes(drug) ? prev.filter((d) => d !== drug) : [...prev, drug]
    );
  };

  const handleAnalyze = () => {
    if (!uploadedFile && selectedDrugs.length === 0) return;
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      onResults({ ...MOCK_RESULT, drugs_analyzed: selectedDrugs });
      document.getElementById("results")?.scrollIntoView({ behavior: "smooth" });
    }, 3000);
  };

  return (
    <section id="upload" className="py-24 relative">
      <div className="absolute top-0 left-0 right-0 section-divider" />
      <div className="absolute inset-0 grid-pattern opacity-20 pointer-events-none" />

      <div className="container mx-auto px-4">
        <div className="text-center mb-12 reveal">
          <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 text-sm mb-6">
            <div className="w-2 h-2 rounded-full bg-neon-cyan animate-pulse" />
            <span className="text-neon-cyan font-medium">Genomic Analysis Engine</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-display font-black mb-4">
            Upload & <span className="gradient-text">Analyze</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Upload your patient's VCF file and select drugs to analyze. Our AI will generate a
            comprehensive pharmacogenomic risk report.
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-6 reveal" style={{ transitionDelay: "0.1s" }}>
          {/* VCF Upload */}
          <div
            className={`drop-zone rounded-2xl p-10 text-center cursor-pointer transition-all duration-300 ${
              isDragging ? "drag-over" : ""
            } ${uploadedFile ? "border-solid border-neon-green/60" : ""}`}
            onDragEnter={() => setIsDragging(true)}
            onDragLeave={() => setIsDragging(false)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            role="button"
            aria-label="Upload VCF file"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".vcf,.vcf.gz"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && setUploadedFile(e.target.files[0])}
              aria-label="VCF file input"
            />

            {uploadedFile ? (
              <div className="space-y-3">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-neon-green/10 border border-neon-green/40 flex items-center justify-center shadow-glow-green">
                  <svg className="w-8 h-8 text-neon-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="text-neon-green font-semibold">{uploadedFile.name}</div>
                <div className="text-muted-foreground text-sm">
                  {(uploadedFile.size / 1024).toFixed(1)} KB · Click to replace
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div
                  className={`w-16 h-16 mx-auto rounded-2xl feature-icon flex items-center justify-center animate-border-glow ${
                    isDragging ? "scale-110" : ""
                  } transition-transform duration-300`}
                >
                  <svg className="w-8 h-8 text-neon-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <div>
                  <p className="text-foreground font-semibold">
                    {isDragging ? "Drop your VCF file here" : "Drag & drop your VCF file"}
                  </p>
                  <p className="text-muted-foreground text-sm mt-1">or click to browse · .vcf, .vcf.gz supported</p>
                </div>
                <div className="inline-flex items-center gap-2 text-xs text-muted-foreground glass rounded-full px-3 py-1">
                  <svg className="w-3 h-3 text-neon-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  End-to-end encrypted · HIPAA compliant
                </div>
              </div>
            )}
          </div>

          {/* Drug selector */}
          <div className="glass rounded-2xl p-6 space-y-4">
            <label className="block text-sm font-semibold text-foreground">
              Select Drugs to Analyze
              <span className="ml-2 text-xs text-muted-foreground font-normal">({selectedDrugs.length} selected)</span>
            </label>

            {/* Selected drugs */}
            {selectedDrugs.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedDrugs.map((drug) => (
                  <button
                    key={drug}
                    onClick={() => toggleDrug(drug)}
                    className="inline-flex items-center gap-1.5 glass glow-border rounded-full px-3 py-1.5 text-xs font-medium text-neon-cyan hover:bg-neon-cyan/10 transition-all duration-200"
                    aria-label={`Remove ${drug}`}
                  >
                    {drug}
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                ))}
              </div>
            )}

            {/* Drug search */}
            <div className="relative">
              <input
                type="text"
                value={drugSearch}
                onChange={(e) => {
                  setDrugSearch(e.target.value);
                  setDropdownOpen(true);
                }}
                onFocus={() => setDropdownOpen(true)}
                onBlur={() => setTimeout(() => setDropdownOpen(false), 200)}
                placeholder="Search drugs (e.g. Warfarin, Codeine...)"
                className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-neon-cyan/50 focus:ring-1 focus:ring-neon-cyan/30 transition-all"
                aria-label="Search drugs"
              />
              <svg
                className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>

              {dropdownOpen && filteredDrugs.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 glass-strong rounded-xl overflow-hidden z-50 max-h-48 overflow-y-auto shadow-card-dark">
                  {filteredDrugs.map((drug) => (
                    <button
                      key={drug}
                      onMouseDown={() => { toggleDrug(drug); setDrugSearch(""); }}
                      className="w-full text-left px-4 py-2.5 text-sm text-foreground hover:bg-neon-cyan/10 hover:text-neon-cyan transition-colors"
                    >
                      {drug}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Demo notice */}
          <div className="glass rounded-xl p-4 flex items-start gap-3">
            <div className="w-5 h-5 rounded-full bg-neon-cyan/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg className="w-3 h-3 text-neon-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-neon-cyan font-medium">Demo Mode:</span> Any VCF file will trigger our demo analysis with sample pharmacogenomic data. No file upload is required to explore the results.
            </p>
          </div>

          {/* Submit button */}
          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className="w-full relative py-4 rounded-xl font-bold text-lg overflow-hidden transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed group"
            style={{
              background: isAnalyzing
                ? "linear-gradient(135deg, hsl(265 60% 40%), hsl(265 60% 35%))"
                : "linear-gradient(135deg, hsl(183 100% 35%), hsl(175 80% 30%))",
              boxShadow: isAnalyzing ? "var(--glow-purple)" : "var(--glow-cyan)",
            }}
            aria-label="Analyze patient data"
          >
            {isAnalyzing ? (
              <span className="flex items-center justify-center gap-3">
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span className="text-white">AI Analyzing Genomic Data...</span>
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2 text-white group-hover:scale-105 transition-transform duration-200">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Run Pharmacogenomic Analysis
              </span>
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
          </button>
        </div>
      </div>
    </section>
  );
};
