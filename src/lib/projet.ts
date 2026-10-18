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

export const ETAPES_MIN = 4;
export const ETAPES_MAX = 7;
export const ETAPE_MAX = 140;

export const etapeSchema = z.object({
  id: z.string().min(1).max(64),
  texte: z.string().trim().min(1).max(ETAPE_MAX),
});

export type EtapeParcours = z.infer<typeof etapeSchema>;

/** Lecture (localStorage) : garde les entrées valides, ignore les autres, plafonne. */
function lectureTolerante<S extends z.ZodType>(schema: S, max: number) {
  return z.unknown().transform((brut): z.output<S>[] => {
    if (!Array.isArray(brut)) return [];
    const valides: z.output<S>[] = [];
    for (const element of brut as unknown[]) {
      const r = schema.safeParse(element);
      if (r.success) valides.push(r.data);
      if (valides.length >= max) break;
    }
    return valides;
  });
}

/** Écriture (actions) : stricte, sans rattrapage. */
export const fonctionnalitesEcritureSchema = z.array(fonctionnaliteSchema).max(FONCTIONNALITES_MAX);
export const etapesEcritureSchema = z.array(etapeSchema).max(ETAPES_MAX);

const fonctionnalitesLectureSchema = lectureTolerante(fonctionnaliteSchema, FONCTIONNALITES_MAX);
const etapesLectureSchema = lectureTolerante(etapeSchema, ETAPES_MAX);

/** Lecture tolérante champ par champ : un champ invalide retombe sur sa valeur par défaut. */
const modifieLeSchema = z
  .string()
  .refine((s) => s === "" || !Number.isNaN(Date.parse(s)))
  .catch("");

export const projetSchema = z.object({
  nom: z.string().transform((s) => s.slice(0, NOM_MAX)).catch(""),
  probleme: z.string().transform((s) => s.slice(0, PROBLEME_MAX)).catch(""),
  appareil: z.enum(["smartphone", "ordinateur", "les-deux"]).nullable().catch(null),
  connexion: z.enum(["bonne", "instable"]).nullable().catch(null),
  fonctionnalites: fonctionnalitesLectureSchema.catch([]),
  parcours: etapesLectureSchema.catch([]),
  modifieLe: modifieLeSchema,
});

export type Projet = z.infer<typeof projetSchema>;

export function projetVide(): Projet {
  return { nom: "", probleme: "", appareil: null, connexion: null, fonctionnalites: [], parcours: [], modifieLe: "" };
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

function nouvelId(): string {
  return typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `f-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function creerFonctionnalite(titre: string, categorie: Categorie): Fonctionnalite {
  return { id: nouvelId(), titre: titre.trim(), categorie };
}

export function creerEtape(texte: string): EtapeParcours {
  return { id: nouvelId(), texte: texte.trim() };
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
