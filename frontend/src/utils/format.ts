// Capitalises the make key (e.g. "ford" -> "Ford") for display purposes.
// Kept as a standalone utility because it is used in both the dropdown
// options and the submission result panel.
export const displayMake = (key: string): string =>
  key.charAt(0).toUpperCase() + key.slice(1);
