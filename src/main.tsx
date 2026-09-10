import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./css/index.css";

// Supabase's client parses the URL hash (#access_token=...&type=recovery)
// and fires a PASSWORD_RECOVERY event as soon as it initializes - which can
// happen before React/AuthProvider mount and subscribe to it, so relying on
// that event alone can silently miss it. Checking the raw hash here, before
// anything else runs, catches every case regardless of that timing and
// regardless of which page Supabase's redirect_to happened to land on
// (e.g. if it fell back to the Site URL because the real redirect_to wasn't
// on the Supabase Redirect URLs allowlist).
if (
  window.location.hash.includes("type=recovery") &&
  window.location.pathname !== "/reset-password"
) {
  window.location.replace(`/reset-password${window.location.hash}`);
} else {
  ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
