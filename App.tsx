import React, { useState } from 'react';
import { ActiveTool } from './types';
import Header from './components/Header';
import NavTabs from './components/NavTabs';
import SwotAnalysis from './components/SwotAnalysis';
import SurveyAnalyzer from './components/SurveyAnalyzer';
import JobDescriptionGenerator from './components/JobDescriptionGenerator';
import JobEvaluation from './components/JobEvaluation';

const App: React.FC = () => {
  const [activeTool, setActiveTool] = useState<ActiveTool>(ActiveTool.JobDescription);

  const renderActiveTool = () => {
    switch (activeTool) {
      case ActiveTool.JobDescription:
        return <JobDescriptionGenerator />;
      case ActiveTool.JobEvaluation:
        return <JobEvaluation />;
      case ActiveTool.SwotAnalysis:
        return <SwotAnalysis />;
      case ActiveTool.SurveyAnalyzer:
        return <SurveyAnalyzer />;
      default:
        return <JobDescriptionGenerator />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      <Header />
      <main className="container mx-auto p-4 md:p-8">
        <NavTabs activeTool={activeTool} setActiveTool={setActiveTool} />
        <div className="mt-8">
          {renderActiveTool()}
        </div>
      </main>
       <footer className="text-center p-4 text-slate-500 text-sm">
          <p>Powered by Gemini API</p>
        </footer>
    </div>
  );
};

export default App;
