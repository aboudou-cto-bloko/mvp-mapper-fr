import type { Categorie } from "@/lib/projet";

export const CATEGORIES_UI: {
  cle: Categorie;
  label: string;
  /** Pastille de compteur. */
  compteur: string;
  /** Libellé de colonne sur la carte. */
  colonne: string;
  /** Barre colorée en haut d'une carte (non textuelle, >= 3:1 sur blanc). */
  barre: string;
  /** Segment coché d'un choix de catégorie. */
  coche: string;
}[] = [
  {
    cle: "must",
    label: "Must",
    colonne: "Must",
    barre: "bg-primary",
    compteur: "bg-primary text-white",
    coche: "has-checked:border-primary has-checked:bg-primary has-checked:text-white",
  },
  {
    cle: "should",
    label: "Should",
    colonne: "Should",
    barre: "bg-should",
    compteur: "bg-should-soft text-should-ink",
    coche: "has-checked:border-should has-checked:bg-should-soft has-checked:text-should-ink",
  },
  {
    cle: "could",
    label: "Could",
    colonne: "Could",
    barre: "bg-could",
    compteur: "bg-could-soft text-could-ink",
    coche: "has-checked:border-could has-checked:bg-could-soft has-checked:text-could-ink",
  },
  {
    cle: "wont",
    label: "Won't",
    colonne: "Won't (v1)",
    barre: "bg-wont",
    compteur: "bg-wont-soft text-ink",
    coche: "has-checked:border-wont has-checked:bg-wont-soft has-checked:text-ink",
  },
];
