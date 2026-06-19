import express from "express";
import { internshalaScraper } from "../../services/internshala_scraper.js";
import { authenticate } from "../middleware/auth.js";
import { db } from "../db/index.js";
import { usersTable } from "../db/schema.js";
import { eq } from "drizzle-orm";
const router = express.Router();

router.use(authenticate)
router.get("/internshala", async (req, res) => {
    try {
        const { role, location, stipend } = req.query;
        if (!role || !location) {
            return res.status(400).json({ message: "role and location are required query parameters" });
        }
        // Fetch user's embedding
        const user = await db.query.usersTable.findFirst({
            where: eq(usersTable.id, req.user.id)
        });
        if (!user || !user.skillprojects_embed) {
            return res.status(400).json({ message: "Please upload your resume in the dashboard first to get personalized job matches." });
        }

        const jobs = await internshalaScraper(role, location, stipend, user.skillprojects_embed);
        res.json(jobs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router
