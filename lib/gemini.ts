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
    const model = client.getGenerativeModel({ model: 'gemini-2.5-flash' });

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

const SUMMARY_PROMPT = `You are an expert Academic Data Analyst. A professor is relying on you to generate an insightful performance report based on student interaction data. Use the input data to produce a report in the following EXACT Markdown format. Be professional, supportive, and highly specific.

---

## 📊 Executive Summary
A 2-3 sentence overview of the class's overall progress. Mention the current phase (Developing/Progressing/Strong), average engagement, and overall trend.

## ⚠️ Weak Areas & Misconceptions
Identify patterns from the list of student questions and weak concepts. Group similar issues together. If multiple students struggle with the same concept, flag it clearly.

- **[Concept Name]**: [Brief explanation of the misconception and how many students are affected]

## 📚 Topics for Revision
Based on question volume and low confidence scores, the top topics the professor should re-teach are:

1. [Topic 1] — [Why it needs revision]
2. [Topic 2] — [Why it needs revision]
3. [Topic 3] — [Why it needs revision]

## 🚀 Actionable Improvement Plan
Two specific strategies the professor can use to help students move from "Developing" to "Proficient":

1. **[Strategy Name]**: [Specific, actionable description]
2. **[Strategy Name]**: [Specific, actionable description]

---

IMPORTANT: Return ONLY the Markdown content above. Do not add any preamble or closing remarks outside the defined sections. If data is insufficient for a topic, state "Insufficient data for individual feedback."`;

export async function generateClassroomSummary(topicsData: string): Promise<string> {
  try {
    const client = getClient();
    const model = client.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `${SUMMARY_PROMPT}\n\n---\n**Class Performance Data:**\n${topicsData}`;
    const result = await model.generateContent(prompt);
    
    return result.response.text().trim();
  } catch (err) {
    console.error('Gemini classroom summary error:', err);
    return "## 📊 Executive Summary\n\nThe AI summary is currently unavailable. Please review the charts below to identify areas where your students may need additional revision.";
  }
}
