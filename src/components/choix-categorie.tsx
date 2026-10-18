"use client";

import { useId } from "react";
import { CATEGORIES_UI } from "@/components/categories-ui";
import type { Categorie } from "@/lib/projet";

export function ChoixCategorie({
  titre,
  valeur,
  onChange,
}: {
  titre: string;
  valeur: Categorie;
  onChange: (c: Categorie) => void;
}) {
  const nom = useId();
  return (
    <fieldset className="min-w-0">
      <legend className="sr-only">Priorité de {titre}</legend>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {CATEGORIES_UI.map((o) => (
          <label
            key={o.cle}
            className={`flex min-h-11 cursor-pointer items-center justify-center rounded-full border border-control-line bg-surface px-3 text-sm font-semibold text-ink has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-primary ${o.coche}`}
          >
            <input
              type="radio"
              name={nom}
              value={o.cle}
              checked={valeur === o.cle}
              onChange={() => onChange(o.cle)}
              className="sr-only"
            />
            {o.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
