import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { HelmetProvider } from "react-helmet-async";
import "./index.css";
import { initNotifications } from "./lib/notifications";

// Init theme
if (localStorage.getItem("theme") === "dark") {
  document.documentElement.classList.add("dark");
}

initNotifications();

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <App />
  </HelmetProvider>,
);
