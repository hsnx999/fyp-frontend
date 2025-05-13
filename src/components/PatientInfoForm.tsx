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
    }
    
    setFormData(prev => {
      const newData = { ...prev, [name]: updatedValue };
      onChange(newData);
      return newData;
    });
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Simple validation checks
    const newErrors: { [key: string]: string } = {};
    if (!formData.age) newErrors.age = 'Age is required';
    if (!formData.gender) newErrors.gender = 'Gender is required';
    if (!formData.smoking) newErrors.smoking = 'Smoking status is required';

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      onSubmit();
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-3">Patient Information</h2>
      <p className="text-sm text-gray-600 mb-4">
        Review and edit the extracted patient information below.
      </p>
      
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-1">Age</label>
          <Input
            id="age"
            name="age"
            type="number"
            value={formData.age === null ? '' : formData.age}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md"
          />
          {errors.age && <p className="text-sm text-red-600">{errors.age}</p>}
        </div>
        
        <div>
          <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
          <Select
            id="gender"
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md"
          >
            <option value="">Select gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </Select>
          {errors.gender && <p className="text-sm text-red-600">{errors.gender}</p>}
        </div>
        
        <div>
          <label htmlFor="smoking" className="block text-sm font-medium text-gray-700 mb-1">Smoking Status</label>
          <Select
            id="smoking"
            name="smoking"
            value={formData.smoking}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md"
          >
            <option value="">Select status</option>
            <option value="never">Never smoker</option>
            <option value="former">Former smoker</option>
            <option value="current">Current smoker</option>
            <option value="history">History of smoking</option>
          </Select>
          {errors.smoking && <p className="text-sm text-red-600">{errors.smoking}</p>}
        </div>
        
        {/* Additional fields remain unchanged */}
        
        <div className="md:col-span-2 flex justify-end mt-4">
          <Button 
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200"
          >
            Calculate Risk Scores
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PatientInfoForm;
