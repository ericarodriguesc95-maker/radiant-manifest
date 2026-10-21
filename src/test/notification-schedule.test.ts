import { describe, it, expect } from "vitest";
import { DEFAULT_NOTIFICATION_SCHEDULE, normalizeSchedule, dueNotificationSlots } from "../../supabase/functions/_shared/notification-schedule";
describe("automatic standard reminders", () => {
  it("enables standard notifications by default", () => { expect(normalizeSchedule(null).enabled).toBe(true); });
  it("uses the existing standard reminder times", () => {
    expect(DEFAULT_NOTIFICATION_SCHEDULE).toMatchObject({ morning: "08:00", noon: "12:00", afternoon: "16:30", evening: "20:00", night: "23:30" });
  });
  it("sends at the user's edited time rather than the default", () => {
    const schedule = normalizeSchedule({ morning: "09:15" });
    expect(dueNotificationSlots(schedule, new Date("2026-10-21T12:15:00Z"))).toEqual(["morning"]);
    expect(dueNotificationSlots(schedule, new Date("2026-10-21T11:00:00Z"))).toEqual([]);
  });
  it("respects disabled reminders", () => {
    expect(dueNotificationSlots(normalizeSchedule({ enabled: false }), new Date("2026-10-21T11:00:00Z"))).toEqual([]);
  });
  it("uses the saved timezone", () => {
    expect(dueNotificationSlots(normalizeSchedule({ timezone: "UTC" }), new Date("2026-10-21T08:00:00Z"))).toEqual(["morning"]);
  });
});