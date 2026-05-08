import { Router } from "express";
import upload from "../middleware/upload";
import { healthCheck, submitVehicle } from "../controllers/vehicleController";

const router = Router();

router.get("/health", healthCheck);

// upload.single("logbook") is multer middleware that parses the multipart
// field named "logbook", validates the file type, and attaches the result
// to req.file before submitVehicle runs.
router.post("/submit", upload.single("logbook"), submitVehicle);

export default router;
