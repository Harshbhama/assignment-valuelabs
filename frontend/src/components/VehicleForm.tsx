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

  const selectClass =
    "select-chevron w-full py-2.5 pl-3 pr-9 text-sm text-[#1a1a2e] bg-white border border-gray-300 rounded-lg appearance-none cursor-pointer transition duration-150 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed disabled:border-gray-200";

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      {/* ---- Quick-select buttons ---- */}
      <section className="px-4 sm:px-7 pt-6 pb-5 border-b border-gray-100 bg-gray-50">
        <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">
          Select a Vehicle
        </h2>
        <div className="flex flex-wrap gap-2.5">
          {QUICK_SELECTS.map((qs) => (
            <button
              key={qs.label}
              type="button"
              // Highlight the button when its preset exactly matches the current selection.
              className={
                make === qs.make && model === qs.model && badge === qs.badge
                  ? "px-4 py-2 text-sm font-medium rounded-md border whitespace-nowrap transition-all duration-150 cursor-pointer bg-indigo-600 text-white border-indigo-600 shadow-[0_2px_6px_rgba(79,70,229,0.35)]"
                  : "px-4 py-2 text-sm font-medium rounded-md border whitespace-nowrap transition-all duration-150 cursor-pointer bg-white text-gray-700 border-gray-300 hover:border-indigo-600 hover:text-indigo-600 hover:bg-indigo-50"
              }
              onClick={() => handleQuickSelect(qs)}
            >
              {qs.label}
            </button>
          ))}
        </div>
      </section>

      {/* noValidate suppresses native browser validation popups */}
      <form
        className="px-4 sm:px-7 pt-7 pb-6"
        onSubmit={handleSubmit}
        noValidate
      >
        {/* Make */}
        <div className="mb-5">
          <label
            htmlFor="make"
            className="block text-sm font-semibold text-gray-700 mb-1.5"
          >
            Make
          </label>
          <select
            id="make"
            className={selectClass}
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

        {/* Model */}
        <div className="mb-5">
          <label
            htmlFor="model"
            className="block text-sm font-semibold text-gray-700 mb-1.5"
          >
            Model
          </label>
          {/* Disabled until a make is chosen so the user follows the intended cascade order */}
          <select
            id="model"
            className={selectClass}
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

        {/* Badge */}
        <div className="mb-5">
          <label
            htmlFor="badge"
            className="block text-sm font-semibold text-gray-700 mb-1.5"
          >
            Badge
          </label>
          {/* Disabled until a model is chosen so the badge list is always relevant */}
          <select
            id="badge"
            className={selectClass}
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

        {/* File upload */}
        <div className="mb-5">
          <label
            htmlFor="logbook"
            className="block text-sm font-semibold text-gray-700 mb-1.5"
          >
            Upload Logbook:
          </label>
          {/* accept=".txt" provides a hint to the OS file picker but is not a
              security boundary; the server's fileFilter is the enforced constraint. */}
          <input
            id="logbook"
            type="file"
            accept=".txt"
            className="block w-full text-sm text-gray-700 py-2 cursor-pointer file:px-3.5 file:py-1.5 file:text-xs file:font-medium file:text-gray-700 file:bg-gray-100 file:border file:border-gray-300 file:rounded-md file:cursor-pointer file:mr-2.5 file:transition-colors hover:file:bg-gray-200"
            onChange={handleFileChange}
          />
          {file && (
            <span className="inline-block mt-1.5 text-xs text-indigo-600 italic">
              {file.name}
            </span>
          )}
        </div>

        {/* Error banner */}
        {error && (
          <div
            className="flex items-center gap-2 px-4 py-3 mb-5 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm font-medium"
            role="alert"
          >
            <span className="text-base shrink-0">&#9888;</span> {error}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          className="w-full py-3 mt-1 text-base font-semibold text-white bg-indigo-600 rounded-lg cursor-pointer tracking-wide transition duration-150 hover:bg-indigo-700 hover:shadow-[0_4px_12px_rgba(79,70,229,0.35)] active:translate-y-px disabled:bg-indigo-300 disabled:cursor-not-allowed"
          disabled={loading}
        >
          {loading ? "Submitting\u2026" : "Submit"}
        </button>
      </form>

      {/* ---- Submission result ---- */}
      {response && (
        <section className="px-4 sm:px-7 pt-7 pb-8 border-t border-gray-100 bg-gray-50">
          <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">
            Submission Result
          </h2>

          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden mb-5">
            <div className="flex items-center px-4 py-3 border-b border-gray-100">
              <span className="w-20 text-xs font-bold uppercase tracking-wider text-gray-500 shrink-0">
                Make
              </span>
              <span className="text-sm font-medium text-[#1a1a2e]">
                {displayMake(response.vehicle.make)}
              </span>
            </div>
            <div className="flex items-center px-4 py-3 border-b border-gray-100">
              <span className="w-20 text-xs font-bold uppercase tracking-wider text-gray-500 shrink-0">
                Model
              </span>
              <span className="text-sm font-medium text-[#1a1a2e]">
                {response.vehicle.model}
              </span>
            </div>
            <div className="flex items-center px-4 py-3">
              <span className="w-20 text-xs font-bold uppercase tracking-wider text-gray-500 shrink-0">
                Badge
              </span>
              <span className="text-sm font-medium text-[#1a1a2e]">
                {response.vehicle.badge}
              </span>
            </div>
          </div>

          <div className="mt-1">
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2.5">
              Logbook Contents
            </h3>
            {/* pre preserves the original whitespace and line breaks from the uploaded text file */}
            <pre className="bg-[#1e1e2e] text-[#cdd6f4] px-[18px] py-4 rounded-lg font-mono text-xs leading-relaxed overflow-x-auto whitespace-pre-wrap break-words">
              {response.logbookContents}
            </pre>
          </div>
        </section>
      )}
    </div>
  );
}

export default VehicleForm;
