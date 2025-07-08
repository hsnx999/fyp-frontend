import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/Button';
import { Search, Filter, Eye, Plus } from 'lucide-react';
import { Select } from './ui/Select';
import { supabase } from '../lib/supabase';
import { convertISOToDDMMYYYY } from '../utils/dateUtils';
import type { Database } from '../lib/database.types';
import AddPatientModal from './patients/AddPatientModal';

type Patient = Database['public']['Tables']['patients']['Row'];

const Patients = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    gender: '',
    ageRange: '',
    status: '',
    diagnosis: '',
  });
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      // Get current user first
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        setError('You must be logged in to view patients');
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('user_id', user.id)
        .order('last_visit', { ascending: false });

      if (error) throw error;
      setPatients(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch patients');
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = 
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (patient.email_address && patient.email_address.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesGender = !filters.gender || patient.gender === filters.gender;

    const matchesAge = !filters.ageRange || (() => {
      const age = patient.age;
      switch (filters.ageRange) {
        case '0-30': return age >= 0 && age <= 30;
        case '31-50': return age >= 31 && age <= 50;
        case '51-70': return age >= 51 && age <= 70;
        case '70+': return age > 70;
        default: return true;
      }
    })();

    const matchesStatus = !filters.status || patient.status === filters.status;
    const matchesDiagnosis = !filters.diagnosis || patient.diagnosis === filters.diagnosis;

    return matchesSearch && matchesGender && matchesAge && matchesStatus && matchesDiagnosis;
  });

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Error: {error}</p>
        <Button onClick={fetchPatients} className="mt-4">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search patients by name, ID, email, or diagnosis..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex flex-wrap gap-3 w-full sm:w-auto">
          <Button variant="outline" onClick={() => setIsFilterOpen(true)}>
            <Filter className="mr-2 h-4 w-4" /> Filter
          </Button>
          <Button onClick={() => setIsAddModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Patient
          </Button>
        </div>
      </div>

      {isFilterOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Filter Patients</h2>
              <button onClick={() => setIsFilterOpen(false)} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
            <div className="flex flex-wrap gap-3">
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
              <Select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="w-32"
              >
                <option value="">All Status</option>
                <option value="Stable">Stable</option>
                <option value="Critical">Critical</option>
              </Select>
              <Select
                value={filters.diagnosis}
                onChange={(e) => setFilters(prev => ({ ...prev, diagnosis: e.target.value }))}
                className="w-40"
              >
                <option value="">All Diagnoses</option>
                <option value="Adenocarcinoma">Adenocarcinoma</option>
                <option value="Large Cell Carcinoma">Large Cell Carcinoma</option>
                <option value="Under Investigation">Under Investigation</option>
                <option value="Normal">Normal</option>
              </Select>
            </div>
            <div className="mt-4 flex justify-end">
              <Button onClick={() => setIsFilterOpen(false)}>Apply</Button>
            </div>
          </div>
        </div>
      )}

      <AddPatientModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={async (newPatient) => {
          const { error } = await supabase.from('patients').insert([newPatient]);
      
          if (!error) {
            fetchPatients();
          } else {
            console.error('Error adding patient:', error.message);
          }
        }}
      />

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center">
              <p className="text-gray-500">Loading patients...</p>
            </div>
          ) : filteredPatients.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500">No patients found</p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient Info</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Visit</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Diagnosis</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPatients.map((patient) => (
                  <tr key={patient.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{patient.name}</div>
                        <div className="text-sm text-gray-500">ID: {patient.id.slice(0, 8)}...</div>
                        <div className="text-sm text-gray-500">{patient.age} years • {patient.gender}</div>
                        {patient.date_of_birth && (
                          <div className="text-xs text-gray-400">DOB: {convertISOToDDMMYYYY(patient.date_of_birth)}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {patient.phone_number && <div>📞 {patient.phone_number}</div>}
                        {patient.email_address && <div>✉️ {patient.email_address}</div>}
                        {!patient.phone_number && !patient.email_address && (
                          <span className="text-gray-400">No contact info</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {convertISOToDDMMYYYY(patient.last_visit)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${patient.status === 'Critical' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>{patient.status}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{patient.diagnosis}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => navigate(`/patients/${patient.id}`)}
                        className="flex items-center gap-2"
                      >
                        <Eye size={16} />
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Patients;