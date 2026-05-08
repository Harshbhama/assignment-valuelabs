import axios from "axios";
import { SubmitApiResponse } from "../types/vehicle";
import { config } from "../config";

export const submitVehicleForm = async (
  make: string,
  model: string,
  badge: string,
  file: File,
): Promise<SubmitApiResponse> => {
  const formData = new FormData();
  formData.append("make", make);
  formData.append("model", model);
  formData.append("badge", badge);
  formData.append("logbook", file);

  try {
    // The Content-Type header is set explicitly so the browser includes the
    // multipart boundary that multer needs to parse the file on the server.
    const res = await axios.post<SubmitApiResponse>(
      `${config.apiBaseUrl}/submit`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    return res.data;
  } catch (err: unknown) {
    // Unwrap the server's error message and re-throw as a plain Error so that
    // callers (VehicleForm) have no dependency on axios internals.
    if (axios.isAxiosError(err) && err.response?.data?.error) {
      throw new Error(err.response.data.error as string);
    }
    throw err;
  }
};
