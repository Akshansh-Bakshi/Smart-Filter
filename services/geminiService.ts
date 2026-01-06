
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
    2. ALWAYS use bracket notation to access properties: row['Column Name'].
    3. Ensure robust type handling: 
       - For numbers: use parseFloat(row['Col']) or Number(row['Col']).
       - For text: use (row['Col'] || '').toString().toLowerCase().includes('search term').
    4. The code MUST contain a 'return' statement returning a boolean.

    COLUMN SELECTION RULES:
    1. IMPORTANT: The 'columns' field MUST include ALL available headers [${headers.join(', ')}] UNLESS the user explicitly asks to "only show", "select", or "hide" specific columns.
    2. Never drop columns like 'Designation', 'ID', etc., unless specifically requested.
    3. Use the exact casing for headers as provided in the Available Headers list.

    Output Schema (JSON):
    - code: (string) The JS code body.
    - columns: (array of strings) Headers to display. Default to ALL available headers if not specified.
    - explanation: (string) A clear summary of the logic.
    - error: (string, optional) If requirements are nonsensical.
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
