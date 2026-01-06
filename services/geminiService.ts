
import { GoogleGenAI, Type } from "@google/genai";
import { SheetRow } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const processRequirements = async (
  requirements: string,
  headers: string[],
  sampleRows: SheetRow[]
) => {
  const model = "gemini-3-flash-preview";
  
  const systemInstruction = `
    You are an expert Data Analyst and JavaScript Engineer. Your task is to take a natural language requirement and convert it into a valid JavaScript filter predicate for an Array.filter() method.
    
    Data Schema Information:
    - Available Headers: ${JSON.stringify(headers)}
    - Sample Data Records: ${JSON.stringify(sampleRows)}

    CRITICAL RULES for 'code' field:
    1. The 'code' MUST be a valid JavaScript function body.
    2. ALWAYS use bracket notation to access properties to avoid issues with spaces or special characters: row['Column Name'].
    3. Ensure robust type handling: 
       - For numbers: use parseFloat(row['Col']) or Number(row['Col']).
       - For text: use (row['Col'] || '').toString().toLowerCase().includes('search term').
    4. Handle null/undefined values gracefully.
    5. The code MUST contain a 'return' statement returning a boolean.
    6. Example: "const val = parseFloat(row['Revenue']); return !isNaN(val) && val > 50000;"

    Output Schema (JSON):
    - code: (string) The JS code body.
    - columns: (array of strings) List of headers the user wants to keep/display. Use exact casing from the "Available Headers" list.
    - explanation: (string) A clear, professional summary of the filtering logic.
    - error: (string, optional) Use this if the prompt is nonsensical or refers to columns that don't exist.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: `User Requirement: "${requirements}"`,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            code: { type: Type.STRING, description: "JS function body with return statement" },
            columns: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Headers to display" },
            explanation: { type: Type.STRING, description: "Explanation of the applied filter" },
            error: { type: Type.STRING, description: "Error message if requirements are invalid" }
          },
          required: ["code", "explanation", "columns"]
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini Error:", error);
    throw new Error("AI analysis failed. Please try a simpler request or check your column names.");
  }
};
