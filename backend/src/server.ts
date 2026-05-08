import "dotenv/config";
// Import the configured Express app separately from the listen call so that
// tests can import app.ts directly without starting a real server.
import app from "./app";
import { config } from "./config";

app.listen(config.port, () => {
  console.log(`Server running on http://localhost:${config.port}`);
});
