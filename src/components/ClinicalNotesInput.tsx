import React, { useState } from 'react';
import { Button } from './ui/Button';

interface ClinicalNotesInputProps {
  onProcess: (extractedEntities: any[]) => void;
}

const ClinicalNotesInput: React.FC<ClinicalNotesInputProps> = ({ onProcess }) => {
  const [notes, setNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleProcess = async () => {
    if (notes.trim().length < 10) return;

    setIsProcessing(true);
    setError(null);

    try {
      const response = await fetch("http://localhost:5000/api/ner", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ notes }),
      });

      if (!response.ok) throw new Error("NER extraction failed");

      const data = await response.json();
      onProcess(data.entities || []);
    } catch (err) {
      console.error("NER error:", err);
      setError("There was an error extracting entities. Check the API server.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-3">Clinical Notes</h2>
      <p className="text-sm text-gray-600 mb-4">
        Enter the patient's clinical notes to extract medical entities.
      </p>
      <textarea
        className="w-full h-40 p-3 border border-gray-300 rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="e.g., 65-year-old male, smoker with persistent cough and weight loss..."
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />
      {error && <p className="text-red-600 text-sm mb-2">{error}</p>}
      <div className="flex justify-end">
        <Button
          onClick={handleProcess}
          disabled={isProcessing || notes.trim().length < 10}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200"
        >
          {isProcessing ? 'Processing...' : 'Process Notes'}
        </Button>
      </div>
    </div>
  );
};

export default ClinicalNotesInput;
