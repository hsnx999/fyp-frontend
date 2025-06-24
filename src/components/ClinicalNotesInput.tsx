import React, { useState } from 'react';
import { Button } from './ui/Button';
import { ExtractedEntity } from '../types';
import { Brain, AlertCircle, CheckCircle, Clock } from 'lucide-react';

interface ClinicalNotesInputProps {
  onProcess: (extractedEntities: ExtractedEntity[], notesContent: string) => void;
  patientId: string;
  analysisId: string;
}

const ClinicalNotesInput: React.FC<ClinicalNotesInputProps> = ({ 
  onProcess, 
  patientId, 
  analysisId 
}) => {
  const [notes, setNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processingStage, setProcessingStage] = useState<string>('');
  const [extractedEntities, setExtractedEntities] = useState<ExtractedEntity[]>([]);

  const handleProcess = async () => {
    if (notes.trim().length < 10) {
      setError('Please enter at least 10 characters of clinical notes.');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setProcessingStage('Connecting to AI model...');

    try {
      setProcessingStage('Analyzing clinical notes...');
      
      const response = await fetch("http://localhost:5000/api/ner", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          notes,
          patient_id: patientId,
          analysis_id: analysisId
        }),
      });

      if (!response.ok) {
        throw new Error(`AI model request failed with status ${response.status}`);
      }

      setProcessingStage('Processing extracted entities...');
      const data = await response.json();
      
      if (!data.entities || !Array.isArray(data.entities)) {
        throw new Error('Invalid response format from AI model');
      }

      setProcessingStage('Mapping entities to form fields...');
      
      // Add a small delay to show the processing stages
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setExtractedEntities(data.entities);
      onProcess(data.entities, notes);
      
      setProcessingStage('Complete!');
      
    } catch (err) {
      console.error("NER error:", err);
      setError(
        err instanceof Error 
          ? `AI processing failed: ${err.message}` 
          : "There was an error extracting entities. Please check if the AI model server is running on localhost:5000."
      );
    } finally {
      setIsProcessing(false);
      setTimeout(() => setProcessingStage(''), 2000);
    }
  };

  const getEntityTypeColor = (entityType: string) => {
    const colors = {
      'age': 'bg-blue-100 text-blue-800',
      'gender': 'bg-purple-100 text-purple-800',
      'symptom': 'bg-red-100 text-red-800',
      'condition': 'bg-orange-100 text-orange-800',
      'history': 'bg-green-100 text-green-800',
      'treatment': 'bg-indigo-100 text-indigo-800',
      'familyHistory': 'bg-pink-100 text-pink-800',
      'unknown': 'bg-gray-100 text-gray-800'
    };
    return colors[entityType as keyof typeof colors] || colors.unknown;
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-3 mb-4">
        <Brain className="h-6 w-6 text-blue-600" />
        <h2 className="text-xl font-semibold text-gray-800">AI-Powered Clinical Notes Analysis</h2>
      </div>
      
      <p className="text-sm text-gray-600 mb-4">
        Enter the patient's clinical notes below. Our AI model will automatically extract medical entities 
        and populate the corresponding form fields with appropriate severity ratings. Results will be saved to the patient's record.
      </p>

      {patientId && analysisId && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Patient ID:</strong> {patientId.slice(0, 8)}... | <strong>Analysis ID:</strong> {analysisId}
          </p>
        </div>
      )}
      
      <div className="space-y-4">
        <div>
          <label htmlFor="clinical-notes" className="block text-sm font-medium text-gray-700 mb-2">
            Clinical Notes
          </label>
          <textarea
            id="clinical-notes"
            className="w-full h-40 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            placeholder="e.g., 68-year-old male with 40-year smoking history, occupational hazards, air pollution exposure. Presents with chronic obstructive pulmonary disease, persistent shortness of breath, dry cough, fatigue, and 5 kg weight loss over the last two months. Frequent colds, wheezing, clubbing of fingernails. Patient is obese with poor diet, consumes alcohol regularly. Chest X-ray shows consolidation in lower lobe. Currently on home oxygen therapy. Family history of lung cancer."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
          <div className="flex justify-between items-center mt-2">
            <span className="text-xs text-gray-500">
              {notes.length} characters (minimum 10 required)
            </span>
            {notes.length >= 10 && (
              <span className="text-xs text-green-600 flex items-center gap-1">
                <CheckCircle size={12} />
                Ready for processing
              </span>
            )}
          </div>
        </div>

        {/* Processing Status */}
        {isProcessing && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-500"></div>
              <div>
                <p className="text-sm font-medium text-blue-800">Processing Clinical Notes</p>
                <p className="text-xs text-blue-600">{processingStage}</p>
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-800">Processing Error</p>
                <p className="text-xs text-red-600 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Success Status */}
        {processingStage === 'Complete!' && extractedEntities.length > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium text-green-800">
                  Successfully extracted {extractedEntities.length} entities
                </p>
                <p className="text-xs text-green-600">
                  Form fields have been automatically populated and results saved to patient record
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Extracted Entities Preview */}
        {extractedEntities.length > 0 && (
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-800 mb-3">Extracted Entities Preview</h4>
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
              {extractedEntities.slice(0, 10).map((entity, index) => (
                <div
                  key={index}
                  className="inline-flex items-center gap-2 px-2 py-1 rounded-full text-xs border"
                >
                  <span className={`px-2 py-0.5 rounded-full text-xs ${getEntityTypeColor(entity.entity)}`}>
                    {entity.entity}
                  </span>
                  <span className="font-medium">{entity.value}</span>
                  <span className={`text-xs ${getConfidenceColor(entity.confidence)}`}>
                    {Math.round(entity.confidence * 100)}%
                  </span>
                </div>
              ))}
              {extractedEntities.length > 10 && (
                <span className="text-xs text-gray-500 px-2 py-1">
                  +{extractedEntities.length - 10} more...
                </span>
              )}
            </div>
          </div>
        )}

        <div className="flex justify-end">
          <Button
            onClick={handleProcess}
            disabled={isProcessing || notes.trim().length < 10}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                Processing...
              </>
            ) : (
              <>
                <Brain size={16} />
                Analyze with AI
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ClinicalNotesInput;