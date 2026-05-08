import React, { useState } from "react";
import { VEHICLES, QUICK_SELECTS } from "../constants/vehicles";
import { submitVehicleForm } from "../services/vehicleApi";
import { displayMake } from "../utils/format";
import { QuickSelect, SubmitApiResponse } from "../types/vehicle";

function VehicleForm() {
  const [make, setMake] = useState<string>("");
  const [model, setModel] = useState<string>("");
  const [badge, setBadge] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [response, setResponse] = useState<SubmitApiResponse | null>(null);
  const [error, setError] = useState<string>("");

  // Derived directly from VEHICLES rather than stored in state: they are always
  // computable from the current make/model values and never need to be set independently.
  const modelOptions: string[] = make ? Object.keys(VEHICLES[make]) : [];
  const badgeOptions: string[] =
    model && make ? (VEHICLES[make]?.[model] ?? []) : [];

  // Cascading reset: changing make must clear both model and badge since the
  // available options for each depend entirely on the parent selection.
  // Changing model only clears badge.
  const resetDownstream = (level: "make" | "model"): void => {
    if (level === "make") setModel("");
    setBadge("");
    setResponse(null);
    setError("");
  };

  const handleMakeChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    setMake(e.target.value);
    resetDownstream("make");
  };

  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    setModel(e.target.value);
    resetDownstream("model");
  };

  const handleBadgeChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    setBadge(e.target.value);
    setResponse(null);
    setError("");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    // files can be null when the input is cleared; fall back to null to keep
    // the File | null type consistent throughout the component.
    setFile(e.target.files?.[0] ?? null);
  };

  const handleQuickSelect = ({
    make: m,
    model: mo,
    badge: b,
  }: QuickSelect): void => {
    // Set all three levels atomically so the dropdowns reflect the full
    // preset in a single render rather than three cascading renders.
    setMake(m);
    setModel(mo);
    setBadge(b);
    setResponse(null);
    setError("");
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    // noValidate is set on the form so the browser does not show its own
    // validation UI; all validation is handled here for consistent styling.
    e.preventDefault();

    if (!make || !model || !badge) {
      setError("Please select a Make, Model and Badge before submitting.");
      return;
    }
    if (!file) {
      setError("Please upload a logbook (.txt) file before submitting.");
      return;
    }

    // Disable the submit button for the duration of the request to prevent
    // duplicate submissions if the user clicks multiple times.
    setLoading(true);
    setError("");
    setResponse(null);

    try {
      const data = await submitVehicleForm(make, model, badge, file);
      setResponse(data);
    } catch (err: unknown) {
      // vehicleApi normalises axios errors to plain Error instances, so a
      // single instanceof check is sufficient here.
      if (err instanceof Error) {
        setError(err.message);
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
              // Highlight the button when its preset exactly matches the current selection.
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

      {/* noValidate suppresses native browser validation popups */}
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
          {/* Disabled until a make is chosen so the user follows the intended cascade order */}
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
          {/* Disabled until a model is chosen so the badge list is always relevant */}
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
          {/* accept=".txt" provides a hint to the OS file picker but is not a
              security boundary; the server's fileFilter is the enforced constraint. */}
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
            {/* pre preserves the original whitespace and line breaks from the uploaded text file */}
            <pre className="logbook-pre">{response.logbookContents}</pre>
          </div>
        </section>
      )}
    </div>
  );
}

export default VehicleForm;
