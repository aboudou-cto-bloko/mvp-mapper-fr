"use client";

import Link from "next/link";
import { useId, useRef, useState, type FormEvent } from "react";
import { ChoixCategorie } from "@/components/choix-categorie";
import { CATEGORIES_UI } from "@/components/categories-ui";
import { champ, Statut } from "@/components/ui";
import {
  FONCTIONNALITES_MAX,
  MUST_MAX_CONSEILLE,
  TITRE_MAX,
  compterParCategorie,
  messageResume,
  type Categorie,
  type Compteurs,
  type Fonctionnalite,
} from "@/lib/projet";
import { useProjet } from "@/lib/use-projet";

function Resume({
  compteurs,
  message,
  annonce,
  trop,
}: {
  compteurs: Compteurs;
  message: string;
  annonce: string;
  trop: boolean;
}) {
  return (
    <section
      aria-label="Résumé"
      className="flex flex-col gap-3 rounded-2xl border border-line bg-surface p-4 lg:sticky lg:top-6"
    >
      <ul className="grid grid-cols-4 gap-2">
        {CATEGORIES_UI.map((c) => (
          <li
            key={c.cle}
            className={`flex min-w-0 flex-col items-center rounded-xl px-1 py-2 ${c.compteur}`}
          >
            <span className="text-2xl font-bold leading-none">{compteurs[c.cle]}</span>
            <span className="mt-1 text-sm font-medium">{c.label}</span>
          </li>
        ))}
      </ul>
      <div role="status" aria-live="polite">
        <p
          className={`rounded-xl px-3 py-2 text-sm font-medium ${
            trop ? "bg-could-soft text-could-ink" : "bg-bg text-ink"
          }`}
        >
          {message}
        </p>
        <span className="sr-only">{annonce}</span>
      </div>
    </section>
  );
}

function Ligne({
  f,
  onClasser,
  onRenommer,
  onSupprimer,
}: {
  f: Fonctionnalite;
  onClasser: (c: Categorie) => void;
  onRenommer: (titre: string) => void;
  onSupprimer: () => void;
}) {
  const [valeur, setValeur] = useState(f.titre);

  const valider = () => {
    if (valeur.trim().length === 0) {
      setValeur(f.titre);
      return;
    }
    if (valeur.trim() !== f.titre) onRenommer(valeur);
    setValeur(valeur.trim());
  };

  return (
    <li className="flex min-w-0 flex-col gap-3 rounded-2xl border border-line bg-surface p-4">
      <div className="flex min-w-0 items-center gap-2">
        <input
          type="text"
          aria-label="Titre de la fonctionnalité"
          maxLength={TITRE_MAX}
          value={valeur}
          onChange={(e) => setValeur(e.target.value)}
          onBlur={valider}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              e.currentTarget.blur();
            }
          }}
          autoComplete="off"
          className="min-h-11 min-w-0 flex-1 break-words rounded-lg border border-transparent bg-transparent px-2 text-base font-semibold hover:border-line"
        />
        <button
          type="button"
          onClick={onSupprimer}
          aria-label={`Supprimer « ${f.titre} »`}
          className="flex size-11 shrink-0 items-center justify-center rounded-full text-muted hover:bg-wont-soft hover:text-ink"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
            <path
              d="M4 4l10 10M14 4L4 14"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>
      <ChoixCategorie titre={f.titre} valeur={f.categorie} onChange={onClasser} />
    </li>
  );
}

export function FonctionnalitesEditeur() {
  const { projet, pret, etat, ajouterFonctionnalite, classer, renommer, supprimer } =
    useProjet();
  const id = useId();
  const aideId = `${id}-aide`;
  const limiteId = `${id}-limite`;
  const [saisie, setSaisie] = useState("");
  const [annonce, setAnnonce] = useState("");
  const saisieRef = useRef<HTMLInputElement>(null);
  const titreListeRef = useRef<HTMLHeadingElement>(null);

  const fs = projet.fonctionnalites;
  const compteurs = compterParCategorie(fs);
  const atteint = fs.length >= FONCTIONNALITES_MAX;
  const inactif = !pret || atteint || saisie.trim().length === 0;
  const peutContinuer = pret && compteurs.must >= 1;

  const surAjout = (e: FormEvent) => {
    e.preventDefault();
    if (!pret || atteint) return;
    const titre = saisie.trim();
    if (ajouterFonctionnalite(saisie)) {
      setSaisie("");
      setAnnonce(`Fonctionnalité ajoutée : ${titre} (${fs.length + 1} au total)`);
    }
    saisieRef.current?.focus();
  };

  const surSuppression = (f: Fonctionnalite) => {
    if (supprimer(f.id)) {
      setAnnonce(`Fonctionnalité supprimée : ${f.titre} (${fs.length - 1} au total)`);
      titreListeRef.current?.focus();
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="grid gap-6 lg:grid-cols-[1fr_320px] lg:items-start">
        <div className="order-2 flex min-w-0 flex-col gap-6 lg:order-1">
          <form onSubmit={surAjout} className="flex flex-col gap-2" noValidate>
            <label htmlFor={`${id}-ajout`} className="text-base font-semibold">
              Ajouter une fonctionnalité
            </label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                id={`${id}-ajout`}
                ref={saisieRef}
                type="text"
                maxLength={TITRE_MAX}
                disabled={!pret}
                value={saisie}
                onChange={(e) => setSaisie(e.target.value)}
                placeholder="Ex. : Réserver un créneau"
                autoComplete="off"
                aria-describedby={`${id}-compte${atteint ? ` ${limiteId}` : ""}`}
                className={`${champ} sm:flex-1`}
              />
              <button
                type="submit"
                aria-disabled={inactif}
                className="min-h-12 rounded-full bg-primary px-8 text-base font-semibold text-white hover:bg-primary/90 aria-disabled:cursor-not-allowed aria-disabled:bg-wont-soft aria-disabled:text-muted aria-disabled:hover:bg-wont-soft"
              >
                Ajouter
              </button>
            </div>
            <p id={`${id}-compte`} className="text-sm text-muted">
              {fs.length} / {FONCTIONNALITES_MAX}
            </p>
            {atteint && (
              <p id={limiteId} className="text-sm font-medium text-could-ink">
                Tu as atteint {FONCTIONNALITES_MAX} fonctionnalités, supprime-en une pour continuer
              </p>
            )}
          </form>

          <section className="flex flex-col gap-3">
            <h2
              ref={titreListeRef}
              tabIndex={-1}
              className="text-lg font-semibold outline-none"
            >
              Tes fonctionnalités
            </h2>
            {pret && !peutContinuer && (
              <p id={aideId} className="text-sm text-muted">
                Classe au moins une fonctionnalité en Must pour continuer.
              </p>
            )}
            {pret && fs.length === 0 && (
              <div className="rounded-2xl border border-dashed border-line p-6 text-center text-base text-muted">
                Aucune fonctionnalité pour l&apos;instant. Écris la première ci-dessus.
              </div>
            )}
            {fs.length > 0 && (
              <ul className="flex flex-col gap-3">
                {fs.map((f) => (
                  <Ligne
                    key={f.id}
                    f={f}
                    onClasser={(c) => classer(f.id, c)}
                    onRenommer={(t) => renommer(f.id, t)}
                    onSupprimer={() => surSuppression(f)}
                  />
                ))}
              </ul>
            )}
          </section>
        </div>

        <div className="order-1 lg:order-2">
          <Resume
            compteurs={compteurs}
            message={messageResume(compteurs)}
            annonce={annonce}
            trop={compteurs.must > MUST_MAX_CONSEILLE}
          />
        </div>
      </div>

      <div className="sticky bottom-0 -mx-4 mt-auto flex flex-col gap-1 border-t border-line bg-bg px-4 py-2 sm:static sm:mx-0 sm:gap-2 sm:border-0 sm:bg-transparent sm:px-0 sm:py-3">
        <div aria-live="polite" className="min-h-5 truncate">
          {etat === "enregistre" && <Statut>Sauvegardé sur cet appareil</Statut>}
          {etat === "erreur" && <Statut>Sauvegarde impossible (stockage bloqué)</Statut>}
        </div>
        <div className="flex gap-2 sm:items-center">
          <Link
            href="/idee"
            className="flex min-h-12 shrink-0 items-center justify-center rounded-full px-4 text-base font-semibold hover:bg-primary-soft sm:border sm:border-line sm:bg-surface sm:px-6"
          >
            ← Retour
          </Link>
          {peutContinuer ? (
            <Link
              href="/carte"
              className="flex min-h-12 flex-1 items-center justify-center rounded-full bg-primary px-4 text-base font-semibold text-white hover:bg-primary/90 sm:flex-none sm:px-8"
            >
              Voir ma carte MVP →
            </Link>
          ) : (
            <span
              aria-describedby={pret ? aideId : undefined}
              className="flex min-h-12 flex-1 cursor-not-allowed items-center justify-center rounded-full bg-wont-soft px-4 text-base font-semibold text-muted sm:flex-none sm:px-8"
            >
              Voir ma carte MVP →
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
