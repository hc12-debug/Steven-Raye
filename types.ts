
export enum ActiveTool {
  JobDescription = 'job-description',
  JobEvaluation = 'job-evaluation',
  SwotAnalysis = 'swot-analysis',
  SurveyAnalyzer = 'survey-analyzer',
}

export interface JobDescriptionParams {
  title: string;
  keywords: string;
  tone: string;
}

export interface JobDescriptionResult {
  jobTitle: string;
  summary: string;
  responsibilities: string[];
  qualifications: string[];
}

export interface FactorResult {
  level: string;
  justification: string;
}

export interface HayEvaluationResult {
  title: string;
  knowHow: {
    depth: FactorResult;
    breadth: FactorResult;
    relations: FactorResult;
    score: number;
  };
  problemSolving: {
    environment: FactorResult;
    challenge: FactorResult;
    percentage: string;
    score: number;
  };
  accountability: {
    freedom: FactorResult;
    area: FactorResult;
    impact: FactorResult;
    score: number;
  };
  profile: string;
  totalScore: number;
  salaryGrade: number;
}

export interface SwotAnalysisResult {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
}

export interface SurveyAnalysisResult {
  sentiment: 'Positive' | 'Negative' | 'Neutral' | 'Mixed';
  summary: string;
  keyThemes: string[];
  suggestions: string[];
}
