import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function parseResume(resumeText) {
    console.log("[parseResume] Starting to parse resume...");
    try {
        const response = await ai.models.generateContent({
            model: "gemini-3.5-flash",
            contents: `
    Extract the following information from this resume and return it STRICTLY as a valid JSON object. Do not include markdown code blocks like \`\`\`json. The JSON should have exactly these keys:
    "name"
    "email"
    "phone"
    "skills" (a string summarizing all technical and soft skills)
    "experience" (a string summarizing work experience)
    "education" (a string summarizing education)
    "projects" (a string summarizing key projects)

    Resume: ${resumeText}`,
        });
        console.log("[parseResume] Successfully parsed resume.");
        
        let result = response.text.trim();
        // Remove markdown formatting if Gemini included it despite instructions
        if (result.startsWith("\`\`\`json")) {
            result = result.replace(/^\`\`\`json/, '').replace(/\`\`\`$/, '').trim();
        } else if (result.startsWith("\`\`\`")) {
            result = result.replace(/^\`\`\`/, '').replace(/\`\`\`$/, '').trim();
        }
        
        try {
            return JSON.parse(result);
        } catch (e) {
            console.warn("[parseResume] Failed to parse JSON. Returning raw string.");
            return result;
        }
    } catch (error) {
        console.error("[parseResume] Error parsing resume:", error);
        throw error;
    }
}

export default parseResume;