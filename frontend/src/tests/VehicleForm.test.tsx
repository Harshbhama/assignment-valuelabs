import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import VehicleForm from "../components/VehicleForm";

describe("VehicleForm", () => {
  it("renders all three dropdowns and the file input", () => {
    render(<VehicleForm />);
    expect(screen.getByLabelText("Make")).toBeInTheDocument();
    expect(screen.getByLabelText("Model")).toBeInTheDocument();
    expect(screen.getByLabelText("Badge")).toBeInTheDocument();
    expect(screen.getByLabelText("Upload Logbook:")).toBeInTheDocument();
  });

  it("renders quick-select buttons", () => {
    render(<VehicleForm />);
    expect(screen.getByText("Tesla Model 3 Performance")).toBeInTheDocument();
    expect(screen.getByText("BMW 130d xDrive 26d")).toBeInTheDocument();
  });

  it("model and badge dropdowns are disabled before parent is selected", () => {
    render(<VehicleForm />);
    expect(screen.getByLabelText("Model")).toBeDisabled();
    expect(screen.getByLabelText("Badge")).toBeDisabled();
  });

  it("enables model dropdown after make is selected", () => {
    render(<VehicleForm />);
    fireEvent.change(screen.getByLabelText("Make"), {
      target: { value: "tesla" },
    });
    expect(screen.getByLabelText("Model")).not.toBeDisabled();
  });

  it("quick-select pre-fills all three dropdowns", () => {
    render(<VehicleForm />);
    fireEvent.click(screen.getByText("Tesla Model 3 Performance"));
    expect(screen.getByLabelText("Make")).toHaveValue("tesla");
    expect(screen.getByLabelText("Model")).toHaveValue("Model 3");
    expect(screen.getByLabelText("Badge")).toHaveValue("Performance");
  });

  it("changing make resets model and badge", () => {
    // Start with a full selection, then switch make to verify the cascade clears downstream values.
    render(<VehicleForm />);
    fireEvent.click(screen.getByText("Tesla Model 3 Performance"));
    fireEvent.change(screen.getByLabelText("Make"), {
      target: { value: "bmw" },
    });
    expect(screen.getByLabelText("Model")).toHaveValue("");
    expect(screen.getByLabelText("Badge")).toHaveValue("");
  });

  it("changing model resets badge", () => {
    // Badge options are model-specific; switching model must clear any stale badge value.
    render(<VehicleForm />);
    fireEvent.click(screen.getByText("BMW 130d xDrive 26d"));
    fireEvent.change(screen.getByLabelText("Model"), {
      target: { value: "240i" },
    });
    expect(screen.getByLabelText("Badge")).toHaveValue("");
  });

  it("shows validation error when submitting without selecting a vehicle", () => {
    // Submitting the form element directly (rather than clicking the button) ensures
    // handleSubmit is exercised regardless of the button's disabled state.
    render(<VehicleForm />);
    fireEvent.submit(
      screen.getByRole("button", { name: /submit/i }).closest("form")!,
    );
    expect(
      screen.getByText(/please select a make, model and badge/i),
    ).toBeInTheDocument();
  });
});
