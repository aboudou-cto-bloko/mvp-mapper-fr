"use client";

import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { estVide, lireProjet, type Projet } from "@/lib/projet";
import { projetExemple } from "@/lib/exemple";
import { useProjet } from "@/lib/use-projet";

type Props = {
  variante: "exemple" | "zero";
  pret: boolean;
  remplacerProjet: (p: Projet) => boolean;
  /** Projet courant en mémoire (si l'appelant édite : peut être en avance sur le stockage). */
  projetCourant?: Projet;
  /** Appelé après un « Repartir de zéro » réussi (ex. rendre le focus à un champ). */
  apresEfface?: () => void;
  /** Cache le bouton déclencheur (ex. projet déjà vide) en gardant l'annonce de statut. */
  masque?: boolean;
  className?: string;
};

type Demande = { nom: string; nb: number };

const lienSecondaire =
  "inline-flex min-h-11 items-center rounded-full px-3 text-base font-semibold text-primary underline underline-offset-4 hover:bg-primary-soft aria-disabled:cursor-not-allowed aria-disabled:text-muted";

export function ExempleProjetActions({
  variante,
  pret,
  remplacerProjet,
  projetCourant,
  apresEfface,
  masque = false,
  className = "",
}: Props) {
  const router = useRouter();
  const id = useId();
  const [demande, setDemande] = useState<Demande | null>(null);
  const [message, setMessage] = useState("");
  const declencheur = useRef<HTMLButtonElement>(null);
  const annuler = useRef<HTMLButtonElement>(null);

  const exemple = variante === "exemple";
  const libelle = exemple ? "Voir un exemple" : "Repartir de zéro";

  useEffect(() => {
    if (demande) annuler.current?.focus();
  }, [demande]);

  const executer = (): void => {
    if (exemple) {
      if (!remplacerProjet(projetExemple())) {
        setMessage(
          "Impossible d'enregistrer l'exemple (stockage du navigateur bloqué).",
        );
        return;
      }
      setMessage("Exemple chargé");
      router.push("/carte");
      return;
    }
    const ok = remplacerProjet({
      nom: "",
      probleme: "",
      appareil: null,
      connexion: null,
      fonctionnalites: [],
      parcours: [],
      modifieLe: "",
    });
    setMessage(
      ok
        ? "Projet effacé"
        : "Projet effacé, mais le stockage du navigateur est bloqué",
    );
    apresEfface?.();
  };

  const surClic = () => {
    if (!pret && !exemple) return;
    // Lecture au moment du clic, jamais pendant le rendu.
    // Un stockage illisible (lireProjet() = null) est traité comme vide.
    const actuel = projetCourant ?? lireProjet();
    if (actuel === null || estVide(actuel)) {
      if (exemple) executer();
      return;
    }
    setMessage("");
    setDemande({ nom: actuel.nom.trim(), nb: actuel.fonctionnalites.length });
  };

  const annulerDemande = () => {
    setDemande(null);
    declencheur.current?.focus();
  };

  const confirmer = () => {
    setDemande(null);
    executer();
  };

  const surTouche = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      e.stopPropagation();
      annulerDemande();
    }
  };

  const titreId = `${id}-titre`;
  const texteId = `${id}-texte`;

  return (
    <div
      className={`flex flex-col gap-3 ${masque && !message ? "hidden" : ""} ${className}`}
    >
      <button
        ref={declencheur}
        hidden={masque}
        type="button"
        aria-disabled={!exemple && !pret ? true : undefined}
        aria-expanded={demande !== null}
        onClick={surClic}
        className={lienSecondaire}
      >
        {libelle}
      </button>
      {demande && (
        <div
          role="alertdialog"
          aria-labelledby={titreId}
          aria-describedby={texteId}
          onKeyDown={surTouche}
          className="flex flex-col gap-3 rounded-2xl border border-danger bg-danger-soft p-4"
        >
          <p id={titreId} className="text-base font-semibold">
            {exemple ? "Remplacer ton projet ?" : "Effacer ce projet ?"}
          </p>
          <p id={texteId} className="text-base leading-relaxed">
            {exemple
              ? `Ton projet actuel ${demande.nom ? `« ${demande.nom} » ` : ""}sera remplacé par l'exemple. Cette action est définitive.`
              : `Tu perdras tout (nom, problème, ${demande.nb} fonctionnalité${demande.nb > 1 ? "s" : ""}, parcours). Pense à exporter ton PRD avant.`}
          </p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              ref={annuler}
              type="button"
              onClick={annulerDemande}
              className="flex min-h-12 items-center justify-center rounded-full border border-control-line bg-surface px-6 text-base font-semibold hover:bg-primary-soft"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={confirmer}
              className="flex min-h-12 items-center justify-center rounded-full bg-danger px-6 text-base font-semibold text-white hover:bg-danger/90"
            >
              {exemple ? "Remplacer par l'exemple" : "Effacer le projet"}
            </button>
          </div>
        </div>
      )}
      <p role="status" aria-live="polite" className="sr-only">
        {message}
      </p>
      {message.startsWith("Impossible") && (
        <p className="text-sm font-medium text-could-ink">{message}</p>
      )}
    </div>
  );
}

/** Version autonome (page d'accueil : aucune autre instance de useProjet sur la page). */
export function VoirExemple({ className }: { className?: string }) {
  const { pret, remplacerProjet } = useProjet();
  return (
    <ExempleProjetActions
      variante="exemple"
      pret={pret}
      remplacerProjet={remplacerProjet}
      className={className}
    />
  );
}
