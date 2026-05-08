import { Request, Response } from "express";
import { SubmitResponse } from "../types";

export const healthCheck = (_req: Request, res: Response): void => {
  res.json({ status: "ok" });
};

export const submitVehicle = (
  req: Request,
  res: Response<SubmitResponse>,
): void => {
  // Express types req.body as `any`; casting to a known shape makes the
  // optional-chaining below type-safe without requiring non-null assertions.
  const body = req.body as { make?: string; model?: string; badge?: string };

  // Trim early so that whitespace-only strings ("   ") are treated as missing,
  // not as valid values that would pass the empty-string check below.
  const trimmedMake = body.make?.trim() ?? "";
  const trimmedModel = body.model?.trim() ?? "";
  const trimmedBadge = body.badge?.trim() ?? "";

  // multer attaches the file to req.file after running the upload middleware;
  // it is undefined when no file was included in the request.
  const logbookFile: Express.Multer.File | undefined = req.file;

  // Collect all missing fields in one pass so the error message names every
  // missing field at once rather than making the client fix them one by one.
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

  // TypeScript cannot narrow req.file across the early-return above, so a
  // second guard is required to satisfy the compiler before accessing .buffer.
  if (!logbookFile) {
    res
      .status(400)
      .json({ success: false, error: "Missing required field(s): logbook." });
    return;
  }

  // The buffer is the raw bytes written by multer's memoryStorage. Decoding as
  // utf-8 is safe because the fileFilter already enforces plain-text uploads.
  res.status(200).json({
    success: true,
    vehicle: {
      make: trimmedMake,
      model: trimmedModel,
      badge: trimmedBadge,
    },
    logbookContents: logbookFile.buffer.toString("utf-8"),
  });
};
