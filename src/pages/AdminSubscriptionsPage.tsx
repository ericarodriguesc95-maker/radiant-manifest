import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Crown, Search, Plus, ShieldCheck, XCircle, Infinity, RefreshCw } from "lucide-react";

export default function AdminSubscriptionsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newPlan, setNewPlan] = useState("monthly");
  const [newStatus, setNewStatus] = useState("active");

  // Check admin role
  const { data: isAdmin, isLoading: adminLoading } = useQuery({
    queryKey: ["is-admin", user?.id],
    queryFn: async () => {
      if (!user) return false;
      const { data } = await supabase.rpc("has_role", {
        _user_id: user.id,
        _role: "admin",
      });
      return !!data;
    },
    enabled: !!user,
  });

  // Fetch subscriptions
  const { data: subscriptions = [], isLoading } = useQuery({
    queryKey: ["admin-subscriptions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subscriptions")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: isAdmin === true,
  });

  // Update subscription
  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      status,
      plan_type,
      expiry_date,
    }: {
      id: string;
      status: string;
      plan_type: string;
      expiry_date: string | null;
    }) => {
      const { error } = await supabase
        .from("subscriptions")
        .update({ status, plan_type, expiry_date, updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-subscriptions"] });
      toast.success("Assinatura atualizada!");
    },
    onError: () => toast.error("Erro ao atualizar"),
  });

  // Add subscription
  const addMutation = useMutation({
    mutationFn: async () => {
      // Find user by email from profiles or just insert with a placeholder user_id
      const { data: profileData } = await supabase
        .from("profiles_public" as any)
        .select("user_id")
        .ilike("display_name", `%${newEmail}%`)
        .limit(1)
        .maybeSingle();
      const profile = (profileData as unknown) as { user_id: string } | null;

      // Try to find by auth email - query subscriptions for existing
      const expiryDate =
        newPlan === "lifetime"
          ? null
          : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

      const { error } = await supabase.from("subscriptions").insert({
        email: newEmail,
        status: newStatus,
        plan_type: newPlan,
        expiry_date: expiryDate,
        user_id: profile?.user_id || "00000000-0000-0000-0000-000000000000",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-subscriptions"] });
      toast.success("Assinatura adicionada!");
      setAddOpen(false);
      setNewEmail("");
    },
    onError: () => toast.error("Erro ao adicionar"),
  });

  if (adminLoading) return null;
  if (!isAdmin) return <Navigate to="/" replace />;

  const filtered = subscriptions.filter(
    (s) => s.email?.toLowerCase().includes(search.toLowerCase())
  );

  const statusColor = (status: string) => {
    if (status === "active") return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
    if (status === "canceled") return "bg-red-500/20 text-red-400 border-red-500/30";
    if (status === "trialing") return "bg-blue-500/20 text-blue-400 border-blue-500/30";
    return "bg-muted text-muted-foreground";
  };

  const planLabel = (plan: string) => {
    if (plan === "lifetime") return "♾️ Vitalício";
    if (plan === "monthly") return "📅 Mensal";
    return plan;
  };

  return (
    <div className="space-y-6 pb-8">
      <div className="flex items-center gap-3">
        <Crown className="h-6 w-6 text-gold" />
        <h1 className="text-2xl font-display font-bold text-foreground">
          Gerenciar Assinaturas
        </h1>
      </div>

      {/* Search + Add */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gold text-black hover:bg-gold/90">
              <Plus className="h-4 w-4 mr-1" /> Adicionar
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Assinatura</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <Input
                placeholder="Email da usuária"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
              />
              <Select value={newPlan} onValueChange={setNewPlan}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Mensal</SelectItem>
                  <SelectItem value="lifetime">Vitalício</SelectItem>
                </SelectContent>
              </Select>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="trialing">Trial</SelectItem>
                  <SelectItem value="canceled">Cancelado</SelectItem>
                  <SelectItem value="inactive">Inativo</SelectItem>
                </SelectContent>
              </Select>
              <Button
                onClick={() => addMutation.mutate()}
                disabled={!newEmail || addMutation.isPending}
                className="w-full bg-gold text-black hover:bg-gold/90"
              >
                Salvar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total", value: subscriptions.length, icon: Crown },
          { label: "Ativas", value: subscriptions.filter((s) => s.status === "active").length, icon: ShieldCheck },
          { label: "Vitalícias", value: subscriptions.filter((s) => s.plan_type === "lifetime").length, icon: Infinity },
          { label: "Canceladas", value: subscriptions.filter((s) => s.status === "canceled").length, icon: XCircle },
        ].map((stat) => (
          <Card key={stat.label} className="p-4 bg-card border-border">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
              <stat.icon className="h-3.5 w-3.5" />
              {stat.label}
            </div>
            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
          </Card>
        ))}
      </div>

      {/* List */}
      {isLoading ? (
        <p className="text-muted-foreground text-center py-8">Carregando...</p>
      ) : filtered.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">Nenhuma assinatura encontrada.</p>
      ) : (
        <div className="space-y-3">
          {filtered.map((sub) => (
            <Card key={sub.id} className="p-4 bg-card border-border space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <p className="text-sm font-semibold text-foreground">{sub.email}</p>
                  <p className="text-xs text-muted-foreground">
                    {sub.expiry_date
                      ? `Expira: ${new Date(sub.expiry_date).toLocaleDateString("pt-BR")}`
                      : "Sem expiração"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={statusColor(sub.status)}>
                    {sub.status}
                  </Badge>
                  <Badge variant="outline" className="border-gold/30 text-gold">
                    {planLabel(sub.plan_type)}
                  </Badge>
                </div>
              </div>

              {/* Quick actions */}
              <div className="flex flex-wrap gap-2">
                {sub.status !== "active" && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10"
                    onClick={() =>
                      updateMutation.mutate({
                        id: sub.id,
                        status: "active",
                        plan_type: sub.plan_type,
                        expiry_date:
                          sub.plan_type === "lifetime"
                            ? null
                            : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                      })
                    }
                  >
                    <ShieldCheck className="h-3.5 w-3.5 mr-1" /> Ativar
                  </Button>
                )}
                {sub.status !== "canceled" && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-400 border-red-500/30 hover:bg-red-500/10"
                    onClick={() =>
                      updateMutation.mutate({
                        id: sub.id,
                        status: "canceled",
                        plan_type: sub.plan_type,
                        expiry_date: sub.expiry_date,
                      })
                    }
                  >
                    <XCircle className="h-3.5 w-3.5 mr-1" /> Cancelar
                  </Button>
                )}
                {sub.plan_type !== "lifetime" && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-gold border-gold/30 hover:bg-gold/10"
                    onClick={() =>
                      updateMutation.mutate({
                        id: sub.id,
                        status: "active",
                        plan_type: "lifetime",
                        expiry_date: null,
                      })
                    }
                  >
                    <Infinity className="h-3.5 w-3.5 mr-1" /> Dar Lifetime
                  </Button>
                )}
                {sub.plan_type !== "monthly" && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-muted-foreground border-border hover:bg-muted/40"
                    onClick={() =>
                      updateMutation.mutate({
                        id: sub.id,
                        status: sub.status,
                        plan_type: "monthly",
                        expiry_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                      })
                    }
                  >
                    <RefreshCw className="h-3.5 w-3.5 mr-1" /> Mudar p/ Mensal
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
