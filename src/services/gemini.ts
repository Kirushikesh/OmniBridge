import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { BridgeCategory, BridgeAction, BridgeResult } from "../types";
export { BridgeCategory } from "../types";
export type { BridgeAction, BridgeResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

const SYSTEM_INSTRUCTION = `
You are OmniBridge, a universal intent engine designed for societal benefit. 
Your task is to take messy, unstructured real-world inputs (text, images, or audio descriptions) and convert them into structured, verified, and life-saving actions.

Analyze the input and provide a JSON response following this schema:
{
  "category": "EMERGENCY" | "HEALTHCARE" | "ENVIRONMENT" | "SOCIAL_AID" | "GENERAL",
  "urgency": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
  "summary": "A concise 1-sentence summary of the situation.",
  "structuredData": {
    "location": "Extracted location if any",
    "entities": ["list of key people, objects, or symptoms"],
    "details": "Other relevant structured info"
  },
  "actions": [
    {
      "title": "Short action title",
      "description": "Detailed instruction",
      "type": "call" | "map" | "form" | "info",
      "payload": "Phone number, address, URL, or key info"
    }
  ],
  "reasoning": "Brief explanation of your analysis"
}

Focus on high-impact, life-saving, or community-benefiting actions. 
If the input is an image, describe what you see and how it relates to the societal benefit.
If it's medical, be precise but note you are an AI.
If it's an emergency, prioritize immediate contact with authorities.
`;

export async function processIntent(
  input: string,
  image?: { data: string; mimeType: string }
): Promise<BridgeResult> {
  if (input && input.length > 2500) {
    throw new Error("Input exceeds the maximum allowed length of 2,500 characters.");
  }

  const model = "gemini-3-flash-preview";
  
  const parts: any[] = [{ text: input || "Analyze this input for societal benefit." }];
  if (image) {
    parts.push({
      inlineData: {
        data: image.data.split(",")[1], // Remove prefix
        mimeType: image.mimeType
      }
    });
  }

  const response = await ai.models.generateContent({
    model,
    contents: [{ parts }],
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
      tools: [{ googleSearch: {} }]
    }
  });

  if (response.text === null || response.text === undefined) {
    throw new Error("Failed to process intent. Please try again.");
  }

  try {
    const result = JSON.parse(response.text || "{}");
    return result as BridgeResult;
  } catch (e) {
    console.error("Failed to parse Gemini response", e);
    throw new Error("Failed to process intent. Please try again.");
  }
}
