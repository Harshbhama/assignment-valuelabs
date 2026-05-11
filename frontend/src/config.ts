// Single place where all environment variables are read and given defaults.
// Vite only exposes variables prefixed with VITE_ to the browser bundle via import.meta.env.
// Import from here instead of accessing import.meta.env directly elsewhere.
export const config = {
  // Falls back to /api so the Vite dev-proxy works out of the box without a .env file.
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? "/api",
} as const;
