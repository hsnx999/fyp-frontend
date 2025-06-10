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

// Enhanced rule-based risk calculation using the new comprehensive patient data
export const calculateRiskScores = (patient: Patient, cancerType: string): RiskScores => {
  let recurrenceRisk = 0.3; // Base risk
  let complicationRisk = 0.3; // Base risk
  let survivalProbability = 0.7; // Base survival probability
  
  // Age factor
  if (patient.age !== null) {
    if (patient.age > 70) {
      recurrenceRisk += 0.15;
      complicationRisk += 0.2;
      survivalProbability -= 0.25;
    } else if (patient.age > 60) {
      recurrenceRisk += 0.1;
      complicationRisk += 0.15;
      survivalProbability -= 0.15;
    } else if (patient.age < 50) {
      recurrenceRisk -= 0.05;
      complicationRisk -= 0.05;
      survivalProbability += 0.1;
    }
  }
  
  // Risk factors (scale 1-9, higher values increase risk)
  const riskFactorWeight = 0.02; // Each point adds 2% risk
  
  // Smoking (highest impact)
  const smokingImpact = (patient.smoking - 1) * 0.04;
  recurrenceRisk += smokingImpact;
  complicationRisk += smokingImpact;
  survivalProbability -= smokingImpact;
  
  // Other risk factors
  const riskFactors = [
    patient.airPollution,
    patient.alcoholUse,
    patient.dustAllergy,
    patient.occupationalHazards,
    patient.geneticRisk,
    patient.chronicLungDisease,
    patient.passiveSmoker
  ];
  
  riskFactors.forEach(factor => {
    const impact = (factor - 1) * riskFactorWeight;
    recurrenceRisk += impact;
    complicationRisk += impact;
    survivalProbability -= impact;
  });
  
  // Obesity impact
  const obesityImpact = (patient.obesity - 1) * 0.025;
  complicationRisk += obesityImpact;
  survivalProbability -= obesityImpact * 0.5;
  
  // Balanced diet (protective factor - higher is better)
  const dietImpact = (patient.balancedDiet - 1) * 0.015;
  recurrenceRisk -= dietImpact;
  survivalProbability += dietImpact;
  
  // Symptoms (scale 1-9, higher values indicate worse prognosis)
  const symptomWeight = 0.015;
  
  const symptoms = [
    patient.chestPain,
    patient.coughingOfBlood,
    patient.fatigue,
    patient.weightLoss,
    patient.shortnessOfBreath,
    patient.wheezing,
    patient.swallowingDifficulty,
    patient.clubbingOfFingerNails,
    patient.frequentCold,
    patient.dryCough,
    patient.snoring
  ];
  
  symptoms.forEach(symptom => {
    const impact = (symptom - 1) * symptomWeight;
    recurrenceRisk += impact;
    complicationRisk += impact;
    survivalProbability -= impact;
  });
  
  // Cancer type factor
  switch (cancerType.toLowerCase()) {
    case 'small cell lung cancer':
      recurrenceRisk += 0.2;
      survivalProbability -= 0.2;
      break;
    case 'adenocarcinoma':
      recurrenceRisk += 0.05;
      break;
    case 'squamous cell carcinoma':
    case 'squamous':
      recurrenceRisk += 0.08;
      survivalProbability -= 0.05;
      break;
    case 'large cell carcinoma':
      recurrenceRisk += 0.12;
      survivalProbability -= 0.1;
      break;
    case 'normal':
      recurrenceRisk -= 0.2;
      complicationRisk -= 0.2;
      survivalProbability += 0.3;
      break;
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