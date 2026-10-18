import { CATEGORIE_PAR_DEFAUT, type Categorie, type Fonctionnalite, type SuggestionCle } from "./projet";

export type { SuggestionCle };

export type Suggestion = {
  cle: SuggestionCle;
  /** Libellé seul, sans « + » (ajouté par l'interface). */
  chip: string;
  titre: string;
  categorie: Categorie;
};

export const SUGGESTIONS: readonly Suggestion[] = [
  { cle: "mobile-money", chip: "Mobile Money", titre: "Paiement par Mobile Money", categorie: CATEGORIE_PAR_DEFAUT },
  {
    cle: "whatsapp",
    chip: "WhatsApp",
    titre: "Notifications et partage par WhatsApp",
    categorie: CATEGORIE_PAR_DEFAUT,
  },
  {
    cle: "hors-ligne",
    chip: "Hors-ligne",
    titre: "Fonctionnement hors-ligne ou connexion instable",
    categorie: CATEGORIE_PAR_DEFAUT,
  },
  { cle: "faible-debit", chip: "Faible débit", titre: "Pages légères pour faible débit", categorie: CATEGORIE_PAR_DEFAUT },
];

function normaliser(s: string): string {
  return s.replace(/\s+/g, " ").trim().toLowerCase();
}

/** Présente : tag explicite OU titre pré-rédigé identique (casse/espaces ignorés). */
export function suggestionPresente(fs: readonly Fonctionnalite[], cle: SuggestionCle): boolean {
  const s = SUGGESTIONS.find((x) => x.cle === cle);
  if (!s) return false;
  const titre = normaliser(s.titre);
  return fs.some((f) => f.suggestion === cle || normaliser(f.titre) === titre);
}

/** Contraintes actives : présentes et non écartées (≠ wont), dans l'ordre du catalogue. */
export function contraintesActives(fs: readonly Fonctionnalite[]): SuggestionCle[] {
  return SUGGESTIONS.filter(({ cle, titre }) => {
    const t = normaliser(titre);
    return fs.some((f) => f.categorie !== "wont" && (f.suggestion === cle || normaliser(f.titre) === t));
  }).map((s) => s.cle);
}
