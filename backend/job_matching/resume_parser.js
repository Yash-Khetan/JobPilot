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
    Extract the following information from this resume:
    Name:
    Email:
    Phone:
    Skills:
    Experience:
    Education:
    Projects:

    Resume: ${resumeText}`,
        });
        console.log("[parseResume] Successfully parsed resume.");
        return response.text;
    } catch (error) {
        console.error("[parseResume] Error parsing resume:", error);
        throw error;
    }
}

export default parseResume;