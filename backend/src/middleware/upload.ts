import multer from "multer";
import { ERROR_MESSAGES } from "../constants";

const upload = multer({
  // memoryStorage keeps the file in a Buffer on req.file.buffer rather than
  // writing to disk, which is sufficient for reading a small text file and
  // avoids the need for any temp-file cleanup.
  storage: multer.memoryStorage(),
  fileFilter: (_req, file, cb) => {
    // Check both MIME type and file extension because some browsers/OS combinations
    // send an incorrect or empty MIME type for plain-text files.
    if (
      file.mimetype === "text/plain" ||
      file.originalname.toLowerCase().endsWith(".txt")
    ) {
      cb(null, true);
    } else {
      // Passing an Error (rather than cb(null, false)) causes multer to forward
      // it to Express's error-handling middleware, where it gets a structured
      // JSON response instead of being silently dropped.
      cb(new Error(ERROR_MESSAGES.INVALID_FILE_TYPE));
    }
  },
});

export default upload;
