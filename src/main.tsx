import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initNotifications } from "./lib/notifications";

initNotifications();

createRoot(document.getElementById("root")!).render(<App />);
