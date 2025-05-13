import React from 'react';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: {
    gender: string;
    ageRange: string;
    status: string;
    diagnosis: string;
  };
  setFilters: React.Dispatch<React.SetStateAction<{
    gender: string;
    ageRange: string;
    status: string;
    diagnosis: string;
  }>>;
}

const FilterModal: React.FC<FilterModalProps> = ({ isOpen, onClose, filters, setFilters }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Filter Patients</h3>

        <div className="space-y-4">
          <div>
            <label htmlFor="gender" className="block text-sm font-medium text-gray-700">Gender</label>
            <Select
              value={filters.gender}
              onChange={(e) => setFilters(prev => ({ ...prev, gender: e.target.value }))}
              className="w-full"
            >
              <option value="">All Genders</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </Select>
          </div>

          <div>
            <label htmlFor="ageRange" className="block text-sm font-medium text-gray-700">Age Range</label>
            <Select
              value={filters.ageRange}
              onChange={(e) => setFilters(prev => ({ ...prev, ageRange: e.target.value }))}
              className="w-full"
            >
              <option value="">All Ages</option>
              <option value="0-30">0-30</option>
              <option value="31-50">31-50</option>
              <option value="51-70">51-70</option>
              <option value="70+">70+</option>
            </Select>
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
            <Select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="w-full"
            >
              <option value="">All Status</option>
              <option value="Stable">Stable</option>
              <option value="Critical">Critical</option>
            </Select>
          </div>

          <div>
            <label htmlFor="diagnosis" className="block text-sm font-medium text-gray-700">Diagnosis</label>
            <Select
              value={filters.diagnosis}
              onChange={(e) => setFilters(prev => ({ ...prev, diagnosis: e.target.value }))}
              className="w-full"
            >
              <option value="">All Diagnoses</option>
              <option value="Adenocarcinoma">Adenocarcinoma</option>
              <option value="Large Cell Carcinoma">Large Cell Carcinoma</option>
              <option value="Under Investigation">Under Investigation</option>
              <option value="Normal">Normal</option>
            </Select>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-4">
          <Button onClick={onClose} variant="outline" className="text-gray-700">
            Close
          </Button>
          <Button onClick={onClose} className="bg-blue-600 text-white">
            Apply Filters
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FilterModal;
