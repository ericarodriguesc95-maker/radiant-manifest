import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type SubscriptionStatus = "active" | "canceled" | "trialing" | "inactive" | "loading";

interface SubscriptionData {
  status: SubscriptionStatus;
  plan_type: "monthly" | "lifetime" | null;
  expiry_date: string | null;
}

export function useSubscription() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionData>({
    status: "loading",
    plan_type: null,
    expiry_date: null,
  });

  useEffect(() => {
    if (!user) {
      setSubscription({ status: "inactive", plan_type: null, expiry_date: null });
      return;
    }

    const fetchSubscription = async () => {
      const { data, error } = await supabase
        .from("subscriptions")
        .select("status, plan_type, expiry_date")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error || !data) {
        setSubscription({ status: "inactive", plan_type: null, expiry_date: null });
        return;
      }

      // Check expiry for non-lifetime plans
      if (data.plan_type !== "lifetime" && data.expiry_date) {
        const expiry = new Date(data.expiry_date);
        if (expiry < new Date()) {
          setSubscription({ status: "canceled", plan_type: data.plan_type as any, expiry_date: data.expiry_date });
          return;
        }
      }

      setSubscription({
        status: data.status as SubscriptionStatus,
        plan_type: data.plan_type as any,
        expiry_date: data.expiry_date,
      });
    };

    fetchSubscription();
  }, [user]);

  const isActive = subscription.plan_type === "lifetime" ||
    subscription.status === "active" ||
    subscription.status === "trialing";

  const isLifetime = subscription.plan_type === "lifetime";
  const isLoading = subscription.status === "loading";

  return { subscription, isActive, isLifetime, isLoading };
}
