import React from 'react';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import { X, Filter as FilterIcon } from 'lucide-react';

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
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-purple-500"></div>
        
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={20} />
        </button>

        <div className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <FilterIcon className="h-6 w-6 text-blue-500" />
            <h3 className="text-2xl font-bold text-gray-900">Filter Patients</h3>
          </div>

          <div className="space-y-6">
            <div>
              <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
                Gender
              </label>
              <Select
                id="gender"
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
              <label htmlFor="ageRange" className="block text-sm font-medium text-gray-700 mb-1">
                Age Range
              </label>
              <Select
                id="ageRange"
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
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <Select
                id="status"
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="w-full"
              >
                <option value="">All Status</option>
                <option value="Stable">Stable</option>
                <option value="Critical">Critical</option>
                <option value="Improving">Improving</option>
                <option value="Deteriorating">Deteriorating</option>
              </Select>
            </div>

            <div>
              <label htmlFor="diagnosis" className="block text-sm font-medium text-gray-700 mb-1">
                Diagnosis
              </label>
              <Select
                id="diagnosis"
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

          <div className="flex justify-end gap-3 mt-8">
            <Button
              onClick={onClose}
              variant="outline"
              className="hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              onClick={onClose}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
            >
              Apply Filters
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterModal;