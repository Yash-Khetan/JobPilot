import express from "express";
import multer from "multer";
import { PDFParse } from "pdf-parse";
import parseResume from "./resume_parser.js";
import { db } from "../src/db/index.js";
import { usersTable } from "../src/db/schema.js";
import { eq } from "drizzle-orm";
import { authenticate } from "../src/middleware/auth.js";
import generateEmbedding from "./generate_embeddings.js";
const router = express.Router();

router.use(authenticate)

const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype !== "application/pdf") {
            return cb(new Error("Only PDF files are allowed"));
        }

        cb(null, true);
    }
});


router.post(
    "/upload",
    upload.single("resume"),
    async (req, res) => {
        try {

            if (!req.file) {
                console.warn("[upload] No resume file provided in request");
                return res.status(400).json({
                    success: false,
                    message: "Resume file is required"
                });
            }

            console.log(`[upload] Received file. Size: ${req.file.size} bytes`);
            const fileBuffer = req.file.buffer;

            console.log("[upload] Extracting text from PDF...");
            // 2. extract text
            const resumeText = await extractText(fileBuffer);

            console.log("[upload] Parsing extracted text using Gemini...");
            // 3. structured information
            const structuredResume = await parseResume(resumeText);
            console.log("[upload] pdf parsed successfully!")

            console.log("[upload] Generating embeddings...");
            // 4. embeddings
            const embedding = await generateEmbedding(resumeText);
            
            console.log("[upload] Generating combined skills+projects embeddings...");
            let skillprojects_embed = null;
            if (typeof structuredResume === "object") {
                const skills = structuredResume.skills || "";
                const projects = structuredResume.projects || "";
                if (skills || projects) {
                    const combinedText = `Skills: ${skills}\nProjects: ${projects}`;
                    skillprojects_embed = await generateEmbedding(combinedText);
                }
            }

            console.log("[upload] Updating user profile in database...");
            // 5. save to db
            await db.update(usersTable)
                .set({
                    resumeText,
                    structuredResume,
                    embedding,
                    skillprojects_embed
                })
                .where(eq(usersTable.id, req.user.id));

            console.log("[upload] Profile successfully updated!");
            res.json({
                success: true
            });

        } catch (err) {
            console.error("[upload] Pipeline failed:", err);
            res.status(500).json({
                success: false
            });
        }
    }
);

export async function extractText(fileBuffer) {
    console.log("[extractText] Calling PDF parse...");
    try {
        const unit8array = new Uint8Array(fileBuffer);
        const data = new PDFParse(unit8array);
        const text = await data.getText();
        console.log("[extractText] PDF parsing successful.");
        return text.text;
    } catch (error) {
        console.error("[extractText] Error parsing PDF:", error);
        throw error;
    }
}


export default router;

