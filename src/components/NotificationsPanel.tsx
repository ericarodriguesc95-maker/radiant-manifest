import { X, Droplets, Brain, Target } from "lucide-react";

const notifications = [
  { icon: Droplets, text: "Hora de beber água! 💧", time: "Agora" },
  { icon: Brain, text: "Sua meditação diária te espera 🧘‍♀️", time: "10:00" },
  { icon: Target, text: "Revise suas metas da semana 🎯", time: "20:00" },
];

export default function NotificationsPanel({ onClose }: { onClose: () => void }) {
  return (
    <div className="mx-5 mb-4 bg-card rounded-2xl shadow-card border border-border overflow-hidden animate-fade-in">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h3 className="text-sm font-display font-semibold">Lembretes</h3>
        <button onClick={onClose} className="p-1">
          <X className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>
      <div className="divide-y divide-border">
        {notifications.map((n, i) => (
          <div key={i} className="flex items-center gap-3 p-4">
            <div className="h-8 w-8 rounded-full bg-gold/10 flex items-center justify-center">
              <n.icon className="h-4 w-4 text-gold" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-body">{n.text}</p>
            </div>
            <span className="text-[10px] text-muted-foreground font-body">{n.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
