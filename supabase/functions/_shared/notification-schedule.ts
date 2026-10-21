export const DEFAULT_NOTIFICATION_SCHEDULE = {
  enabled: true, morning: "08:00", noon: "12:00", afternoon: "16:30",
  evening: "20:00", night: "23:30", timezone: "America/Sao_Paulo",
};
export const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;
export type NotificationSchedule = typeof DEFAULT_NOTIFICATION_SCHEDULE;
export type NotificationSlot = "morning" | "noon" | "afternoon" | "evening" | "night";
export const NOTIFICATION_SLOTS: NotificationSlot[] = ["morning", "noon", "afternoon", "evening", "night"];
export function normalizeSchedule(value: unknown): NotificationSchedule {
  const raw = value && typeof value === "object" ? value as Record<string, unknown> : {};
  const result = { ...DEFAULT_NOTIFICATION_SCHEDULE };
  result.enabled = raw.enabled !== false;
  for (const slot of NOTIFICATION_SLOTS) {
    if (typeof raw[slot] === "string" && TIME_PATTERN.test(raw[slot])) result[slot] = raw[slot];
  }
  if (typeof raw.timezone === "string") {
    try { new Intl.DateTimeFormat("en", { timeZone: raw.timezone }); result.timezone = raw.timezone; } catch {}
  }
  return result;
}
export function scheduleClock(date: Date, timezone: string) {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: timezone, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(date);
  const get = (name: string) => parts.find(p => p.type === name)?.value || "";
  return { time: `${get("hour")}:${get("minute")}`, day: `${get("year")}-${get("month")}-${get("day")}` };
}
export function dueNotificationSlots(schedule: NotificationSchedule, date: Date) {
  if (!schedule.enabled) return [];
  const { time } = scheduleClock(date, schedule.timezone);
  return NOTIFICATION_SLOTS.filter(slot => schedule[slot] === time);
}