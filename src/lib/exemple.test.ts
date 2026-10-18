import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { APERCU_EXEMPLE, projetExemple } from "./exemple";
import { PROBLEME_MAX, projetSchema } from "./projet";
import { diagnosticPrd, genererPrd } from "./prd";
import { contraintesActives } from "./suggestions";

describe("projetExemple", () => {
  const p = projetExemple("2026-10-18T10:00:00.000Z");

  it("passe projetSchema sans perte", () => {
    expect(projetSchema.parse(JSON.parse(JSON.stringify(p)))).toEqual(p);
    expect(p.probleme.length).toBeLessThanOrEqual(PROBLEME_MAX);
    expect(p.modifieLe).toBe("2026-10-18T10:00:00.000Z");
  });

  it("MVP raisonnable et PRD complet", () => {
    expect(p.fonctionnalites.filter((x) => x.categorie === "must").length).toBeLessThanOrEqual(7);
    expect(p.parcours.length).toBeGreaterThanOrEqual(4);
    expect(p.parcours.length).toBeLessThanOrEqual(7);
    expect(diagnosticPrd(p).manques).toEqual([]);
    expect(genererPrd(p).split("\n").length).toBeLessThanOrEqual(120);
    expect(contraintesActives(p.fonctionnalites)).toEqual(["mobile-money", "whatsapp", "hors-ligne"]);
  });

  it("aligné avec l'aperçu de la page d'accueil", () => {
    for (const cat of ["must", "should", "could"] as const) {
      const titres = p.fonctionnalites.filter((x) => x.categorie === cat).map((x) => x.titre);
      for (const t of APERCU_EXEMPLE[cat]) expect(titres).toContain(t);
    }
    const source = readFileSync("src/components/mvp-map-preview.tsx", "utf8");
    for (const t of Object.values(APERCU_EXEMPLE).flat()) expect(source).toContain(t);
  });
});
