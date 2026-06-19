import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function generateEmbedding(text) {
    console.log("[generateEmbedding] Generating embedding for text...");
    try {
        const response = await ai.models.embedContent({
            model: 'gemini-embedding-2',
            contents: text,
        });
        console.log("[generateEmbedding] Successfully generated embedding.");
        return response.embeddings;
    } catch (error) {
        console.error("[generateEmbedding] Error generating embedding:", error);
        throw error;
    }
}

export default generateEmbedding;