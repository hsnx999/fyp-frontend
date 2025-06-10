import { ExtractedEntity, Patient } from '../types';

// Mapping configuration for entity types to form fields
export const ENTITY_FIELD_MAPPING = {
  // Basic information
  age: 'age',
  gender: 'gender',
  
  // Risk factors
  'air pollution': 'airPollution',
  'alcohol': 'alcoholUse',
  'dust allergy': 'dustAllergy',
  'occupational hazards': 'occupationalHazards',
  'genetic risk': 'geneticRisk',
  'chronic lung disease': 'chronicLungDisease',
  'copd': 'chronicLungDisease',
  'balanced diet': 'balancedDiet',
  'diet': 'balancedDiet',
  'obesity': 'obesity',
  'smoking': 'smoking',
  'passive smoker': 'passiveSmoker',
  'secondhand smoke': 'passiveSmoker',
  
  // Symptoms
  'chest pain': 'chestPain',
  'coughing blood': 'coughingOfBlood',
  'hemoptysis': 'coughingOfBlood',
  'fatigue': 'fatigue',
  'weight loss': 'weightLoss',
  'shortness of breath': 'shortnessOfBreath',
  'dyspnea': 'shortnessOfBreath',
  'wheezing': 'wheezing',
  'swallowing difficulty': 'swallowingDifficulty',
  'dysphagia': 'swallowingDifficulty',
  'clubbing': 'clubbingOfFingerNails',
  'finger clubbing': 'clubbingOfFingerNails',
  'frequent cold': 'frequentCold',
  'colds': 'frequentCold',
  'dry cough': 'dryCough',
  'cough': 'dryCough',
  'snoring': 'snoring'
};

// Severity mapping for converting qualitative descriptions to 1-9 scale
export const SEVERITY_MAPPING = {
  // Intensity levels
  'absent': 1,
  'none': 1,
  'never': 1,
  'minimal': 2,
  'very mild': 2,
  'mild': 3,
  'slight': 3,
  'light': 3,
  'moderate': 5,
  'medium': 5,
  'average': 5,
  'significant': 6,
  'considerable': 6,
  'severe': 7,
  'heavy': 7,
  'intense': 7,
  'very severe': 8,
  'extreme': 9,
  'critical': 9,
  'maximum': 9,
  
  // Frequency levels
  'rarely': 2,
  'occasionally': 3,
  'sometimes': 4,
  'often': 6,
  'frequently': 7,
  'very often': 8,
  'constantly': 9,
  'always': 9,
  
  // Smoking specific
  'former smoker': 4,
  'ex-smoker': 4,
  'quit smoking': 4,
  'current smoker': 8,
  'active smoker': 8,
  'heavy smoker': 9,
  'chain smoker': 9,
  
  // Diet specific
  'poor diet': 3,
  'unhealthy diet': 3,
  'fair diet': 5,
  'good diet': 7,
  'healthy diet': 7,
  'excellent diet': 8,
  'very healthy diet': 9,
  
  // Weight specific
  'underweight': 3,
  'normal weight': 5,
  'overweight': 6,
  'obese': 8,
  'morbidly obese': 9
};

// Cancer type mapping
export const CANCER_TYPE_MAPPING = {
  'adenocarcinoma': 'adenocarcinoma',
  'squamous cell carcinoma': 'squamous',
  'squamous': 'squamous',
  'large cell carcinoma': 'large cell carcinoma',
  'large cell': 'large cell carcinoma',
  'small cell': 'small cell lung cancer',
  'normal': 'normal',
  'no cancer': 'normal',
  'benign': 'normal'
};

// Confidence thresholds for auto-population
export const CONFIDENCE_THRESHOLDS = {
  HIGH: 0.8,    // Auto-populate with high confidence
  MEDIUM: 0.6,  // Auto-populate with medium confidence (show indicator)
  LOW: 0.4      // Don't auto-populate, but show suggestion
};

/**
 * Converts extracted entities to patient form data
 */
export const mapEntitiesToPatient = (entities: ExtractedEntity[], initialPatient: Patient): Patient => {
  const patient = { ...initialPatient };
  const aiPopulatedFields = new Set<string>();

  entities.forEach(entity => {
    const { entity: entityType, value, confidence } = entity;
    
    // Skip low confidence entities
    if (confidence < CONFIDENCE_THRESHOLDS.LOW) return;

    // Handle age extraction
    if (entityType === 'age') {
      const ageMatch = value.match(/(\d+)/);
      if (ageMatch) {
        patient.age = parseInt(ageMatch[1], 10);
        aiPopulatedFields.add('age');
      }
      return;
    }

    // Handle gender extraction
    if (entityType === 'gender') {
      const genderValue = value.toLowerCase();
      if (genderValue.includes('male') && !genderValue.includes('female')) {
        patient.gender = 'Male';
      } else if (genderValue.includes('female')) {
        patient.gender = 'Female';
      }
      aiPopulatedFields.add('gender');
      return;
    }

    // Handle cancer type from condition entities
    if (entityType === 'condition' || entityType === 'diagnosis') {
      const cancerType = mapCancerType(value);
      if (cancerType) {
        patient.cancerType = cancerType;
        aiPopulatedFields.add('cancerType');
      }
      return;
    }

    // Map entity to form field
    const fieldName = findMatchingField(entityType, value);
    if (!fieldName) return;

    // Convert to 1-9 scale
    const scaleValue = convertToScale(value, entityType, confidence);
    if (scaleValue && scaleValue >= 1 && scaleValue <= 9) {
      (patient as any)[fieldName] = scaleValue;
      aiPopulatedFields.add(fieldName);
    }
  });

  // Store AI populated fields for UI indication
  (patient as any).aiPopulatedFields = Array.from(aiPopulatedFields);

  return patient;
};

/**
 * Finds the matching form field for an entity
 */
function findMatchingField(entityType: string, value: string): string | null {
  const lowerValue = value.toLowerCase();
  const lowerEntityType = entityType.toLowerCase();

  // Direct entity type mapping
  if (ENTITY_FIELD_MAPPING[lowerEntityType]) {
    return ENTITY_FIELD_MAPPING[lowerEntityType];
  }

  // Search in value for known terms
  for (const [term, field] of Object.entries(ENTITY_FIELD_MAPPING)) {
    if (lowerValue.includes(term) || lowerEntityType.includes(term)) {
      return field;
    }
  }

  // Handle special cases
  if (entityType === 'symptom') {
    return findSymptomField(lowerValue);
  }

  if (entityType === 'history') {
    return findHistoryField(lowerValue);
  }

  if (entityType === 'treatment') {
    return findTreatmentField(lowerValue);
  }

  return null;
}

/**
 * Maps symptom values to form fields
 */
function findSymptomField(value: string): string | null {
  const symptomMappings = {
    'chest pain': 'chestPain',
    'pain': 'chestPain',
    'blood': 'coughingOfBlood',
    'hemoptysis': 'coughingOfBlood',
    'fatigue': 'fatigue',
    'tired': 'fatigue',
    'weight loss': 'weightLoss',
    'losing weight': 'weightLoss',
    'shortness': 'shortnessOfBreath',
    'breath': 'shortnessOfBreath',
    'dyspnea': 'shortnessOfBreath',
    'wheez': 'wheezing',
    'swallow': 'swallowingDifficulty',
    'clubbing': 'clubbingOfFingerNails',
    'finger': 'clubbingOfFingerNails',
    'cold': 'frequentCold',
    'cough': 'dryCough',
    'snor': 'snoring',
    'consolidation': 'chestPain' // Radiological finding often associated with chest symptoms
  };

  for (const [term, field] of Object.entries(symptomMappings)) {
    if (value.includes(term)) {
      return field;
    }
  }

  return null;
}

/**
 * Maps history values to form fields
 */
function findHistoryField(value: string): string | null {
  const historyMappings = {
    'smok': 'smoking',
    'tobacco': 'smoking',
    'cigarette': 'smoking',
    'alcohol': 'alcoholUse',
    'drink': 'alcoholUse',
    'pollution': 'airPollution',
    'dust': 'dustAllergy',
    'occupational': 'occupationalHazards',
    'work': 'occupationalHazards',
    'asbestos': 'occupationalHazards',
    'diet': 'balancedDiet',
    'nutrition': 'balancedDiet',
    'genetic': 'geneticRisk',
    'family': 'geneticRisk',
    'hereditary': 'geneticRisk'
  };

  for (const [term, field] of Object.entries(historyMappings)) {
    if (value.includes(term)) {
      return field;
    }
  }

  return null;
}

/**
 * Maps treatment values to form fields (for inferring severity)
 */
function findTreatmentField(value: string): string | null {
  if (value.includes('oxygen')) {
    return 'shortnessOfBreath'; // Oxygen therapy suggests severe breathing issues
  }
  return null;
}

/**
 * Converts entity value to 1-9 scale
 */
function convertToScale(value: string, entityType: string, confidence: number): number | null {
  const lowerValue = value.toLowerCase().trim();

  // Direct severity mapping
  if (SEVERITY_MAPPING[lowerValue]) {
    return SEVERITY_MAPPING[lowerValue];
  }

  // Extract numeric values with context
  const numericMatch = value.match(/(\d+)/);
  if (numericMatch) {
    const num = parseInt(numericMatch[1], 10);
    
    // Handle pack-years for smoking
    if (lowerValue.includes('pack') && lowerValue.includes('year')) {
      if (num >= 40) return 9;
      if (num >= 30) return 8;
      if (num >= 20) return 7;
      if (num >= 10) return 6;
      if (num >= 5) return 5;
      return 4;
    }

    // Handle weight loss in kg
    if (lowerValue.includes('kg') && entityType === 'symptom') {
      if (num >= 10) return 8;
      if (num >= 5) return 6;
      if (num >= 2) return 4;
      return 3;
    }

    // Handle age-based risk factors
    if (entityType === 'age' && num > 0) {
      // This is handled separately in the main mapping function
      return null;
    }
  }

  // Context-based inference
  if (lowerValue.includes('persistent') || lowerValue.includes('chronic')) {
    return 7;
  }

  if (lowerValue.includes('severe') || lowerValue.includes('intense')) {
    return 8;
  }

  if (lowerValue.includes('mild') || lowerValue.includes('slight')) {
    return 3;
  }

  if (lowerValue.includes('moderate')) {
    return 5;
  }

  // Treatment-based inference
  if (entityType === 'treatment') {
    if (lowerValue.includes('oxygen')) {
      return 8; // Oxygen therapy suggests severe symptoms
    }
  }

  // Default based on confidence and entity type
  if (confidence > CONFIDENCE_THRESHOLDS.HIGH) {
    if (entityType === 'symptom') return 6; // Moderate severity for detected symptoms
    if (entityType === 'history') return 5; // Moderate risk for detected history
  }

  return null;
}

/**
 * Maps cancer type from entity value
 */
function mapCancerType(value: string): string | null {
  const lowerValue = value.toLowerCase();
  
  for (const [term, type] of Object.entries(CANCER_TYPE_MAPPING)) {
    if (lowerValue.includes(term)) {
      return type;
    }
  }

  return null;
}

/**
 * Generates suggestions for manual review
 */
export const generateSuggestions = (entities: ExtractedEntity[]): Array<{
  field: string;
  suggestedValue: number | string;
  confidence: number;
  reasoning: string;
}> => {
  const suggestions: Array<{
    field: string;
    suggestedValue: number | string;
    confidence: number;
    reasoning: string;
  }> = [];

  entities.forEach(entity => {
    const { entity: entityType, value, confidence } = entity;
    
    if (confidence < CONFIDENCE_THRESHOLDS.MEDIUM) return;

    const fieldName = findMatchingField(entityType, value);
    if (!fieldName) return;

    const scaleValue = convertToScale(value, entityType, confidence);
    if (scaleValue) {
      suggestions.push({
        field: fieldName,
        suggestedValue: scaleValue,
        confidence,
        reasoning: `Detected "${value}" with ${Math.round(confidence * 100)}% confidence`
      });
    }
  });

  return suggestions;
};