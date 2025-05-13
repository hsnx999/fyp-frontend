import React from 'react';
import { ExtractedEntity } from '../types';

interface ExtractedEntitiesDisplayProps {
  entities: ExtractedEntity[];
}

const ExtractedEntitiesDisplay: React.FC<ExtractedEntitiesDisplayProps> = ({ entities }) => {
  if (!entities || entities.length === 0) {
    return <p className="text-gray-500">No extracted information available.</p>;
  }

  // Group entities by type for better organization
  const groupedEntities: Record<string, ExtractedEntity[]> = {};

  entities.forEach(entity => {
    if (!groupedEntities[entity.entity]) {
      groupedEntities[entity.entity] = [];
    }
    groupedEntities[entity.entity].push(entity);
  });

  // Friendly names for entity types
  const entityNames: Record<string, string> = {
    age: 'Age',
    gender: 'Gender',
    smoking: 'Smoking Status',
    obesity: 'Obesity',
    balancedDiet: 'Balanced Diet',
    chronicLungDisease: 'Chronic Lung Disease',
    familyHistory: 'Family History',
    weightLoss: 'Weight Loss',
    oxygenTherapy: 'Oxygen Therapy',
    exposureToToxins: 'Exposure to Toxins'
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-3">Extracted Information</h2>
      <p className="text-sm text-gray-600 mb-4">
        The following information was extracted from the clinical notes using NLP:
      </p>

      <div className="space-y-4">
        {Object.keys(groupedEntities).map(entityType => (
          <div key={entityType} className="pb-2 border-b border-gray-100">
            <h3 className="text-md font-medium text-gray-700 mb-1">
              {entityNames[entityType] || 'Unknown Entity Type'}
            </h3>

            {groupedEntities[entityType].map((entity, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{entity.value}</span>
                <span
                  className="text-xs px-2 py-1 rounded-full"
                  style={{
                    backgroundColor: `rgba(59, 130, 246, ${entity.confidence})`,
                    color: entity.confidence > 0.7 ? 'white' : 'black'
                  }}
                >
                  {Math.round(entity.confidence * 100)}%
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="mt-4 text-xs text-gray-500">
        <p>Confidence scores indicate the model's certainty in the extracted information.</p>
      </div>
    </div>
  );
};

export default ExtractedEntitiesDisplay;
