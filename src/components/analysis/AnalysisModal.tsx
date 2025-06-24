import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { X, UserPlus, Users, ArrowLeft } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { convertDDMMYYYYToISO, isValidDDMMYYYYFormat } from '../../utils/dateUtils';

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
    dateOfBirth: '',
    phoneNumber: '',
    emailAddress: '',
    address: '',
    diagnosis: '',
    status: 'Stable',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.age || parseInt(formData.age) < 1 || parseInt(formData.age) > 120) {
      newErrors.age = 'Valid age is required (1-120)';
    }
    if (!formData.gender) newErrors.gender = 'Gender is required';
    if (!formData.diagnosis) newErrors.diagnosis = 'Diagnosis is required';
    
    if (formData.dateOfBirth && !isValidDDMMYYYYFormat(formData.dateOfBirth)) {
      newErrors.dateOfBirth = 'Date must be in DD-MM-YYYY format';
    }
    
    if (formData.emailAddress && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.emailAddress)) {
      newErrors.emailAddress = 'Valid email address is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);

    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        throw new Error('You must be logged in to create a patient.');
      }

      const patientData = {
        name: formData.name,
        age: parseInt(formData.age),
        gender: formData.gender,
        diagnosis: formData.diagnosis,
        status: formData.status,
        user_id: user.id,
        date_of_birth: formData.dateOfBirth ? convertDDMMYYYYToISO(formData.dateOfBirth) : null,
        phone_number: formData.phoneNumber || null,
        email_address: formData.emailAddress || null,
        address: formData.address || null,
        last_visit: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('patients')
        .insert([patientData]);

      if (error) throw error;

      onCreateNew();
      setFormData({
        name: '',
        age: '',
        gender: '',
        dateOfBirth: '',
        phoneNumber: '',
        emailAddress: '',
        address: '',
        diagnosis: '',
        status: 'Stable',
      });
      setShowRegistrationForm(false);
    } catch (err) {
      console.error('Error creating patient:', err);
      setErrors({ submit: err instanceof Error ? err.message : 'An error occurred' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  if (showRegistrationForm) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl relative overflow-hidden max-h-[90vh] overflow-y-auto">
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

            {errors.submit && (
              <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6 text-sm">
                {errors.submit}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full"
                    placeholder="Enter patient's full name"
                  />
                  {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name}</p>}
                </div>

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
                    value={formData.age}
                    onChange={handleChange}
                    className="w-full"
                    placeholder="Enter patient's age"
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
                    className="w-full"
                  >
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </Select>
                  {errors.gender && <p className="text-sm text-red-600 mt-1">{errors.gender}</p>}
                </div>

                <div>
                  <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-1">
                    Date of Birth (DD-MM-YYYY)
                  </label>
                  <Input
                    id="dateOfBirth"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    className="w-full"
                    placeholder="DD-MM-YYYY"
                  />
                  {errors.dateOfBirth && <p className="text-sm text-red-600 mt-1">{errors.dateOfBirth}</p>}
                </div>

                <div>
                  <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <Input
                    id="phoneNumber"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    className="w-full"
                    placeholder="Enter phone number"
                  />
                </div>

                <div>
                  <label htmlFor="emailAddress" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <Input
                    id="emailAddress"
                    name="emailAddress"
                    type="email"
                    value={formData.emailAddress}
                    onChange={handleChange}
                    className="w-full"
                    placeholder="Enter email address"
                  />
                  {errors.emailAddress && <p className="text-sm text-red-600 mt-1">{errors.emailAddress}</p>}
                </div>
              </div>

              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <Input
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full"
                  placeholder="Enter full address"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="diagnosis" className="block text-sm font-medium text-gray-700 mb-1">
                    Initial Diagnosis *
                  </label>
                  <Select
                    id="diagnosis"
                    name="diagnosis"
                    value={formData.diagnosis}
                    onChange={handleChange}
                    className="w-full"
                  >
                    <option value="">Select diagnosis</option>
                    <option value="Under Investigation">Under Investigation</option>
                    <option value="Adenocarcinoma">Adenocarcinoma</option>
                    <option value="Squamous Cell Carcinoma">Squamous Cell Carcinoma</option>
                    <option value="Large Cell Carcinoma">Large Cell Carcinoma</option>
                    <option value="Normal">Normal</option>
                  </Select>
                  {errors.diagnosis && <p className="text-sm text-red-600 mt-1">{errors.diagnosis}</p>}
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
                    className="w-full"
                  >
                    <option value="Stable">Stable</option>
                    <option value="Critical">Critical</option>
                    <option value="Improving">Improving</option>
                    <option value="Deteriorating">Deteriorating</option>
                  </Select>
                </div>
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
                <Button type="submit" disabled={loading}>
                  {loading ? 'Creating...' : 'Create & Start Analysis'}
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