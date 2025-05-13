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
      value: 'male',
      confidence: 0.98,
    });
  } else if (/\b(female|woman|lady|girl)\b/i.test(notes)) {
    entities.push({
      entity: 'gender',
      value: 'female',
      confidence: 0.98,
    });
  }

  // Smoking detection
  if (/\bnever smok(ed|er|ing)\b/i.test(lowerNotes)) {
    entities.push({
      entity: 'smoking',
      value: 'never',
      confidence: 0.92,
    });
  } else if (/\bformer smok(ed|er|ing)\b/i.test(lowerNotes) || /\bquit smoking\b/i.test(lowerNotes)) {
    entities.push({
      entity: 'smoking',
      value: 'former',
      confidence: 0.9,
    });
  } else if (/\bcurrent smok(ed|er|ing)\b/i.test(lowerNotes) || /\bactive smok(ed|er|ing)\b/i.test(lowerNotes)) {
    entities.push({
      entity: 'smoking',
      value: 'current',
      confidence: 0.94,
    });
  } else if (/\b\d+ pack.?(year|yr)\b/i.test(lowerNotes) || /\bsmok(ed|er|ing)\b/i.test(lowerNotes)) {
    entities.push({
      entity: 'smoking',
      value: 'history',
      confidence: 0.85,
    });
  }

  // COPD/Chronic Lung Disease
  if (/\b(copd|chronic obstructive pulmonary disease)\b/i.test(lowerNotes)) {
    entities.push({
      entity: 'chronicLungDisease',
      value: 'severe',
      confidence: 0.93,
    });
  } else if (/\b(asthma|bronchitis|emphysema)\b/i.test(lowerNotes)) {
    entities.push({
      entity: 'chronicLungDisease',
      value: 'moderate',
      confidence: 0.88,
    });
  }

  // Weight loss
  if (/\b(significant|severe|substantial) weight loss\b/i.test(lowerNotes)) {
    entities.push({
      entity: 'weightLoss',
      value: 'severe',
      confidence: 0.91,
    });
  } else if (/\bweight loss\b/i.test(lowerNotes)) {
    entities.push({
      entity: 'weightLoss',
      value: 'moderate',
      confidence: 0.87,
    });
  }

  // Oxygen therapy
  if (/\b(home oxygen|oxygen therapy|supplemental oxygen)\b/i.test(lowerNotes)) {
    entities.push({
      entity: 'oxygenTherapy',
      value: 'yes',
      confidence: 0.94,
    });
  }

  // Family history
  if (/\bfamily history\b/i.test(lowerNotes) && /\b(cancer|lung cancer|malignancy)\b/i.test(lowerNotes)) {
    entities.push({
      entity: 'familyHistory',
      value: 'positive',
      confidence: 0.89,
    });
  }

  // Obesity
  if (/\b(obese|obesity|overweight)\b/i.test(lowerNotes)) {
    entities.push({
      entity: 'obesity',
      value: 'yes',
      confidence: 0.9,
    });
  } else if (/\b(normal weight|healthy weight)\b/i.test(lowerNotes)) {
    entities.push({
      entity: 'obesity',
      value: 'no',
      confidence: 0.85,
    });
  }

  // Balanced diet
  if (/\b(balanced diet|healthy diet|nutritious diet)\b/i.test(lowerNotes)) {
    entities.push({
      entity: 'balancedDiet',
      value: 'yes',
      confidence: 0.82,
    });
  } else if (/\b(poor diet|unbalanced diet|unhealthy eating)\b/i.test(lowerNotes)) {
    entities.push({
      entity: 'balancedDiet',
      value: 'no',
      confidence: 0.8,
    });
  }

  // Exposure to toxins
  if (/\b(asbestos|radon|radiation|chemical|occupational hazard)\b/i.test(lowerNotes)) {
    entities.push({
      entity: 'exposureToToxins',
      value: 'yes',
      confidence: 0.88,
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
        patient.smoking = entity.value;
        break;
      case 'chronicLungDisease':
        patient.chronicLungDisease = entity.value;
        break;
      case 'weightLoss':
        patient.weightLoss = entity.value;
        break;
      case 'oxygenTherapy':
        patient.oxygenTherapy = entity.value;
        break;
      case 'familyHistory':
        patient.familyHistory = entity.value;
        break;
      case 'obesity':
        patient.obesity = entity.value;
        break;
      case 'balancedDiet':
        patient.balancedDiet = entity.value;
        break;
      case 'exposureToToxins':
        patient.exposureToToxins = entity.value;
        break;
    }
  });

  return patient;
};

export const getDefaultPatient = (): Patient => ({
  id: Math.random().toString(36).substring(2, 9),
  age: null,
  gender: '',
  smoking: '',
  obesity: '',
  balancedDiet: '',
  chronicLungDisease: '',
  familyHistory: '',
  weightLoss: '',
  oxygenTherapy: '',
  exposureToToxins: '',
});