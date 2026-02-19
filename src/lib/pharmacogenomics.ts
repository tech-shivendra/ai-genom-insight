// ============================================================
// PharmaGuard – Pharmacogenomic Engine (client-side, production)
// CPIC Guidelines v2024.1 aligned
// No secrets / no hardcoded API keys. Set VITE_GEMINI_API_KEY in .env
// ============================================================

// ─── Types ───────────────────────────────────────────────────

export interface DetectedVariant {
  rsid: string;
  gene: string;
  star_allele: string;
}

/** Risk labels per hackathon schema */
export type RiskLabel = "Safe" | "Adjust Dosage" | "Toxic" | "Ineffective" | "Unknown";

/** Severity values per schema: none | low | moderate | high | critical */
export type Severity = "none" | "low" | "moderate" | "high" | "critical";

export interface ParsedVCF {
  variants: DetectedVariant[];
  variantsFound: number;
  success: boolean;
  error?: string;
}

export interface RiskResult {
  drug: string;
  risk_label: RiskLabel;
  severity: Severity;
  confidence_score: number;
  phenotype: string;
  diplotype: string;
  primary_gene: string;
  action: string;
  detected_variants: DetectedVariant[];
}

export interface QualityMetrics {
  vcf_parsing_success: boolean;
  variants_detected: number;
  supported_gene_detected: boolean;
  cpic_guideline_version: string;
}

export interface PharmaGuardReport {
  patient_id: string;
  drug: string;
  timestamp: string;
  risk_assessment: {
    risk_label: RiskLabel;
    confidence_score: number;
    severity: Severity;
  };
  pharmacogenomic_profile: {
    primary_gene: string;
    diplotype: string;
    phenotype: string;
    detected_variants: DetectedVariant[];
  };
  clinical_recommendation: {
    action: string;
  };
  llm_generated_explanation: {
    summary: string;
    mechanism: string;
    clinical_impact: string;
  };
  quality_metrics: QualityMetrics;
}

export type LLMExplanation = PharmaGuardReport["llm_generated_explanation"];

// ─── Validation ───────────────────────────────────────────────

const VALID_RISK_LABELS: RiskLabel[] = ["Safe", "Adjust Dosage", "Toxic", "Ineffective", "Unknown"];
const VALID_SEVERITIES: Severity[] = ["none", "low", "moderate", "high", "critical"];

/**
 * Validates a generated report against the strict JSON schema.
 * Returns null if valid, or an error string describing the violation.
 */
export function validateSchema(report: unknown): string | null {
  if (!report || typeof report !== "object") return "Report must be an object.";
  const r = report as Record<string, unknown>;

  const requiredTopKeys: (keyof PharmaGuardReport)[] = [
    "patient_id", "drug", "timestamp", "risk_assessment",
    "pharmacogenomic_profile", "clinical_recommendation",
    "llm_generated_explanation", "quality_metrics",
  ];
  for (const key of requiredTopKeys) {
    if (!(key in r)) return `Missing required field: ${key}`;
  }

  if (typeof r.patient_id !== "string" || !r.patient_id) return "patient_id must be a non-empty string.";
  if (typeof r.drug !== "string" || !r.drug) return "drug must be a non-empty string.";
  if (typeof r.timestamp !== "string" || isNaN(Date.parse(r.timestamp as string)))
    return "timestamp must be a valid ISO 8601 string.";

  const ra = r.risk_assessment as Record<string, unknown>;
  if (!ra || typeof ra !== "object") return "risk_assessment must be an object.";
  if (!VALID_RISK_LABELS.includes(ra.risk_label as RiskLabel))
    return `risk_assessment.risk_label must be one of: ${VALID_RISK_LABELS.join(", ")}.`;
  if (typeof ra.confidence_score !== "number")
    return "risk_assessment.confidence_score must be a number.";
  if (!VALID_SEVERITIES.includes(ra.severity as Severity))
    return `risk_assessment.severity must be one of: ${VALID_SEVERITIES.join(", ")}.`;

  const pp = r.pharmacogenomic_profile as Record<string, unknown>;
  if (!pp || typeof pp !== "object") return "pharmacogenomic_profile must be an object.";
  for (const k of ["primary_gene", "diplotype", "phenotype"]) {
    if (typeof pp[k] !== "string") return `pharmacogenomic_profile.${k} must be a string.`;
  }
  if (!Array.isArray(pp.detected_variants)) return "pharmacogenomic_profile.detected_variants must be an array.";

  const cr = r.clinical_recommendation as Record<string, unknown>;
  if (!cr || typeof cr.action !== "string") return "clinical_recommendation.action must be a string.";

  const llm = r.llm_generated_explanation as Record<string, unknown>;
  if (!llm || typeof llm !== "object") return "llm_generated_explanation must be an object.";
  for (const k of ["summary", "mechanism", "clinical_impact"]) {
    if (typeof llm[k] !== "string") return `llm_generated_explanation.${k} must be a string.`;
  }

  const qm = r.quality_metrics as Record<string, unknown>;
  if (!qm || typeof qm !== "object") return "quality_metrics must be an object.";
  if (typeof qm.vcf_parsing_success !== "boolean") return "quality_metrics.vcf_parsing_success must be boolean.";
  if (typeof qm.variants_detected !== "number") return "quality_metrics.variants_detected must be a number.";
  if (typeof qm.supported_gene_detected !== "boolean") return "quality_metrics.supported_gene_detected must be boolean.";
  if (typeof qm.cpic_guideline_version !== "string") return "quality_metrics.cpic_guideline_version must be a string.";

  return null;
}

// ─── Pharmacogenomic Rule Database (CPIC 2024.1) ─────────────

interface DrugRule {
  risk: RiskLabel;
  severity: Severity;
  recommendation: string;
}

interface DiplotypeRule {
  phenotype: string;
  drugs: Record<string, DrugRule>;
}

type PharmaDB = Record<string, Record<string, DiplotypeRule>>;

/**
 * Internal pharmacogenomic rule database.
 * Gene → Diplotype → { phenotype, drugs → DrugRule }
 * Aligned with CPIC Guidelines 2024.1.
 */
export const pharmacogenomicDB: PharmaDB = {
  // ── CYP2D6 ──────────────────────────────────────────────────
  CYP2D6: {
    "*1/*1": {
      phenotype: "Normal Metabolizer (NM)",
      drugs: {
        CODEINE: {
          risk: "Safe",
          severity: "none",
          recommendation:
            "Standard codeine dosing. Normal CYP2D6 activity ensures adequate morphine conversion. No dose adjustment required per CPIC Level A.",
        },
        TRAMADOL: {
          risk: "Safe",
          severity: "none",
          recommendation: "Standard tramadol dosing appropriate for CYP2D6 Normal Metabolizers.",
        },
        METOPROLOL: {
          risk: "Safe",
          severity: "none",
          recommendation: "Standard metoprolol dosing. Normal CYP2D6-mediated clearance expected.",
        },
      },
    },
    "*1/*4": {
      phenotype: "Intermediate Metabolizer (IM)",
      drugs: {
        CODEINE: {
          risk: "Adjust Dosage",
          severity: "moderate",
          recommendation:
            "Reduced codeine-to-morphine conversion. Consider lower starting dose or alternative opioid (e.g., morphine). Monitor for inadequate analgesia.",
        },
        TRAMADOL: {
          risk: "Adjust Dosage",
          severity: "moderate",
          recommendation: "Reduced tramadol activation. Monitor efficacy; consider non-CYP2D6-substrate analgesic.",
        },
      },
    },
    "*1/*2": {
      phenotype: "Intermediate Metabolizer (IM)",
      drugs: {
        CODEINE: {
          risk: "Adjust Dosage",
          severity: "moderate",
          recommendation: "Use reduced codeine dose or select a direct-acting opioid. Close monitoring recommended.",
        },
      },
    },
    "*4/*4": {
      phenotype: "Poor Metabolizer (PM)",
      drugs: {
        CODEINE: {
          risk: "Toxic",
          severity: "high",
          recommendation:
            "CONTRAINDICATED. Non-functional CYP2D6 → codeine accumulates without morphine conversion. Life-threatening toxicity risk. Use morphine or non-opioid analgesics. CPIC Level A.",
        },
        TRAMADOL: {
          risk: "Toxic",
          severity: "high",
          recommendation:
            "Negligible O-desmethyltramadol production. Avoid tramadol. Select alternative analgesic.",
        },
      },
    },
    "*2/*2": {
      phenotype: "Poor Metabolizer (PM)",
      drugs: {
        CODEINE: {
          risk: "Toxic",
          severity: "high",
          recommendation:
            "AVOID codeine. Non-functional CYP2D6. Accumulation of parent compound with inadequate analgesia. Use morphine or alternative.",
        },
      },
    },
    "*1/*1xN": {
      phenotype: "Ultrarapid Metabolizer (UM)",
      drugs: {
        CODEINE: {
          risk: "Toxic",
          severity: "critical",
          recommendation:
            "CONTRAINDICATED. Ultrarapid CYP2D6 → excessive morphine production from codeine. Life-threatening respiratory depression risk (CPIC Level A). Avoid codeine/tramadol. Use non-opioid alternatives.",
        },
      },
    },
  },

  // ── CYP2C19 ─────────────────────────────────────────────────
  CYP2C19: {
    "*1/*1": {
      phenotype: "Normal Metabolizer (NM)",
      drugs: {
        CLOPIDOGREL: {
          risk: "Safe",
          severity: "none",
          recommendation:
            "Standard clopidogrel dosing. Expected antiplatelet activation. No dose adjustment required per CPIC Level A.",
        },
        OMEPRAZOLE: {
          risk: "Safe",
          severity: "none",
          recommendation: "Standard omeprazole dosing appropriate for Normal Metabolizers.",
        },
      },
    },
    "*1/*2": {
      phenotype: "Intermediate Metabolizer (IM)",
      drugs: {
        CLOPIDOGREL: {
          risk: "Adjust Dosage",
          severity: "moderate",
          recommendation:
            "Reduced clopidogrel bioactivation. Consider alternative antiplatelet agents (ticagrelor, prasugrel) especially in ACS/high-risk PCI patients. CPIC Level A.",
        },
        OMEPRAZOLE: {
          risk: "Adjust Dosage",
          severity: "low",
          recommendation: "Mildly reduced omeprazole clearance. Standard dose typically adequate; monitor response.",
        },
      },
    },
    "*2/*2": {
      phenotype: "Poor Metabolizer (PM)",
      drugs: {
        CLOPIDOGREL: {
          risk: "Ineffective",
          severity: "high",
          recommendation:
            "Severely reduced clopidogrel bioactivation to active thiol metabolite. Use prasugrel or ticagrelor instead (CPIC Level A). Risk of major adverse cardiovascular events.",
        },
        OMEPRAZOLE: {
          risk: "Adjust Dosage",
          severity: "moderate",
          recommendation: "Significantly reduced omeprazole clearance. Dose reduction may be warranted.",
        },
      },
    },
    "*17/*17": {
      phenotype: "Ultrarapid Metabolizer (UM)",
      drugs: {
        CLOPIDOGREL: {
          risk: "Safe",
          severity: "none",
          recommendation:
            "Enhanced clopidogrel bioactivation. Standard dosing; be aware of potentially increased bleeding risk.",
        },
        OMEPRAZOLE: {
          risk: "Adjust Dosage",
          severity: "moderate",
          recommendation:
            "Accelerated omeprazole clearance. Higher doses may be needed for adequate acid suppression.",
        },
      },
    },
    "*1/*17": {
      phenotype: "Rapid Metabolizer (RM)",
      drugs: {
        CLOPIDOGREL: {
          risk: "Safe",
          severity: "none",
          recommendation: "Adequate clopidogrel activation expected. Standard dosing appropriate.",
        },
      },
    },
  },

  // ── CYP2C9 ──────────────────────────────────────────────────
  CYP2C9: {
    "*1/*1": {
      phenotype: "Normal Metabolizer (NM)",
      drugs: {
        WARFARIN: {
          risk: "Safe",
          severity: "none",
          recommendation:
            "Standard warfarin initiation per CPIC/IWPC dosing algorithm. Routine INR monitoring as per clinical guidelines.",
        },
      },
    },
    "*1/*2": {
      phenotype: "Intermediate Metabolizer (IM)",
      drugs: {
        WARFARIN: {
          risk: "Adjust Dosage",
          severity: "moderate",
          recommendation:
            "Reduce initial warfarin dose by ~20–25%. Slower clearance increases bleeding risk. Intensive INR monitoring during initiation. CPIC Level A.",
        },
      },
    },
    "*1/*3": {
      phenotype: "Intermediate Metabolizer (IM)",
      drugs: {
        WARFARIN: {
          risk: "Adjust Dosage",
          severity: "moderate",
          recommendation:
            "Reduce initial warfarin dose by 30–40%. CYP2C9*3 severely impairs warfarin S-enantiomer hydroxylation. Frequent INR monitoring mandatory.",
        },
      },
    },
    "*2/*3": {
      phenotype: "Poor Metabolizer (PM)",
      drugs: {
        WARFARIN: {
          risk: "Toxic",
          severity: "high",
          recommendation:
            "Significant dose reduction required (~50–60% of standard). Extreme warfarin sensitivity. Genotype-guided dosing algorithm (IWPC) recommended. Intensive INR monitoring.",
        },
      },
    },
    "*3/*3": {
      phenotype: "Poor Metabolizer (PM)",
      drugs: {
        WARFARIN: {
          risk: "Toxic",
          severity: "critical",
          recommendation:
            "Consider alternative anticoagulant (DOAC). If warfarin necessary, initiate at very low dose under expert supervision with intensive monitoring. CPIC Level A.",
        },
      },
    },
  },

  // ── SLCO1B1 ─────────────────────────────────────────────────
  SLCO1B1: {
    "*1/*1": {
      phenotype: "Normal Function (NF)",
      drugs: {
        SIMVASTATIN: {
          risk: "Safe",
          severity: "none",
          recommendation:
            "Standard simvastatin dosing. Normal OATP1B1 transport function. Routine CK monitoring per standard guidelines.",
        },
      },
    },
    "*1/*5": {
      phenotype: "Decreased Function (DF)",
      drugs: {
        SIMVASTATIN: {
          risk: "Adjust Dosage",
          severity: "moderate",
          recommendation:
            "Increased simvastatin plasma exposure due to reduced hepatic uptake. Use ≤20 mg/day or switch to pravastatin/rosuvastatin. CPIC Level A.",
        },
      },
    },
    "*5/*5": {
      phenotype: "Poor Function (PF)",
      drugs: {
        SIMVASTATIN: {
          risk: "Toxic",
          severity: "high",
          recommendation:
            "HIGH RISK of simvastatin-induced myopathy and rhabdomyolysis. Avoid simvastatin >20 mg. Strongly prefer pravastatin or rosuvastatin. Monitor CK. CPIC Level A.",
        },
      },
    },
  },

  // ── TPMT ────────────────────────────────────────────────────
  TPMT: {
    "*1/*1": {
      phenotype: "Normal Metabolizer (NM)",
      drugs: {
        AZATHIOPRINE: {
          risk: "Safe",
          severity: "none",
          recommendation:
            "Standard azathioprine dosing. Normal TPMT activity. Routine CBC monitoring per immunosuppression protocol.",
        },
        MERCAPTOPURINE: {
          risk: "Safe",
          severity: "none",
          recommendation: "Standard mercaptopurine dosing for Normal TPMT Metabolizers.",
        },
      },
    },
    "*1/*3A": {
      phenotype: "Intermediate Metabolizer (IM)",
      drugs: {
        AZATHIOPRINE: {
          risk: "Adjust Dosage",
          severity: "moderate",
          recommendation:
            "Reduce azathioprine starting dose by 30–70% of standard. Monitor CBC closely for myelosuppression. Titrate based on tolerance. CPIC Level A.",
        },
        MERCAPTOPURINE: {
          risk: "Adjust Dosage",
          severity: "moderate",
          recommendation: "Reduce mercaptopurine starting dose by 30–70%. Weekly CBC monitoring.",
        },
      },
    },
    "*3A/*3A": {
      phenotype: "Poor Metabolizer (PM)",
      drugs: {
        AZATHIOPRINE: {
          risk: "Toxic",
          severity: "critical",
          recommendation:
            "LIFE-THREATENING risk. Standard doses cause severe myelosuppression. Reduce to ~10% of standard dose or select alternative immunosuppressant. Mandatory CBC monitoring. CPIC Level A.",
        },
        MERCAPTOPURINE: {
          risk: "Toxic",
          severity: "critical",
          recommendation:
            "Severe myelosuppression risk. Reduce to 10% of standard dose. Consider alternative therapy. CPIC Level A.",
        },
      },
    },
  },

  // ── DPYD ────────────────────────────────────────────────────
  DPYD: {
    "*1/*1": {
      phenotype: "Normal Metabolizer (NM)",
      drugs: {
        FLUOROURACIL: {
          risk: "Safe",
          severity: "none",
          recommendation:
            "Standard 5-FU dosing. Normal DPD enzyme activity. Proceed with standard oncology protocol.",
        },
        CAPECITABINE: {
          risk: "Safe",
          severity: "none",
          recommendation: "Standard capecitabine dosing for Normal DPYD Metabolizers.",
        },
      },
    },
    "*1/*2A": {
      phenotype: "Intermediate Metabolizer (IM)",
      drugs: {
        FLUOROURACIL: {
          risk: "Adjust Dosage",
          severity: "moderate",
          recommendation:
            "Reduce 5-FU starting dose by 50%. Reduced DPD activity increases severe toxicity risk. Monitor for mucositis, myelosuppression, diarrhea. CPIC Level A.",
        },
        CAPECITABINE: {
          risk: "Adjust Dosage",
          severity: "moderate",
          recommendation: "Reduce capecitabine dose by 50%. Monitor closely for Grade 3–4 toxicities.",
        },
      },
    },
    "*2A/*2A": {
      phenotype: "Poor Metabolizer (PM)",
      drugs: {
        FLUOROURACIL: {
          risk: "Toxic",
          severity: "critical",
          recommendation:
            "CONTRAINDICATED. Complete DPD deficiency → life-threatening 5-FU toxicity. Avoid all fluoropyrimidines or use only under expert supervision with >75% dose reduction. CPIC Level A.",
        },
        CAPECITABINE: {
          risk: "Toxic",
          severity: "critical",
          recommendation:
            "CONTRAINDICATED. Complete DPD deficiency. Life-threatening toxicity. Avoid capecitabine. CPIC Level A.",
        },
      },
    },
  },
};

// Set of supported gene names (derived from DB keys)
const SUPPORTED_GENES = new Set(Object.keys(pharmacogenomicDB));

// Set of all supported drug names across the DB (uppercase)
export const SUPPORTED_DRUGS: Set<string> = new Set(
  Object.values(pharmacogenomicDB).flatMap((diplotypeMap) =>
    Object.values(diplotypeMap).flatMap((d) => Object.keys(d.drugs))
  )
);

// ─── 1. VCF Parser ────────────────────────────────────────────

/**
 * parseVCF – Entry point for VCF file parsing.
 * Validates VCF header, then delegates to extractVariants().
 */
export function parseVCF(fileContent: string): ParsedVCF {
  try {
    // Validate VCF format: must have at least one header line
    const lines = fileContent.split("\n");
    const hasHeader = lines.some((l) => l.startsWith("##fileformat=VCF") || l.startsWith("#CHROM"));
    if (!hasHeader) {
      return {
        variants: [],
        variantsFound: 0,
        success: false,
        error: "Invalid VCF format: missing ##fileformat or #CHROM header line.",
      };
    }

    const variants = extractVariants(lines);
    return { variants, variantsFound: variants.length, success: true };
  } catch (err) {
    return {
      variants: [],
      variantsFound: 0,
      success: false,
      error: err instanceof Error ? err.message : "Unknown VCF parsing error.",
    };
  }
}

/**
 * extractVariants – Parses VCF lines, extracting GENE, STAR, and RS tags from INFO column.
 * Ignores header lines (starting with #). Requires GENE= tag to register a variant.
 * Prefers RS= tag for rsid; falls back to VCF ID column (col[2]).
 */
function extractVariants(lines: string[]): DetectedVariant[] {
  const variants: DetectedVariant[] = [];

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (line.startsWith("#") || line === "") continue;

    const cols = line.split("\t");
    if (cols.length < 8) continue;

    // Standard VCF columns: CHROM(0) POS(1) ID(2) REF(3) ALT(4) QUAL(5) FILTER(6) INFO(7)
    const vcfId = cols[2] && cols[2] !== "." ? cols[2] : "";
    const info = cols[7] || "";

    const infoTags = parseInfoTags(info);
    const gene = (infoTags["GENE"] || infoTags["gene"] || "").toUpperCase();
    const star = infoTags["STAR"] || infoTags["star"] || infoTags["ALLELE"] || "*1";

    // Prefer RS= from INFO over VCF ID column for clinical rsID accuracy
    const rsFromInfo = infoTags["RS"] || infoTags["rs"] || "";
    const rsid = rsFromInfo
      ? (rsFromInfo.startsWith("rs") ? rsFromInfo : `rs${rsFromInfo}`)
      : (vcfId || "unknown");

    if (gene) {
      variants.push({ rsid, gene, star_allele: star });
    }
  }

  return variants;
}

/** parseInfoTags – Parses semicolon-delimited key=value pairs from VCF INFO field. */
function parseInfoTags(info: string): Record<string, string> {
  const tags: Record<string, string> = {};
  for (const part of info.split(";")) {
    const eqIdx = part.indexOf("=");
    if (eqIdx > 0) {
      const key = part.slice(0, eqIdx).trim();
      const val = part.slice(eqIdx + 1).trim();
      tags[key] = val;
    }
  }
  return tags;
}

// ─── 2. Diplotype Determination ───────────────────────────────

/**
 * determineDiplotype – Constructs diplotype string from detected variants for a gene.
 * Handles heterozygous (2+ alleles), homozygous (1 allele duplicated), and wildtype (*1/*1).
 */
function determineDiplotype(variants: DetectedVariant[], gene: string): string {
  const geneVars = variants.filter((v) => v.gene === gene);
  if (geneVars.length === 0) return "*1/*1"; // wildtype assumption

  const alleles = geneVars.map((v) => v.star_allele || "*1");

  if (alleles.length === 1) {
    // Single detected allele: heterozygous with wildtype assumption
    return `*1/${alleles[0]}`;
  }
  // Use first two alleles for diplotype
  return `${alleles[0]}/${alleles[1]}`;
}

// ─── 3. Risk Classifier ───────────────────────────────────────

/**
 * classifyRisk – Core risk engine.
 * Iterates pharmacogenomicDB to find gene-diplotype-drug match.
 * Returns confidence 0.95 (exact), 0.75 (partial), or 0.40 (unknown).
 */
export function classifyRisk(drug: string, variants: DetectedVariant[]): RiskResult {
  const drugUpper = drug.toUpperCase().trim();

  for (const [gene, diplotypeMap] of Object.entries(pharmacogenomicDB)) {
    const diplotype = determineDiplotype(variants, gene);
    const geneVariants = variants.filter((v) => v.gene === gene);

    // Exact diplotype match
    if (diplotypeMap[diplotype]) {
      const diplotypeRule = diplotypeMap[diplotype];
      const drugRule = diplotypeRule.drugs[drugUpper];
      if (drugRule) {
        return {
          drug,
          risk_label: drugRule.risk,
          severity: drugRule.severity,
          confidence_score: 0.95,
          phenotype: diplotypeRule.phenotype,
          diplotype,
          primary_gene: gene,
          action: drugRule.recommendation,
          detected_variants: geneVariants,
        };
      }
    }

    // Partial match: gene covers this drug in some diplotype, but not the exact one
    const coversDrug = Object.values(diplotypeMap).some((d) => d.drugs[drugUpper]);
    if (coversDrug) {
      const fallbackKey = Object.keys(diplotypeMap)[0];
      const fallbackRule = diplotypeMap[fallbackKey];
      const drugRule = fallbackRule.drugs[drugUpper];
      return {
        drug,
        risk_label: drugRule ? drugRule.risk : "Unknown",
        severity: drugRule ? drugRule.severity : "low",
        confidence_score: 0.75,
        phenotype: `${fallbackRule.phenotype} (estimated)`,
        diplotype: `${diplotype} (partial match)`,
        primary_gene: gene,
        action: drugRule
          ? `[Partial match – ${diplotype} not in DB] ${drugRule.recommendation}`
          : "Insufficient diplotype data. Consult clinical pharmacogenomics specialist.",
        detected_variants: geneVariants,
      };
    }
  }

  // No gene-drug pairing found
  return {
    drug,
    risk_label: "Unknown",
    severity: "low",
    confidence_score: 0.4,
    phenotype: "Unknown",
    diplotype: "Unknown",
    primary_gene: "Not detected",
    action:
      "No pharmacogenomic data available for this gene-drug pair. Apply standard clinical guidelines and monitor closely for adverse effects.",
    detected_variants: [],
  };
}

// ─── 4. JSON Output Generator ─────────────────────────────────

/**
 * generateJSON – Produces a schema-compliant PharmaGuardReport.
 * All fields explicitly set; no extra keys added.
 * Internal schema validation guard throws on violation.
 */
export function generateJSON(
  patientId: string,
  riskResult: RiskResult,
  vcfSuccess: boolean,
  totalVariants: number,
  llmExplanation: LLMExplanation
): PharmaGuardReport {
  const geneDetected = riskResult.primary_gene !== "Not detected";

  const report: PharmaGuardReport = {
    patient_id: patientId,
    drug: riskResult.drug,
    timestamp: new Date().toISOString(),
    risk_assessment: {
      risk_label: riskResult.risk_label,
      confidence_score: riskResult.confidence_score,
      severity: riskResult.severity,
    },
    pharmacogenomic_profile: {
      primary_gene: riskResult.primary_gene,
      diplotype: riskResult.diplotype,
      phenotype: riskResult.phenotype,
      detected_variants: riskResult.detected_variants,
    },
    clinical_recommendation: {
      action: riskResult.action,
    },
    llm_generated_explanation: llmExplanation,
    quality_metrics: {
      vcf_parsing_success: vcfSuccess,
      variants_detected: totalVariants,
      supported_gene_detected: geneDetected && SUPPORTED_GENES.has(riskResult.primary_gene),
      cpic_guideline_version: "2024.1",
    },
  };

  const validationError = validateSchema(report);
  if (validationError) {
    throw new Error(`Schema validation failed: ${validationError}`);
  }

  return report;
}

// ─── 5. LLM Integration ───────────────────────────────────────

/**
 * API key sourced from Vite env variable: VITE_GEMINI_API_KEY
 * .env.example: VITE_GEMINI_API_KEY=AIzaSy...
 * Runtime override supported via setGeminiKey() for user-supplied keys.
 */
let _runtimeApiKey = "";

export function setGeminiKey(key: string): void {
  _runtimeApiKey = key.trim();
}

function getApiKey(): string {
  return _runtimeApiKey || (import.meta.env.VITE_GEMINI_API_KEY as string) || "";
}

/**
 * callLLM – Requests a structured pharmacogenomic explanation from Google Gemini 2.0 Flash.
 * Falls back to generateFallbackExplanation() on failure or missing key.
 * Prevents duplicate API calls via per-drug deduplication in runAnalysis().
 */
export async function callLLM(riskResult: RiskResult): Promise<LLMExplanation> {
  const apiKey = getApiKey();
  if (!apiKey) return generateFallbackExplanation(riskResult);

  const variantStr =
    riskResult.detected_variants.length > 0
      ? riskResult.detected_variants.map((v) => `${v.rsid} (${v.star_allele})`).join(", ")
      : "none detected";

  const prompt = `You are a board-certified clinical pharmacogenomics expert following CPIC guidelines.

Patient gene: ${riskResult.primary_gene}
Diplotype: ${riskResult.diplotype}
Phenotype: ${riskResult.phenotype}
Drug: ${riskResult.drug}
Risk: ${riskResult.risk_label}
Detected variants: ${variantStr}

Generate a structured response with exactly these four sections:
1. Summary (2–3 sentences): Clinical summary of this drug-gene interaction.
2. Biological mechanism: Explain the enzyme/transporter, pathway, and how the diplotype alters drug metabolism.
3. Clinical implication: Patient-specific risk and expected drug response.
4. Dosing recommendation: Specific dosing guidance aligned with CPIC Level A evidence.

Be medically concise and accurate. Do not hallucinate variant identifiers or allele frequencies.`;

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.2, maxOutputTokens: 600 },
      }),
    });

    if (!response.ok) return generateFallbackExplanation(riskResult);

    const data = await response.json();
    const text: string = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    const summaryMatch = text.match(/1\.\s*Summary[:\s]+(.+?)(?=2\.|$)/is);
    const mechMatch = text.match(/2\.\s*Biological mechanism[:\s]+(.+?)(?=3\.|$)/is);
    const implMatch = text.match(/3\.\s*Clinical implication[:\s]+(.+?)(?=4\.|$)/is);
    const doseMatch = text.match(/4\.\s*Dosing recommendation[:\s]+(.+?)$/is);

    return {
      summary: summaryMatch?.[1]?.trim() || text.substring(0, 250),
      mechanism: mechMatch?.[1]?.trim() || "See clinical summary.",
      clinical_impact: [implMatch?.[1]?.trim(), doseMatch?.[1]?.trim()]
        .filter(Boolean)
        .join(" ") || riskResult.action,
    };
  } catch {
    return generateFallbackExplanation(riskResult);
  }
}

/**
 * generateFallbackExplanation – Deterministic CPIC-aligned explanation.
 * Used when no API key is provided or LLM call fails.
 */
function generateFallbackExplanation(r: RiskResult): LLMExplanation {
  const FALLBACK_BASE =
    "Based on detected variant and CPIC guidelines, this risk assessment is derived from pharmacogenomic evidence.";

  const summaryMap: Record<RiskLabel, string> = {
    Safe: `${r.primary_gene} diplotype ${r.diplotype} confers ${r.phenotype} status — standard ${r.drug} dosing is appropriate without pharmacogenomic contraindication. ${FALLBACK_BASE}`,
    "Adjust Dosage": `${r.primary_gene} diplotype ${r.diplotype} indicates ${r.phenotype}, requiring modified ${r.drug} dosing. ${FALLBACK_BASE}`,
    Toxic: `${r.primary_gene} diplotype ${r.diplotype} creates a high-toxicity risk with ${r.drug} — therapy change is recommended. ${FALLBACK_BASE}`,
    Ineffective: `${r.primary_gene} diplotype ${r.diplotype} indicates ${r.phenotype}, significantly reducing ${r.drug} therapeutic efficacy. ${FALLBACK_BASE}`,
    Unknown: `Insufficient pharmacogenomic data to assess ${r.drug} interaction. ${FALLBACK_BASE}`,
  };

  const mechanismMap: Record<string, string> = {
    CYP2D6: `CYP2D6 encodes a major cytochrome P450 enzyme responsible for oxidative metabolism of ${r.drug} and ~25% of all clinically used drugs. The ${r.diplotype} diplotype produces ${r.phenotype.toLowerCase()}, directly altering drug bioactivation rates and active metabolite concentrations.`,
    CYP2C19: `CYP2C19 mediates hepatic bioactivation of prodrugs including ${r.drug}. The ${r.diplotype} diplotype alters enzyme kinetics (Vmax/Km), changing the rate of conversion to pharmacologically active metabolites and downstream receptor binding.`,
    CYP2C9: `CYP2C9 is the primary enzyme catalysing S-warfarin 7-hydroxylation and clearance. The ${r.diplotype} diplotype impairs enzyme function, extending ${r.drug} half-life and increasing systemic exposure, raising bleeding risk.`,
    SLCO1B1: `SLCO1B1 encodes the hepatic uptake transporter OATP1B1. The ${r.diplotype} variant reduces transporter expression/function, causing elevated plasma ${r.drug} concentrations and increased skeletal muscle exposure, raising myopathy risk.`,
    TPMT: `TPMT catalyses S-methylation of thiopurine drugs including ${r.drug}. The ${r.diplotype} diplotype reduces TPMT activity, causing accumulation of cytotoxic 6-thioguanine nucleotides (6-TGN) in haematopoietic cells, leading to life-threatening myelosuppression.`,
    DPYD: `DPYD encodes dihydropyrimidine dehydrogenase, the rate-limiting enzyme responsible for >80% of ${r.drug} catabolism. The ${r.diplotype} diplotype severely impairs DPD function, causing dose-dependent fluoropyrimidine accumulation and systemic toxicity.`,
  };

  return {
    summary: summaryMap[r.risk_label],
    mechanism:
      mechanismMap[r.primary_gene] ||
      `${r.primary_gene} enzyme/transporter activity is altered by the ${r.diplotype} diplotype, affecting ${r.drug} pharmacokinetics and pharmacodynamics. ${FALLBACK_BASE}`,
    clinical_impact: r.action,
  };
}

// ─── 6. Patient ID Generator ─────────────────────────────────

/** Generates a unique session patient ID (e.g. PG-A3B7K2). */
export function generatePatientId(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const suffix = Array.from({ length: 6 }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join("");
  return `PG-${suffix}`;
}

// ─── 7. Full Analysis Pipeline ───────────────────────────────

export interface AnalysisResult {
  patientId: string;
  drugs: string[];
  variants: DetectedVariant[];
  variantsFound: number;
  vcfSuccess: boolean;
  reports: PharmaGuardReport[];
  riskResults: RiskResult[];
  schemaErrors: string[];
}

/**
 * runAnalysis – Orchestrates the full pipeline:
 * parseVCF → classifyRisk → callLLM → generateJSON (per drug)
 * Deduplicates drug list. Validates each report schema before including in output.
 */
export async function runAnalysis(
  vcfContent: string,
  drugs: string[]
): Promise<AnalysisResult> {
  const normalisedDrugs = drugs.map((d) => d.trim()).filter(Boolean);

  const parsed = parseVCF(vcfContent);
  const patientId = generatePatientId();

  const reports: PharmaGuardReport[] = [];
  const riskResults: RiskResult[] = [];
  const schemaErrors: string[] = [];

  // Deduplicate drug list (case-insensitive) to prevent duplicate API calls
  const seenDrugs = new Set<string>();
  for (const drug of normalisedDrugs) {
    const key = drug.toUpperCase();
    if (seenDrugs.has(key)) continue;
    seenDrugs.add(key);

    const riskResult = classifyRisk(drug, parsed.variants);
    riskResults.push(riskResult);

    const llmExplanation = await callLLM(riskResult);

    try {
      const report = generateJSON(
        patientId,
        riskResult,
        parsed.success,
        parsed.variantsFound,
        llmExplanation
      );
      reports.push(report);
    } catch (err) {
      schemaErrors.push(err instanceof Error ? err.message : String(err));
    }
  }

  return {
    patientId,
    drugs: normalisedDrugs,
    variants: parsed.variants,
    variantsFound: parsed.variantsFound,
    vcfSuccess: parsed.success,
    reports,
    riskResults,
    schemaErrors,
  };
}
