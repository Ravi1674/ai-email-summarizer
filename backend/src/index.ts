import "dotenv/config";
import express from "express";
import cors from "cors";
import { router as emailRouter } from "./routes/emails";

const app = express();
const port = process.env.PORT || 4000;
const corsOrigin = process.env.CORS_ORIGIN || "http://localhost:5173";

app.use(cors({ origin: corsOrigin }));
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/emails", emailRouter);

app.listen(port, () => {
  console.log(`Backend listening on http://localhost:${port}`);
});
