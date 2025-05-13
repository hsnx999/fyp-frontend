import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { X, UserPlus, Users, ArrowLeft } from 'lucide-react';

interface AnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateNew: () => void;
  onSelectExisting: () => void;
}

const AnalysisModal: React.FC<AnalysisModalProps> = ({
  isOpen,
  onClose,
  onCreateNew,
  onSelectExisting,
}) => {
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: '',
    diagnosis: '',
    status: 'Stable',
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateNew();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (showRegistrationForm) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-purple-500"></div>
          
          <button
            onClick={() => {
              setShowRegistrationForm(false);
              onClose();
            }}
            className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>

          <div className="p-8">
            <div className="flex items-center gap-2 mb-6">
              <button
                onClick={() => setShowRegistrationForm(false)}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft size={20} />
              </button>
              <h2 className="text-2xl font-bold text-gray-900">Register New Patient</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full"
                  placeholder="Enter patient's full name"
                />
              </div>

              <div>
                <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-1">
                  Age
                </label>
                <Input
                  id="age"
                  name="age"
                  type="number"
                  value={formData.age}
                  onChange={handleChange}
                  required
                  className="w-full"
                  placeholder="Enter patient's age"
                />
              </div>

              <div>
                <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
                  Gender
                </label>
                <Select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  required
                  className="w-full"
                >
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </Select>
              </div>

              <div>
                <label htmlFor="diagnosis" className="block text-sm font-medium text-gray-700 mb-1">
                  Initial Diagnosis
                </label>
                <Select
                  id="diagnosis"
                  name="diagnosis"
                  value={formData.diagnosis}
                  onChange={handleChange}
                  required
                  className="w-full"
                >
                  <option value="">Select diagnosis</option>
                  <option value="Under Investigation">Under Investigation</option>
                  <option value="Adenocarcinoma">Adenocarcinoma</option>
                  <option value="Squamous Cell Carcinoma">Squamous Cell Carcinoma</option>
                  <option value="Large Cell Carcinoma">Large Cell Carcinoma</option>
                  <option value="Normal">Normal</option>
                </Select>
              </div>

              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <Select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  required
                  className="w-full"
                >
                  <option value="Stable">Stable</option>
                  <option value="Critical">Critical</option>
                  <option value="Improving">Improving</option>
                  <option value="Deteriorating">Deteriorating</option>
                </Select>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setShowRegistrationForm(false);
                    onClose();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  Create & Start Analysis
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-purple-500"></div>
        
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={20} />
        </button>

        <div className="p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Start Analysis</h2>
          <p className="text-gray-600 mb-8">
            Choose how you would like to proceed with the analysis:
          </p>

          <div className="space-y-4">
            <Button
              onClick={() => setShowRegistrationForm(true)}
              className="w-full flex items-center justify-center gap-3 py-6 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-[1.02]"
            >
              <UserPlus size={24} />
              <div className="text-left">
                <div className="font-semibold">Create New Patient</div>
                <div className="text-sm opacity-90">Register a new patient for analysis</div>
              </div>
            </Button>

            <Button
              onClick={onSelectExisting}
              variant="outline"
              className="w-full flex items-center justify-center gap-3 py-6 hover:bg-gray-50 transition-all duration-300"
            >
              <Users size={24} />
              <div className="text-left">
                <div className="font-semibold">Select Existing Patient</div>
                <div className="text-sm opacity-90">Choose from existing patient records</div>
              </div>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisModal;