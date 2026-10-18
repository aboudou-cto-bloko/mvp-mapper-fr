import { z } from "zod";

export const CLE_PROJET = "mvp-mapper-fr:projet:v1";

export const NOM_MAX = 80;
export const PROBLEME_MAX = 600;

export const projetSchema = z.object({
  nom: z.string().max(NOM_MAX).default(""),
  probleme: z.string().max(PROBLEME_MAX).default(""),
  appareil: z.enum(["smartphone", "ordinateur", "les-deux"]).nullable().default(null),
  connexion: z.enum(["bonne", "instable"]).nullable().default(null),
  modifieLe: z.string(),
});

export type Projet = z.infer<typeof projetSchema>;

export function projetVide(): Projet {
  return { nom: "", probleme: "", appareil: null, connexion: null, modifieLe: "" };
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
