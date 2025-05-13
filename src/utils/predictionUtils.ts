import { Patient, RiskScores, CancerPrediction } from '../types';

// Simulated CNN model for cancer type prediction
export const predictCancerType = (imageFile: File | null): CancerPrediction => {
  // In a real app, this would call a trained model API
  // Here we'll simulate different results based on file size or name patterns
  
  let type = 'Adenocarcinoma';
  let confidence = 0.82;
  
  if (!imageFile) {
    return { type: 'Unknown', confidence: 0 };
  }
  
  // Use file size to simulate different predictions
  const fileSize = imageFile.size;
  if (fileSize % 5 === 0) {
    type = 'Squamous Cell Carcinoma';
    confidence = 0.78;
  } else if (fileSize % 4 === 0) {
    type = 'Small Cell Lung Cancer';
    confidence = 0.85;
  } else if (fileSize % 3 === 0) {
    type = 'Large Cell Carcinoma';
    confidence = 0.74;
  }
  
  // Use filename to influence confidence
  if (imageFile.name.toLowerCase().includes('scan')) {
    confidence += 0.07;
  }
  
  // Cap confidence at 0.97
  confidence = Math.min(confidence, 0.97);
  
  return { type, confidence };
};

// Rule-based risk calculation
export const calculateRiskScores = (patient: Patient, cancerType: string): RiskScores => {
  let recurrenceRisk = 0.5;
  let complicationRisk = 0.5;
  let survivalProbability = 0.5;
  
  // Age factor
  if (patient.age !== null) {
    if (patient.age > 70) {
      recurrenceRisk += 0.1;
      complicationRisk += 0.15;
      survivalProbability -= 0.2;
    } else if (patient.age > 60) {
      recurrenceRisk += 0.05;
      complicationRisk += 0.1;
      survivalProbability -= 0.1;
    } else if (patient.age < 50) {
      recurrenceRisk -= 0.05;
      complicationRisk -= 0.05;
      survivalProbability += 0.1;
    }
  }
  
  // Smoking factor
  if (patient.smoking === 'current') {
    recurrenceRisk += 0.15;
    complicationRisk += 0.15;
    survivalProbability -= 0.15;
  } else if (patient.smoking === 'former') {
    recurrenceRisk += 0.08;
    complicationRisk += 0.1;
    survivalProbability -= 0.08;
  } else if (patient.smoking === 'never') {
    recurrenceRisk -= 0.1;
    complicationRisk -= 0.05;
    survivalProbability += 0.1;
  }
  
  // Chronic lung disease factor
  if (patient.chronicLungDisease === 'severe') {
    recurrenceRisk += 0.08;
    complicationRisk += 0.15;
    survivalProbability -= 0.12;
  } else if (patient.chronicLungDisease === 'moderate') {
    recurrenceRisk += 0.05;
    complicationRisk += 0.08;
    survivalProbability -= 0.06;
  }
  
  // Weight loss factor
  if (patient.weightLoss === 'severe') {
    recurrenceRisk += 0.1;
    complicationRisk += 0.12;
    survivalProbability -= 0.15;
  } else if (patient.weightLoss === 'moderate') {
    recurrenceRisk += 0.05;
    complicationRisk += 0.05;
    survivalProbability -= 0.07;
  }
  
  // Oxygen therapy factor
  if (patient.oxygenTherapy === 'yes') {
    complicationRisk += 0.12;
    survivalProbability -= 0.1;
  }
  
  // Family history factor
  if (patient.familyHistory === 'positive') {
    recurrenceRisk += 0.07;
    survivalProbability -= 0.05;
  }
  
  // Cancer type factor
  if (cancerType === 'Small Cell Lung Cancer') {
    recurrenceRisk += 0.15;
    survivalProbability -= 0.15;
  } else if (cancerType === 'Adenocarcinoma') {
    recurrenceRisk += 0.05;
  } else if (cancerType === 'Squamous Cell Carcinoma') {
    recurrenceRisk += 0.08;
    survivalProbability -= 0.05;
  }
  
  // Obesity & diet factors
  if (patient.obesity === 'yes') {
    complicationRisk += 0.08;
    survivalProbability -= 0.05;
  }
  
  if (patient.balancedDiet === 'no') {
    survivalProbability -= 0.03;
  } else if (patient.balancedDiet === 'yes') {
    survivalProbability += 0.03;
  }
  
  // Exposure to toxins
  if (patient.exposureToToxins === 'yes') {
    recurrenceRisk += 0.07;
    survivalProbability -= 0.05;
  }
  
  // Normalize values between 0 and 1
  recurrenceRisk = Math.max(0, Math.min(1, recurrenceRisk));
  complicationRisk = Math.max(0, Math.min(1, complicationRisk));
  survivalProbability = Math.max(0, Math.min(1, survivalProbability));
  
  return {
    recurrenceRisk,
    complicationRisk,
    survivalProbability,
  };
};