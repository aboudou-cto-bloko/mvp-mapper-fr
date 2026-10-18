"use client";

import Link from "next/link";
import { useId } from "react";
import { CATEGORIES_UI } from "@/components/categories-ui";
import { Bandeau } from "@/components/ui";
import {
  MUST_MAX_CONSEILLE,
  compterParCategorie,
  messageResume,
  type Categorie,
  type Fonctionnalite,
} from "@/lib/projet";
import { useProjet } from "@/lib/use-projet";

type Groupes = Record<Categorie, Fonctionnalite[]>;

function ListeFonctionnalites({ fs, categorie }: { fs: Fonctionnalite[]; categorie: Categorie }) {
  const def = CATEGORIES_UI.find((c) => c.cle === categorie);
  if (!def) return null;
  const must = categorie === "must";
  if (fs.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-line p-4 text-sm text-muted">
        Rien ici pour l&apos;instant. Ce que tu classes en {def.label} apparaît ici.
      </p>
    );
  }
  return (
    <ul className="flex flex-col gap-2">
      {fs.map((f) => (
        <li
          key={f.id}
          className={`min-w-0 overflow-hidden rounded-2xl bg-surface ${
            must ? "border-2 border-primary" : "border border-line"
          }`}
        >
          <div aria-hidden="true" className={`h-1.5 ${def.barre}`} />
          <p className="min-w-0 break-words px-4 py-3 text-base font-semibold">{f.titre}</p>
        </li>
      ))}
    </ul>
  );
}

function Pastille({ categorie, n, grosse }: { categorie: Categorie; n: number; grosse?: boolean }) {
  const def = CATEGORIES_UI.find((c) => c.cle === categorie);
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-bold ${
        grosse ? "min-w-8 px-2 py-1 text-base" : "min-w-7 px-2 py-0.5 text-sm"
      } ${def?.compteur ?? ""}`}
    >
      {n}
      <span className="sr-only"> fonctionnalité{n > 1 ? "s" : ""}</span>
    </span>
  );
}

function Chevron() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
      className="shrink-0 text-muted transition-transform group-open:rotate-180"
    >
      <path d="M5 8l5 5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function CarteMvp() {
  const { projet, pret } = useProjet();
  const id = useId();
  const messageId = `${id}-garde`;

  const fs = projet.fonctionnalites;
  const compteurs = compterParCategorie(fs);
  const groupes: Groupes = { must: [], should: [], could: [], wont: [] };
  for (const f of fs) groupes[f.categorie].push(f);

  const gardeFou = pret && compteurs.must === 0;
  const vide = pret && fs.length === 0;
  const trop = pret && compteurs.must > MUST_MAX_CONSEILLE;
  const peutContinuer = pret && compteurs.must >= 1;

  const mustDef = CATEGORIES_UI.find((c) => c.cle === "must");
  const autres = CATEGORIES_UI.filter((c) => c.cle !== "must");

  return (
    <div className="flex flex-1 flex-col gap-6">
      {!pret && (
        <div aria-hidden="true" className="grid animate-pulse motion-reduce:animate-none grid-cols-2 gap-3 lg:grid-cols-4">
          {CATEGORIES_UI.map((c) => (
            <div key={c.cle} className="h-48 rounded-2xl bg-wont-soft" />
          ))}
        </div>
      )}

      {/* Conteneurs live toujours montés : seul le texte change */}
      <div role="status">
        {gardeFou && (
          <p
            id={messageId}
            className="rounded-2xl border border-line bg-surface p-4 text-base font-medium"
          >
            {messageResume(compteurs)}
          </p>
        )}
      </div>
      {gardeFou && (
        <Link
          href="/fonctionnalites"
          className="-mt-3 flex min-h-12 w-fit items-center rounded-full bg-primary px-6 text-base font-semibold text-white hover:bg-primary/90"
        >
          Aller aux fonctionnalités
        </Link>
      )}

      <div role="status">{trop && <Bandeau trop>{messageResume(compteurs)}</Bandeau>}</div>

      {pret && !vide && (
        <>
          {/* Bureau : 4 colonnes */}
          <div className="hidden grid-cols-4 items-start gap-4 lg:grid">
            {CATEGORIES_UI.map((c) => (
              <section key={c.cle} aria-labelledby={`${id}-d-${c.cle}`} className="flex min-w-0 flex-col gap-3">
                <h2
                  id={`${id}-d-${c.cle}`}
                  className="flex items-center gap-2 text-lg font-semibold"
                >
                  {c.colonne}
                  <Pastille categorie={c.cle} n={compteurs[c.cle]} grosse={c.cle === "must"} />
                </h2>
                <ListeFonctionnalites fs={groupes[c.cle]} categorie={c.cle} />
              </section>
            ))}
          </div>

          {/* Mobile et tablette : Must déplié, le reste replié */}
          <div className="flex flex-col gap-4 lg:hidden">
            <section aria-labelledby={`${id}-m-must`} className="flex min-w-0 flex-col gap-3">
              <h2 id={`${id}-m-must`} className="flex items-center gap-2 text-lg font-semibold">
                {mustDef?.colonne}
                <Pastille categorie="must" n={compteurs.must} grosse />
              </h2>
              <ListeFonctionnalites fs={groupes.must} categorie="must" />
            </section>

            <div className="flex items-center gap-3" role="separator" aria-label="Ligne MVP">
              <span aria-hidden="true" className="h-0.5 flex-1 bg-primary" />
              <span
                aria-hidden="true"
                className="rounded-full bg-primary px-3 py-1 text-sm font-bold tracking-wide text-white"
              >
                LIGNE MVP
              </span>
              <span aria-hidden="true" className="h-0.5 flex-1 bg-primary" />
            </div>

            {autres.map((c) => (
              <details key={c.cle} className="group min-w-0 rounded-2xl border border-control-line bg-surface">
                <summary className="flex min-h-12 cursor-pointer list-none items-center gap-2 rounded-2xl px-4 py-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary [&::-webkit-details-marker]:hidden">
                  <h2 className="flex flex-1 items-center gap-2 text-lg font-semibold">
                    {c.colonne}
                    <Pastille categorie={c.cle} n={compteurs[c.cle]} />
                  </h2>
                  <Chevron />
                </summary>
                <div className="px-3 pb-3">
                  <ListeFonctionnalites fs={groupes[c.cle]} categorie={c.cle} />
                </div>
              </details>
            ))}
          </div>
        </>
      )}

      <div className="sticky bottom-0 -mx-4 mt-auto flex gap-2 border-t border-line bg-bg px-4 py-2 sm:static sm:mx-0 sm:items-center sm:border-0 sm:bg-transparent sm:px-0 sm:py-3">
        <Link
          href="/fonctionnalites"
          aria-label="Modifier les fonctionnalités"
          className="flex min-h-12 shrink-0 items-center justify-center rounded-full px-4 text-base font-semibold hover:bg-primary-soft sm:border sm:border-control-line sm:bg-surface sm:px-6"
        >
          <span className="sm:hidden">← Modifier</span>
          <span className="hidden sm:inline">← Modifier les fonctionnalités</span>
        </Link>
        {peutContinuer ? (
          <Link
            href="/parcours"
            className="flex min-h-12 flex-1 items-center justify-center rounded-full bg-primary px-4 text-base font-semibold text-white hover:bg-primary/90 sm:flex-none sm:px-8"
          >
            Décrire le parcours →
          </Link>
        ) : (
          <span
            className="flex min-h-12 flex-1 cursor-not-allowed items-center justify-center rounded-full bg-wont-soft px-4 text-base font-semibold text-muted sm:flex-none sm:px-8"
          >
            Décrire le parcours →
          </span>
        )}
      </div>
    </div>
  );
}
