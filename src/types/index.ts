export interface Patient {
  id: string;
  name?: string;
  age: number | null;
  gender: string;
  dateOfBirth?: string;
  phoneNumber?: string;
  emailAddress?: string;
  address?: string;
  medicalHistorySummary?: string;
  
  // Risk Factors (1-9 scale)
  airPollution: number;
  alcoholUse: number;
  dustAllergy: number;
  occupationalHazards: number;
  geneticRisk: number;
  chronicLungDisease: number;
  balancedDiet: number;
  obesity: number;
  smoking: number;
  passiveSmoker: number;
  
  // Symptoms (1-9 scale)
  chestPain: number;
  coughingOfBlood: number;
  fatigue: number;
  weightLoss: number;
  shortnessOfBreath: number;
  wheezing: number;
  swallowingDifficulty: number;
  clubbingOfFingerNails: number;
  frequentCold: number;
  dryCough: number;
  snoring: number;
  
  // Cancer Type
  cancerType: string;
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
  analysisId: string;
}

export interface CTAnalysisResult {
  id: string;
  patientId: string;
  analysisId: string;
  imageUrl?: string;
  predictionType: string;
  confidence: number;
  createdAt: string;
}

export interface ClinicalNotesResult {
  id: string;
  patientId: string;
  analysisId: string;
  notesContent: string;
  extractedEntitiesJson: ExtractedEntity[];
  createdAt: string;
}

export interface MedicationTreatment {
  id: string;
  patientId: string;
  analysisId: string;
  medicationName: string;
  dosage?: string;
  startDate?: string;
  endDate?: string;
  notes?: string;
  createdAt: string;
}