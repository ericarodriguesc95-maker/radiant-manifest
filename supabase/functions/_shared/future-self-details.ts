export interface FutureSelfDetails { goal: string; challenge: string; feeling: string; age: number; city: string }
export function parseFutureSelfDetails(raw: unknown): FutureSelfDetails | null {
  if (!raw || typeof raw !== "object") return null;
  const value = raw as Record<string, unknown>;
  const keys = ["goal", "challenge", "feeling"] as const;
  if (keys.some(key => typeof value[key] !== "string" || !value[key].trim() || value[key].length > 300)) return null;
  if (typeof value.age !== "number" || !Number.isInteger(value.age) || value.age < 1 || value.age > 120 || typeof value.city !== "string" || !value.city.trim() || value.city.length > 100) return null;
  return { goal: String(value.goal).trim(), challenge: String(value.challenge).trim(), feeling: String(value.feeling).trim(), age: value.age, city: value.city.trim() };
}