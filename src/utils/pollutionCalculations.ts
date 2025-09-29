// Pollution Index Calculations for Groundwater Assessment

export interface PollutionIndices {
  hpi: number;  // Heavy Metal Pollution Index
  mi: number;   // Metal Index
  cd: number;   // Contamination Degree
  status: 'safe' | 'moderate' | 'danger';
  statusLabel: string;
}

export interface MetalConcentrations {
  lead: number;
  cadmium: number;
  arsenic: number;
  chromium: number;
}

// WHO/EPA standard limits for drinking water (mg/L)
const STANDARDS = {
  lead: 0.01,       // WHO guideline
  cadmium: 0.003,   // WHO guideline
  arsenic: 0.01,    // WHO guideline
  chromium: 0.05,   // WHO guideline
};

// Metal weights for HPI calculation (based on toxicity)
const WEIGHTS = {
  lead: 0.9,
  cadmium: 1.0,     // Highest weight due to high toxicity
  arsenic: 1.0,     // Highest weight due to carcinogenic properties
  chromium: 0.8,
};

/**
 * Calculate Heavy Metal Pollution Index (HPI)
 * Formula: HPI = Σ(Wi * Qi) / Σ(Wi)
 * Where Qi = 100 * (Ci - Si) / (Li - Si)
 */
export const calculateHPI = (metals: MetalConcentrations): number => {
  const metalKeys = Object.keys(metals) as (keyof MetalConcentrations)[];
  
  let weightedSum = 0;
  let totalWeight = 0;
  
  metalKeys.forEach(metal => {
    const concentration = metals[metal];
    const standard = STANDARDS[metal];
    const weight = WEIGHTS[metal];
    
    // Sub-index calculation (Qi)
    // Using standard as both Si (standard) and Li (maximum permissible limit)
    const subIndex = concentration > standard 
      ? 100 * (concentration - standard) / standard
      : 0; // If below standard, contribution is 0
    
    weightedSum += weight * subIndex;
    totalWeight += weight;
  });
  
  return totalWeight > 0 ? weightedSum / totalWeight : 0;
};

/**
 * Calculate Metal Index (MI)
 * Formula: MI = Σ(Ci / Si) / n
 * Where Ci = concentration, Si = standard, n = number of metals
 */
export const calculateMI = (metals: MetalConcentrations): number => {
  const metalKeys = Object.keys(metals) as (keyof MetalConcentrations)[];
  
  const sum = metalKeys.reduce((acc, metal) => {
    return acc + (metals[metal] / STANDARDS[metal]);
  }, 0);
  
  return sum / metalKeys.length;
};

/**
 * Calculate Contamination Degree (Cd)
 * Formula: Cd = Σ(Ci / Si)
 * Where Ci = concentration, Si = standard
 */
export const calculateCd = (metals: MetalConcentrations): number => {
  const metalKeys = Object.keys(metals) as (keyof MetalConcentrations)[];
  
  return metalKeys.reduce((acc, metal) => {
    return acc + (metals[metal] / STANDARDS[metal]);
  }, 0);
};

/**
 * Determine pollution status based on indices
 */
export const getPollutionStatus = (hpi: number, mi: number, cd: number): {
  status: 'safe' | 'moderate' | 'danger';
  statusLabel: string;
} => {
  // Classification based on scientific literature
  if (hpi > 100 || mi > 1.5 || cd > 3) {
    return { status: 'danger', statusLabel: 'High Contamination' };
  } else if (hpi > 50 || mi > 1 || cd > 1.5) {
    return { status: 'moderate', statusLabel: 'Moderate Contamination' };
  } else {
    return { status: 'safe', statusLabel: 'Safe Level' };
  }
};

/**
 * Calculate all pollution indices for a sample
 */
export const calculatePollutionIndices = (metals: MetalConcentrations): PollutionIndices => {
  const hpi = calculateHPI(metals);
  const mi = calculateMI(metals);
  const cd = calculateCd(metals);
  
  const { status, statusLabel } = getPollutionStatus(hpi, mi, cd);
  
  return {
    hpi: Number(hpi.toFixed(2)),
    mi: Number(mi.toFixed(2)),
    cd: Number(cd.toFixed(2)),
    status,
    statusLabel,
  };
};

/**
 * Get the most critical metal in a sample
 */
export const getMostCriticalMetal = (metals: MetalConcentrations): {
  metal: string;
  ratio: number;
  exceedsStandard: boolean;
} => {
  const metalKeys = Object.keys(metals) as (keyof MetalConcentrations)[];
  
  let maxRatio = 0;
  let criticalMetal = 'lead';
  
  metalKeys.forEach(metal => {
    const ratio = metals[metal] / STANDARDS[metal];
    if (ratio > maxRatio) {
      maxRatio = ratio;
      criticalMetal = metal;
    }
  });
  
  return {
    metal: criticalMetal.charAt(0).toUpperCase() + criticalMetal.slice(1),
    ratio: Number(maxRatio.toFixed(2)),
    exceedsStandard: maxRatio > 1,
  };
};

/**
 * Generate pollution summary statistics for a dataset
 */
export const generateSummaryStats = (results: PollutionIndices[]) => {
  const total = results.length;
  const safe = results.filter(r => r.status === 'safe').length;
  const moderate = results.filter(r => r.status === 'moderate').length;
  const danger = results.filter(r => r.status === 'danger').length;
  
  const avgHPI = results.reduce((sum, r) => sum + r.hpi, 0) / total;
  const avgMI = results.reduce((sum, r) => sum + r.mi, 0) / total;
  const avgCd = results.reduce((sum, r) => sum + r.cd, 0) / total;
  
  const maxHPI = Math.max(...results.map(r => r.hpi));
  const maxMI = Math.max(...results.map(r => r.mi));
  const maxCd = Math.max(...results.map(r => r.cd));
  
  return {
    total,
    distribution: {
      safe: { count: safe, percentage: Number(((safe / total) * 100).toFixed(1)) },
      moderate: { count: moderate, percentage: Number(((moderate / total) * 100).toFixed(1)) },
      danger: { count: danger, percentage: Number(((danger / total) * 100).toFixed(1)) },
    },
    averages: {
      hpi: Number(avgHPI.toFixed(2)),
      mi: Number(avgMI.toFixed(2)),
      cd: Number(avgCd.toFixed(2)),
    },
    maximums: {
      hpi: Number(maxHPI.toFixed(2)),
      mi: Number(maxMI.toFixed(2)),
      cd: Number(maxCd.toFixed(2)),
    },
  };
};