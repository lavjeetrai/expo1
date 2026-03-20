import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY || '';

let genAI: GoogleGenerativeAI | null = null;

function getClient() {
  if (!genAI) {
    if (!apiKey) throw new Error('GEMINI_API_KEY is not set in environment variables');
    genAI = new GoogleGenerativeAI(apiKey);
  }
  return genAI;
}

export interface AnalysisResult {
  topic: string;
  weakConcepts: string[];
  confidenceScore: number;
  aiFeedback: string;
}

const SYSTEM_PROMPT = `You are an educational AI analyst. Analyze the student's academic content and return a JSON object with:
- topic: The specific academic topic/concept being asked about or submitted (1 concise phrase, e.g. "Binary Search Trees", "Pointer Arithmetic", "Photosynthesis")
- weakConcepts: Array of 2-4 specific sub-concepts the student seems to struggle with (each max 4 words)
- confidenceScore: Integer 0-100 estimating the student's understanding (0=completely lost, 50=partial, 100=fully understands)
- aiFeedback: 1-2 sentence constructive observation about the student's understanding gap

Return ONLY valid JSON, no markdown, no explanation.`;

export async function analyzeStudentContent(content: string): Promise<AnalysisResult> {
  try {
    const client = getClient();
    const model = client.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `${SYSTEM_PROMPT}\n\nStudent content:\n"${content}"`;
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    // Strip markdown code fences if present
    const cleaned = text.replace(/```json\n?|\n?```/g, '').trim();
    const parsed = JSON.parse(cleaned) as AnalysisResult;

    return {
      topic: parsed.topic || 'General',
      weakConcepts: Array.isArray(parsed.weakConcepts) ? parsed.weakConcepts.slice(0, 4) : [],
      confidenceScore: Math.max(0, Math.min(100, Number(parsed.confidenceScore) || 50)),
      aiFeedback: parsed.aiFeedback || '',
    };
  } catch (err) {
    console.error('Gemini analysis error:', err);
    // Fallback — don't block the main flow
    return {
      topic: 'General',
      weakConcepts: [],
      confidenceScore: 50,
      aiFeedback: 'Analysis unavailable.',
    };
  }
}
