import { ArrowLeft } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

/**
 * Universal back button shown at the top of every screen except Home ("/").
 * Uses browser history when available, falls back to "/".
 */
export default function BackButton() {
  const navigate = useNavigate();
  const location = useLocation();

  if (location.pathname === "/") return null;

  const handleBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate("/");
  };

  return (
    <div className="px-4 pt-3">
      <button
        onClick={handleBack}
        aria-label="Voltar"
        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:bg-secondary active:scale-95"
      >
        <ArrowLeft className="h-4 w-4" />
      </button>
    </div>
  );
}

