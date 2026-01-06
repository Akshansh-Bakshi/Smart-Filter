
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
    You are an expert Data Analyst. Your task is to take a natural language requirement and convert it into a valid JavaScript filter predicate function.
    
    Data Schema:
    - Headers: ${JSON.stringify(headers)}
    - Sample Data: ${JSON.stringify(sampleRows)}

    Rules:
    1. Output MUST be valid JSON.
    2. Provide a 'code' field which is a string containing a JavaScript function body: (row) => { ... return boolean; }
    3. If the user asks for specific columns, provide them in a 'columns' field as an array of strings.
    4. Provide an 'explanation' field describing what the filter does.
    5. Handle numeric comparisons by ensuring strings are converted to numbers if necessary.
    6. Be case-insensitive for text comparisons unless specified.
    7. If the requirement is invalid or impossible given the headers, provide an error in the 'error' field.
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
            code: { type: Type.STRING, description: "JS function body for Array.filter" },
            columns: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of columns to keep" },
            explanation: { type: Type.STRING, description: "Human-readable explanation" },
            error: { type: Type.STRING, description: "Error message if applicable" }
          },
          required: ["explanation"]
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini Error:", error);
    throw new Error("Failed to process requirements with AI.");
  }
};
