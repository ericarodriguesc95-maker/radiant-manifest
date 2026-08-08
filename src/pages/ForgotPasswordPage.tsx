import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Mail, ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } else {
      setSent(true);
      toast({ title: "Email enviado! 📧", description: "Verifique sua caixa de entrada." });
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{
        background: `linear-gradient(180deg, hsl(32 30% 97% / 0.92), hsl(30 28% 94% / 0.92)),
          radial-gradient(100% 60% at 50% 0%, hsl(32 30% 100% / 0.7) 0%, transparent 55%),
          radial-gradient(100% 60% at 50% 100%, hsl(24 45% 88% / 0.35) 0%, transparent 55%),
          radial-gradient(45% 90% at -5% 50%, hsl(24 48% 88% / 0.35) 0%, transparent 55%),
          radial-gradient(45% 90% at 105% 50%, hsl(19 48% 84% / 0.32) 0%, transparent 55%)`,
        backdropFilter: "blur(18px) saturate(1.05)",
        WebkitBackdropFilter: "blur(18px) saturate(1.05)",
      }}
    >
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-2xl font-display">Recuperar Senha</CardTitle>
          <CardDescription>{sent ? "Verifique seu email" : "Enviaremos um link de redefinição"}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!sent ? (
            <form onSubmit={handleReset} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="email" type="email" placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10" required />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Enviando..." : "Enviar link"}
              </Button>
            </form>
          ) : (
            <p className="text-sm text-center text-muted-foreground">
              Um email foi enviado para <strong className="text-foreground">{email}</strong>. Clique no link para redefinir sua senha.
            </p>
          )}
          <Link to="/login" className="flex items-center justify-center gap-1 text-sm text-primary hover:underline">
            <ArrowLeft className="h-4 w-4" /> Voltar ao login
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
