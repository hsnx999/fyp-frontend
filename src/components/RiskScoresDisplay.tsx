import React, { useMemo } from 'react';
import { RiskScores, CancerPrediction } from '../types';

interface RiskScoresDisplayProps {
  riskScores: RiskScores;
  cancerPrediction: CancerPrediction;
}

const RiskScoresDisplay: React.FC<RiskScoresDisplayProps> = ({ 
  riskScores, 
  cancerPrediction 
}) => {
  const formatPercentage = (value: number) => {
    return `${Math.round(value * 100)}%`;
  };

  const getRiskColor = (value: number, isPositive: boolean = false) => {
    if (isPositive) {
      // For positive scores (like survival), higher is better
      if (value >= 0.7) return 'bg-green-500';
      if (value >= 0.4) return 'bg-yellow-500';
      return 'bg-red-500';
    } else {
      // For risk scores, lower is better
      if (value <= 0.3) return 'bg-green-500';
      if (value <= 0.6) return 'bg-yellow-500';
      return 'bg-red-500';
    }
  };

  const getRiskLabel = (value: number, isPositive: boolean = false) => {
    if (isPositive) {
      // For positive scores (like survival)
      if (value >= 0.7) return 'High';
      if (value >= 0.4) return 'Moderate';
      return 'Low';
    } else {
      // For risk scores
      if (value <= 0.3) return 'Low';
      if (value <= 0.6) return 'Moderate';
      return 'High';
    }
  };

  // Memoize formatted risk scores to avoid recalculating on every render
  const formattedRiskScores = useMemo(() => ({
    recurrenceRisk: formatPercentage(riskScores.recurrenceRisk),
    complicationRisk: formatPercentage(riskScores.complicationRisk),
    survivalProbability: formatPercentage(riskScores.survivalProbability),
  }), [riskScores]);

  if (!riskScores || !cancerPrediction) {
    return <div className="text-center text-red-500">Data is unavailable.</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 animate-fadeIn">
      <h2 className="text-xl font-semibold text-gray-800 mb-3">Diagnostic Results</h2>
      
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-700 mb-2">Cancer Type Prediction</h3>
        <div className="flex items-center">
          <div className="flex-1">
            <p className="text-xl font-bold text-blue-800">{cancerPrediction.type}</p>
            <p className="text-sm text-gray-500">
              Confidence: {formatPercentage(cancerPrediction.confidence)}
            </p>
          </div>
        </div>
      </div>
      
      <h3 className="text-lg font-medium text-gray-700 mb-3">Risk Assessment</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Recurrence Risk */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-md font-medium text-gray-700">Recurrence Risk</h4>
            <span className="text-md font-bold">{formattedRiskScores.recurrenceRisk}</span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2.5 mb-1">
            <div 
              className={`h-2.5 rounded-full ${getRiskColor(riskScores.recurrenceRisk)}`} 
              style={{ width: `${riskScores.recurrenceRisk * 100}%` }}
              aria-label={`Recurrence Risk: ${getRiskLabel(riskScores.recurrenceRisk)}`}
            ></div>
          </div>
          
          <p className="text-right text-sm text-gray-500">
            Risk Level: <span className="font-medium">{getRiskLabel(riskScores.recurrenceRisk)}</span>
          </p>
        </div>
        
        {/* Complication Risk */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-md font-medium text-gray-700">Complication Risk</h4>
            <span className="text-md font-bold">{formattedRiskScores.complicationRisk}</span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2.5 mb-1">
            <div 
              className={`h-2.5 rounded-full ${getRiskColor(riskScores.complicationRisk)}`} 
              style={{ width: `${riskScores.complicationRisk * 100}%` }}
              aria-label={`Complication Risk: ${getRiskLabel(riskScores.complicationRisk)}`}
            ></div>
          </div>
          
          <p className="text-right text-sm text-gray-500">
            Risk Level: <span className="font-medium">{getRiskLabel(riskScores.complicationRisk)}</span>
          </p>
        </div>
        
        {/* Survival Probability */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-md font-medium text-gray-700">Survival Probability</h4>
            <span className="text-md font-bold">{formattedRiskScores.survivalProbability}</span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2.5 mb-1">
            <div 
              className={`h-2.5 rounded-full ${getRiskColor(riskScores.survivalProbability, true)}`} 
              style={{ width: `${riskScores.survivalProbability * 100}%` }}
              aria-label={`Survival Probability: ${getRiskLabel(riskScores.survivalProbability, true)}`}
            ></div>
          </div>
          
          <p className="text-right text-sm text-gray-500">
            Probability: <span className="font-medium">{getRiskLabel(riskScores.survivalProbability, true)}</span>
          </p>
        </div>
      </div>
      
      <div className="mt-6 text-sm text-gray-500">
        <p className="font-medium mb-1">Risk Assessment Disclaimer:</p>
        <p>These risk scores are derived from a rule-based algorithm using the provided patient data. They should be used as a clinical decision support tool only and not as a sole basis for treatment decisions. Always exercise clinical judgment and consider the full patient context.</p>
      </div>
    </div>
  );
};

export default RiskScoresDisplay;
