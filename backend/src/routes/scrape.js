import express from "express";
import { internshalaScraper } from "../../services/internshala_scraper.js";

const router = express.Router();

router.get("/internshala", async (req, res) => {
    try {
        const { role, location, stipend } = req.query;
        if (!role || !location) {
            return res.status(400).json({ message: "role and location are required query parameters" });
        }
        const jobs = await internshalaScraper(role, location, stipend);
        res.json(jobs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router
