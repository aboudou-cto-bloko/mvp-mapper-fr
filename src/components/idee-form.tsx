"use client";

import Link from "next/link";
import { useId, type ReactNode } from "react";
import { NOM_MAX, PROBLEME_MAX, type Projet } from "@/lib/projet";
import { useProjet } from "@/lib/use-projet";

type Appareil = NonNullable<Projet["appareil"]>;
type Connexion = NonNullable<Projet["connexion"]>;

const APPAREILS: { valeur: Appareil; label: string }[] = [
  { valeur: "smartphone", label: "Smartphone" },
  { valeur: "ordinateur", label: "Ordinateur" },
  { valeur: "les-deux", label: "Les deux" },
];

const CONNEXIONS: { valeur: Connexion; label: string }[] = [
  { valeur: "bonne", label: "Bonne" },
  { valeur: "instable", label: "Instable" },
];

const champ =
  "min-h-12 w-full rounded-xl border border-line bg-surface px-4 py-3 text-base placeholder:text-muted";

function Choix<T extends string>({
  legende,
  nom,
  options,
  valeur,
  onChange,
}: {
  legende: string;
  nom: string;
  options: { valeur: T; label: string }[];
  valeur: T | null;
  onChange: (v: T) => void;
}) {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-2 text-base font-semibold">{legende}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <label
            key={o.valeur}
            className="flex min-h-11 cursor-pointer items-center gap-2 rounded-full border border-line bg-surface px-4 text-base font-medium has-checked:border-primary has-checked:bg-primary-soft has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-primary"
          >
            <input
              type="radio"
              name={nom}
              value={o.valeur}
              checked={valeur === o.valeur}
              onChange={() => onChange(o.valeur)}
              className="size-4 accent-primary"
            />
            {o.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function Statut({ children }: { children: ReactNode }) {
  return <p className="text-sm text-muted">{children}</p>;
}

export function IdeeForm() {
  const { projet, maj, pret, etat } = useProjet();
  const id = useId();
  const aideId = `${id}-aide`;
  const peutContinuer = pret && projet.nom.trim().length > 0;

  return (
    <form
      onSubmit={(e) => e.preventDefault()}
      className="flex flex-1 flex-col gap-6"
      noValidate
    >
      <div className="flex flex-col gap-2">
        <label htmlFor={`${id}-nom`} className="text-base font-semibold">
          Nom du projet
        </label>
        <input
          id={`${id}-nom`}
          type="text"
          maxLength={NOM_MAX}
          disabled={!pret}
          value={projet.nom}
          onChange={(e) => maj({ nom: e.target.value })}
          placeholder="Ex. : RDV Salon"
          autoComplete="off"
          className={champ}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor={`${id}-pb`} className="text-base font-semibold">
          Quel problème résous-tu, et pour qui ?
        </label>
        <textarea
          id={`${id}-pb`}
          maxLength={PROBLEME_MAX}
          disabled={!pret}
          rows={5}
          value={projet.probleme}
          onChange={(e) => maj({ probleme: e.target.value })}
          aria-describedby={`${id}-pb-compte`}
          className={champ}
        />
        <p id={`${id}-pb-compte`} className="text-sm text-muted">
          {projet.probleme.length} / {PROBLEME_MAX} caractères
        </p>
      </div>

      <Choix
        legende="Sur quel appareil ta cible utilise-t-elle ton produit ?"
        nom="appareil"
        options={APPAREILS}
        valeur={projet.appareil}
        onChange={(v) => maj({ appareil: v })}
      />
      <Choix
        legende="Quelle est sa connexion ?"
        nom="connexion"
        options={CONNEXIONS}
        valeur={projet.connexion}
        onChange={(v) => maj({ connexion: v })}
      />

      <aside className="rounded-2xl bg-primary-soft p-4">
        <p className="text-sm font-semibold text-primary">Astuce</p>
        <p className="mt-1 text-sm leading-relaxed">
          Décris une scène concrète : qui, où, quand. Un problème précis donne un MVP plus petit
          et plus facile à construire.
        </p>
      </aside>

      <div className="sticky bottom-0 -mx-4 mt-auto flex flex-col gap-2 border-t border-line bg-bg px-4 py-3 sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:px-0">
        <div aria-live="polite" className="min-h-5">
          {etat === "enregistre" && <Statut>Sauvegardé sur cet appareil</Statut>}
          {etat === "erreur" && (
            <Statut>Impossible de sauvegarder (stockage du navigateur bloqué)</Statut>
          )}
        </div>
        {peutContinuer ? (
          <Link
            href="/fonctionnalites"
            className="flex min-h-12 items-center justify-center rounded-full bg-primary px-8 text-base font-semibold text-white hover:bg-primary/90 sm:w-fit"
          >
            Continuer →
          </Link>
        ) : (
          <span
            role="link"
            aria-disabled="true"
            aria-describedby={pret ? aideId : undefined}
            className="flex min-h-12 cursor-not-allowed items-center justify-center rounded-full bg-wont-soft px-8 text-base font-semibold text-muted sm:w-fit"
          >
            Continuer →
          </span>
        )}
        {pret && !peutContinuer && (
          <p id={aideId} className="text-sm text-muted">
            Donne un nom à ton projet pour continuer.
          </p>
        )}
      </div>
    </form>
  );
}
