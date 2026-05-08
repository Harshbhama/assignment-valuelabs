// Keyed as make -> model -> badge list. Using Record instead of an interface
// allows dynamic key access (VEHICLES[make]) without index signature boilerplate.
export type VehicleMap = Record<string, Record<string, string[]>>;

export interface QuickSelect {
  label: string;
  make: string;
  model: string;
  badge: string;
}

export interface SubmitApiResponse {
  success: boolean;
  vehicle: {
    make: string;
    model: string;
    badge: string;
  };
  logbookContents: string;
  // error is only present when success is false; it is absent on successful responses.
  error?: string;
}
