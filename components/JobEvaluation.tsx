
import React, { useState, useRef } from 'react';
import { evaluateJobByHayMethod } from '../services/geminiService';
import { HayEvaluationResult } from '../types';
import Card from './common/Card';
import Button from './common/Button';
import Loader from './common/Loader';
import { AwardIcon } from './icons/AwardIcon';
import { FileTextIcon } from './icons/FileTextIcon';

const FactorBox: React.FC<{ label: string; level: string; justification: string }> = ({ label, level, justification }) => (
    <div className="py-3 border-b border-slate-100 last:border-0">
        <div className="flex justify-between items-center mb-1">
            <h5 className="font-bold text-slate-700 text-[10px] uppercase tracking-wider">{label}</h5>
            <span className="text-[10px] font-black px-1.5 py-0.5 rounded border border-slate-200 bg-slate-50 text-slate-600">
                {level}
            </span>
        </div>
        <p className="text-[11px] text-slate-500 leading-tight italic">
            {justification}
        </p>
    </div>
);

const JobEvaluation: React.FC = () => {
  const [jobTitle, setJobTitle] = useState('');
  const [description, setDescription] = useState('');
  const [evaluation, setEvaluation] = useState<HayEvaluationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const reportRef = useRef<HTMLDivElement>(null);

  const handleEvaluate = async () => {
    if (!jobTitle.trim() || !description.trim()) {
      setError('Harap isi Judul Pekerjaan dan Deskripsi Pekerjaan secara lengkap.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setEvaluation(null);
    try {
      const result = await evaluateJobByHayMethod(jobTitle, description);
      setEvaluation(result);
    } catch (e: any) {
      setError(e.message || 'Gagal mengevaluasi deskripsi pekerjaan.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!reportRef.current || !evaluation) return;
    setIsExporting('pdf');
    try {
        const element = reportRef.current;
        const opt = {
            margin: [10, 10],
            filename: `Hay_Report_${jobTitle.replace(/\s+/g, '_')}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true, width: 794 },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };
        // @ts-ignore
        await window.html2pdf().set(opt).from(element).save();
    } catch (err) {
        console.error(err);
    } finally {
        setIsExporting(null);
    }
  };

  const handleDownloadWord = () => {
    if (!evaluation) return;
    setIsExporting('word');
    try {
        const header = `
            <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
            <head><meta charset='utf-8'><title>Hay Report</title>
            <style>
                body { font-family: 'Calibri', sans-serif; color: #333; }
                h1 { color: #1a202c; border-bottom: 2px solid #000; padding-bottom: 5px; }
                table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                td, th { border: 1px solid #ddd; padding: 8px; font-size: 11pt; }
                .label { font-weight: bold; background: #f3f4f6; }
                .score { font-weight: bold; color: #2563eb; }
            </style>
            </head><body>
        `;
        const footer = "</body></html>";
        let content = `<h1>Hay Evaluation Report: ${jobTitle}</h1>`;
        content += `<p>Generated Date: ${new Date().toLocaleDateString()}</p>`;
        content += `<table>
            <tr><td class="label">Total Hay Points</td><td class="score">${evaluation.totalScore}</td></tr>
            <tr><td class="label">Job Profile</td><td class="score">${evaluation.profile}</td></tr>
            <tr><td class="label">Salary Grade</td><td class="score">Grade ${evaluation.salaryGrade}</td></tr>
        </table>`;
        
        content += `<h2>1. Know-How (Score: ${evaluation.knowHow.score})</h2>`;
        content += `<p><b>Depth:</b> ${evaluation.knowHow.depth.level}<br><i>${evaluation.knowHow.depth.justification}</i></p>`;
        content += `<p><b>Breadth:</b> ${evaluation.knowHow.breadth.level}<br><i>${evaluation.knowHow.breadth.justification}</i></p>`;
        content += `<p><b>Relations:</b> ${evaluation.knowHow.relations.level}<br><i>${evaluation.knowHow.relations.justification}</i></p>`;

        content += `<h2>2. Problem Solving (Score: ${evaluation.problemSolving.score})</h2>`;
        content += `<p><b>Environment:</b> ${evaluation.problemSolving.environment.level}<br><i>${evaluation.problemSolving.environment.justification}</i></p>`;
        content += `<p><b>Challenge:</b> ${evaluation.problemSolving.challenge.level}<br><i>${evaluation.problemSolving.challenge.justification}</i></p>`;

        content += `<h2>3. Accountability (Score: ${evaluation.accountability.score})</h2>`;
        content += `<p><b>Freedom:</b> ${evaluation.accountability.freedom.level}<br><i>${evaluation.accountability.freedom.justification}</i></p>`;
        content += `<p><b>Area:</b> ${evaluation.accountability.area.level}<br><i>${evaluation.accountability.area.justification}</i></p>`;
        content += `<p><b>Impact:</b> ${evaluation.accountability.impact.level}<br><i>${evaluation.accountability.impact.justification}</i></p>`;

        const blob = new Blob([header + content + footer], { type: 'application/msword' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `Hay_Report_${jobTitle.replace(/\s+/g, '_')}.doc`;
        link.click();
    } finally {
        setIsExporting(null);
    }
  };

  const handleDownloadImage = async () => {
    if (!reportRef.current || !evaluation) return;
    setIsExporting('image');
    try {
        // @ts-ignore
        const canvas = await html2canvas(reportRef.current, { scale: 2 });
        const imgData = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = imgData;
        link.download = `Hay_Report_${jobTitle.replace(/\s+/g, '_')}.png`;
        link.click();
    } catch (err) {
        console.error(err);
    } finally {
        setIsExporting(null);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-20">
      <Card className="border-t-4 border-slate-900 shadow-xl">
        <div className="flex items-center mb-6">
          <AwardIcon className="w-8 h-8 text-slate-800" />
          <div className="ml-4">
            <h2 className="text-xl font-black text-slate-900 uppercase">Pusat Evaluasi Jabatan</h2>
            <p className="text-[10px] text-slate-400 font-bold tracking-[0.2em] uppercase">CARSURIN OTS TOOLKIT</p>
          </div>
        </div>
        
        <div className="space-y-4">
            <div className="flex flex-col gap-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Nama Jabatan</label>
                <input
                    type="text"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:border-slate-900 outline-none font-bold text-slate-700"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="Contoh: Senior Manager Operations"
                />
            </div>
            
            <div className="flex flex-col gap-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Deskripsi & Akuntabilitas</label>
                <textarea
                  className="w-full h-40 p-3 bg-slate-50 border border-slate-200 rounded-lg focus:border-slate-900 outline-none text-sm leading-relaxed"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Paste Job Description atau Key Accountabilities di sini..."
                />
            </div>
            
            <div className="flex justify-end pt-2">
                <Button onClick={handleEvaluate} disabled={isLoading} className="bg-slate-900 hover:bg-black w-full md:w-auto px-8 py-3 text-xs font-black tracking-widest">
                    {isLoading ? <Loader /> : 'HITUNG EVALUASI'}
                </Button>
            </div>
        </div>
      </Card>

      {error && <div className="text-red-500 font-bold text-center p-4 bg-red-50 rounded-lg text-xs">{error}</div>}

      {evaluation && (
        <div className="space-y-4">
            <div className="flex flex-wrap gap-2 justify-center md:justify-end">
                <button onClick={handleDownloadPdf} disabled={isExporting !== null} className="text-[9px] font-black tracking-tighter uppercase px-4 py-2 bg-white border border-slate-200 rounded hover:bg-slate-50 flex items-center gap-2">
                    {isExporting === 'pdf' ? 'Wait...' : 'Download PDF'}
                </button>
                <button onClick={handleDownloadWord} disabled={isExporting !== null} className="text-[9px] font-black tracking-tighter uppercase px-4 py-2 bg-white border border-slate-200 rounded hover:bg-slate-50 flex items-center gap-2">
                    {isExporting === 'word' ? 'Wait...' : 'Download Word'}
                </button>
                <button onClick={handleDownloadImage} disabled={isExporting !== null} className="text-[9px] font-black tracking-tighter uppercase px-4 py-2 bg-white border border-slate-200 rounded hover:bg-slate-50 flex items-center gap-2">
                    {isExporting === 'image' ? 'Wait...' : 'Download Image'}
                </button>
            </div>

            {/* THE REPORT CONTAINER */}
            <div ref={reportRef} className="bg-white border border-slate-200 shadow-2xl overflow-hidden mx-auto text-slate-800" style={{ width: '794px' }}>
                <div className="p-8 border-b border-slate-100 flex justify-between items-start bg-slate-50/50">
                    <div className="flex-1 pr-4">
                        <h3 className="text-2xl font-black tracking-tighter text-slate-900 leading-tight break-words whitespace-normal uppercase">
                            {jobTitle}
                        </h3>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.3em] mt-2">HAY Group Method Evaluation Report</p>
                    </div>
                    <div className="flex gap-6 border-l border-slate-200 pl-6 flex-shrink-0">
                        <div className="text-center">
                            <p className="text-[8px] font-black text-slate-400 uppercase mb-0.5">Points</p>
                            <p className="text-2xl font-black text-slate-900 leading-none">{evaluation.totalScore}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-[8px] font-black text-slate-400 uppercase mb-0.5">Profile</p>
                            <p className="text-2xl font-black text-indigo-600 leading-none">{evaluation.profile}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-[8px] font-black text-slate-400 uppercase mb-0.5">Grade</p>
                            <p className="text-2xl font-black text-emerald-600 leading-none">{evaluation.salaryGrade}</p>
                        </div>
                    </div>
                </div>

                <div className="p-8 grid grid-cols-3 gap-6">
                    <div className="space-y-1">
                        <div className="border-b-2 border-slate-900 pb-1 mb-2 flex justify-between items-end">
                            <h4 className="text-[9px] font-black uppercase text-slate-900 tracking-widest">1. Know-How</h4>
                            <span className="text-[10px] font-black text-slate-400">{evaluation.knowHow.score}</span>
                        </div>
                        <FactorBox label="Technical Depth" level={evaluation.knowHow.depth.level} justification={evaluation.knowHow.depth.justification} />
                        <FactorBox label="Mgmt Breadth" level={evaluation.knowHow.breadth.level} justification={evaluation.knowHow.breadth.justification} />
                        <FactorBox label="Human Relations" level={evaluation.knowHow.relations.level} justification={evaluation.knowHow.relations.justification} />
                    </div>

                    <div className="space-y-1">
                        <div className="border-b-2 border-slate-900 pb-1 mb-2 flex justify-between items-end">
                            <h4 className="text-[9px] font-black uppercase text-slate-900 tracking-widest">2. Problem Solving</h4>
                            <span className="text-[10px] font-black text-slate-400">{evaluation.problemSolving.score}</span>
                        </div>
                        <p className="text-[8px] font-bold text-slate-400 mb-1">Percentage: {evaluation.problemSolving.percentage}</p>
                        <FactorBox label="Environment" level={evaluation.problemSolving.environment.level} justification={evaluation.problemSolving.environment.justification} />
                        <FactorBox label="Challenge" level={evaluation.problemSolving.challenge.level} justification={evaluation.problemSolving.challenge.justification} />
                    </div>

                    <div className="space-y-1">
                        <div className="border-b-2 border-slate-900 pb-1 mb-2 flex justify-between items-end">
                            <h4 className="text-[9px] font-black uppercase text-slate-900 tracking-widest">3. Accountability</h4>
                            <span className="text-[10px] font-black text-slate-400">{evaluation.accountability.score}</span>
                        </div>
                        <FactorBox label="Freedom to Act" level={evaluation.accountability.freedom.level} justification={evaluation.accountability.freedom.justification} />
                        <FactorBox label="Area/Magnitude" level={evaluation.accountability.area.level} justification={evaluation.accountability.area.justification} />
                        <FactorBox label="Impact Type" level={evaluation.accountability.impact.level} justification={evaluation.accountability.impact.justification} />
                    </div>
                </div>

                <div className="p-6 bg-slate-900 flex justify-between items-center text-white">
                    <div className="flex items-center gap-2">
                        <FileTextIcon className="w-4 h-4 text-white opacity-30" />
                        <p className="text-[8px] font-black uppercase tracking-widest opacity-40">Confidential HR Analytics Report</p>
                    </div>
                    <div className="text-right">
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest opacity-70">
                            PROCESSED BY CARSURIN OTS TOOLKIT - {new Date().toLocaleDateString('id-ID')}
                        </p>
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default JobEvaluation;
