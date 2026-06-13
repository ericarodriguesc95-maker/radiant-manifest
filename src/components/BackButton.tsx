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
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full glass border border-gold/20 text-xs font-body text-foreground hover:bg-gold/10 hover:border-gold/40 transition-all active:scale-95"
      >
        <ArrowLeft className="h-3.5 w-3.5 text-gold" />
        Voltar
      </button>
    </div>
  );
}
