import { VehicleMap, QuickSelect } from "../types/vehicle";

// Static vehicle catalogue. In a production app this would be fetched from an
// API, but is hard-coded here to satisfy the assignment constraints.
export const VEHICLES: VehicleMap = {
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

// Pre-defined selections that populate all three dropdowns in one click.
// Add entries here to expose more common vehicles in the UI without changing
// any component logic.
export const QUICK_SELECTS: QuickSelect[] = [
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
