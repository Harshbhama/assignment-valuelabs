import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import multer from "multer";
import apiRouter from "./routes/api";
import { SubmitResponse } from "./types";
import { ERROR_MESSAGES } from "./constants";
import { config } from "./config";

const app = express();

// Restrict CORS to the configured frontend origin rather than allowing all origins (*).
// The origin is read from CORS_ORIGIN in .env so it can differ per environment.
app.use(cors({ origin: config.corsOrigin }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api", apiRouter);

// Express identifies error-handling middleware by its 4-argument signature.
// Removing or renaming _next would cause Express to treat this as a regular
// middleware and errors would fall through unhandled.
app.use(
  (
    err: Error,
    _req: Request,
    res: Response<SubmitResponse>,
    _next: NextFunction,
  ): void => {
    // MulterError covers built-in multer failures (e.g. unexpected field names).
    // err.message covers the custom Error thrown by our fileFilter for wrong file types.
    if (err instanceof multer.MulterError || err.message) {
      res.status(400).json({ success: false, error: err.message });
      return;
    }
    res
      .status(500)
      .json({ success: false, error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR });
  },
);

// app is exported without calling .listen() so that supertest can import it
// directly in tests and bind its own ephemeral port, avoiding port conflicts.
export default app;
