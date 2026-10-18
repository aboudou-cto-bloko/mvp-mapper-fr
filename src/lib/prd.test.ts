import { describe, expect, it } from "vitest";
import { diagnosticPrd, genererPrd, nettoyer, nomFichierPrd, planifierTranches } from "./prd";
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

describe("problème multiligne", () => {
  it("600 caractères de sauts de ligne : PRD <= 120 lignes", () => {
    const probleme = Array.from({ length: 300 }, () => "a").join("\n");
    const md = genererPrd(projet({ probleme: probleme.slice(0, 600) }));
    expect(md.split("\n").length).toBeLessThanOrEqual(120);
    expect(md).toContain("> a");
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
  const fsMust = (titres: string[]) =>
    titres.map((titre, i) => ({ id: `m${i}`, titre, categorie: "must" as Categorie }));
  const prompts = (t: { elements: string[] }[]) => t.flatMap((x) => x.elements);

  it("0 Must : aucune tranche", () => {
    expect(planifierTranches([], [])).toEqual([]);
  });

  it("1 Must : Socle seul", () => {
    const t = planifierTranches(fsMust(["A"]), []);
    expect(t).toHaveLength(1);
    expect(t[0].titre).toBe("Socle");
    expect(t[0].elements[0]).toContain("A");
    expect(t[0].elements[0]).toContain("sans paiements ni messages");
  });

  it("2 Must : Socle + 1 tranche", () => {
    expect(planifierTranches(fsMust(["A", "B"]), []).map((x) => x.titre)).toEqual(["Socle", "Cœur"]);
  });

  it("8 Must : 5 tranches max, aucun Must perdu", () => {
    const t = planifierTranches(fsMust(musts(8)), []);
    expect(t).toHaveLength(5);
    const texte = prompts(t).join("\n");
    for (const m of musts(8)) expect(texte).toContain(m);
  });

  it("12 Must : toujours 5 tranches, tailles équilibrées", () => {
    const t = planifierTranches(fsMust(musts(12)), []);
    expect(t).toHaveLength(5);
    expect(t[4].elements[0]).toContain("Must 12");
    expect(t.slice(1).map((x) => x.elements[0].split(" + ").length)).toEqual([3, 3, 3, 2]);
  });

  it("40 Must : 5 tranches équilibrées, aucun Must perdu ni dupliqué", () => {
    const m = musts(40);
    const t = planifierTranches(fsMust(m), []);
    expect(t).toHaveLength(5);
    const tailles = t.slice(1).map((x) => x.elements[0].split(" + ").length);
    expect(tailles).toEqual([10, 10, 10, 9]);
    const texte = prompts(t).join("\n");
    for (const x of m) expect(texte.match(new RegExp(`${x}(?!\\d)`, "g"))).toHaveLength(1);
  });

  it("socle : parenthèse seulement si le premier Must n'est pas une intégration", () => {
    expect(planifierTranches(fsMust(["Paiement en ligne"]), [])[0].elements[0]).not.toContain("sans paiements");
    expect(planifierTranches(fsMust(["Liste"]), [])[0].elements[0]).toContain("sans paiements ni messages");
  });

  it("variantes Mobile Money seulement si la contrainte est active", () => {
    const fs = fsMust(["Socle", "Accueil", "Payer avec MoMo", "Orange-Money", "Mobile-Money"]);
    const sans = planifierTranches(fs, []).map((x) => x.titre);
    expect(sans.slice(1)).not.toContain("Intégrations");
    const avec = planifierTranches(fs, ["mobile-money"]);
    expect(avec.map((x) => x.titre)).toContain("Intégrations");
    expect(prompts(avec).join("\n")).toContain("bac à sable");
    const hyphen = planifierTranches(fsMust(["Socle", "Mobile-Money"]), []);
    expect(hyphen[1].titre).toBe("Intégrations");
  });

  it("ordre stable : cœur avant intégrations, ordre relatif conservé", () => {
    const t = planifierTranches(
      fsMust(["Accueil", "Rappel WhatsApp", "Paiement en ligne", "Liste", "Profil", "Envoi d'e-mail"]),
      [],
    );
    const texte = prompts(t).join("\n");
    const pos = (s: string) => texte.indexOf(s);
    expect(pos("Liste")).toBeLessThan(pos("Profil"));
    expect(pos("Profil")).toBeLessThan(pos("Rappel WhatsApp"));
    expect(pos("Rappel WhatsApp")).toBeLessThan(pos("Paiement en ligne"));
    expect(pos("Paiement en ligne")).toBeLessThan(pos("Envoi d'e-mail"));
  });

  it("mots-clés insensibles à la casse et aux accents", () => {
    const t = planifierTranches(fsMust(["Socle", "NOTIFICATION push", "Écran résumé", "Réservation"]), []);
    expect(t[1].titre).toBe("Cœur");
    expect(t[2].titre).toBe("Intégrations");
  });

  it("chaque prompt se termine par la garantie d'usage", () => {
    for (const p of prompts(planifierTranches(fsMust(musts(6)), []))) {
      expect(p.endsWith(" — vérifier que l'app reste utilisable après cette tranche\""))
        .toBe(true);
    }
  });

  it("contexte local seulement si la contrainte est active", () => {
    const fs = fsMust(["Socle", "Payer par Mobile Money", "Rappel WhatsApp"]);
    const sans = prompts(planifierTranches(fs, [])).join("\n");
    expect(sans).not.toContain("bac à sable");
    expect(sans).not.toContain("modèle de message");
    const avec = prompts(planifierTranches(fs, ["mobile-money", "whatsapp"])).join("\n");
    expect(avec).toContain("paiement Mobile Money (bac à sable d'abord, gestion de l'échec)");
    expect(avec).toContain("messages WhatsApp en français (modèle de message, repli si l'envoi échoue)");
  });

  it("déterministe et titres accentués conservés", () => {
    const fs = fsMust(["Écran d'accueil", "Café à emporter", "Règlement", "Été"]);
    const a = planifierTranches(fs, []);
    expect(planifierTranches(fs, [])).toEqual(a);
    expect(prompts(a).join("\n")).toContain("Café à emporter");
  });

  it("apparaissent dans le PRD avec le pied attendu", () => {
    const p = projet({
      fonctionnalites: [
        ...fsMust(["A", "B", "C"]),
        ...["s1", "s2", "s3", "s4", "s5", "s6"].map((titre) => ({
          id: titre,
          titre,
          categorie: "should" as Categorie,
        })),
      ],
    });
    const prd = genererPrd(p);
    expect(prd).toContain("1. Socle : `/feature");
    expect(prd).toContain("Ordre proposé, à ajuster selon les dépendances. Après la v1 : les Should (s1, s2, s3, s4, s5, …), puis les Could.");
  });
});

describe("contraintes locales dans le PRD", () => {
  it("aucune renseignée par défaut", () => {
    expect(genererPrd(projet())).toContain("- Contraintes locales : aucune renseignée");
  });
  it("actives : libellés et critères", () => {
    const prd = genererPrd(
      projet({
        fonctionnalites: [
          { id: "1", titre: "X", categorie: "must", suggestion: "whatsapp" },
          { id: "2", titre: "Y", categorie: "should", suggestion: "mobile-money" },
          { id: "3", titre: "Z", categorie: "wont", suggestion: "hors-ligne" },
        ],
      }),
    );
    expect(prd).toContain("- Contraintes locales : Mobile Money, WhatsApp\n");
    expect(prd).toContain("- [ ] Le paiement Mobile Money est testé en bac à sable (échec et annulation compris)");
    expect(prd).toContain("- [ ] Les messages WhatsApp partent avec un texte en français relu");
    expect(prd).not.toContain("coupure");
    expect(prd.indexOf("Les messages WhatsApp")).toBeLessThan(prd.indexOf("Mesure de succès"));
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
