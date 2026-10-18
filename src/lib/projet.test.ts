import { describe, expect, it } from "vitest";
import {
  ETAPE_MAX,
  NOM_MAX,
  PROBLEME_MAX,
  creerEtape,
  creerFonctionnalite,
  estVide,
  etapeSchema,
  etapesEcritureSchema,
  fonctionnalitesEcritureSchema,
  projetApresStorage,
  CLE_PROJET,
  projetSchema,
  projetVide,
} from "./projet";

const base = { nom: "x", probleme: "", appareil: null, connexion: null, modifieLe: "" };
const etape = (i: number) => ({ id: `e${i}`, texte: `Étape ${i}` });

describe("projetSchema", () => {
  it("v1 sans parcours donne []", () => {
    const r = projetSchema.parse({ ...base, fonctionnalites: [] });
    expect(r.parcours).toEqual([]);
  });

  it("parcours mixte : ignore les invalides et plafonne à 7", () => {
    const brut = [
      ...Array.from({ length: 5 }, (_, i) => etape(i)),
      { id: "", texte: "sans id" },
      { id: "z", texte: "   " },
      42,
      ...Array.from({ length: 10 }, (_, i) => etape(100 + i)),
    ];
    const r = projetSchema.parse({ ...base, fonctionnalites: [], parcours: brut });
    expect(r.parcours).toHaveLength(7);
    expect(r.parcours.every((e) => e.texte.startsWith("Étape"))).toBe(true);
  });

  it("fonctionnalités mixtes : une invalide n'efface pas les autres", () => {
    const r = projetSchema.parse({
      ...base,
      fonctionnalites: [
        { id: "a", titre: "A", categorie: "must" },
        { id: "b", titre: "B", categorie: "inconnue" },
        { id: "c", titre: "C", categorie: "could" },
      ],
    });
    expect(r.fonctionnalites.map((f) => f.id)).toEqual(["a", "c"]);
  });

  it("champs racine invalides : défaut par champ, jamais d'échec", () => {
    const r = projetSchema.parse({
      nom: "n".repeat(NOM_MAX + 20),
      probleme: "p".repeat(PROBLEME_MAX + 5),
      appareil: "tablette",
      connexion: 3,
      fonctionnalites: [{ id: "a", titre: "A", categorie: "must" }],
      modifieLe: "pas une date",
    });
    expect(r.nom).toHaveLength(NOM_MAX);
    expect(r.probleme).toHaveLength(PROBLEME_MAX);
    expect(r.appareil).toBeNull();
    expect(r.connexion).toBeNull();
    expect(r.modifieLe).toBe("");
    expect(r.fonctionnalites).toHaveLength(1);
  });

  it("modifieLe absent : défaut ; non-objet : rejet", () => {
    expect(projetSchema.parse({}).modifieLe).toBe("");
    expect(projetSchema.safeParse("x").success).toBe(false);
    expect(projetSchema.safeParse(null).success).toBe(false);
    expect(projetSchema.safeParse([]).success).toBe(false);
  });

  it("projetVide a un parcours vide", () => {
    expect(projetVide().parcours).toEqual([]);
  });
});

describe("étapes", () => {
  it("rejette un texte de 141 caractères, accepte 140", () => {
    expect(etapeSchema.safeParse({ id: "a", texte: "x".repeat(ETAPE_MAX + 1) }).success).toBe(false);
    expect(etapeSchema.safeParse({ id: "a", texte: "x".repeat(ETAPE_MAX) }).success).toBe(true);
  });

  it("écriture stricte : refuse plus de 7 étapes", () => {
    expect(etapesEcritureSchema.safeParse(Array.from({ length: 8 }, (_, i) => etape(i))).success).toBe(false);
  });

  it("creerEtape rogne et génère des ids distincts", () => {
    const a = creerEtape("  salut ");
    expect(a.texte).toBe("salut");
    expect(a.id).not.toBe(creerEtape("x").id);
  });
});

describe("suggestion (additif)", () => {
  it("tag valide conservé, invalide ignoré sans rejeter la fonctionnalité", () => {
    const r = projetSchema.parse({
      ...base,
      fonctionnalites: [
        { id: "a", titre: "A", categorie: "must", suggestion: "whatsapp" },
        { id: "b", titre: "B", categorie: "must", suggestion: "nimporte" },
        { id: "c", titre: "C", categorie: "must" },
      ],
    });
    expect(r.fonctionnalites.map((f) => f.suggestion)).toEqual(["whatsapp", undefined, undefined]);
    expect(r.fonctionnalites).toHaveLength(3);
  });

  it("creerFonctionnalite pose le tag", () => {
    expect(creerFonctionnalite("T", "must", "hors-ligne").suggestion).toBe("hors-ligne");
    expect(creerFonctionnalite("T", "must")).not.toHaveProperty("suggestion");
  });
});

describe("estVide", () => {
  it("projet vide", () => expect(estVide(projetVide())).toBe(true));
  it("nom seul = non vide", () => expect(estVide({ ...projetVide(), nom: "x" })).toBe(false));
  it("connexion seule = non vide", () => expect(estVide({ ...projetVide(), connexion: "bonne" })).toBe(false));
});

describe("écriture stricte de suggestion", () => {
  it("rejette une suggestion invalide, accepte une valide", () => {
    expect(fonctionnalitesEcritureSchema.safeParse([{ id: "a", titre: "A", categorie: "must", suggestion: "x" }]).success).toBe(false);
    expect(fonctionnalitesEcritureSchema.safeParse([{ id: "a", titre: "A", categorie: "must", suggestion: "whatsapp" }]).success).toBe(true);
    expect(fonctionnalitesEcritureSchema.safeParse([{ id: "a", titre: "A", categorie: "must" }]).success).toBe(true);
  });
});

describe("projetApresStorage", () => {
  const p = { ...projetVide(), nom: "autre onglet" };
  it("ignore une autre clé", () => {
    expect(projetApresStorage("autre", () => p)).toBeNull();
  });
  it("relit le projet pour la bonne clé", () => {
    expect(projetApresStorage(CLE_PROJET, () => p)).toEqual(p);
  });
  it("clé absente (clear) ou valeur supprimée : projet vide", () => {
    expect(projetApresStorage(null, () => null)).toEqual(projetVide());
    expect(projetApresStorage(CLE_PROJET, () => null)).toEqual(projetVide());
  });
});
