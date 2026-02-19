import { useState, useRef } from "react";
import { runAnalysis, setOpenAIKey, AnalysisResult, SUPPORTED_DRUGS } from "@/lib/pharmacogenomics";

// All drugs available in the pharmacogenomic DB
const DRUG_LIST = [
  "Warfarin", "Clopidogrel", "Codeine", "Simvastatin",
  "Azathioprine", "Fluorouracil", "Capecitabine", "Omeprazole",
  "Tramadol", "Mercaptopurine", "Metoprolol",
];

interface UploadSectionProps {
  onResults: (results: AnalysisResult) => void;
}

type AnalysisStep = "idle" | "parsing" | "classifying" | "explaining" | "done";

const STEP_LABELS: Record<AnalysisStep, string> = {
  idle: "",
  parsing: "Parsing VCF genome data...",
  classifying: "Classifying pharmacogenomic risk...",
  explaining: "Generating CPIC-aligned explanations...",
  done: "Analysis complete!",
};

/** Returns true if drug name matches a supported gene-drug pair. */
function isDrugSupported(drug: string): boolean {
  return SUPPORTED_DRUGS.has(drug.toUpperCase().trim());
}

export const UploadSection = ({ onResults }: UploadSectionProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [selectedDrugs, setSelectedDrugs] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState<AnalysisStep>("idle");
  const [drugSearch, setDrugSearch] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [openAIKey, setOpenAIKeyState] = useState("");
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [keySaved, setKeySaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredDrugs = DRUG_LIST.filter(
    (d) => d.toLowerCase().includes(drugSearch.toLowerCase()) && !selectedDrugs.includes(d)
  );

  // ── File handling ──────────────────────────────────────────

  const handleFileAccept = (file: File) => {
    setFileError(null);
    setAnalysisError(null);

    if (!file.name.toLowerCase().endsWith(".vcf") && !file.name.toLowerCase().endsWith(".vcf.gz")) {
      setFileError("Invalid file type. Please upload a .vcf file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setFileError("File too large. Maximum size is 5 MB.");
      return;
    }
    if (file.size === 0) {
      setFileError("File is empty. Please upload a valid VCF file.");
      return;
    }
    setUploadedFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileAccept(file);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileAccept(file);
  };

  // ── Drug selection ─────────────────────────────────────────

  const toggleDrug = (drug: string) => {
    setSelectedDrugs((prev) =>
      prev.includes(drug) ? prev.filter((d) => d !== drug) : [...prev, drug]
    );
  };

  /** Handles comma-separated drug input on Enter/comma keydown. */
  const handleDrugSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const terms = drugSearch.split(",").map((t) => t.trim()).filter(Boolean);
      for (const term of terms) {
        const match = DRUG_LIST.find((d) => d.toLowerCase() === term.toLowerCase());
        if (match && !selectedDrugs.includes(match)) {
          setSelectedDrugs((prev) => [...prev, match]);
        }
      }
      setDrugSearch("");
    }
  };

  // Drugs that are selected but not in our DB (warn user)
  const unsupportedSelected = selectedDrugs.filter((d) => !isDrugSupported(d));

  // ── API key ────────────────────────────────────────────────

  const handleSaveKey = () => {
    setOpenAIKey(openAIKey.trim());
    setKeySaved(true);
    setShowKeyInput(false);
    setTimeout(() => setKeySaved(false), 3000);
  };

  // ── Analysis ───────────────────────────────────────────────

  const canAnalyze = uploadedFile !== null && selectedDrugs.length > 0 && !isAnalyzing;

  const getButtonLabel = () => {
    if (!uploadedFile) return "Upload a VCF file to continue";
    if (selectedDrugs.length === 0) return "Select at least one drug";
    return "Run Pharmacogenomic Analysis";
  };

  const handleAnalyze = async () => {
    if (!canAnalyze) return;
    setAnalysisError(null);
    setIsAnalyzing(true);

    try {
      setAnalysisStep("parsing");
      const vcfContent = await readFileAsText(uploadedFile!);

      await delay(500);
      setAnalysisStep("classifying");
      await delay(600);
      setAnalysisStep("explaining");

      const results = await runAnalysis(vcfContent, selectedDrugs);

      if (!results.vcfSuccess) {
        setAnalysisError(
          "VCF parsing failed. Ensure the file is a valid VCF format with tab-separated columns."
        );
        return;
      }

      setAnalysisStep("done");
      await delay(300);

      onResults(results);
      document.getElementById("results")?.scrollIntoView({ behavior: "smooth" });
    } catch (err) {
      setAnalysisError(
        err instanceof Error ? err.message : "Analysis failed. Please try again."
      );
    } finally {
      setIsAnalyzing(false);
      setAnalysisStep("idle");
    }
  };

  return (
    <section id="upload" className="py-24 relative">
      <div className="absolute top-0 left-0 right-0 section-divider" />
      <div className="absolute inset-0 grid-pattern opacity-20 pointer-events-none" />

      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12 reveal">
          <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 text-sm mb-6">
            <div className="w-2 h-2 rounded-full bg-neon-cyan animate-pulse" />
            <span className="text-neon-cyan font-medium">Genomic Analysis Engine</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-display font-black mb-4">
            Upload & <span className="gradient-text">Analyze</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Upload a VCF file with pharmacogenomic annotations and select drugs to analyze.
            The engine applies CPIC v2024.1-aligned rules to generate a schema-validated risk report.
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-5 reveal" style={{ transitionDelay: "0.1s" }}>

          {/* VCF Upload Zone */}
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
              onChange={handleFileInput}
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
                  {(uploadedFile.size / 1024).toFixed(1)} KB · VCF validated · Click to replace
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
                  <p className="text-muted-foreground text-sm mt-1">
                    or click to browse · .vcf supported · max 5 MB
                  </p>
                </div>
                <div className="inline-flex items-center gap-2 text-xs text-muted-foreground glass rounded-full px-3 py-1">
                  <svg className="w-3 h-3 text-neon-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Processed client-side only · No data uploaded
                </div>
              </div>
            )}
          </div>

          {/* File error */}
          {fileError && (
            <div className="flex items-start gap-3 glass rounded-xl p-4 border border-neon-red/30">
              <svg className="w-5 h-5 text-neon-red flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-neon-red">{fileError}</p>
            </div>
          )}

          {/* Drug selector */}
          <div className="glass rounded-2xl p-6 space-y-4">
            <label className="block text-sm font-semibold text-foreground">
              Select Drugs to Analyze
              <span className="ml-2 text-xs text-muted-foreground font-normal">
                ({selectedDrugs.length} selected)
              </span>
            </label>

            {/* Selected drug chips */}
            {selectedDrugs.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedDrugs.map((drug) => {
                  const unsupported = !isDrugSupported(drug);
                  return (
                    <button
                      key={drug}
                      onClick={() => toggleDrug(drug)}
                      className={`inline-flex items-center gap-1.5 glass rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-200 ${
                        unsupported
                          ? "text-neon-yellow border border-neon-yellow/40 hover:bg-neon-yellow/10"
                          : "text-neon-cyan glow-border hover:bg-neon-cyan/10"
                      }`}
                      aria-label={`Remove ${drug}`}
                      title={unsupported ? "Drug not in pharmacogenomic database — results will be Unknown" : undefined}
                    >
                      {unsupported && <span>⚠</span>}
                      {drug}
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Unsupported drug warning */}
            {unsupportedSelected.length > 0 && (
              <div className="flex items-start gap-2 text-xs text-neon-yellow">
                <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>
                  <span className="font-medium">{unsupportedSelected.join(", ")}</span>{" "}
                  {unsupportedSelected.length === 1 ? "is" : "are"} not in the pharmacogenomic database — analysis will return Unknown risk.
                </span>
              </div>
            )}

            {/* Drug search input */}
            <div className="relative">
              <input
                type="text"
                value={drugSearch}
                onChange={(e) => { setDrugSearch(e.target.value); setDropdownOpen(true); }}
                onFocus={() => setDropdownOpen(true)}
                onBlur={() => setTimeout(() => setDropdownOpen(false), 200)}
                onKeyDown={handleDrugSearchKeyDown}
                placeholder="Search drugs (e.g. Warfarin, Codeine) or type comma-separated"
                className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-neon-cyan/50 focus:ring-1 focus:ring-neon-cyan/30 transition-all"
                aria-label="Search drugs"
              />
              <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                      {!isDrugSupported(drug) && (
                        <span className="ml-2 text-xs text-neon-yellow">⚠ not in DB</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Analysis error */}
          {analysisError && (
            <div className="flex items-start gap-3 glass rounded-xl p-4 border border-neon-red/30">
              <svg className="w-5 h-5 text-neon-red flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-neon-red">{analysisError}</p>
            </div>
          )}

          {/* OpenAI API key (optional) */}
          <div className="glass rounded-xl p-4">
            <button
              onClick={() => setShowKeyInput((v) => !v)}
              className="flex items-center justify-between w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-neon-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
                <span>
                  <span className="text-neon-purple font-medium">Optional:</span> OpenAI API key for GPT explanations
                </span>
                {keySaved && (
                  <span className="text-xs text-neon-green font-medium">✓ Saved</span>
                )}
              </div>
              <svg className={`w-4 h-4 transition-transform duration-200 ${showKeyInput ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {showKeyInput && (
              <div className="mt-3 space-y-2">
                <p className="text-xs text-muted-foreground">
                  Without a key, deterministic rule-based CPIC explanations are generated automatically.
                  Your key is never stored or transmitted beyond the OpenAI API call.
                </p>
                <div className="flex gap-2">
                  <input
                    type="password"
                    value={openAIKey}
                    onChange={(e) => setOpenAIKeyState(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSaveKey()}
                    placeholder="sk-..."
                    className="flex-1 bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-neon-purple/50 transition-all"
                    aria-label="OpenAI API key"
                  />
                  <button
                    onClick={handleSaveKey}
                    className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-all"
                    style={{ background: "hsl(265 60% 45%)", border: "1px solid hsl(265 60% 60% / 0.4)" }}
                  >
                    Save
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* VCF format guide */}
          <details className="glass rounded-xl p-4 group">
            <summary className="flex items-center justify-between cursor-pointer text-sm text-muted-foreground hover:text-foreground transition-colors list-none">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-neon-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-medium">VCF Format Guide & Sample Data</span>
              </div>
              <svg className="w-4 h-4 transition-transform duration-200 group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </summary>
            <div className="mt-3 space-y-3">
              <p className="text-xs text-muted-foreground">
                The engine reads the <code className="text-neon-cyan">INFO</code> column for{" "}
                <code className="text-neon-cyan">GENE=</code> and{" "}
                <code className="text-neon-cyan">STAR=</code> tags (tab-delimited, 8+ columns).
              </p>
              <pre className="text-xs font-mono text-muted-foreground bg-muted/30 rounded-lg p-3 overflow-x-auto leading-relaxed">{`##fileformat=VCFv4.1
#CHROM  POS       ID          REF  ALT  QUAL  FILTER  INFO
1       97915614  rs1065852   C    T    .     PASS    GENE=CYP2D6;STAR=*4;RS=rs1065852
10      96741053  rs4244285   G    A    .     PASS    GENE=CYP2C19;STAR=*2;RS=rs4244285
10      96702047  rs1799853   C    T    .     PASS    GENE=CYP2C9;STAR=*2;RS=rs1799853
12      21331549  rs4149056   T    C    .     PASS    GENE=SLCO1B1;STAR=*5;RS=rs4149056`}</pre>
              <button
                onClick={downloadSampleVCF}
                className="inline-flex items-center gap-2 text-xs font-medium text-neon-cyan hover:underline"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download sample VCF file
              </button>
            </div>
          </details>

          {/* Analyze button */}
          <button
            onClick={handleAnalyze}
            disabled={!canAnalyze}
            className="w-full relative py-4 rounded-xl font-bold text-lg overflow-hidden transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group"
            style={{
              background: isAnalyzing
                ? "linear-gradient(135deg, hsl(265 60% 40%), hsl(265 60% 35%))"
                : "linear-gradient(135deg, hsl(183 100% 35%), hsl(175 80% 30%))",
              boxShadow: isAnalyzing
                ? "var(--glow-purple)"
                : canAnalyze
                ? "var(--glow-cyan)"
                : "none",
            }}
            aria-label="Analyze patient data"
          >
            {isAnalyzing ? (
              <span className="flex items-center justify-center gap-3">
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span className="text-white">{STEP_LABELS[analysisStep]}</span>
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2 text-white group-hover:scale-105 transition-transform duration-200">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                {getButtonLabel()}
              </span>
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
          </button>

          {/* Validation hint */}
          {(!uploadedFile || selectedDrugs.length === 0) && !isAnalyzing && (
            <p className="text-center text-xs text-muted-foreground">
              {!uploadedFile && selectedDrugs.length === 0
                ? "Upload a VCF file and select at least one drug to enable analysis"
                : !uploadedFile
                ? "Waiting for VCF file upload"
                : "Select at least one drug to analyze"}
            </p>
          )}
        </div>
      </div>
    </section>
  );
};

// ─── Utilities ────────────────────────────────────────────────

function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = () => reject(new Error("Failed to read file. Please try again."));
    reader.readAsText(file);
  });
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function downloadSampleVCF() {
  const sample = [
    "##fileformat=VCFv4.1",
    "##source=PharmaGuard-Sample",
    "##reference=GRCh38",
    "#CHROM\tPOS\tID\tREF\tALT\tQUAL\tFILTER\tINFO",
    "1\t97915614\trs1065852\tC\tT\t.\tPASS\tGENE=CYP2D6;STAR=*4;RS=rs1065852",
    "10\t96741053\trs4244285\tG\tA\t.\tPASS\tGENE=CYP2C19;STAR=*2;RS=rs4244285",
    "10\t96702047\trs1799853\tC\tT\t.\tPASS\tGENE=CYP2C9;STAR=*2;RS=rs1799853",
    "12\t21331549\trs4149056\tT\tC\t.\tPASS\tGENE=SLCO1B1;STAR=*5;RS=rs4149056",
    "6\t18128556\trs1800460\tC\tT\t.\tPASS\tGENE=TPMT;STAR=*3A;RS=rs1800460",
    "1\t97305364\trs3918290\tC\tT\t.\tPASS\tGENE=DPYD;STAR=*2A;RS=rs3918290",
  ].join("\n");

  const blob = new Blob([sample], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "sample_pharmaguard.vcf";
  a.click();
  URL.revokeObjectURL(url);
}
