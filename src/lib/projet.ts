import { z } from "zod";

export const CLE_PROJET = "mvp-mapper-fr:projet:v1";

export const NOM_MAX = 80;
export const PROBLEME_MAX = 600;

export const TITRE_MAX = 80;
export const FONCTIONNALITES_MAX = 40;
export const MUST_MAX_CONSEILLE = 7;

export const CATEGORIES = ["must", "should", "could", "wont"] as const;
export type Categorie = (typeof CATEGORIES)[number];
export const CATEGORIE_PAR_DEFAUT: Categorie = "should";

export const fonctionnaliteSchema = z.object({
  id: z.string().min(1).max(64),
  titre: z.string().trim().min(1).max(TITRE_MAX),
  categorie: z.enum(CATEGORIES),
});

export type Fonctionnalite = z.infer<typeof fonctionnaliteSchema>;

/** Écriture (actions) : stricte, sans rattrapage. */
export const fonctionnalitesEcritureSchema = z.array(fonctionnaliteSchema).max(FONCTIONNALITES_MAX);

/** Lecture (localStorage) : garde les entrées valides, ignore les autres. */
const fonctionnalitesLectureSchema = z.unknown().transform((brut): Fonctionnalite[] => {
  if (!Array.isArray(brut)) return [];
  const valides: Fonctionnalite[] = [];
  for (const element of brut as unknown[]) {
    const r = fonctionnaliteSchema.safeParse(element);
    if (r.success) valides.push(r.data);
    if (valides.length >= FONCTIONNALITES_MAX) break;
  }
  return valides;
});

export const projetSchema = z.object({
  nom: z.string().max(NOM_MAX).default(""),
  probleme: z.string().max(PROBLEME_MAX).default(""),
  appareil: z.enum(["smartphone", "ordinateur", "les-deux"]).nullable().default(null),
  connexion: z.enum(["bonne", "instable"]).nullable().default(null),
  fonctionnalites: fonctionnalitesLectureSchema,
  modifieLe: z.string(),
});

export type Projet = z.infer<typeof projetSchema>;

export function projetVide(): Projet {
  return { nom: "", probleme: "", appareil: null, connexion: null, fonctionnalites: [], modifieLe: "" };
}

export function lireProjet(): Projet | null {
  try {
    const brut = window.localStorage.getItem(CLE_PROJET);
    if (brut === null) return null;
    const donnees: unknown = JSON.parse(brut);
    const resultat = projetSchema.safeParse(donnees);
    return resultat.success ? resultat.data : null;
  } catch {
    return null;
  }
}

export function ecrireProjet(p: Projet): boolean {
  try {
    window.localStorage.setItem(CLE_PROJET, JSON.stringify(p));
    return true;
  } catch {
    return false;
  }
}

export function creerFonctionnalite(titre: string, categorie: Categorie): Fonctionnalite {
  const id =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `f-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  return { id, titre: titre.trim(), categorie };
}

export type Compteurs = Record<Categorie, number>;

export function compterParCategorie(fs: readonly Fonctionnalite[]): Compteurs {
  const c: Compteurs = { must: 0, should: 0, could: 0, wont: 0 };
  for (const f of fs) c[f.categorie] += 1;
  return c;
}

export function messageResume(c: Compteurs): string {
  const total = c.must + c.should + c.could + c.wont;
  if (total === 0) return "Ajoute tes premières idées";
  if (c.must === 0) return "Choisis au moins une fonctionnalité Must pour tracer ta ligne MVP";
  if (c.must > MUST_MAX_CONSEILLE) {
    return `Ton MVP est trop gros : ${c.must} Must. Vise ${MUST_MAX_CONSEILLE} au maximum, passe les autres en Should.`;
  }
  return "Ton MVP est raisonnable";
}
