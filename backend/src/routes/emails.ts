import express from "express";
import { db } from "../db/client";
import { emails } from "../db/schema";
import { eq } from "drizzle-orm";
import { mockEmails } from "../data/mockEmails";
import { summarizeEmail } from "../services/openai";
import { Parser } from "json2csv";

export const router = express.Router();

// Get all emails, optionally filtered by category
router.get("/", async (req, res) => {
  try {
    const { category } = req.query;

    const results = await db.query.emails.findMany({
      where: category
        ? (emails, { eq }) => eq(emails.category, String(category))
        : undefined,
      orderBy: (emails, { desc }) => desc(emails.createdAt)
    });

    res.json(results);
  } catch (err) {
    console.error("Error fetching emails:", err);
    res.status(500).json({ error: "Failed to fetch emails" });
  }
});

// Trigger summarization workflow on mock emails
router.post("/ingest", async (_req, res) => {
  try {
    const created: any[] = [];
    for (const raw of mockEmails) {
      const ai = await summarizeEmail({
        sender: raw.sender,
        subject: raw.subject,
        body: raw.body
      });

      const [inserted] = await db
        .insert(emails)
        .values({
          sender: raw.sender,
          subject: raw.subject,
          body: raw.body,
          summary: ai.summary,
          category: ai.category
        })
        .returning();

      created.push(inserted);
    }

    res.status(201).json({
      message: "Ingested and summarized mock emails",
      count: created.length,
      data: created
    });
  } catch (err) {
    console.error("Error ingesting emails:", err);
    res.status(500).json({ error: "Failed to ingest emails" });
  }
});

// Re-summarize a single email
router.post("/:id/resummarize", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const [existing] = await db
      .select()
      .from(emails)
      .where(eq(emails.id, id));

    if (!existing) {
      return res.status(404).json({ error: "Email not found" });
    }

    const ai = await summarizeEmail({
      sender: existing.sender,
      subject: existing.subject,
      body: existing.body
    });

    const [updated] = await db
      .update(emails)
      .set({
        summary: ai.summary,
        category: ai.category,
        updatedAt: new Date()
      })
      .where(eq(emails.id, id))
      .returning();

    res.json(updated);
  } catch (err) {
    console.error("Error resummarizing email:", err);
    res.status(500).json({ error: "Failed to resummarize email" });
  }
});

// Delete an email
router.delete("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    const [deleted] = await db
      .delete(emails)
      .where(eq(emails.id, id))
      .returning();

    if (!deleted) {
      return res.status(404).json({ error: "Email not found" });
    }

    res.json({ message: "Deleted", id });
  } catch (err) {
    console.error("Error deleting email:", err);
    res.status(500).json({ error: "Failed to delete email" });
  }
});

// Export summaries as CSV
router.get("/export", async (_req, res) => {
  try {
    const results = await db.query.emails.findMany({
      orderBy: (emails, { desc }) => desc(emails.createdAt)
    });

    const fields = [
      "id",
      "sender",
      "subject",
      "summary",
      "category",
      "createdAt",
      "updatedAt"
    ];
    const parser = new Parser({ fields });
    const csv = parser.parse(results);

    res.header("Content-Type", "text/csv");
    res.attachment("email_summaries.csv");
    res.send(csv);
  } catch (err) {
    console.error("Error exporting CSV:", err);
    res.status(500).json({ error: "Failed to export CSV" });
  }
});
