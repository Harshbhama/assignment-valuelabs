// vehicle and logbookContents are absent on error responses, so both are optional.
export interface SubmitResponse {
  success: boolean;
  vehicle?: {
    make: string;
    model: string;
    badge: string;
  };
  logbookContents?: string;
  error?: string;
}
