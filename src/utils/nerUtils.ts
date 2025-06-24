import { ExtractedEntity, Patient } from '../types';

// Simulated NER model based on keyword mapping
export const processClinicaNotes = (notes: string): ExtractedEntity[] => {
  const entities: ExtractedEntity[] = [];
  const lowerNotes = notes.toLowerCase();

  // Age detection
  const ageMatch = notes.match(/(\d+)[ -]*(year|yr|y)s?[ -]*(old|of age)/i);
  if (ageMatch) {
    entities.push({
      entity: 'age',
      value: ageMatch[1],
      confidence: 0.95,
    });
  }

  // Gender detection
  if (/\b(male|man|gentleman|boy)\b/i.test(notes)) {
    entities.push({
      entity: 'gender',
      value: 'Male',
      confidence: 0.98,
    });
  } else if (/\b(female|woman|lady|girl)\b/i.test(notes)) {
    entities.push({
      entity: 'gender',
      value: 'Female',
      confidence: 0.98,
    });
  }

  // Smoking detection
  if (/\bnever smok(ed|er|ing)\b/i.test(lowerNotes)) {
    entities.push({
      entity: 'smoking',
      value: '1',
      confidence: 0.92,
    });
  } else if (/\bformer smok(ed|er|ing)\b/i.test(lowerNotes) || /\bquit smoking\b/i.test(lowerNotes)) {
    entities.push({
      entity: 'smoking',
      value: '4',
      confidence: 0.9,
    });
  } else if (/\bcurrent smok(ed|er|ing)\b/i.test(lowerNotes) || /\bactive smok(ed|er|ing)\b/i.test(lowerNotes)) {
    entities.push({
      entity: 'smoking',
      value: '8',
      confidence: 0.94,
    });
  } else if (/\b\d+ pack.?(year|yr)\b/i.test(lowerNotes) || /\bsmok(ed|er|ing)\b/i.test(lowerNotes)) {
    entities.push({
      entity: 'smoking',
      value: '6',
      confidence: 0.85,
    });
  }

  // COPD/Chronic Lung Disease
  if (/\b(copd|chronic obstructive pulmonary disease)\b/i.test(lowerNotes)) {
    entities.push({
      entity: 'chronicLungDisease',
      value: '8',
      confidence: 0.93,
    });
  } else if (/\b(asthma|bronchitis|emphysema)\b/i.test(lowerNotes)) {
    entities.push({
      entity: 'chronicLungDisease',
      value: '5',
      confidence: 0.88,
    });
  }

  // Weight loss
  if (/\b(significant|severe|substantial) weight loss\b/i.test(lowerNotes)) {
    entities.push({
      entity: 'weightLoss',
      value: '8',
      confidence: 0.91,
    });
  } else if (/\bweight loss\b/i.test(lowerNotes)) {
    entities.push({
      entity: 'weightLoss',
      value: '5',
      confidence: 0.87,
    });
  }

  // Chest pain
  if (/\b(severe|intense) chest pain\b/i.test(lowerNotes)) {
    entities.push({
      entity: 'chestPain',
      value: '8',
      confidence: 0.9,
    });
  } else if (/\bchest pain\b/i.test(lowerNotes)) {
    entities.push({
      entity: 'chestPain',
      value: '5',
      confidence: 0.85,
    });
  }

  // Shortness of breath
  if (/\b(severe|extreme) (shortness of breath|dyspnea)\b/i.test(lowerNotes)) {
    entities.push({
      entity: 'shortnessOfBreath',
      value: '8',
      confidence: 0.9,
    });
  } else if (/\b(shortness of breath|dyspnea)\b/i.test(lowerNotes)) {
    entities.push({
      entity: 'shortnessOfBreath',
      value: '5',
      confidence: 0.85,
    });
  }

  // Fatigue
  if (/\b(severe|extreme) fatigue\b/i.test(lowerNotes)) {
    entities.push({
      entity: 'fatigue',
      value: '8',
      confidence: 0.88,
    });
  } else if (/\bfatigue\b/i.test(lowerNotes)) {
    entities.push({
      entity: 'fatigue',
      value: '5',
      confidence: 0.82,
    });
  }

  // Coughing of blood
  if (/\b(hemoptysis|coughing blood|blood in sputum)\b/i.test(lowerNotes)) {
    entities.push({
      entity: 'coughingOfBlood',
      value: '7',
      confidence: 0.92,
    });
  }

  // Dry cough
  if (/\b(persistent|chronic) dry cough\b/i.test(lowerNotes)) {
    entities.push({
      entity: 'dryCough',
      value: '7',
      confidence: 0.88,
    });
  } else if (/\bdry cough\b/i.test(lowerNotes)) {
    entities.push({
      entity: 'dryCough',
      value: '5',
      confidence: 0.82,
    });
  }

  return entities;
};

export const mapEntitiesToPatient = (entities: ExtractedEntity[], initialPatient: Patient): Patient => {
  const patient = { ...initialPatient };

  entities.forEach(entity => {
    switch (entity.entity) {
      case 'age':
        patient.age = parseInt(entity.value, 10);
        break;
      case 'gender':
        patient.gender = entity.value;
        break;
      case 'smoking':
        patient.smoking = parseInt(entity.value, 10);
        break;
      case 'chronicLungDisease':
        patient.chronicLungDisease = parseInt(entity.value, 10);
        break;
      case 'weightLoss':
        patient.weightLoss = parseInt(entity.value, 10);
        break;
      case 'chestPain':
        patient.chestPain = parseInt(entity.value, 10);
        break;
      case 'shortnessOfBreath':
        patient.shortnessOfBreath = parseInt(entity.value, 10);
        break;
      case 'fatigue':
        patient.fatigue = parseInt(entity.value, 10);
        break;
      case 'coughingOfBlood':
        patient.coughingOfBlood = parseInt(entity.value, 10);
        break;
      case 'dryCough':
        patient.dryCough = parseInt(entity.value, 10);
        break;
    }
  });

  return patient;
};

export const getDefaultPatient = (): Patient => ({
  id: Math.random().toString(36).substring(2, 9),
  age: null,
  gender: '',
  dateOfBirth: '',
  phoneNumber: '',
  emailAddress: '',
  address: '',
  medicalHistorySummary: '',
  
  // Risk Factors (default to 1 - lowest level)
  airPollution: 1,
  alcoholUse: 1,
  dustAllergy: 1,
  occupationalHazards: 1,
  geneticRisk: 1,
  chronicLungDisease: 1,
  balancedDiet: 1,
  obesity: 1,
  smoking: 1,
  passiveSmoker: 1,
  
  // Symptoms (default to 1 - absent/mild)
  chestPain: 1,
  coughingOfBlood: 1,
  fatigue: 1,
  weightLoss: 1,
  shortnessOfBreath: 1,
  wheezing: 1,
  swallowingDifficulty: 1,
  clubbingOfFingerNails: 1,
  frequentCold: 1,
  dryCough: 1,
  snoring: 1,
  
  // Cancer Type
  cancerType: '',
});