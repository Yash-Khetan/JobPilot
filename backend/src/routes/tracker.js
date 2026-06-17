// src/routes/tracker.js — Job tracker CRUD routes (all protected by auth middleware)
import { Router } from "express";
import { db } from "../db/index.js";
import { trackedJobsTable } from "../db/schema.js";
import { eq, and } from "drizzle-orm";
import { authenticate } from "../middleware/auth.js";

const router = Router();

// All tracker routes require authentication
router.use(authenticate);

// GET /api/tracker — get all tracked jobs for logged-in user
router.get("/", async (req, res) => {
  try {
    const jobs = await db.query.trackedJobsTable.findMany({
      where: eq(trackedJobsTable.userId, req.user.id),
      orderBy: (t, { desc }) => [desc(t.createdAt)],
    });
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/tracker — save a scraped job to tracker
router.post("/", async (req, res) => {
  const { role, company, location, stipend, description, link, source } =
    req.body;
  try {
    const [job] = await db
      .insert(trackedJobsTable)
      .values({
        role,
        company,
        location,
        stipend,
        description,
        link,
        source,
        userId: req.user.id,
      })
      .returning();
    res.status(201).json(job);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PATCH /api/tracker/:id — update status or notes
router.patch("/:id", async (req, res) => {
  const { id } = req.params;
  const { status, notes } = req.body;
  try {
    const [updated] = await db
      .update(trackedJobsTable)
      .set({ ...(status && { status }), ...(notes !== undefined && { notes }) })
      .where(
        and(
          eq(trackedJobsTable.id, Number(id)),
          eq(trackedJobsTable.userId, req.user.id)
        )
      )
      .returning();

    if (!updated) {
      return res.status(404).json({ message: "Job not found" });
    }
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/tracker/:id — remove a tracked job
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const [deleted] = await db
      .delete(trackedJobsTable)
      .where(
        and(
          eq(trackedJobsTable.id, Number(id)),
          eq(trackedJobsTable.userId, req.user.id)
        )
      )
      .returning();

    if (!deleted) {
      return res.status(404).json({ message: "Job not found" });
    }
    res.json({ message: "Job removed", job: deleted });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
