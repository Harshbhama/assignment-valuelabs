/// <reference types="vite/client" />

// Extends Vite's ImportMetaEnv to include our application-specific variables.
// Only variables declared here will be type-checked when accessed via import.meta.env.
interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
