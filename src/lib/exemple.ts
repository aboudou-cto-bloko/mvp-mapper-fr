import { creerEtape, creerFonctionnalite, type Projet } from "./projet";

/** Titres affichés dans l'aperçu de la page d'accueil (sous-ensemble de l'exemple). */
export const APERCU_EXEMPLE = {
  must: ["Choisir un créneau", "Payer l'acompte par Mobile Money", "Rappel WhatsApp au client"],
  should: ["Avis clients", "Statistiques simples"],
  could: ["Mode sombre"],
} as const;

export function projetExemple(modifieLe: string = new Date().toISOString()): Projet {
  return {
    nom: "RDV Salon",
    probleme:
      "Dans mon salon de coiffure à Cotonou, les clientes appellent pour réserver. " +
      "Quand personne ne répond, le salon perd des rendez-vous. " +
      "Je veux une appli simple pour réserver un créneau et réduire les absences.",
    appareil: "smartphone",
    connexion: "instable",
    fonctionnalites: [
      creerFonctionnalite("Choisir un créneau", "must"),
      creerFonctionnalite("Payer l'acompte par Mobile Money", "must", "mobile-money"),
      creerFonctionnalite("Rappel WhatsApp au client", "must", "whatsapp"),
      creerFonctionnalite("Voir et annuler ma réservation", "must"),
      creerFonctionnalite("Avis clients", "should"),
      creerFonctionnalite("Statistiques simples", "should"),
      creerFonctionnalite("Fonctionnement hors-ligne ou connexion instable", "should", "hors-ligne"),
      creerFonctionnalite("Mode sombre", "could"),
      creerFonctionnalite("Programme de fidélité", "wont"),
    ],
    parcours: [
      "La cliente ouvre le lien du salon sur son téléphone",
      "Elle choisit la coiffure et un créneau libre",
      "Elle paie l'acompte par Mobile Money",
      "Elle reçoit la confirmation et un rappel sur WhatsApp",
      "Elle vient au salon, ou annule sa réservation à temps",
    ].map(creerEtape),
    modifieLe,
  };
}
