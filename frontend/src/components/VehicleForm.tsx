import React, { useState } from "react";
import axios from "axios";

type VehicleMap = Record<string, Record<string, string[]>>;

interface QuickSelect {
  label: string;
  make: string;
  model: string;
  badge: string;
}

interface SubmitApiResponse {
  success: boolean;
  vehicle: {
    make: string;
    model: string;
    badge: string;
  };
  logbookContents: string;
  error?: string;
}

const VEHICLES: VehicleMap = {
  ford: {
    Ranger: ["Raptor", "Raptor X", "Wildtrak"],
    Falcon: ["XR6", "XR6 Turbo", "XR8"],
    "Falcon Ute": ["XR6", "XR6 Turbo"],
  },
  bmw: {
    "130d": ["xDrive 26d", "xDrive 30d"],
    "240i": ["xDrive 30d", "xDrive 50d"],
    "320e": ["xDrive 75d", "xDrive 80d", "xDrive 85d"],
  },
  tesla: {
    "Model 3": ["Performance", "Long Range", "Dual Motor"],
  },
};

const displayMake = (key: string): string =>
  key.charAt(0).toUpperCase() + key.slice(1);

const QUICK_SELECTS: QuickSelect[] = [
  {
    label: "Tesla Model 3 Performance",
    make: "tesla",
    model: "Model 3",
    badge: "Performance",
  },
  {
    label: "BMW 130d xDrive 26d",
    make: "bmw",
    model: "130d",
    badge: "xDrive 26d",
  },
];

function VehicleForm() {
  const [make, setMake] = useState<string>("");
  const [model, setModel] = useState<string>("");
  const [badge, setBadge] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);

  const modelOptions: string[] = make ? Object.keys(VEHICLES[make]) : [];
  const badgeOptions: string[] = model && make ? (VEHICLES[make]?.[model] ?? []) : [];

  const [loading, setLoading] = useState<boolean>(false);
  const [response, setResponse] = useState<SubmitApiResponse | null>(null);
  const [error, setError] = useState<string>("");

  const handleMakeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setMake(e.target.value);
    setModel("");
    setBadge("");
    setResponse(null);
    setError("");
  };

  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setModel(e.target.value);
    setBadge("");
    setResponse(null);
    setError("");
  };

  const handleBadgeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setBadge(e.target.value);
    setResponse(null);
    setError("");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0] ?? null);
  };

  const handleQuickSelect = ({ make: m, model: mo, badge: b }: QuickSelect) => {
    setMake(m);
    setModel(mo);
    setBadge(b);
    setResponse(null);
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!make || !model || !badge) {
      setError("Please select a Make, Model and Badge before submitting.");
      return;
    }
    if (!file) {
      setError("Please upload a logbook (.txt) file before submitting.");
      return;
    }

    setLoading(true);
    setError("");
    setResponse(null);

    try {
      const formData = new FormData();
      formData.append("make", make);
      formData.append("model", model);
      formData.append("badge", badge);
      formData.append("logbook", file);

      const res = await axios.post<SubmitApiResponse>("/api/submit", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setResponse(res.data);
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.data?.error) {
        setError(err.response.data.error as string);
      } else if (err instanceof Error) {
        setError(`Network error: ${err.message}`);
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-wrapper">
      <section className="quick-select-section">
        <h2 className="section-title">Select a Vehicle</h2>
        <div className="quick-select-buttons">
          {QUICK_SELECTS.map((qs) => (
            <button
              key={qs.label}
              type="button"
              className={`quick-select-btn${
                make === qs.make && model === qs.model && badge === qs.badge
                  ? " quick-select-btn--active"
                  : ""
              }`}
              onClick={() => handleQuickSelect(qs)}
            >
              {qs.label}
            </button>
          ))}
        </div>
      </section>

      <form className="vehicle-form" onSubmit={handleSubmit} noValidate>
        <div className="form-group">
          <label htmlFor="make" className="form-label">
            Make
          </label>
          <select
            id="make"
            className="form-select"
            value={make}
            onChange={handleMakeChange}
          >
            <option value="">-- Select Make --</option>
            {Object.keys(VEHICLES).map((key) => (
              <option key={key} value={key}>
                {displayMake(key)}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="model" className="form-label">
            Model
          </label>
          <select
            id="model"
            className="form-select"
            value={model}
            onChange={handleModelChange}
            disabled={!make}
          >
            <option value="">-- Select Model --</option>
            {modelOptions.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="badge" className="form-label">
            Badge
          </label>
          <select
            id="badge"
            className="form-select"
            value={badge}
            onChange={handleBadgeChange}
            disabled={!model}
          >
            <option value="">-- Select Badge --</option>
            {badgeOptions.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="logbook" className="form-label">
            Upload Logbook:
          </label>
          <input
            id="logbook"
            type="file"
            accept=".txt"
            className="form-file-input"
            onChange={handleFileChange}
          />
          {file && <span className="file-name-display">{file.name}</span>}
        </div>

        {error && (
          <div className="error-banner" role="alert">
            <span className="error-icon">&#9888;</span> {error}
          </div>
        )}

        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? "Submitting\u2026" : "Submit"}
        </button>
      </form>

      {response && (
        <section className="response-section">
          <h2 className="section-title">Submission Result</h2>

          <div className="response-vehicle-info">
            <div className="response-row">
              <span className="response-key">Make</span>
              <span className="response-value">
                {displayMake(response.vehicle.make)}
              </span>
            </div>
            <div className="response-row">
              <span className="response-key">Model</span>
              <span className="response-value">{response.vehicle.model}</span>
            </div>
            <div className="response-row">
              <span className="response-key">Badge</span>
              <span className="response-value">{response.vehicle.badge}</span>
            </div>
          </div>

          <div className="logbook-section">
            <h3 className="logbook-title">Logbook Contents</h3>
            <pre className="logbook-pre">{response.logbookContents}</pre>
          </div>
        </section>
      )}
    </div>
  );
}

export default VehicleForm;
