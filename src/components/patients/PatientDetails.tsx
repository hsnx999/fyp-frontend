import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Button } from '../ui/Button';
import { ArrowLeft, FileText, Activity, Calendar, User } from 'lucide-react';

interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  lastVisit: string;
  status: string;
  diagnosis: string;
}

const PatientDetails: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPatient = async () => {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching patient:', error);
        setPatient(null);
      } else {
        setPatient(data);
      }

      setLoading(false);
    };

    if (id) fetchPatient();
  }, [id]);

  if (loading) {
    return <div>Loading patient details...</div>;
  }

  if (!patient) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Patient not found</h2>
        <Button onClick={() => navigate('/patients')} className="mt-4">
          Back to Patients
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => navigate('/patients')}
          className="flex items-center gap-2"
        >
          <ArrowLeft size={16} />
          Back to Patients
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{patient.name}</h1>
            <p className="text-gray-500">Patient ID: {patient.id}</p>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              patient.status === 'Critical'
                ? 'bg-red-100 text-red-800'
                : 'bg-green-100 text-green-800'
            }`}
          >
            {patient.status}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Basic Information</p>
                <p className="text-gray-900">
                  {patient.age} years old • {patient.gender}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Diagnosis</p>
                <p className="text-gray-900">{patient.diagnosis}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Activity className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Current Status</p>
                <p className="text-gray-900">{patient.status}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Last Visit</p>
                <p className="text-gray-900">{patient.lastVisit}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-3">Recent Activity</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Diagnosis Updated</span>
                <span className="text-gray-900">2 days ago</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">CT Scan Analysis</span>
                <span className="text-gray-900">5 days ago</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Initial Consultation</span>
                <span className="text-gray-900">1 week ago</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDetails;
