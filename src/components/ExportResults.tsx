import React from 'react';
import { DiagnosticResult } from '../types';
import { Button } from './ui/Button';

interface ExportResultsProps {
  result: DiagnosticResult | null;
}

const ExportResults: React.FC<ExportResultsProps> = ({ result }) => {
  if (!result) {
    return (
      <p className="text-red-500">No results available to export. Please process the data first.</p>
    );
  }

  const handleExportJSON = () => {
    const dataStr = JSON.stringify(result, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `thoracic-diagnostic-${new Date().toISOString().slice(0, 10)}.json`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };
  
  const handleExportCSV = () => {
    // Format patient data as CSV
    const patientData = result.patient;
    const riskScores = result.riskScores;
    
    const headers = [
      'ID', 'Age', 'Gender', 'Smoking Status', 'Obesity', 'Balanced Diet',
      'Chronic Lung Disease', 'Family History', 'Weight Loss', 'Oxygen Therapy',
      'Exposure to Toxins', 'Cancer Type', 'Cancer Confidence',
      'Recurrence Risk', 'Complication Risk', 'Survival Probability'
    ];
    
    const values = [
      patientData.id,
      patientData.age,
      patientData.gender,
      patientData.smoking,
      patientData.obesity,
      patientData.balancedDiet,
      patientData.chronicLungDisease,
      patientData.familyHistory,
      patientData.weightLoss,
      patientData.oxygenTherapy,
      patientData.exposureToToxins,
      result.cancerPrediction.type,
      result.cancerPrediction.confidence,
      riskScores.recurrenceRisk,
      riskScores.complicationRisk,
      riskScores.survivalProbability
    ];
    
    const csvContent = [
      headers.join(','),
      values.join(',')
    ].join('\n');
    
    const dataUri = 'data:text/csv;charset=utf-8,'+ encodeURIComponent(csvContent);
    const exportFileDefaultName = `thoracic-diagnostic-${new Date().toISOString().slice(0, 10)}.csv`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };
  
  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div className="flex flex-wrap gap-3 mt-4">
      <Button 
        onClick={handleExportJSON}
        variant="secondary"
        className="text-sm"
      >
        Export JSON
      </Button>
      
      <Button 
        onClick={handleExportCSV}
        variant="secondary"
        className="text-sm"
      >
        Export CSV
      </Button>
      
      <Button 
        onClick={handlePrintReport}
        variant="outline"
        className="text-sm"
      >
        Print Report
      </Button>
    </div>
  );
};

export default ExportResults;
