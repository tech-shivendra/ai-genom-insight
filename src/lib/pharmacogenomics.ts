// ============================================================
// PharmaGuard – Pharmacogenomic Engine (client-side)
// ============================================================

// ─── Types ───────────────────────────────────────────────────

export interface DetectedVariant {
  rsid: string;
  gene: string;
  star_allele: string;
}

export interface ParsedVCF {
  variants: DetectedVariant[];
  variantsFound: number;
  success: boolean;
  error?: string;
}

export interface RiskResult {
  drug: string;
  risk_label: "Safe" | "Adjust Dosage" | "Toxic / Ineffective" | "Unknown";
  severity: "none" | "moderate" | "high" | "unknown";
  confidence_score: number;
  phenotype: string;
  diplotype: string;
  primary_gene: string;
  action: string;
  detected_variants: DetectedVariant[];
}

export interface PharmaGuardReport {
  patient_id: string;
  drug: string;
  timestamp: string;
  risk_assessment: {
    risk_label: string;
    confidence_score: number;
    severity: string;
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
  quality_metrics: {
    vcf_parsing_success: boolean;
    variants_detected: number;
  };
}

// ─── Pharmacogenomic Rule Database ───────────────────────────

interface DrugRule {
  risk: "Safe" | "Adjust Dosage" | "Toxic / Ineffective";
  severity: "none" | "moderate" | "high";
  recommendation: string;
}

interface DiplotypeRule {
  phenotype: string;
  drugs: Record<string, DrugRule>;
}

type PharmaDB = Record<string, Record<string, DiplotypeRule>>;

export const pharmacogenomicDB: PharmaDB = {
  CYP2D6: {
    "*1/*1": {
      phenotype: "Normal Metabolizer (NM)",
      drugs: {
        CODEINE: {
          risk: "Safe",
          severity: "none",
          recommendation:
            "Standard dosing. Patient metabolizes codeine to morphine at expected rates. No dose adjustment required.",
        },
        TRAMADOL: {
          risk: "Safe",
          severity: "none",
          recommendation: "Standard tramadol dosing is appropriate for normal CYP2D6 metabolizers.",
        },
        METOPROLOL: {
          risk: "Safe",
          severity: "none",
          recommendation: "Standard metoprolol dosing. Normal CYP2D6 activity expected.",
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
            "Use with caution. Reduced conversion to morphine may impair analgesia. Consider alternative opioids such as morphine (direct-acting).",
        },
        TRAMADOL: {
          risk: "Adjust Dosage",
          severity: "moderate",
          recommendation: "Reduced activation of tramadol. Monitor for reduced analgesic efficacy.",
        },
      },
    },
    "*4/*4": {
      phenotype: "Poor Metabolizer (PM)",
      drugs: {
        CODEINE: {
          risk: "Toxic / Ineffective",
          severity: "high",
          recommendation:
            "CONTRAINDICATED. Patient cannot convert codeine to active morphine. Risk of toxic codeine accumulation. Use morphine or non-opioid analgesics instead.",
        },
        TRAMADOL: {
          risk: "Toxic / Ineffective",
          severity: "high",
          recommendation:
            "Avoid tramadol. Negligible conversion to active metabolite O-desmethyltramadol. Select alternative analgesic.",
        },
      },
    },
    "*1/*2": {
      phenotype: "Intermediate Metabolizer (IM)",
      drugs: {
        CODEINE: {
          risk: "Adjust Dosage",
          severity: "moderate",
          recommendation: "Reduced codeine metabolism. Consider lower starting dose or alternative analgesic.",
        },
      },
    },
    "*2/*2": {
      phenotype: "Poor Metabolizer (PM)",
      drugs: {
        CODEINE: {
          risk: "Toxic / Ineffective",
          severity: "high",
          recommendation:
            "AVOID codeine. Non-functional CYP2D6 enzyme. Select morphine or non-opioid pain management.",
        },
      },
    },
  },

  CYP2C19: {
    "*1/*1": {
      phenotype: "Normal Metabolizer (NM)",
      drugs: {
        CLOPIDOGREL: {
          risk: "Safe",
          severity: "none",
          recommendation:
            "Standard clopidogrel dosing. Expected antiplatelet activation. No dose adjustment required.",
        },
        OMEPRAZOLE: {
          risk: "Safe",
          severity: "none",
          recommendation: "Standard omeprazole dosing appropriate.",
        },
      },
    },
    "*2/*2": {
      phenotype: "Poor Metabolizer (PM)",
      drugs: {
        CLOPIDOGREL: {
          risk: "Toxic / Ineffective",
          severity: "high",
          recommendation:
            "AVOID clopidogrel. Severely reduced bioactivation to active thiol metabolite. Use prasugrel or ticagrelor as alternatives per CPIC guidelines.",
        },
        OMEPRAZOLE: {
          risk: "Adjust Dosage",
          severity: "moderate",
          recommendation: "Reduced clearance; consider dose reduction of omeprazole.",
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
            "Reduced clopidogrel activation. Consider alternative agents (ticagrelor) especially in high-risk ACS patients.",
        },
      },
    },
    "*17/*17": {
      phenotype: "Ultrarapid Metabolizer (UM)",
      drugs: {
        CLOPIDOGREL: {
          risk: "Safe",
          severity: "none",
          recommendation: "Enhanced clopidogrel activation. Standard dosing; monitor for increased bleeding risk.",
        },
        OMEPRAZOLE: {
          risk: "Adjust Dosage",
          severity: "moderate",
          recommendation:
            "Accelerated omeprazole clearance. May need higher doses for adequate acid suppression.",
        },
      },
    },
  },

  CYP2C9: {
    "*1/*1": {
      phenotype: "Normal Metabolizer (NM)",
      drugs: {
        WARFARIN: {
          risk: "Safe",
          severity: "none",
          recommendation:
            "Standard warfarin initiation. Use CPIC/IWPC dosing algorithm. Monitor INR per standard protocol.",
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
            "Reduce initial warfarin dose by ~20–25%. Slower warfarin clearance increases bleeding risk. Close INR monitoring essential during initiation.",
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
            "Reduce initial warfarin dose by ~30–40%. *3 allele severely impairs CYP2C9 function. Aggressive INR monitoring required.",
        },
      },
    },
    "*2/*3": {
      phenotype: "Poor Metabolizer (PM)",
      drugs: {
        WARFARIN: {
          risk: "Toxic / Ineffective",
          severity: "high",
          recommendation:
            "Significantly reduced warfarin dose required (~50–60% reduction). Extreme sensitivity to warfarin. Consider genotype-guided dosing algorithm. Frequent INR checks mandatory.",
        },
      },
    },
    "*3/*3": {
      phenotype: "Poor Metabolizer (PM)",
      drugs: {
        WARFARIN: {
          risk: "Toxic / Ineffective",
          severity: "high",
          recommendation:
            "Extreme warfarin sensitivity due to non-functional CYP2C9. Consider alternative anticoagulant (e.g., DOAC). If warfarin used, initiate at very low dose with intensive INR monitoring.",
        },
      },
    },
  },

  SLCO1B1: {
    "*1/*1": {
      phenotype: "Normal Function (NF)",
      drugs: {
        SIMVASTATIN: {
          risk: "Safe",
          severity: "none",
          recommendation:
            "Standard simvastatin dosing. Normal SLCO1B1 transport function. Routine CK monitoring as per guidelines.",
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
            "Increased simvastatin plasma exposure. Use lower simvastatin dose (≤20 mg/day) or switch to pravastatin/rosuvastatin which are less SLCO1B1-dependent.",
        },
      },
    },
    "*5/*5": {
      phenotype: "Poor Function (PF)",
      drugs: {
        SIMVASTATIN: {
          risk: "Toxic / Ineffective",
          severity: "high",
          recommendation:
            "HIGH RISK of simvastatin-induced myopathy and rhabdomyolysis. Avoid simvastatin >20mg. Switch to pravastatin or rosuvastatin. Monitor CK levels.",
        },
      },
    },
  },

  TPMT: {
    "*1/*1": {
      phenotype: "Normal Metabolizer (NM)",
      drugs: {
        AZATHIOPRINE: {
          risk: "Safe",
          severity: "none",
          recommendation:
            "Standard azathioprine dosing. Normal TPMT activity. Monitor CBC as per standard immunosuppression protocol.",
        },
        MERCAPTOPURINE: {
          risk: "Safe",
          severity: "none",
          recommendation: "Standard mercaptopurine dosing appropriate for normal TPMT activity.",
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
            "Reduce azathioprine starting dose by 30–70% of standard dose. Monitor CBC closely for myelosuppression. Titrate based on tolerance and clinical response.",
        },
        MERCAPTOPURINE: {
          risk: "Adjust Dosage",
          severity: "moderate",
          recommendation: "Reduce starting mercaptopurine dose by 30–70%. Monitor blood counts weekly.",
        },
      },
    },
    "*3A/*3A": {
      phenotype: "Poor Metabolizer (PM)",
      drugs: {
        AZATHIOPRINE: {
          risk: "Toxic / Ineffective",
          severity: "high",
          recommendation:
            "LIFE-THREATENING myelosuppression risk with standard azathioprine doses. Reduce dose to 10% of standard dose or choose alternative immunosuppressant. Mandatory CBC monitoring.",
        },
        MERCAPTOPURINE: {
          risk: "Toxic / Ineffective",
          severity: "high",
          recommendation:
            "Severe myelosuppression risk. Reduce to 10% of standard dose. Consider alternative therapy.",
        },
      },
    },
  },

  DPYD: {
    "*1/*1": {
      phenotype: "Normal Metabolizer (NM)",
      drugs: {
        FLUOROURACIL: {
          risk: "Safe",
          severity: "none",
          recommendation:
            "Standard fluorouracil (5-FU) dosing. Normal DPD enzyme activity. Proceed with standard oncology protocol.",
        },
        CAPECITABINE: {
          risk: "Safe",
          severity: "none",
          recommendation: "Standard capecitabine dosing for normal DPYD metabolizers.",
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
            "Reduce 5-FU starting dose by 50%. Reduced DPD activity increases risk of severe fluoropyrimidine toxicity. Monitor for mucositis, myelosuppression, diarrhea.",
        },
        CAPECITABINE: {
          risk: "Adjust Dosage",
          severity: "moderate",
          recommendation:
            "Reduce capecitabine dose by 50%. Monitor closely for Grade 3–4 toxicities.",
        },
      },
    },
    "*2A/*2A": {
      phenotype: "Poor Metabolizer (PM)",
      drugs: {
        FLUOROURACIL: {
          risk: "Toxic / Ineffective",
          severity: "high",
          recommendation:
            "CONTRAINDICATED. Complete DPD deficiency causes life-threatening 5-FU toxicity. Avoid all fluoropyrimidines or use with extreme dose reduction (>75%) under expert supervision only.",
        },
        CAPECITABINE: {
          risk: "Toxic / Ineffective",
          severity: "high",
          recommendation:
            "CONTRAINDICATED. Avoid capecitabine. Complete DPD deficiency. Life-threatening toxicity risk.",
        },
      },
    },
  },
};

// ─── 1. VCF Parser ────────────────────────────────────────────

/**
 * Parses a VCF file string into structured variant objects.
 * Extracts GENE, STAR allele, and rsID from each data line.
 */
export function parseVCF(fileContent: string): ParsedVCF {
  try {
    const lines = fileContent.split("\n");
    const variants: DetectedVariant[] = [];

    for (const rawLine of lines) {
      const line = rawLine.trim();

      // Skip header/comment lines
      if (line.startsWith("#") || line === "") continue;

      const cols = line.split("\t");
      if (cols.length < 8) continue;

      // Column indices: CHROM(0) POS(1) ID(2) REF(3) ALT(4) QUAL(5) FILTER(6) INFO(7)
      const rsid = cols[2] || ".";
      const info = cols[7] || "";

      // Parse INFO tags
      const infoTags: Record<string, string> = {};
      for (const tag of info.split(";")) {
        const [key, val] = tag.split("=");
        if (key && val !== undefined) infoTags[key.trim()] = val.trim();
      }

      const gene = infoTags["GENE"] || infoTags["gene"] || "";
      const star = infoTags["STAR"] || infoTags["star"] || infoTags["ALLELE"] || "";

      if (gene) {
        variants.push({
          rsid: rsid !== "." ? rsid : infoTags["RS"] || "unknown",
          gene: gene.toUpperCase(),
          star_allele: star || "*1",
        });
      }
    }

    return {
      variants,
      variantsFound: variants.length,
      success: true,
    };
  } catch (err) {
    return {
      variants: [],
      variantsFound: 0,
      success: false,
      error: err instanceof Error ? err.message : "Unknown parsing error",
    };
  }
}

// ─── 2. Risk Classifier ──────────────────────────────────────

/**
 * Determines diplotype from detected variants for a given gene.
 * Pairs up star alleles to form diplotype (e.g. *1/*4).
 */
function inferDiplotype(variants: DetectedVariant[], gene: string): string {
  const geneVariants = variants.filter((v) => v.gene === gene);
  if (geneVariants.length === 0) return "*1/*1"; // assume wildtype

  const alleles = geneVariants.map((v) => v.star_allele || "*1");
  if (alleles.length === 1) return `${alleles[0]}/${alleles[0]}`; // homozygous assumption
  return `${alleles[0]}/${alleles[1]}`;
}

/**
 * Classifies risk for a given drug based on detected VCF variants.
 */
export function classifyRisk(drug: string, variants: DetectedVariant[]): RiskResult {
  const drugUpper = drug.toUpperCase();

  // Find which gene in DB covers this drug
  for (const [gene, diplotypeMap] of Object.entries(pharmacogenomicDB)) {
    const diplotype = inferDiplotype(variants, gene);

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
          detected_variants: variants.filter((v) => v.gene === gene),
        };
      }
    }

    // Partial match: check if gene covers drug in any diplotype
    const hasDrugInGene = Object.values(diplotypeMap).some((d) => d.drugs[drugUpper]);
    if (hasDrugInGene) {
      // Gene is relevant but diplotype not matched exactly → partial
      const fallbackDiplotype = Object.keys(diplotypeMap)[0];
      const fallbackRule = diplotypeMap[fallbackDiplotype];
      const drugRule = fallbackRule.drugs[drugUpper];
      return {
        drug,
        risk_label: drugRule ? drugRule.risk : "Unknown",
        severity: drugRule ? drugRule.severity : "unknown",
        confidence_score: 0.75,
        phenotype: fallbackRule.phenotype,
        diplotype: `${diplotype} (estimated)`,
        primary_gene: gene,
        action: drugRule
          ? `[Partial match] ${drugRule.recommendation}`
          : "Insufficient diplotype data. Consult clinical pharmacogenomics specialist.",
        detected_variants: variants.filter((v) => v.gene === gene),
      };
    }
  }

  // Unknown – no rule found
  return {
    drug,
    risk_label: "Unknown",
    severity: "unknown",
    confidence_score: 0.4,
    phenotype: "Unknown",
    diplotype: "Unknown",
    primary_gene: "Not detected in VCF",
    action:
      "No pharmacogenomic data available for this gene-drug pair. Proceed with standard clinical guidelines and monitor for adverse effects.",
    detected_variants: [],
  };
}

// ─── 3. JSON Output Generator ─────────────────────────────────

/**
 * Generates the standardised PharmaGuard JSON report for one drug.
 */
export function generateJSON(
  patientId: string,
  riskResult: RiskResult,
  vcfSuccess: boolean,
  totalVariants: number,
  llmExplanation: PharmaGuardReport["llm_generated_explanation"]
): PharmaGuardReport {
  return {
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
    },
  };
}

// ─── 4. LLM Integration ──────────────────────────────────────

const LLM_API_URL = "https://api.openai.com/v1/chat/completions";
// NOTE: Replace with your actual OpenAI API key via environment variable or user input
let OPENAI_API_KEY = "";

export function setOpenAIKey(key: string) {
  OPENAI_API_KEY = key;
}

/**
 * Calls the OpenAI API to generate a pharmacogenomics explanation.
 * Falls back to a rule-based explanation if API key is not set.
 */
export async function callLLM(
  riskResult: RiskResult
): Promise<PharmaGuardReport["llm_generated_explanation"]> {
  // If no API key → generate deterministic explanation
  if (!OPENAI_API_KEY) {
    return generateRuleBasedExplanation(riskResult);
  }

  const prompt = `You are a clinical pharmacogenomics expert. A patient has the following genomic profile:

Gene: ${riskResult.primary_gene}
Diplotype: ${riskResult.diplotype}
Phenotype: ${riskResult.phenotype}
Drug of interest: ${riskResult.drug}
Risk classification: ${riskResult.risk_label}
Detected variants: ${riskResult.detected_variants.map((v) => `${v.rsid} (${v.star_allele})`).join(", ") || "None detected"}

Explain in three short sections:
1. Summary: One sentence clinical summary of this drug-gene interaction.
2. Mechanism: Biological mechanism (enzyme activity, drug metabolism pathway).
3. Clinical impact: Patient-specific dosing recommendation and monitoring plan.

Be medically concise. Use clinical language. Reference the rsID if available.`;

  try {
    const response = await fetch(LLM_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 400,
        temperature: 0.3,
      }),
    });

    if (!response.ok) throw new Error(`OpenAI error: ${response.status}`);

    const data = await response.json();
    const text: string = data.choices[0]?.message?.content || "";

    // Parse the three sections from the response
    const summaryMatch = text.match(/1\.\s*Summary[:\s]+(.+?)(?=2\.|$)/is);
    const mechMatch = text.match(/2\.\s*Mechanism[:\s]+(.+?)(?=3\.|$)/is);
    const impactMatch = text.match(/3\.\s*Clinical impact[:\s]+(.+?)$/is);

    return {
      summary: summaryMatch?.[1]?.trim() || text.substring(0, 200),
      mechanism: mechMatch?.[1]?.trim() || "See full AI response above.",
      clinical_impact: impactMatch?.[1]?.trim() || riskResult.action,
    };
  } catch {
    // Fall back to rule-based if API call fails
    return generateRuleBasedExplanation(riskResult);
  }
}

/**
 * Generates a structured explanation from the pharmacogenomic rules
 * when no OpenAI API key is available.
 */
function generateRuleBasedExplanation(
  r: RiskResult
): PharmaGuardReport["llm_generated_explanation"] {
  const variantStr =
    r.detected_variants.length > 0
      ? r.detected_variants.map((v) => `${v.rsid} (${v.star_allele})`).join(", ")
      : "no specific variants";

  const summaryMap: Record<string, string> = {
    "Safe": `Patient's ${r.primary_gene} diplotype (${r.diplotype}) confers ${r.phenotype} status, supporting standard ${r.drug} dosing without pharmacogenomic contraindication.`,
    "Adjust Dosage": `Patient's ${r.primary_gene} diplotype (${r.diplotype}) indicates ${r.phenotype}, altering ${r.drug} metabolism and requiring dose modification.`,
    "Toxic / Ineffective": `Patient's ${r.primary_gene} diplotype (${r.diplotype}) indicates ${r.phenotype}, creating a high-risk interaction with ${r.drug} requiring therapy change.`,
    "Unknown": `Insufficient pharmacogenomic data to assess ${r.drug} risk for this patient's genomic profile.`,
  };

  const mechanismMap: Record<string, string> = {
    CYP2D6: `CYP2D6 encodes a cytochrome P450 enzyme responsible for oxidative metabolism of ${r.drug}. The ${r.diplotype} diplotype results in ${r.phenotype.toLowerCase()}, affecting drug conversion rates and active metabolite production.`,
    CYP2C19: `CYP2C19 mediates hepatic activation of prodrugs including ${r.drug}. The ${r.diplotype} diplotype alters enzyme activity, impacting bioactivation efficiency and resultant pharmacological effect.`,
    CYP2C9: `CYP2C9 is the primary enzyme responsible for ${r.drug} hydroxylation and clearance. The ${r.diplotype} diplotype impairs enzyme function, reducing drug elimination and extending half-life.`,
    SLCO1B1: `SLCO1B1 encodes the hepatic transporter OATP1B1, which mediates cellular uptake of ${r.drug}. The ${r.diplotype} variant reduces transporter function, increasing plasma drug concentrations and myopathy risk.`,
    TPMT: `TPMT catalyzes S-methylation of thiopurine drugs including ${r.drug}. Reduced TPMT activity in ${r.diplotype} patients results in accumulation of cytotoxic thioguanine nucleotides, increasing myelosuppression risk.`,
    DPYD: `DPYD encodes dihydropyrimidine dehydrogenase, the rate-limiting enzyme in ${r.drug} catabolism. The ${r.diplotype} diplotype significantly impairs drug clearance, leading to toxic accumulation of fluoropyrimidines.`,
  };

  return {
    summary: summaryMap[r.risk_label] || summaryMap["Unknown"],
    mechanism:
      mechanismMap[r.primary_gene] ||
      `${r.primary_gene} enzyme activity is altered by the ${r.diplotype} diplotype (detected variants: ${variantStr}), affecting ${r.drug} pharmacokinetics.`,
    clinical_impact: r.action,
  };
}

// ─── 5. Patient ID Generator ─────────────────────────────────

export function generatePatientId(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const suffix = Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  return `PG-${suffix}`;
}

// ─── 6. Full Analysis Pipeline ───────────────────────────────

export interface AnalysisResult {
  patientId: string;
  drugs: string[];
  variants: DetectedVariant[];
  variantsFound: number;
  vcfSuccess: boolean;
  reports: PharmaGuardReport[];
  riskResults: RiskResult[];
}

/**
 * Main entry point: runs the full pharmacogenomic analysis pipeline.
 * parseVCF → classifyRisk → callLLM → generateJSON (per drug)
 */
export async function runAnalysis(
  vcfContent: string,
  drugs: string[]
): Promise<AnalysisResult> {
  // Step 1: Parse VCF
  const parsed = parseVCF(vcfContent);
  const patientId = generatePatientId();

  // Step 2: For each drug, classify risk + generate LLM explanation + build JSON
  const reports: PharmaGuardReport[] = [];
  const riskResults: RiskResult[] = [];

  for (const drug of drugs) {
    const riskResult = classifyRisk(drug, parsed.variants);
    riskResults.push(riskResult);

    const llmExplanation = await callLLM(riskResult);

    const report = generateJSON(
      patientId,
      riskResult,
      parsed.success,
      parsed.variantsFound,
      llmExplanation
    );

    reports.push(report);
  }

  return {
    patientId,
    drugs,
    variants: parsed.variants,
    variantsFound: parsed.variantsFound,
    vcfSuccess: parsed.success,
    reports,
    riskResults,
  };
}
