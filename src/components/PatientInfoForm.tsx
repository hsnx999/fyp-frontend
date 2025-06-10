import React, { useState, useEffect } from 'react';
import { Patient } from '../types';
import { Button } from './ui/Button';
import { Select } from './ui/Select';
import { Input } from './ui/Input';

interface PatientInfoFormProps {
  patient: Patient;
  onChange: (patient: Patient) => void;
  onSubmit: () => void;
}

const PatientInfoForm: React.FC<PatientInfoFormProps> = ({ 
  patient, 
  onChange, 
  onSubmit 
}) => {
  const [formData, setFormData] = useState<Patient>(patient);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  
  useEffect(() => {
    setFormData(patient);
  }, [patient]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    let updatedValue: any = value;
    if (name === 'age' && value) {
      updatedValue = parseInt(value, 10);
    } else if (name !== 'gender' && name !== 'cancerType' && value) {
      // Convert scale values to numbers
      updatedValue = parseInt(value, 10);
    }
    
    setFormData(prev => {
      const newData = { ...prev, [name]: updatedValue };
      onChange(newData);
      return newData;
    });
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

  const ScaleSelect = ({ name, label, value }: { name: string; label: string; value: number }) => (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <Select
        id={name}
        name={name}
        value={value || ''}
        onChange={handleChange}
        className="w-full p-2 border border-gray-300 rounded-md"
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
      <h2 className="text-xl font-semibold text-gray-800 mb-3">Patient Information</h2>
      <p className="text-sm text-gray-600 mb-6">
        Please provide comprehensive patient information for accurate risk assessment.
      </p>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div>
          <h3 className="text-lg font-medium text-gray-800 mb-4 border-b border-gray-200 pb-2">
            Basic Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-1">
                Age *
              </label>
              <Input
                id="age"
                name="age"
                type="number"
                min="1"
                max="120"
                value={formData.age === null ? '' : formData.age}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="Enter age"
              />
              {errors.age && <p className="text-sm text-red-600 mt-1">{errors.age}</p>}
            </div>
            
            <div>
              <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
                Gender *
              </label>
              <Select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </Select>
              {errors.gender && <p className="text-sm text-red-600 mt-1">{errors.gender}</p>}
            </div>

            <div>
              <label htmlFor="cancerType" className="block text-sm font-medium text-gray-700 mb-1">
                Cancer Type *
              </label>
              <Select
                id="cancerType"
                name="cancerType"
                value={formData.cancerType}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md"
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