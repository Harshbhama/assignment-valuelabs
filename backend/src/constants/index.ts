// `as const` narrows the type to literal strings, preventing accidental widening to `string`
// and enabling exhaustive checks if the object is extended in future.
export const ERROR_MESSAGES = {
  INVALID_FILE_TYPE: "Only .txt files are accepted for the logbook field.",
  INTERNAL_SERVER_ERROR: "Internal server error.",
} as const;
