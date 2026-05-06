import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import multer from "multer";

interface SubmitResponse {
  success: boolean;
  vehicle?: { make: string; model: string; badge: string };
  logbookContents?: string;
  error?: string;
}

const app = express();
const PORT = process.env.PORT ?? 5001;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  fileFilter: (_req, file, cb) => {
    if (
      file.mimetype === "text/plain" ||
      file.originalname.toLowerCase().endsWith(".txt")
    ) {
      cb(null, true);
    } else {
      cb(new Error("Only .txt files are accepted for the logbook field."));
    }
  },
});

app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ status: "ok" });
});

app.post(
  "/api/submit",
  upload.single("logbook"),
  (req: Request, res: Response<SubmitResponse>) => {
    const body = req.body as { make?: string; model?: string; badge?: string };
    const trimmedMake = body.make?.trim() ?? "";
    const trimmedModel = body.model?.trim() ?? "";
    const trimmedBadge = body.badge?.trim() ?? "";
    const logbookFile: Express.Multer.File | undefined = req.file;

    const missing: string[] = [];

    if (!trimmedMake) missing.push("make");
    if (!trimmedModel) missing.push("model");
    if (!trimmedBadge) missing.push("badge");
    if (!logbookFile) missing.push("logbook");

    if (missing.length > 0) {
      res.status(400).json({
        success: false,
        error: `Missing required field(s): ${missing.join(", ")}.`,
      });
      return;
    }

    if (!logbookFile) {
      res
        .status(400)
        .json({ success: false, error: "Missing required field(s): logbook." });
      return;
    }

    const logbookContents = logbookFile.buffer.toString("utf-8");

    res.status(200).json({
      success: true,
      vehicle: {
        make: trimmedMake,
        model: trimmedModel,
        badge: trimmedBadge,
      },
      logbookContents,
    });
  },
);

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof multer.MulterError || err.message) {
    res.status(400).json({ success: false, error: err.message });
    return;
  }
  res.status(500).json({ success: false, error: "Internal server error." });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
