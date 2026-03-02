import React, { useState } from 'react';
import { generateSwotAnalysis } from '../services/geminiService';
import { SwotAnalysisResult } from '../types';
import Card from './common/Card';
import Button from './common/Button';
import Loader from './common/Loader';
import { CrosshairIcon } from './icons/CrosshairIcon';

const SwotAnalysis: React.FC = () => {
  const [description, setDescription] = useState('');
  const [analysis, setAnalysis] = useState<SwotAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!description.trim()) {
      setError('Please provide a description.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setAnalysis(null);
    try {
      const result = await generateSwotAnalysis(description);
      setAnalysis(result);
    } catch (e: any) {
      setError(e.message || 'Failed to generate SWOT analysis. Please try again.');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const renderAnalysisSection = (title: string, items: string[], color: string, icon: React.ReactNode) => (
    <div className={`p-4 rounded-lg ${color}`}>
        <h3 className="flex items-center text-lg font-bold mb-2">
            {icon}
            <span className="ml-2">{title}</span>
        </h3>
        <ul className="list-disc list-inside space-y-1 text-sm">
            {items.map((item, index) => (
                <li key={index}>{item}</li>
            ))}
        </ul>
    </div>
  );

  return (
    <div className="space-y-8">
      <Card>
        <div className="flex items-center mb-4">
          <CrosshairIcon className="w-8 h-8 text-indigo-600" />
          <h2 className="text-2xl font-bold ml-3">SWOT Analysis Generator</h2>
        </div>
        <p className="text-slate-600 mb-4">
          Describe your company, team, or project, and Gemini will generate a Strengths, Weaknesses, Opportunities, and Threats analysis.
        </p>
        <textarea
          className="w-full h-40 p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="e.g., We are a startup building a new project management tool..."
        />
        <div className="mt-4">
          <Button onClick={handleGenerate} disabled={isLoading}>
            {isLoading ? <Loader /> : 'Generate Analysis'}
          </Button>
        </div>
      </Card>

      {error && <div className="text-red-500 text-center">{error}</div>}

      {analysis && (
        <Card>
            <h3 className="text-xl font-bold mb-6 text-center">SWOT Analysis Results</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {renderAnalysisSection('Strengths', analysis.strengths, 'bg-green-50 text-green-800', <span className="text-green-500 font-bold">S</span>)}
                {renderAnalysisSection('Weaknesses', analysis.weaknesses, 'bg-red-50 text-red-800', <span className="text-red-500 font-bold">W</span>)}
                {renderAnalysisSection('Opportunities', analysis.opportunities, 'bg-blue-50 text-blue-800', <span className="text-blue-500 font-bold">O</span>)}
                {renderAnalysisSection('Threats', analysis.threats, 'bg-yellow-50 text-yellow-800', <span className="text-yellow-500 font-bold">T</span>)}
            </div>
        </Card>
      )}
    </div>
  );
};

export default SwotAnalysis;
