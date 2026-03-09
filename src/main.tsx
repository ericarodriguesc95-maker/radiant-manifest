import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initNotifications } from "./lib/notifications";

// Init theme
if (localStorage.getItem("theme") === "dark") {
  document.documentElement.classList.add("dark");
}

initNotifications();

createRoot(document.getElementById("root")!).render(<App />);
