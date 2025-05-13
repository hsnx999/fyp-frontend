import React, { useState } from 'react';
import { Button } from './ui/Button';

interface CTScanUploaderProps {
  onPrediction: (prediction: CancerPrediction) => void;
}

const CTScanUploader: React.FC<CTScanUploaderProps> = ({ onPrediction }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleAnalysis = async () => {
    if (!selectedFile) return;
  
    setIsProcessing(true);
    const formData = new FormData();
    formData.append("image", selectedFile);
  
    try {
      const response = await fetch("http://localhost:5000/api/predict", {
        method: "POST",
        body: formData,
      });
  
      if (!response.ok) throw new Error("Prediction failed");
  
      const prediction = await response.json();
      onPrediction(prediction);
    } catch (error) {
      console.error("Prediction error:", error);
      alert("There was an error analyzing the scan.");
    } finally {
      setIsProcessing(false);
    }
  };


  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-3">CT Scan Analysis</h2>
      <p className="text-sm text-gray-600 mb-4">
        Upload a CT scan image to begin the analysis.
      </p>
      
      <div 
        className={`border-2 border-dashed ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'} rounded-md p-6 mb-4 text-center flex flex-col items-center justify-center`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <svg 
          className="w-12 h-12 text-gray-400 mb-3" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth="2" 
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        
        <p className="text-sm text-gray-500 mb-2">
          {selectedFile ? selectedFile.name : 'Drag & drop your CT scan image here'}
        </p>
        
        <p className="text-xs text-gray-400 mb-3">
          {!selectedFile && 'or'}
        </p>
        
        <label className={`cursor-pointer inline-flex items-center px-4 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 transition duration-200 ${selectedFile ? 'hidden' : ''}`}>
          <span>Select File</span>
          <input
            type="file"
            className="hidden"
            accept="image/*,.dcm"
            onChange={handleFileChange}
          />
        </label>
      </div>
      
      <div className="flex justify-end">
        <Button 
          onClick={handleAnalysis} 
          disabled={isProcessing || !selectedFile}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200"
        >
          {isProcessing ? 'Analyzing...' : 'Run CT Analysis'}
        </Button>
      </div>
    </div>
  );
};

export default CTScanUploader;