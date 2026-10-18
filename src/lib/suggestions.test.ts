import { describe, expect, it } from "vitest";
import { TITRE_MAX, type Fonctionnalite } from "./projet";
import { SUGGESTIONS, contraintesActives, suggestionPresente } from "./suggestions";

const f = (over: Partial<Fonctionnalite>): Fonctionnalite => ({ id: "i", titre: "T", categorie: "should", ...over });

describe("catalogue", () => {
  it("clés uniques, titres <= TITRE_MAX, 4 entrées", () => {
    expect(SUGGESTIONS).toHaveLength(4);
    expect(new Set(SUGGESTIONS.map((s) => s.cle)).size).toBe(4);
    for (const s of SUGGESTIONS) expect(s.titre.length).toBeLessThanOrEqual(TITRE_MAX);
  });
});

describe("chip", () => {
  it("libellé seul, sans « + »", () => {
    expect(SUGGESTIONS.map((s) => s.chip)).toEqual(["Mobile Money", "WhatsApp", "Hors-ligne", "Faible débit"]);
  });
});

describe("suggestionPresente", () => {
  it("par tag ou par titre identique (casse/espaces)", () => {
    expect(suggestionPresente([f({ suggestion: "whatsapp" })], "whatsapp")).toBe(true);
    expect(suggestionPresente([f({ titre: "  paiement  PAR mobile money " })], "mobile-money")).toBe(true);
    expect(suggestionPresente([f({})], "mobile-money")).toBe(false);
  });
});

describe("contraintesActives", () => {
  it("exclut wont, ordre du catalogue", () => {
    const fs = [
      f({ suggestion: "faible-debit" }),
      f({ suggestion: "hors-ligne", categorie: "wont" }),
      f({ suggestion: "mobile-money", categorie: "must" }),
    ];
    expect(contraintesActives(fs)).toEqual(["mobile-money", "faible-debit"]);
  });
});
