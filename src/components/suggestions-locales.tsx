"use client";

import { useId } from "react";
import { FONCTIONNALITES_MAX, type Fonctionnalite, type SuggestionCle } from "@/lib/projet";
import { SUGGESTIONS, suggestionPresente } from "@/lib/suggestions";

type Props = {
  pret: boolean;
  fonctionnalites: readonly Fonctionnalite[];
  ajouterSuggestion: (cle: SuggestionCle) => "ajoutee" | "deja" | "limite";
  onAnnonce: (message: string) => void;
  className?: string;
};

export function SuggestionsLocales({
  pret,
  fonctionnalites,
  ajouterSuggestion,
  onAnnonce,
  className = "flex",
}: Props) {
  const id = useId();
  const titreId = `${id}-titre`;
  const limiteId = `${id}-limite`;
  const atteint = fonctionnalites.length >= FONCTIONNALITES_MAX;

  const surClic = (cle: SuggestionCle, titre: string) => {
    if (!pret) return;
    if (suggestionPresente(fonctionnalites, cle)) {
      onAnnonce(`${titre} : déjà dans ta liste`);
      return;
    }
    if (atteint) {
      onAnnonce(`Limite de ${FONCTIONNALITES_MAX} fonctionnalités atteinte`);
      return;
    }
    const r = ajouterSuggestion(cle);
    if (r === "ajoutee") {
      onAnnonce(`Ajouté : ${titre} (${fonctionnalites.length + 1} au total)`);
    } else if (r === "deja") {
      onAnnonce(`${titre} : déjà dans ta liste`);
    } else {
      onAnnonce(`Limite de ${FONCTIONNALITES_MAX} fonctionnalités atteinte`);
    }
  };

  return (
    <section
      aria-labelledby={titreId}
      className={`flex-col gap-3 rounded-2xl border border-line bg-surface p-4 ${className}`}
    >
      <div>
        <h2 id={titreId} className="text-base font-semibold">
          Suggestions locales
        </h2>
        <p className="mt-1 text-sm text-muted">
          Contraintes à cocher si elles concernent ton projet.
        </p>
      </div>
      <div role="group" aria-labelledby={titreId} className="flex flex-wrap gap-2">
        {SUGGESTIONS.map((s) => {
          const coche = suggestionPresente(fonctionnalites, s.cle);
          const bloque = !pret || (!coche && atteint);
          return (
            <button
              key={s.cle}
              type="button"
              aria-label={coche ? `${s.chip}, déjà ajouté` : undefined}
              aria-disabled={bloque || undefined}
              aria-describedby={!coche && atteint ? limiteId : undefined}
              onClick={() => surClic(s.cle, s.titre)}
              className={`flex min-h-11 items-center gap-1.5 rounded-full border px-4 text-base font-medium transition-colors motion-reduce:transition-none aria-disabled:cursor-not-allowed aria-disabled:text-muted ${
                coche
                  ? "border-primary bg-primary-soft text-ink"
                  : "border-control-line bg-surface text-ink hover:bg-primary-soft aria-disabled:hover:bg-surface"
              }`}
            >
              <span aria-hidden="true" className="font-bold text-primary">
                {coche ? "✓" : "+"}
              </span>
              {s.chip}
            </button>
          );
        })}
      </div>
      {atteint && (
        <p id={limiteId} className="text-sm font-medium text-could-ink">
          Limite de {FONCTIONNALITES_MAX} atteinte, supprime une fonctionnalité pour en ajouter.
        </p>
      )}
    </section>
  );
}
