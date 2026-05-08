// Single place where all environment variables are read and given defaults.
// Import from here instead of reading process.env directly elsewhere.
export const config = {
  port: process.env.PORT ?? 5001,
  // Restricts CORS to the configured frontend origin instead of allowing all origins.
  corsOrigin: process.env.CORS_ORIGIN ?? "http://localhost:3000",
} as const;
