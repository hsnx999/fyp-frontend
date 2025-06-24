import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { X, Search, Calendar } from 'lucide-react';
import { Patient } from '../../types';
import { convertISOToDDMMYYYY } from '../../utils/dateUtils';

interface PatientSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (patient: Patient) => void;
  patients: Patient[];
}

const PatientSelectionModal: React.FC<PatientSelectionModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  patients,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    gender: '',
    ageRange: '',
    status: '',
  });

  if (!isOpen) return null;

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = 
      patient.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.emailAddress?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesGender = !filters.gender || patient.gender === filters.gender;
    
    const matchesAge = !filters.ageRange || (() => {
      const age = patient.age;
      if (!age) return false;
      switch (filters.ageRange) {
        case '0-30': return age >= 0 && age <= 30;
        case '31-50': return age >= 31 && age <= 50;
        case '51-70': return age >= 51 && age <= 70;
        case '70+': return age > 70;
        default: return true;
      }
    })();

    return matchesSearch && matchesGender && matchesAge;
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-5xl relative overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-purple-500"></div>
        
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={20} />
        </button>

        <div className="p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Select Patient</h2>

          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="Search by name, ID, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex gap-2">
              <Select
                value={filters.gender}
                onChange={(e) => setFilters(prev => ({ ...prev, gender: e.target.value }))}
                className="w-32"
              >
                <option value="">All Genders</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </Select>

              <Select
                value={filters.ageRange}
                onChange={(e) => setFilters(prev => ({ ...prev, ageRange: e.target.value }))}
                className="w-32"
              >
                <option value="">All Ages</option>
                <option value="0-30">0-30</option>
                <option value="31-50">31-50</option>
                <option value="51-70">51-70</option>
                <option value="70+">70+</option>
              </Select>
            </div>
          </div>

          <div className="overflow-y-auto max-h-[calc(100vh-400px)] rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Patient Info
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Details
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPatients.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                      No patients found matching your criteria
                    </td>
                  </tr>
                ) : (
                  filteredPatients.map((patient) => (
                    <tr key={patient.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {patient.name || 'Unnamed Patient'}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {patient.id.slice(0, 8)}...
                          </div>
                          <div className="text-sm text-gray-500">
                            {patient.age} years • {patient.gender}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {patient.phoneNumber && (
                            <div>📞 {patient.phoneNumber}</div>
                          )}
                          {patient.emailAddress && (
                            <div>✉️ {patient.emailAddress}</div>
                          )}
                          {!patient.phoneNumber && !patient.emailAddress && (
                            <span className="text-gray-400">No contact info</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {patient.dateOfBirth && (
                            <div className="flex items-center gap-1">
                              <Calendar size={14} />
                              <span>DOB: {convertISOToDDMMYYYY(patient.dateOfBirth)}</span>
                            </div>
                          )}
                          {patient.address && (
                            <div className="text-xs text-gray-500 mt-1">
                              📍 {patient.address.length > 30 ? patient.address.substring(0, 30) + '...' : patient.address}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Button
                          onClick={() => onSelect(patient)}
                          variant="outline"
                          size="sm"
                          className="hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 transition-colors"
                        >
                          Select
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-6 flex justify-end">
            <Button onClick={onClose} variant="outline">
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientSelectionModal;