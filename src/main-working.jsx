import React from "react";
import ReactDOM from "react-dom/client";
import Dashboard from "./pages/Dashboard";

console.log("🚀 Starting VidyaMitra Direct Dashboard...");

const root = document.getElementById("root");
if (!root) throw new Error("Root element #root not found");

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <Dashboard />
  </React.StrictMode>
);

console.log("✅ Dashboard loaded directly - no auth required!");
