import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Patient, ExtractedEntity, DiagnosticResult, CancerPrediction, RiskScores } from '../types';
import { getDefaultPatient } from '../utils/nerUtils';
import { calculateRiskScores } from '../utils/predictionUtils';
import { formatDateToDDMMYYYY } from '../utils/dateUtils';
import ClinicalNotesInput from './ClinicalNotesInput';
import PatientInfoForm from './PatientInfoForm';
import CTScanUploader from './CTScanUploader';
import RiskScoresDisplay from './RiskScoresDisplay';
import ExtractedEntitiesDisplay from './ExtractedEntitiesDisplay';
import ExportResults from './ExportResults';
import AnalysisModal from './analysis/AnalysisModal';
import PatientSelectionModal from './analysis/PatientSelectionModal';
import { Button } from './ui/Button';
import { Plus } from 'lucide-react';
import { supabase } from '../lib/supabase';

const Analysis = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<'initial' | 'scan' | 'notes' | 'info' | 'results'>('initial');
  const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);
  const [isPatientSelectionModalOpen, setIsPatientSelectionModalOpen] = useState(false);
  const [extractedEntities, setExtractedEntities] = useState<ExtractedEntity[]>([]);
  const [patient, setPatient] = useState<Patient>(getDefaultPatient());
  const [cancerPrediction, setCancerPrediction] = useState<CancerPrediction | null>(null);
  const [riskScores, setRiskScores] = useState<RiskScores | null>(null);
  const [diagnosticResult, setDiagnosticResult] = useState<DiagnosticResult | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [analysisId, setAnalysisId] = useState<string>('');

  // Generate unique analysis ID when starting new analysis
  const generateAnalysisId = () => {
    return 'analysis_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
  };

  useEffect(() => {
    const fetchPatientsFromDatabase = async () => {
      const { data, error } = await supabase
        .from('patients')
        .select('*');

      if (error) {
        console.error("Error fetching patients:", error);
        return [];
      }

      // Transform database patients to match our Patient interface
      const transformedPatients = data.map(dbPatient => ({
        ...getDefaultPatient(),
        id: dbPatient.id,
        name: dbPatient.name,
        age: dbPatient.age,
        gender: dbPatient.gender,
        dateOfBirth: dbPatient.date_of_birth || '',
        phoneNumber: dbPatient.phone_number || '',
        emailAddress: dbPatient.email_address || '',
        address: dbPatient.address || '',
        medicalHistorySummary: dbPatient.medical_history_summary || '',
      }));

      setPatients(transformedPatients);
    };

    fetchPatientsFromDatabase();
  }, []);

  const handleCreateNewPatient = () => {
    setIsAnalysisModalOpen(false);
    setAnalysisId(generateAnalysisId());
    setCurrentStep('scan');
  };

  const handleSelectExistingPatient = () => {
    setIsAnalysisModalOpen(false);
    setIsPatientSelectionModalOpen(true);
  };

  const handlePatientSelected = (selectedPatient: Patient) => {
    setIsPatientSelectionModalOpen(false);
    setPatient(selectedPatient);
    setAnalysisId(generateAnalysisId());
    setCurrentStep('scan');
  };

  const handleNotesProcessed = async (entities: ExtractedEntity[], notesContent: string) => {
    setExtractedEntities(entities);
    
    // Save clinical notes results to database
    try {
      const { error } = await supabase
        .from('clinical_notes_results')
        .insert({
          patient_id: patient.id,
          analysis_id: analysisId,
          notes_content: notesContent,
          extracted_entities_json: entities
        });

      if (error) {
        console.error('Error saving clinical notes results:', error);
      }
    } catch (err) {
      console.error('Error saving clinical notes results:', err);
    }
    
    setCurrentStep('info');
  };

  const handlePatientDataSubmit = async () => {
    if (cancerPrediction) {
      const scores = calculateRiskScores(patient, cancerPrediction.type);
      setRiskScores(scores);
      
      const result: DiagnosticResult = {
        patient,
        cancerPrediction,
        riskScores: scores,
        extractedEntities,
        analysisId
      };
      setDiagnosticResult(result);

      // Save final risk assessment to reports table
      try {
        const criticalFindings = scores.recurrenceRisk > 0.7 || scores.complicationRisk > 0.7 || scores.survivalProbability < 0.3;
        
        const { error: reportError } = await supabase
          .from('reports')
          .insert({
            patient_id: patient.id,
            analysis_id: analysisId,
            predicted_type: cancerPrediction.type,
            confidence: cancerPrediction.confidence,
            risk_scores_json: scores,
            critical_findings: criticalFindings,
            status: 'completed',
            risk_factor_count: Object.values(patient).filter(val => typeof val === 'number' && val > 5).length
          });

        if (reportError) {
          console.error('Error saving report:', reportError);
        }

        // Update patient's last visit date and medical history
        const { error: patientError } = await supabase
          .from('patients')
          .update({
            last_visit: new Date().toISOString(),
            medical_history_summary: `Latest analysis (${formatDateToDDMMYYYY(new Date())}): ${cancerPrediction.type} with ${Math.round(cancerPrediction.confidence * 100)}% confidence. Risk assessment completed.`
          })
          .eq('id', patient.id);

        if (patientError) {
          console.error('Error updating patient:', patientError);
        }
      } catch (err) {
        console.error('Error saving analysis results:', err);
      }
    }
    setCurrentStep('results');
  };

  const handlePatientChange = (updatedPatient: Patient) => {
    setPatient(updatedPatient);
  };

  const handleCancerPrediction = async (prediction: CancerPrediction) => {
    setCancerPrediction(prediction);
    
    // Save CT analysis results to database
    try {
      const { error } = await supabase
        .from('ct_analysis_results')
        .insert({
          patient_id: patient.id,
          analysis_id: analysisId,
          prediction_type: prediction.type,
          confidence: prediction.confidence,
          image_url: null // Could be updated if you store the image
        });

      if (error) {
        console.error('Error saving CT analysis results:', error);
      }
    } catch (err) {
      console.error('Error saving CT analysis results:', err);
    }
    
    setCurrentStep('notes');
  };

  const handleBack = () => {
    switch (currentStep) {
      case 'notes':
        setCurrentStep('scan');
        break;
      case 'info':
        setCurrentStep('notes');
        break;
      case 'results':
        setCurrentStep('info');
        break;
      default:
        setCurrentStep('initial');
    }
  };

  const handleReset = () => {
    setCurrentStep('initial');
    setExtractedEntities([]);
    setPatient(getDefaultPatient());
    setCancerPrediction(null);
    setRiskScores(null);
    setDiagnosticResult(null);
    setAnalysisId('');
  };

  if (currentStep === 'initial') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">AI-Powered Patient Analysis</h1>
        <p className="text-gray-600 mb-8 text-center max-w-md">
          Start a comprehensive analysis using AI-powered clinical note processing and automated form population.
        </p>
        <Button
          onClick={() => setIsAnalysisModalOpen(true)}
          className="flex items-center gap-2"
        >
          <Plus size={20} />
          Start New Analysis
        </Button>

        <AnalysisModal
          isOpen={isAnalysisModalOpen}
          onClose={() => setIsAnalysisModalOpen(false)}
          onCreateNew={handleCreateNewPatient}
          onSelectExisting={handleSelectExistingPatient}
        />

        <PatientSelectionModal
          isOpen={isPatientSelectionModalOpen}
          onClose={() => setIsPatientSelectionModalOpen(false)}
          onSelect={handlePatientSelected}
          patients={patients}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="mb-8">
        <nav className="flex justify-center">
          <ol className="flex items-center w-full max-w-3xl">
            {['CT Scan Analysis', 'AI Clinical Notes', 'Patient Information', 'Risk Assessment'].map((step, index) => {
              const isActive = index === 
                (currentStep === 'scan' ? 0 : 
                 currentStep === 'notes' ? 1 : 
                 currentStep === 'info' ? 2 : 3);
              const isCompleted = index < 
                (currentStep === 'scan' ? 0 : 
                 currentStep === 'notes' ? 1 : 
                 currentStep === 'info' ? 2 : 3);
                
              return (
                <li key={step} className={`flex items-center ${index < 3 ? 'w-full' : ''}`}>
                  <div className={`flex flex-col items-center ${index < 3 ? 'w-full' : ''}`}>
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                      isActive 
                        ? 'bg-blue-600 text-white' 
                        : isCompleted 
                          ? 'bg-green-500 text-white' 
                          : 'bg-gray-200 text-gray-600'
                    }`}>
                      {isCompleted ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <span>{index + 1}</span>
                      )}
                    </div>
                    <span className={`mt-2 text-xs ${
                      isActive ? 'text-blue-600 font-medium' : 'text-gray-500'
                    }`}>
                      {step}
                    </span>
                  </div>
                  
                  {index < 3 && (
                    <div className={`w-full h-0.5 ${
                      isCompleted ? 'bg-green-500' : 'bg-gray-200'
                    }`} />
                  )}
                </li>
              );
            })}
          </ol>
        </nav>
      </div>

      <div className="animate-fadeIn">
        {currentStep === 'scan' && (
          <CTScanUploader 
            onPrediction={handleCancerPrediction}
            patientId={patient.id}
            analysisId={analysisId}
          />
        )}
        
        {currentStep === 'notes' && (
          <div className="space-y-4">
            <ClinicalNotesInput 
              onProcess={handleNotesProcessed}
              patientId={patient.id}
              analysisId={analysisId}
            />
            <div className="flex justify-start">
              <Button onClick={handleBack} variant="secondary">
                Back to CT Scan
              </Button>
            </div>
          </div>
        )}
        
        {currentStep === 'info' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <PatientInfoForm 
                  patient={patient} 
                  onChange={handlePatientChange}
                  onSubmit={handlePatientDataSubmit}
                  extractedEntities={extractedEntities}
                />
              </div>
              <div className="lg:col-span-1">
                <ExtractedEntitiesDisplay entities={extractedEntities} />
              </div>
            </div>
            <div className="flex justify-start">
              <Button onClick={handleBack} variant="secondary">
                Back to Clinical Notes
              </Button>
            </div>
          </div>
        )}
        
        {currentStep === 'results' && (
          <div className="space-y-6">
            {cancerPrediction && (
              <RiskScoresDisplay
                cancerPrediction={cancerPrediction} 
                patient={patient}
              />
            )}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-3">Patient Summary</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Age</p>
                    <p className="text-lg">{patient.age}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Gender</p>
                    <p className="text-lg capitalize">{patient.gender}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Cancer Type</p>
                    <p className="text-lg capitalize">{patient.cancerType}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Smoking Level</p>
                    <p className="text-lg">{patient.smoking}/9</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Analysis ID</p>
                    <p className="text-sm text-gray-600">{analysisId}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Date</p>
                    <p className="text-sm text-gray-600">{formatDateToDDMMYYYY(new Date())}</p>
                  </div>
                </div>
                <ExportResults result={diagnosticResult} />
              </div>
              <div className="lg:col-span-1">
                <ExtractedEntitiesDisplay entities={extractedEntities} />
              </div>
            </div>
            <div className="flex justify-start gap-4">
              <Button onClick={handleBack} variant="secondary">
                Back to Patient Information
              </Button>
              <Button onClick={handleReset} variant="secondary">
                New Assessment
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Analysis;