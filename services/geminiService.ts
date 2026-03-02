
import { GoogleGenAI, Type } from "@google/genai";
import {
  JobDescriptionParams,
  JobDescriptionResult,
  HayEvaluationResult,
  SwotAnalysisResult,
  SurveyAnalysisResult,
} from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

async function generateStructuredResponse<T>(prompt: string, schema: any, modelName: string = "gemini-3-pro-preview"): Promise<T> {
  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
        temperature: 0.1,
      },
    });

    const text = response.text.trim();
    const jsonStr = text.replace(/^```json\n?/, '').replace(/\n?```$/, '');
    return JSON.parse(jsonStr) as T;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Gagal mendapatkan respon valid dari model AI. Silakan coba lagi.");
  }
}

export const generateJobDescription = async (
  params: JobDescriptionParams
): Promise<JobDescriptionResult> => {
  const { title, keywords, tone } = params;
  const prompt = `Generate a job description for "${title}". Tone: ${tone}. Keywords: ${keywords}.`;
  const schema = {
    type: Type.OBJECT,
    properties: {
      jobTitle: { type: Type.STRING },
      summary: { type: Type.STRING },
      responsibilities: { type: Type.ARRAY, items: { type: Type.STRING } },
      qualifications: { type: Type.ARRAY, items: { type: Type.STRING } },
    },
    required: ["jobTitle", "summary", "responsibilities", "qualifications"],
  };
  return generateStructuredResponse<JobDescriptionResult>(prompt, schema, "gemini-3-flash-preview");
};

export const evaluateJobByHayMethod = async (
  jobTitle: string,
  description: string
): Promise<HayEvaluationResult> => {
  const prompt = `Anda adalah konsultan HR ahli yang SANGAT AKURAT. Anda **WAJIB** mereplikasi **LOGIKA DAN RUMUS EXCEL SPESIFIK** berikut.

**ATURAN NAMA JABATAN:**
Field "title" harus PERSIS: "${jobTitle}".

**DERET HAY POINT RESMI (Gunakan untuk Hitung Step Profile):**
4, 5, 6, 7, 8, 9, 10, 12, 14, 16, 19, 22, 25, 29, 33, 38, 43, 50, 57, 66, 76, 87, 100, 115, 132, 152, 175, 200, 230, 264, 304, 350, 400, 460, 528, 608, 700, 800, 920, 1056, 1216, 1400.

---
**MATRIKS LOOKUP 2: PROBLEM SOLVING (PS%) - ATURAN HARD-CODED:**
- Level D: 16%, 22%, **29%**, 38%, 50%
- Level D+: 19%, 25%, **33%**, 43%, 57%
- **WAJIB:** Jika TE=D dan TC=3, maka PS% = **29%**. (JANGAN GUNAKAN 33%).
- **WAJIB:** Jika TE=D+ dan TC=3, baru gunakan PS% = **33%**.

PS Score = KH Score * PS%. Bulatkan ke Hay Point Resmi TERDEKAT.

---
**MATRIKS LOOKUP 3: ACCOUNTABILITY (A) - ATURAN HARD-CODED:**
- Level E, Magnitude 2, Impact Type P (E-2-P) = **200**.

---
**ATURAN FORMAT PROFILE (KRITIS):**
Field "profile" **HANYA BOLEH** berisi kode singkat (Short Code). JANGAN ADA PENJELASAN TEKSTUAL.
- Jika Accountability Point (A) > Problem Solving Point (PS): Gunakan "A" + jumlah step. Contoh: "A1", "A2", "A3".
- Jika Problem Solving Point (PS) > Accountability Point (A): Gunakan "P" + jumlah step. Contoh: "P1", "P2", "P3".
- Jika A == PS: Gunakan "L" (Level).
- Contoh: Jika PS=87 dan A=115, A adalah 1 step di atas PS dalam deret Hay, maka profile = "A1".

---
**MATRIKS LOOKUP 4: SALARY GRADE (HRL)**
0-33=0, 34-39=1, 40-46=2, 47-53=3, 54-62=4, 63-72=5, 73-84=6, 85-97=7, 98-113=8, 114-134=9, 135-160=10, 161-191=11, 192-227=12, 228-268=13, 269-313=14, 314-370=15, 371-438=16, 439-518=17, 519-613=18, 614-734=19, 735-879=20, 880-1055=21, 1056-1260=22.

---
**TUGAS:**
Analisis Jabatan: ${jobTitle}
Deskripsi: ${description}

Hasilkan output JSON presisi dengan field 'profile' hanya berupa kode singkat (A1/P2/L/dll).`;

  const factorResultSchema = {
    type: Type.OBJECT,
    properties: { level: { type: Type.STRING }, justification: { type: Type.STRING } },
    required: ["level", "justification"]
  };

  const schema = {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING },
      knowHow: {
        type: Type.OBJECT,
        properties: { 
          depth: factorResultSchema, 
          breadth: factorResultSchema, 
          relations: factorResultSchema, 
          score: { type: Type.NUMBER } 
        },
        required: ["depth", "breadth", "relations", "score"]
      },
      problemSolving: {
        type: Type.OBJECT,
        properties: { 
          environment: factorResultSchema, 
          challenge: factorResultSchema, 
          percentage: { type: Type.STRING }, 
          score: { type: Type.NUMBER } 
        },
        required: ["environment", "challenge", "percentage", "score"]
      },
      accountability: {
        type: Type.OBJECT,
        properties: { 
          freedom: factorResultSchema, 
          area: factorResultSchema, 
          impact: factorResultSchema, 
          score: { type: Type.NUMBER } 
        },
        required: ["freedom", "area", "impact", "score"]
      },
      profile: { type: Type.STRING },
      totalScore: { type: Type.NUMBER },
      salaryGrade: { type: Type.NUMBER },
    },
    required: ["knowHow", "problemSolving", "accountability", "profile", "totalScore", "salaryGrade", "title"],
  };

  return generateStructuredResponse<HayEvaluationResult>(prompt, schema, "gemini-3-pro-preview");
};

export const generateSwotAnalysis = async (d: string): Promise<SwotAnalysisResult> => {
  const p = `Generate SWOT for: ${d}`;
  const s = { 
    type: Type.OBJECT, 
    properties: { 
      strengths: { type: Type.ARRAY, items: { type: Type.STRING } }, 
      weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } }, 
      opportunities: { type: Type.ARRAY, items: { type: Type.STRING } }, 
      threats: { type: Type.ARRAY, items: { type: Type.STRING } } 
    }, 
    required: ["strengths", "weaknesses", "opportunities", "threats"] 
  };
  return generateStructuredResponse<SwotAnalysisResult>(p, s);
};

export const analyzeSurveyFeedback = async (f: string): Promise<SurveyAnalysisResult> => {
  const p = `Analyze feedback: ${f}`;
  const s = { 
    type: Type.OBJECT, 
    properties: { 
      sentiment: { type: Type.STRING }, 
      summary: { type: Type.STRING }, 
      keyThemes: { type: Type.ARRAY, items: { type: Type.STRING } }, 
      suggestions: { type: Type.ARRAY, items: { type: Type.STRING } } 
    }, 
    required: ["sentiment", "summary", "keyThemes", "suggestions"] 
  };
  return generateStructuredResponse<SurveyAnalysisResult>(p, s);
};
