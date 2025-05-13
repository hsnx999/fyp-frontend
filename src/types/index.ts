export interface Patient {
  id: string;
  age: number | null;
  gender: string;
  smoking: string;
  obesity: string;
  balancedDiet: string;
  chronicLungDisease: string;
  familyHistory: string;
  weightLoss: string;
  oxygenTherapy: string;
  exposureToToxins: string;
}

export interface ExtractedEntity {
  entity: string;
  value: string;
  confidence: number;
}

export interface RiskScores {
  recurrenceRisk: number;
  complicationRisk: number;
  survivalProbability: number;
}

export interface CancerPrediction {
  type: string;
  confidence: number;
}

export interface DiagnosticResult {
  patient: Patient;
  cancerPrediction: CancerPrediction;
  riskScores: RiskScores;
  extractedEntities: ExtractedEntity[];
}