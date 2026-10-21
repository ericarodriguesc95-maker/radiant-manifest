import { describe, it, expect } from "vitest";
import { resolveNavigationMode, isNavigationActive, phaseLinks, mainLinks } from "@/lib/app-navigation";

describe("navigation rules", () => {
  it("uses phone navigation below 768 even with a saved site preference", () => {
    expect(resolveNavigationMode(767, "desktop")).toBe("mobile");
  });
  it("uses a sidebar on tablets from 768 to 1023", () => {
    expect(resolveNavigationMode(768, "mobile")).toBe("desktop");
    expect(resolveNavigationMode(1023, "mobile")).toBe("desktop");
  });
  it("honors notebook preferences starting at 1024", () => {
    expect(resolveNavigationMode(1024, "mobile")).toBe("mobile");
    expect(resolveNavigationMode(1024, null)).toBe("desktop");
  });
  it("distinguishes separate Home views without changing the root path", () => {
    expect(isNavigationActive("/", "/", "?view=agenda")).toBe(false);
    expect(isNavigationActive("/?view=agenda", "/", "?view=agenda")).toBe(true);
    expect(isNavigationActive("/?view=trilhas", "/", "?view=agenda")).toBe(false);
  });
  it("keeps all eight phase shortcuts on their existing destinations", () => {
    expect(phaseLinks.map(x => x.to)).toEqual(["/reprogramacao", "/diario", "/ritual-fechamento", "/evolucao", "/plano-alimentar", "/sono", "/mente-poderosa", "/guias"]);
  });
  it("places Bible immediately below Agenda and preserves the signed-in profile", () => {
    const links = mainLinks("test-user");
    expect(links[3].to).toBe("/?view=agenda");
    expect(links[4].to).toBe("/?view=biblia");
    expect(links[6].to).toBe("/perfil/test-user");
  });
});