import { describe, expect, it } from "vitest";
import { diagnosticPrd, genererPrd, nettoyer, nomFichierPrd, repartirTranches } from "./prd";
import { projetVide, type Categorie, type Projet } from "./projet";

const musts = (n: number) => Array.from({ length: n }, (_, i) => `Must ${i + 1}`);

function projet(over: Partial<Projet> = {}): Projet {
  return { ...projetVide(), ...over };
}

function avecMusts(n: number): Projet {
  return projet({
    fonctionnalites: musts(n).map((titre, i) => ({ id: `m${i}`, titre, categorie: "must" as Categorie })),
  });
}

describe("nettoyer", () => {
  it("neutralise la structure markdown", () => {
    const r = nettoyer("# Titre\n[x](http://a) <b>");
    expect(r).toBe("\\# Titre \\[x\\](http://a) \\<b\\>");
    expect(r).not.toContain("\n");
  });
});

describe("nettoyer (durcissement)", () => {
  it("retire contrôle et bidi", () => {
    expect(nettoyer("a\u202Eb\u200Bc\u0000d\te")).toBe("abcd e");
  });
  it("échappe les débuts de liste", () => {
    expect(nettoyer("- x")).toBe("\\- x");
    expect(nettoyer("+ x")).toBe("\\+ x");
    expect(nettoyer("1. x")).toBe("1\\. x");
    expect(nettoyer("12) x")).toBe("12\\) x");
  });
});

describe("prompts et taille", () => {
  it("titre vide après nettoyage : pas de /feature vide", () => {
    const p = projet({ fonctionnalites: [{ id: "a", titre: "```", categorie: "must" }] });
    expect(genererPrd(p)).not.toContain('/feature ""');
  });

  it("40 fonctionnalités : au plus 120 lignes", () => {
    const cats: Categorie[] = ["must", "should", "could", "wont"];
    for (const mode of ["must", "mixte"] as const) {
      const p = projet({
        nom: "Gros",
        probleme: "Un problème",
        appareil: "les-deux",
        connexion: "instable",
        parcours: Array.from({ length: 7 }, (_, i) => ({ id: `e${i}`, texte: `Étape ${i}` })),
        fonctionnalites: Array.from({ length: 40 }, (_, i) => ({
          id: `f${i}`,
          titre: `Fonction ${i}`,
          categorie: mode === "must" ? "must" : cats[i % 4],
        })),
      });
      expect(genererPrd(p).split("\n").length).toBeLessThanOrEqual(120);
    }
  });

  it("projet normal : contenu complet (un critère par Must)", () => {
    const md = genererPrd(avecMusts(5));
    for (const t of musts(5)) expect(md).toContain(`- [ ] ${t} fonctionne de bout en bout`);
  });
});

describe("nomFichierPrd", () => {
  it("slugifie", () => {
    expect(nomFichierPrd("Café Réservé !")).toBe("prd-cafe-reserve.md");
  });
  it("repli", () => {
    expect(nomFichierPrd("")).toBe("prd-projet.md");
    expect(nomFichierPrd("!!!")).toBe("prd-projet.md");
  });
});

describe("tranches", () => {
  it.each([
    [1, 1],
    [2, 2],
    [3, 3],
    [4, 3],
    [6, 3],
    [8, 4],
    [12, 5],
  ])("%i Must -> %i tranches, sans perte ni doublon", (m, attendu) => {
    const t = repartirTranches(musts(m));
    expect(t).toHaveLength(attendu);
    expect(t.flat()).toEqual(musts(m));
    const tailles = t.map((g) => g.length);
    expect(Math.max(...tailles) - Math.min(...tailles)).toBeLessThanOrEqual(1);
    expect(tailles).toEqual([...tailles].sort((a, b) => b - a));
  });

  it("apparaissent dans le PRD", () => {
    const prd = genererPrd(avecMusts(4));
    expect(prd).toContain('1. `/feature "Must 1 + Must 2"`');
    expect(prd).toContain('3. `/feature "Must 4"`');
  });
});

describe("genererPrd", () => {
  it("projet vide : sections en ?", () => {
    const prd = genererPrd(projet());
    expect(prd).toContain("# PRD — ?");
    expect(prd).toContain("le ?");
    expect(prd).toContain("## Problème\n\n?");
    expect(prd).toContain("## Parcours\n\n?");
    expect(prd).toContain("## Hors périmètre\n\n?");
    expect(prd).toContain("## Tranches de construction\n\n?");
    expect(prd).toContain("**Must**\n- ?");
    expect(prd).toContain("- Appareil : ?");
  });

  it("projet normal : au plus 120 lignes", () => {
    const p = projet({
      nom: "Resto",
      probleme: "Ligne 1\n\nLigne 2",
      appareil: "les-deux",
      connexion: "instable",
      modifieLe: "2026-10-18T10:00:00.000Z",
      fonctionnalites: [
        ...musts(7).map((titre, i) => ({ id: `m${i}`, titre, categorie: "must" as Categorie })),
        { id: "s1", titre: "S", categorie: "should" },
        { id: "w1", titre: "W", categorie: "wont" },
      ],
      parcours: [1, 2, 3, 4, 5].map((i) => ({ id: `e${i}`, texte: `Étape ${i}` })),
    });
    const prd = genererPrd(p);
    expect(prd.split("\n").length).toBeLessThanOrEqual(120);
    expect(prd).toContain("le 2026-10-18");
    expect(prd).toContain("Le parcours en 5 étapes");
    expect(prd).toContain("Utilisable sur connexion instable");
    expect(prd).toContain("Utilisable sur smartphone (360 px)");
    expect(prd).not.toContain("MVP trop gros");
  });

  it("alerte si plus de 7 Must", () => {
    expect(genererPrd(avecMusts(8))).toContain("MVP trop gros : 8 Must (conseil ≤ 7)");
  });

  it("saisie piégée inerte", () => {
    const piege = "# x [a](javascript:alert(1))";
    const prd = genererPrd(
      projet({
        nom: piege,
        probleme: piege,
        parcours: [{ id: "e", texte: piege }],
        fonctionnalites: [{ id: "f", titre: `${piege} "q" \`c\``, categorie: "must" }],
      }),
    );
    const horsCode = prd.split("\n").filter((l) => !l.includes("/feature")).join("\n");
    expect(horsCode).not.toMatch(/(^|[^\\])\[a\]/m);
    expect(prd).not.toMatch(/^# x/m);
    expect(prd).not.toMatch(/^> #/m);
    expect(prd).not.toMatch(/^\d\. #/m);
    const feature = prd.split("\n").find((l) => l.includes("/feature"));
    expect(feature).toBeDefined();
    expect(feature).not.toMatch(/`.*`.*`/);
  });
});

describe("diagnosticPrd", () => {
  it("projet vide : manques", () => {
    const d = diagnosticPrd(projet());
    expect(d.manques).toHaveLength(3);
    expect(d.avertissements).toEqual([]);
  });
  it("parcours court : avertissement", () => {
    const d = diagnosticPrd({
      ...avecMusts(1),
      nom: "N",
      parcours: [{ id: "a", texte: "t" }],
    });
    expect(d.manques).toEqual([]);
    expect(d.avertissements).toHaveLength(1);
  });
});
