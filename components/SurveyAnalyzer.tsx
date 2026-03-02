import React, { useState } from 'react';
import { analyzeSurveyFeedback } from '../services/geminiService';
import { SurveyAnalysisResult } from '../types';
import Card from './common/Card';
import Button from './common/Button';
import Loader from './common/Loader';
import { SmileIcon } from './icons/SmileIcon';

const SurveyAnalyzer: React.FC = () => {
  const [feedback, setFeedback] = useState('');
  const [analysis, setAnalysis] = useState<SurveyAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!feedback.trim()) {
      setError('Please provide survey feedback to analyze.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setAnalysis(null);
    try {
      const result = await analyzeSurveyFeedback(feedback);
      setAnalysis(result);
    } catch (e: any) {
      setError(e.message || 'Failed to analyze feedback. Please try again.');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const getSentimentBadgeClass = (sentiment: SurveyAnalysisResult['sentiment']) => {
    switch (sentiment) {
      case 'Positive': return 'bg-green-100 text-green-800';
      case 'Negative': return 'bg-red-100 text-red-800';
      case 'Neutral': return 'bg-slate-100 text-slate-800';
      case 'Mixed': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-8">
      <Card>
        <div className="flex items-center mb-4">
          <SmileIcon className="w-8 h-8 text-indigo-600" />
          <h2 className="text-2xl font-bold ml-3">Team Morale Analyzer</h2>
        </div>
        <p className="text-slate-600 mb-4">
          Paste anonymous survey feedback to get an AI-powered summary of team morale, key themes, and actionable suggestions.
        </p>
        <textarea
          className="w-full h-60 p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="e.g., 'Communication could be better.' 'Love the new flexible work policy!' 'Project deadlines feel tight.'"
        />
        <div className="mt-4">
          <Button onClick={handleAnalyze} disabled={isLoading}>
            {isLoading ? <Loader /> : 'Analyze Feedback'}
          </Button>
        </div>
      </Card>

      {error && <div className="text-red-500 text-center">{error}</div>}

      {analysis && (
        <Card>
            <h3 className="text-xl font-bold mb-6 text-center">Feedback Analysis Results</h3>
            <div className="space-y-6">
                <div>
                    <h4 className="font-bold text-lg mb-2">Overall Sentiment</h4>
                    <span className={`px-3 py-1 text-sm font-medium rounded-full ${getSentimentBadgeClass(analysis.sentiment)}`}>
                        {analysis.sentiment}
                    </span>
                </div>
                <div>
                    <h4 className="font-bold text-lg mb-2">Executive Summary</h4>
                    <p className="text-slate-700 bg-slate-100 p-4 rounded-md">{analysis.summary}</p>
                </div>
                <div>
                    <h4 className="font-bold text-lg mb-2">Key Themes</h4>
                    <ul className="list-disc list-inside space-y-1 text-slate-700">
                        {analysis.keyThemes.map((theme, index) => (
                            <li key={index}>{theme}</li>
                        ))}
                    </ul>
                </div>
                <div>
                    <h4 className="font-bold text-lg mb-2">Actionable Suggestions</h4>
                    <ul className="list-decimal list-inside space-y-2 text-slate-700">
                        {analysis.suggestions.map((suggestion, index) => (
                            <li key={index}>{suggestion}</li>
                        ))}
                    </ul>
                </div>
            </div>
        </Card>
      )}
    </div>
  );
};

export default SurveyAnalyzer;
