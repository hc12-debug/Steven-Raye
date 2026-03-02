import React, { useState } from 'react';
import { generateJobDescription } from '../services/geminiService';
import { JobDescriptionResult } from '../types';
import Card from './common/Card';
import Button from './common/Button';
import Loader from './common/Loader';
import { FileTextIcon } from './icons/FileTextIcon';

const JobDescriptionGenerator: React.FC = () => {
    const [title, setTitle] = useState('');
    const [keywords, setKeywords] = useState('');
    const [tone, setTone] = useState('Professional');
    const [description, setDescription] = useState<JobDescriptionResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGenerate = async () => {
        if (!title.trim() || !keywords.trim()) {
            setError('Please provide a job title and some keywords.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setDescription(null);
        try {
            const result = await generateJobDescription({ title, keywords, tone });
            setDescription(result);
        } catch (e: any) {
            setError(e.message || 'Failed to generate job description. Please try again.');
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            <Card>
                <div className="flex items-center mb-4">
                    <FileTextIcon className="w-8 h-8 text-indigo-600" />
                    <h2 className="text-2xl font-bold ml-3">Job Description Generator</h2>
                </div>
                <p className="text-slate-600 mb-6">Enter the job details below, and Gemini will craft a compelling job description for you.</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="job-title" className="block text-sm font-medium text-slate-700 mb-1">Job Title</label>
                        <input
                            id="job-title"
                            type="text"
                            className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g., Senior Frontend Engineer"
                        />
                    </div>
                    <div>
                        <label htmlFor="tone" className="block text-sm font-medium text-slate-700 mb-1">Tone of Voice</label>
                        <select
                            id="tone"
                            className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition bg-white"
                            value={tone}
                            onChange={(e) => setTone(e.target.value)}
                        >
                            <option>Professional</option>
                            <option>Casual</option>
                            <option>Enthusiastic</option>
                            <option>Formal</option>
                            <option>Playful</option>
                        </select>
                    </div>
                </div>

                <div className="mt-6">
                    <label htmlFor="keywords" className="block text-sm font-medium text-slate-700 mb-1">Key Responsibilities & Skills</label>
                    <textarea
                        id="keywords"
                        className="w-full h-32 p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                        value={keywords}
                        onChange={(e) => setKeywords(e.target.value)}
                        placeholder="e.g., React, TypeScript, UI/UX design, agile methodologies, REST APIs, state management..."
                    ></textarea>
                </div>
                <div className="mt-6">
                    <Button onClick={handleGenerate} disabled={isLoading}>
                        {isLoading ? <Loader /> : 'Generate Description'}
                    </Button>
                </div>
            </Card>

            {error && <div className="text-red-500 text-center p-4 bg-red-50 rounded-lg">{error}</div>}

            {description && (
                <Card>
                    <h3 className="text-2xl font-bold mb-2">{description.jobTitle}</h3>
                    <p className="text-slate-600 mb-6">{description.summary}</p>
                    <div className="space-y-6">
                        <div>
                            <h4 className="font-bold text-lg mb-2 text-slate-800">Responsibilities</h4>
                            <ul className="list-disc list-inside space-y-2 text-slate-700 pl-2">
                                {description.responsibilities.map((item, index) => <li key={index}>{item}</li>)}
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold text-lg mb-2 text-slate-800">Qualifications</h4>
                            <ul className="list-disc list-inside space-y-2 text-slate-700 pl-2">
                                {description.qualifications.map((item, index) => <li key={index}>{item}</li>)}
                            </ul>
                        </div>
                    </div>
                </Card>
            )}
        </div>
    );
};

export default JobDescriptionGenerator;
