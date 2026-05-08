// Single place where all environment variables are read and given defaults.
// CRA only exposes variables prefixed with REACT_APP_ to the browser bundle.
// Import from here instead of reading process.env directly elsewhere.
export const config = {
  // Falls back to /api so the CRA dev-proxy works out of the box without a .env file.
  apiBaseUrl: process.env.REACT_APP_API_BASE_URL ?? "/api",
} as const;
