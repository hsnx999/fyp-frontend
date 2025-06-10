import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Patient, ExtractedEntity, DiagnosticResult, CancerPrediction, RiskScores } from '../types';
import { getDefaultPatient, mapEntitiesToPatient } from '../utils/nerUtils';
import { calculateRiskScores } from '../utils/predictionUtils';
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

  useEffect(() => {
    const fetchPatientsFromDatabase = async () => {
      const { data, error } = await supabase
        .from('patients')
        .select('*');

      if (error) {
        console.error("Error fetching patients:", error);
        return [];
      }

      setPatients(data);
    };

    fetchPatientsFromDatabase();
  }, []);

  const handleCreateNewPatient = () => {
    setIsAnalysisModalOpen(false);
    setCurrentStep('scan');
  };

  const handleSelectExistingPatient = () => {
    setIsAnalysisModalOpen(false);
    setIsPatientSelectionModalOpen(true);
  };

  const handlePatientSelected = (selectedPatient: Patient) => {
    setIsPatientSelectionModalOpen(false);
    setPatient(selectedPatient);
    setCurrentStep('scan');
  };

  const handleNotesProcessed = (entities: ExtractedEntity[]) => {
    setExtractedEntities(entities);
    const updatedPatient = mapEntitiesToPatient(entities, patient);
    setPatient(updatedPatient);
    setCurrentStep('info');
  };

  const handlePatientDataSubmit = () => {
    if (cancerPrediction) {
      const scores = calculateRiskScores(patient, cancerPrediction.type);
      setRiskScores(scores);
      
      const result: DiagnosticResult = {
        patient,
        cancerPrediction,
        riskScores: scores,
        extractedEntities
      };
      setDiagnosticResult(result);
    }
    setCurrentStep('results');
  };

  const handlePatientChange = (updatedPatient: Patient) => {
    setPatient(updatedPatient);
  };

  const handleCancerPrediction = (prediction: CancerPrediction) => {
    setCancerPrediction(prediction);
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
  };

  if (currentStep === 'initial') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Patient Analysis</h1>
        <p className="text-gray-600 mb-8 text-center max-w-md">
          Start a new analysis by creating a new patient record or selecting an existing patient.
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
            {['CT Scan Analysis', 'Clinical Notes', 'Patient Information', 'Risk Assessment'].map((step, index) => {
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
          <CTScanUploader onPrediction={handleCancerPrediction} />
        )}
        
        {currentStep === 'notes' && (
          <div className="space-y-4">
            <ClinicalNotesInput onProcess={handleNotesProcessed} />
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