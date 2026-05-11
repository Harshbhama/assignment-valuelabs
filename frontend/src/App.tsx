import React from "react";
import VehicleForm from "./components/VehicleForm";

function App() {
  return (
    <div className="max-w-[640px] mx-auto my-6 sm:my-12 px-4 pb-16">
      <h1 className="text-[1.4rem] sm:text-[1.75rem] font-bold tracking-tight text-[#1a1a2e] mb-7">
        Drill Down Form
      </h1>
      <VehicleForm />
    </div>
  );
}

export default App;
