import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Button } from '../ui/Button';
import { ArrowLeft, FileText, Activity, Calendar, User, Phone, Mail, MapPin } from 'lucide-react';
import { convertISOToDDMMYYYY } from '../../utils/dateUtils';
import type { Database } from '../../lib/database.types';

type Patient = Database['public']['Tables']['patients']['Row'];

const PatientDetails: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [analysisHistory, setAnalysisHistory] = useState<any[]>([]);

  useEffect(() => {
    const fetchPatientData = async () => {
      if (!id) return;

      try {
        // Fetch patient details
        const { data: patientData, error: patientError } = await supabase
          .from('patients')
          .select('*')
          .eq('id', id)
          .single();

        if (patientError) {
          console.error('Error fetching patient:', patientError);
          setPatient(null);
        } else {
          setPatient(patientData);
        }

        // Fetch analysis history
        const { data: reportsData, error: reportsError } = await supabase
          .from('reports')
          .select('*')
          .eq('patient_id', id)
          .order('created_at', { ascending: false })
          .limit(5);

        if (!reportsError && reportsData) {
          setAnalysisHistory(reportsData);
        }
      } catch (error) {
        console.error('Error fetching patient data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPatientData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
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
            <p className="text-gray-500">Patient ID: {patient.id.slice(0, 8)}...</p>
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Basic Information */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Age & Gender</p>
                    <p className="text-gray-900">{patient.age} years old • {patient.gender}</p>
                  </div>
                </div>

                {patient.date_of_birth && (
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Date of Birth</p>
                      <p className="text-gray-900">{convertISOToDDMMYYYY(patient.date_of_birth)}</p>
                    </div>
                  </div>
                )}

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
                    <p className="text-gray-900">{convertISOToDDMMYYYY(patient.last_visit)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h3>
              <div className="space-y-4">
                {patient.phone_number && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Phone Number</p>
                      <p className="text-gray-900">{patient.phone_number}</p>
                    </div>
                  </div>
                )}

                {patient.email_address && (
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Email Address</p>
                      <p className="text-gray-900">{patient.email_address}</p>
                    </div>
                  </div>
                )}

                {patient.address && (
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Address</p>
                      <p className="text-gray-900">{patient.address}</p>
                    </div>
                  </div>
                )}

                {!patient.phone_number && !patient.email_address && !patient.address && (
                  <p className="text-gray-400 italic">No contact information available</p>
                )}
              </div>
            </div>
          </div>

          {/* Medical History & Analysis History */}
          <div className="space-y-6">
            {patient.medical_history_summary && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Medical History Summary</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700">{patient.medical_history_summary}</p>
                </div>
              </div>
            )}

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Analysis History</h3>
              <div className="space-y-3">
                {analysisHistory.length > 0 ? (
                  analysisHistory.map((analysis) => (
                    <div key={analysis.id} className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between text-sm">
                        <div>
                          <p className="font-medium text-gray-900">
                            {analysis.predicted_type} Analysis
                          </p>
                          <p className="text-gray-500">
                            Confidence: {Math.round(analysis.confidence * 100)}%
                          </p>
                          {analysis.critical_findings && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-red-100 text-red-800 mt-1">
                              Critical Findings
                            </span>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-gray-900">
                            {convertISOToDDMMYYYY(analysis.created_at)}
                          </p>
                          <p className="text-xs text-gray-500">
                            Status: {analysis.status || 'Completed'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 italic">No analysis history available</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDetails;