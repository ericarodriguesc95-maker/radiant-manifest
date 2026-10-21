import { describe, it, expect } from "vitest";
import { parseFutureSelfDetails } from "../../supabase/functions/_shared/future-self-details";
describe("future-self personalization", () => {
  it("requires the user's goal, challenge and desired feeling", () => {
    expect(parseFutureSelfDetails({ goal: "Cuidar da saúde", challenge: "Constância", feeling: "Confiante", age: 30, city: "São Paulo" })).toEqual({ goal: "Cuidar da saúde", challenge: "Constância", feeling: "Confiante", age: 30, city: "São Paulo" });
    expect(parseFutureSelfDetails({ goal: "Cuidar da saúde", challenge: "Constância" })).toBeNull();
  });
  it("requires age and city", () => {
    expect(parseFutureSelfDetails({ goal: "Saúde", challenge: "Constância", feeling: "Confiante" })).toBeNull();
    expect(parseFutureSelfDetails({ goal: "Saúde", challenge: "Constância", feeling: "Confiante", age: 30, city: "" })).toBeNull();
  });
  it("rejects empty or excessively long personal input", () => {
    expect(parseFutureSelfDetails({ goal: " ", challenge: "Constância", feeling: "Confiante" })).toBeNull();
    expect(parseFutureSelfDetails({ goal: "x".repeat(301), challenge: "Constância", feeling: "Confiante" })).toBeNull();
  });
});