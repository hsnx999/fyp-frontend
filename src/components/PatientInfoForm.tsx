import React, { useState, useEffect } from 'react';
import { Patient, ExtractedEntity } from '../types';
import { Button } from './ui/Button';
import { Select } from './ui/Select';
import { Input } from './ui/Input';
import { mapEntitiesToPatient, generateSuggestions, CONFIDENCE_THRESHOLDS } from '../utils/entityMappingUtils';
import { Brain, AlertTriangle, CheckCircle, Edit3 } from 'lucide-react';

interface PatientInfoFormProps {
  patient: Patient;
  onChange: (patient: Patient) => void;
  onSubmit: () => void;
  extractedEntities?: ExtractedEntity[];
}

const PatientInfoForm: React.FC<PatientInfoFormProps> = ({ 
  patient, 
  onChange, 
  onSubmit,
  extractedEntities = []
}) => {
  const [formData, setFormData] = useState<Patient>(patient);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [aiPopulatedFields, setAiPopulatedFields] = useState<Set<string>>(new Set());
  const [suggestions, setSuggestions] = useState<Array<{
    field: string;
    suggestedValue: number | string;
    confidence: number;
    reasoning: string;
  }>>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  useEffect(() => {
    setFormData(patient);
  }, [patient]);

  useEffect(() => {
    if (extractedEntities.length > 0) {
      // Map entities to patient data
      const mappedPatient = mapEntitiesToPatient(extractedEntities, formData);
      
      // Track AI populated fields
      const aiFields = new Set((mappedPatient as any).aiPopulatedFields || []);
      setAiPopulatedFields(aiFields);
      
      // Generate suggestions for manual review
      const newSuggestions = generateSuggestions(extractedEntities);
      setSuggestions(newSuggestions);
      setShowSuggestions(newSuggestions.length > 0);
      
      // Update form data
      setFormData(mappedPatient);
      onChange(mappedPatient);
    }
  }, [extractedEntities]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    let updatedValue: any = value;
    if (name === 'age' && value) {
      updatedValue = parseInt(value, 10);
    } else if (name !== 'gender' && name !== 'cancerType' && value) {
      // Convert scale values to numbers
      updatedValue = parseInt(value, 10);
    }
    
    // Remove from AI populated fields when manually edited
    if (aiPopulatedFields.has(name)) {
      const newAiFields = new Set(aiPopulatedFields);
      newAiFields.delete(name);
      setAiPopulatedFields(newAiFields);
    }
    
    setFormData(prev => {
      const newData = { ...prev, [name]: updatedValue };
      onChange(newData);
      return newData;
    });
  };

  const applySuggestion = (field: string, value: number | string) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      onChange(newData);
      return newData;
    });
    
    // Remove applied suggestion
    setSuggestions(prev => prev.filter(s => s.field !== field));
  };
  
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    
    if (!formData.age) newErrors.age = 'Age is required';
    if (!formData.gender) newErrors.gender = 'Gender is required';
    if (!formData.cancerType) newErrors.cancerType = 'Cancer type is required';
    
    // Validate scale fields (1-9)
    const scaleFields = [
      'airPollution', 'alcoholUse', 'dustAllergy', 'occupationalHazards', 'geneticRisk',
      'chronicLungDisease', 'balancedDiet', 'obesity', 'smoking', 'passiveSmoker',
      'chestPain', 'coughingOfBlood', 'fatigue', 'weightLoss', 'shortnessOfBreath',
      'wheezing', 'swallowingDifficulty', 'clubbingOfFingerNails', 'frequentCold',
      'dryCough', 'snoring'
    ];
    
    scaleFields.forEach(field => {
      const value = formData[field as keyof Patient] as number;
      if (!value || value < 1 || value > 9) {
        newErrors[field] = 'Please select a value between 1-9';
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit();
    }
  };

  const getFieldIndicator = (fieldName: string) => {
    if (aiPopulatedFields.has(fieldName)) {
      return (
        <div className="flex items-center gap-1 text-xs text-blue-600 mt-1">
          <Brain size={12} />
          <span>AI populated</span>
        </div>
      );
    }
    return null;
  };

  const ScaleSelect = ({ name, label, value }: { name: string; label: string; value: number }) => (
    <div className="relative">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {aiPopulatedFields.has(name) && (
          <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-700">
            <Brain size={10} />
            AI
          </span>
        )}
      </label>
      <Select
        id={name}
        name={name}
        value={value || ''}
        onChange={handleChange}
        className={`w-full p-2 border rounded-md ${
          aiPopulatedFields.has(name) 
            ? 'border-blue-300 bg-blue-50' 
            : 'border-gray-300'
        }`}
      >
        <option value="">Select level (1-9)</option>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
          <option key={num} value={num}>{num}</option>
        ))}
      </Select>
      {errors[name] && <p className="text-sm text-red-600 mt-1">{errors[name]}</p>}
    </div>
  );
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Patient Information</h2>
        {aiPopulatedFields.size > 0 && (
          <div className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
            <Brain size={16} />
            <span>{aiPopulatedFields.size} fields auto-populated</span>
          </div>
        )}
      </div>
      
      <p className="text-sm text-gray-600 mb-6">
        Please review and complete the patient information below. Fields marked with AI indicators 
        have been automatically populated based on clinical notes analysis.
      </p>

      {/* AI Suggestions Panel */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            <h3 className="text-sm font-medium text-yellow-800">AI Suggestions for Review</h3>
            <button
              onClick={() => setShowSuggestions(false)}
              className="ml-auto text-yellow-600 hover:text-yellow-800"
            >
              ×
            </button>
          </div>
          <div className="space-y-2">
            {suggestions.slice(0, 3).map((suggestion, index) => (
              <div key={index} className="flex items-center justify-between bg-white p-2 rounded border">
                <div className="flex-1">
                  <span className="text-sm font-medium">{suggestion.field}</span>
                  <span className="text-xs text-gray-500 ml-2">
                    Suggested: {suggestion.suggestedValue} ({Math.round(suggestion.confidence * 100)}% confidence)
                  </span>
                  <p className="text-xs text-gray-600">{suggestion.reasoning}</p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => applySuggestion(suggestion.field, suggestion.suggestedValue)}
                  className="ml-2"
                >
                  Apply
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div>
          <h3 className="text-lg font-medium text-gray-800 mb-4 border-b border-gray-200 pb-2">
            Basic Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-1">
                Age *
                {aiPopulatedFields.has('age') && (
                  <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-700">
                    <Brain size={10} />
                    AI
                  </span>
                )}
              </label>
              <Input
                id="age"
                name="age"
                type="number"
                min="1"
                max="120"
                value={formData.age === null ? '' : formData.age}
                onChange={handleChange}
                className={`w-full p-2 border rounded-md ${
                  aiPopulatedFields.has('age') 
                    ? 'border-blue-300 bg-blue-50' 
                    : 'border-gray-300'
                }`}
                placeholder="Enter age"
              />
              {errors.age && <p className="text-sm text-red-600 mt-1">{errors.age}</p>}
            </div>
            
            <div className="relative">
              <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
                Gender *
                {aiPopulatedFields.has('gender') && (
                  <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-700">
                    <Brain size={10} />
                    AI
                  </span>
                )}
              </label>
              <Select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className={`w-full p-2 border rounded-md ${
                  aiPopulatedFields.has('gender') 
                    ? 'border-blue-300 bg-blue-50' 
                    : 'border-gray-300'
                }`}
              >
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </Select>
              {errors.gender && <p className="text-sm text-red-600 mt-1">{errors.gender}</p>}
            </div>

            <div className="relative">
              <label htmlFor="cancerType" className="block text-sm font-medium text-gray-700 mb-1">
                Cancer Type *
                {aiPopulatedFields.has('cancerType') && (
                  <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-700">
                    <Brain size={10} />
                    AI
                  </span>
                )}
              </label>
              <Select
                id="cancerType"
                name="cancerType"
                value={formData.cancerType}
                onChange={handleChange}
                className={`w-full p-2 border rounded-md ${
                  aiPopulatedFields.has('cancerType') 
                    ? 'border-blue-300 bg-blue-50' 
                    : 'border-gray-300'
                }`}
              >
                <option value="">Select cancer type</option>
                <option value="adenocarcinoma">Adenocarcinoma</option>
                <option value="squamous">Squamous Cell Carcinoma</option>
                <option value="large cell carcinoma">Large Cell Carcinoma</option>
                <option value="normal">Normal</option>
              </Select>
              {errors.cancerType && <p className="text-sm text-red-600 mt-1">{errors.cancerType}</p>}
            </div>
          </div>
        </div>

        {/* Risk Factors */}
        <div>
          <h3 className="text-lg font-medium text-gray-800 mb-4 border-b border-gray-200 pb-2">
            Risk Factors (Scale 1-9: 1=Very Low, 9=Very High)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ScaleSelect name="airPollution" label="Air Pollution Exposure" value={formData.airPollution} />
            <ScaleSelect name="alcoholUse" label="Alcohol Use" value={formData.alcoholUse} />
            <ScaleSelect name="dustAllergy" label="Dust Allergy" value={formData.dustAllergy} />
            <ScaleSelect name="occupationalHazards" label="Occupational Hazards" value={formData.occupationalHazards} />
            <ScaleSelect name="geneticRisk" label="Genetic Risk" value={formData.geneticRisk} />
            <ScaleSelect name="chronicLungDisease" label="Chronic Lung Disease" value={formData.chronicLungDisease} />
            <ScaleSelect name="balancedDiet" label="Balanced Diet" value={formData.balancedDiet} />
            <ScaleSelect name="obesity" label="Obesity Level" value={formData.obesity} />
            <ScaleSelect name="smoking" label="Smoking" value={formData.smoking} />
            <ScaleSelect name="passiveSmoker" label="Passive Smoking" value={formData.passiveSmoker} />
          </div>
        </div>

        {/* Symptoms */}
        <div>
          <h3 className="text-lg font-medium text-gray-800 mb-4 border-b border-gray-200 pb-2">
            Symptoms (Scale 1-9: 1=Absent/Mild, 9=Severe)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ScaleSelect name="chestPain" label="Chest Pain" value={formData.chestPain} />
            <ScaleSelect name="coughingOfBlood" label="Coughing of Blood" value={formData.coughingOfBlood} />
            <ScaleSelect name="fatigue" label="Fatigue" value={formData.fatigue} />
            <ScaleSelect name="weightLoss" label="Weight Loss" value={formData.weightLoss} />
            <ScaleSelect name="shortnessOfBreath" label="Shortness of Breath" value={formData.shortnessOfBreath} />
            <ScaleSelect name="wheezing" label="Wheezing" value={formData.wheezing} />
            <ScaleSelect name="swallowingDifficulty" label="Swallowing Difficulty" value={formData.swallowingDifficulty} />
            <ScaleSelect name="clubbingOfFingerNails" label="Clubbing of Finger Nails" value={formData.clubbingOfFingerNails} />
            <ScaleSelect name="frequentCold" label="Frequent Cold" value={formData.frequentCold} />
            <ScaleSelect name="dryCough" label="Dry Cough" value={formData.dryCough} />
            <ScaleSelect name="snoring" label="Snoring" value={formData.snoring} />
          </div>
        </div>

        {/* AI Processing Summary */}
        {extractedEntities.length > 0 && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-800 mb-2">AI Processing Summary</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>{extractedEntities.length} entities extracted</span>
              </div>
              <div className="flex items-center gap-2">
                <Brain className="h-4 w-4 text-blue-500" />
                <span>{aiPopulatedFields.size} fields auto-populated</span>
              </div>
              <div className="flex items-center gap-2">
                <Edit3 className="h-4 w-4 text-orange-500" />
                <span>Manual review recommended</span>
              </div>
            </div>
          </div>
        )}
        
        <div className="flex justify-end pt-6 border-t border-gray-200">
          <Button 
            type="submit"
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200 font-medium"
          >
            Calculate Risk Assessment
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PatientInfoForm;