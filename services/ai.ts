
import { Note, AIResponse } from '../types';

const API_ENDPOINT = process.env.VITE_API_ENDPOINT;
const API_KEY = process.env.VITE_API_KEY;

// Helper for making API calls
async function callAI(messages: any[], temperature: number = 0.7, jsonMode: boolean = false): Promise<string> {
  if (!navigator.onLine) {
    throw new Error("You are currently offline. Please check your internet connection to use AI features.");
  }

  try {
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: 'gemini', 
        messages: messages,
        temperature: temperature,
        response_format: jsonMode ? { type: "json_object" } : undefined
      }),
    });

    if (!response.ok) {
      throw new Error(`AI API Error: ${response.statusText}`);
    }

    const data: AIResponse = await response.json();
    return data.choices[0]?.message?.content || "Sorry, I couldn't generate a response.";
  } catch (error) {
    console.error("AI Service Error:", error);
    throw error; // Propagate error to handle UI state
  }
}

export const formatNoteMagic = async (text: string): Promise<{ title: string, content: string, tags: string[] }> => {
  const systemPrompt = `
    You are a professional organizer assistant. 
    Your goal is to take messy, unstructured text and format it into clean Markdown with structure.
    
    Rules:
    1. Identify "To-Do" items and list them with GFM checkboxes (e.g., - [ ] Task).
    2. Identify "Events" with times and list them bulleted with bold times (e.g., - **4:00 PM**: Meeting).
    3. Identify generic "Notes" and list them as bullet points.
    4. Generate a short, concise "title" (max 6 words) that summarizes the content.
    5. Generate 2-4 relevant, short hashtags (e.g., "Work", "Shopping").
    6. Return valid JSON object with keys: "title" (string), "markdown" (string) and "tags" (array of strings).
    7. CRITICAL: Detect the language of the input text. The output "markdown" content and "title" MUST be in the EXACT SAME language as the input. Do NOT translate.
  `;

  const result = await callAI([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: text }
  ], 0.5, true);

  try {
    // Strip code fences if present (common issue with Gemini)
    const cleanResult = result.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanResult);
    return {
      title: parsed.title || "",
      content: parsed.markdown || cleanResult,
      tags: parsed.tags || []
    };
  } catch (e) {
    console.error("JSON Parse Error in Magic Format:", e);
    // Fallback if JSON parsing fails completely
    return { title: "", content: result, tags: [] };
  }
};

export const summarizeText = async (text: string): Promise<{ title: string, content: string, tags: string[] }> => {
  const systemPrompt = `
    You are a precise summarizer. 
    Your goal is to read the input text and provide a concise summary in Markdown.
    
    Rules:
    1. Start with a one-sentence high-level overview (bolded).
    2. Follow with a bulleted list of key details/takeaways.
    3. Generate a short "title" (max 6 words).
    4. Generate 2-3 relevant tags (e.g., "Summary", "Research").
    5. Return valid JSON object with keys: "title" (string), "markdown" (string) and "tags" (array of strings).
    6. CRITICAL: Detect the language of the input text. The output MUST be in the EXACT SAME language as the input. Do NOT translate.
  `;

  const result = await callAI([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: text }
  ], 0.5, true);

  try {
    const cleanResult = result.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanResult);
    return {
      title: parsed.title || "",
      content: parsed.markdown || cleanResult,
      tags: parsed.tags || []
    };
  } catch (e) {
    console.error("JSON Parse Error in Summary:", e);
    return { title: "", content: result, tags: [] };
  }
};

export const askNotesRAG = async (query: string, notes: Note[]): Promise<string> => {
  // Simple RAG: Dump the context into the prompt. 
  // Limit to last 30 active notes to avoid hitting token limits blindly.
  const contextNotes = notes
    .filter(n => !n.isArchived)
    .slice(0, 30)
    .map(n => `- [${n.title || 'Untitled'}] (${new Date(n.createdAt).toLocaleDateString()}): ${n.content}`)
    .join('\n');

  const systemPrompt = `
    You are a helpful "Second Brain" assistant. 
    You have access to the user's personal notes.
    Answer the user's question based ONLY on the context provided below.
    If the answer isn't in the notes, say "I couldn't find that in your notes."
    Do NOT invent information.
    
    --- USER NOTES CONTEXT ---
    ${contextNotes}
    --- END CONTEXT ---
  `;

  return callAI([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: query }
  ]);
};

export const rewriteTone = async (text: string, tone: string): Promise<string> => {
  const systemPrompt = `
    Rewrite the following text to have a "${tone}" tone.
    Keep the core meaning the same.
    CRITICAL: Do not translate. Maintain the original language of the text.
    Return ONLY the rewritten text.
  `;

  return callAI([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: text }
  ]);
};
