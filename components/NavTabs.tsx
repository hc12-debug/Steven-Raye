import React from 'react';
import { ActiveTool } from '../types';
import { CrosshairIcon } from './icons/CrosshairIcon';
import { SmileIcon } from './icons/SmileIcon';
import { FileTextIcon } from './icons/FileTextIcon';
import { AwardIcon } from './icons/AwardIcon';

interface NavTabsProps {
  activeTool: ActiveTool;
  setActiveTool: (tool: ActiveTool) => void;
}

const NavTabs: React.FC<NavTabsProps> = ({ activeTool, setActiveTool }) => {
  const tabs = [
    { id: ActiveTool.JobDescription, label: 'Job Description', icon: <FileTextIcon className="w-5 h-5 mr-2" /> },
    { id: ActiveTool.JobEvaluation, label: 'Job Evaluation', icon: <AwardIcon className="w-5 h-5 mr-2" /> },
    { id: ActiveTool.SwotAnalysis, label: 'SWOT Analysis', icon: <CrosshairIcon className="w-5 h-5 mr-2" /> },
    { id: ActiveTool.SurveyAnalyzer, label: 'Survey Analyzer', icon: <SmileIcon className="w-5 h-5 mr-2" /> },
  ];

  return (
    <div className="border-b border-slate-200">
      <nav className="-mb-px flex flex-wrap" aria-label="Tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTool(tab.id)}
            className={`
              ${activeTool === tab.id
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }
              whitespace-nowrap flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ease-in-out mr-4 md:mr-8
            `}
            aria-current={activeTool === tab.id ? 'page' : undefined}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default NavTabs;
