"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { Statut, champ } from "@/components/ui";
import { ETAPES_MAX, ETAPES_MIN, ETAPE_MAX, type EtapeParcours } from "@/lib/projet";
import { useProjet } from "@/lib/use-projet";

type Sens = "monter" | "descendre";

const boutonIcone =
  "flex size-11 shrink-0 items-center justify-center rounded-full border border-control-line bg-surface text-ink hover:bg-primary-soft aria-disabled:cursor-not-allowed aria-disabled:border-line aria-disabled:text-muted aria-disabled:hover:bg-surface";

function Ligne({
  e,
  index,
  total,
  refBouton,
  refChamp,
  onModifier,
  onDeplacer,
  onSupprimer,
}: {
  e: EtapeParcours;
  index: number;
  total: number;
  refBouton: (sens: Sens) => (el: HTMLButtonElement | null) => void;
  refChamp: (el: HTMLInputElement | null) => void;
  onModifier: (texte: string) => void;
  onDeplacer: (sens: Sens) => void;
  onSupprimer: () => void;
}) {
  const [valeur, setValeur] = useState(e.texte);

  const valider = () => {
    const propre = valeur.trim();
    if (propre.length === 0) {
      setValeur(e.texte);
      return;
    }
    if (propre !== e.texte) onModifier(propre);
    setValeur(propre);
  };

  const premier = index === 0;
  const dernier = index === total - 1;

  return (
    <li className="flex min-w-0 items-center gap-2 rounded-2xl border border-line bg-surface p-3 sm:gap-3 sm:p-4">
      <span
        aria-hidden="true"
        className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary-soft text-sm font-bold text-primary"
      >
        {index + 1}
      </span>
      <input
        ref={refChamp}
        type="text"
        aria-label={`Texte de l'étape ${index + 1}`}
        maxLength={ETAPE_MAX}
        value={valeur}
        onChange={(ev) => setValeur(ev.target.value)}
        onBlur={valider}
        onKeyDown={(ev) => {
          if (ev.key === "Enter") {
            ev.preventDefault();
            ev.currentTarget.blur();
          }
        }}
        autoComplete="off"
        className="min-h-11 min-w-0 flex-1 rounded-lg border border-control-line bg-transparent px-2 text-base hover:bg-primary-soft"
      />
      <div className="flex shrink-0 items-center gap-1">
        <button
          type="button"
          ref={refBouton("monter")}
          aria-disabled={premier}
          onClick={() => !premier && onDeplacer("monter")}
          aria-label={`Monter « ${e.texte} »`}
          className={boutonIcone}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
            <path d="M4 11l5-5 5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <button
          type="button"
          ref={refBouton("descendre")}
          aria-disabled={dernier}
          onClick={() => !dernier && onDeplacer("descendre")}
          aria-label={`Descendre « ${e.texte} »`}
          className={boutonIcone}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
            <path d="M4 7l5 5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <button
          type="button"
          onClick={onSupprimer}
          aria-label={`Supprimer « ${e.texte} »`}
          className="flex size-11 shrink-0 items-center justify-center rounded-full text-muted hover:bg-wont-soft hover:text-ink"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
            <path d="M4 4l10 10M14 4L4 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </li>
  );
}

export function ParcoursEditeur() {
  const { projet, pret, etat, ajouterEtape, modifierEtape, supprimerEtape, deplacerEtape } =
    useProjet();
  const id = useId();
  const aideId = `${id}-aide`;
  const limiteId = `${id}-limite`;
  const [saisie, setSaisie] = useState("");
  const [annonce, setAnnonce] = useState("");
  const saisieRef = useRef<HTMLInputElement>(null);
  const boutons = useRef(new Map<string, HTMLButtonElement>());
  const champs = useRef(new Map<string, HTMLInputElement>());
  const aFocaliser = useRef<{ id: string; sens: Sens } | null>(null);
  const apresSuppression = useRef<string | null | undefined>(undefined);

  const etapes = projet.parcours;
  const n = etapes.length;
  const atteint = n >= ETAPES_MAX;
  const inactif = !pret || atteint || saisie.trim().length === 0;
  const peutContinuer = pret && n >= ETAPES_MIN;

  useEffect(() => {
    if (apresSuppression.current !== undefined) {
      const voisin = apresSuppression.current;
      apresSuppression.current = undefined;
      const champ = voisin ? champs.current.get(voisin) : null;
      (champ ?? saisieRef.current)?.focus();
      return;
    }
    const cible = aFocaliser.current;
    if (!cible) return;
    aFocaliser.current = null;
    const i = etapes.findIndex((e) => e.id === cible.id);
    if (i < 0) return;
    const bloque = cible.sens === "monter" ? i === 0 : i === etapes.length - 1;
    const sens: Sens = bloque ? (cible.sens === "monter" ? "descendre" : "monter") : cible.sens;
    boutons.current.get(`${cible.id}:${sens}`)?.focus();
  }, [etapes]);

  const surAjout = (ev: FormEvent) => {
    ev.preventDefault();
    if (!pret || atteint) return;
    const texte = saisie.trim();
    if (ajouterEtape(saisie)) {
      setSaisie("");
      setAnnonce(`Étape ajoutée : ${texte} (${n + 1} au total)`);
    }
    saisieRef.current?.focus();
  };

  const surSuppression = (e: EtapeParcours, index: number) => {
    const voisin = etapes[index + 1] ?? etapes[index - 1];
    apresSuppression.current = voisin ? voisin.id : null;
    if (supprimerEtape(e.id)) {
      setAnnonce(`Étape supprimée : ${e.texte} (${n - 1} au total)`);
    } else {
      apresSuppression.current = undefined;
    }
  };

  const surDeplacement = (e: EtapeParcours, index: number, sens: Sens) => {
    const delta = sens === "monter" ? -1 : 1;
    aFocaliser.current = { id: e.id, sens };
    if (deplacerEtape(e.id, delta)) {
      setAnnonce(`Étape ${index + 1} déplacée en position ${index + delta + 1}`);
    } else {
      aFocaliser.current = null;
    }
  };

  const manque = ETAPES_MIN - n;
  const aideVisible = pret && manque > 0;

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="grid gap-6 lg:grid-cols-[1fr_320px] lg:items-start">
        <div className="order-2 flex min-w-0 flex-col gap-6 lg:order-1">
          <form onSubmit={surAjout} className="flex flex-col gap-2" noValidate>
            <label htmlFor={`${id}-ajout`} className="text-base font-semibold">
              Ajouter une étape
            </label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                id={`${id}-ajout`}
                ref={saisieRef}
                type="text"
                maxLength={ETAPE_MAX}
                disabled={!pret}
                value={saisie}
                onChange={(ev) => setSaisie(ev.target.value)}
                placeholder="Ex. : Il ouvre le lien reçu sur WhatsApp"
                autoComplete="off"
                aria-describedby={`${id}-compte${atteint ? ` ${limiteId}` : ""}${aideVisible ? ` ${aideId}` : ""}`}
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
              {n} étape{n > 1 ? "s" : ""} sur {ETAPES_MAX} max
            </p>
            {atteint && (
              <p id={limiteId} className="text-sm font-medium text-could-ink">
                Tu as atteint {ETAPES_MAX} étapes, supprime-en une pour continuer
              </p>
            )}
          </form>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold">
              Les étapes de ton parcours
            </h2>
            {aideVisible && (
              <p id={aideId} className="text-sm text-muted">
                Ajoute encore {manque} étape{manque > 1 ? "s" : ""}
              </p>
            )}
            {pret && n === 0 && (
              <div className="rounded-2xl border border-dashed border-control-line p-6 text-center text-base text-muted">
                Aucune étape pour l&apos;instant. Écris la première ci-dessus.
              </div>
            )}
            {n > 0 && (
              <ol className="flex flex-col gap-3">
                {etapes.map((e, i) => (
                  <Ligne
                    key={e.id}
                    e={e}
                    index={i}
                    total={n}
                    refBouton={(sens) => (el) => {
                      if (el) boutons.current.set(`${e.id}:${sens}`, el);
                      else boutons.current.delete(`${e.id}:${sens}`);
                    }}
                    refChamp={(el) => {
                      if (el) champs.current.set(e.id, el);
                      else champs.current.delete(e.id);
                    }}
                    onModifier={(t) => modifierEtape(e.id, t)}
                    onDeplacer={(sens) => surDeplacement(e, i, sens)}
                    onSupprimer={() => surSuppression(e, i)}
                  />
                ))}
              </ol>
            )}
          </section>
        </div>

        <aside className="order-1 flex flex-col gap-3 rounded-2xl border border-line bg-surface p-4 lg:order-2 lg:sticky lg:top-6">
          <p className="text-base font-semibold">Astuce</p>
          <p className="rounded-xl bg-primary-soft px-3 py-2 text-sm font-medium text-ink">
            4 à 7 étapes, une action par étape. Chaque étape doit correspondre à une
            fonctionnalité Must.
          </p>
          <div role="status" aria-live="polite" className="sr-only">
            {annonce}
          </div>
        </aside>
      </div>

      <div className="sticky bottom-0 -mx-4 mt-auto flex flex-col gap-1 border-t border-line bg-bg px-4 py-2 sm:static sm:mx-0 sm:gap-2 sm:border-0 sm:bg-transparent sm:px-0 sm:py-3">
        <div aria-live="polite" className="min-h-5 truncate">
          {etat === "enregistre" && <Statut>Sauvegardé sur cet appareil</Statut>}
          {etat === "erreur" && <Statut>Sauvegarde impossible (stockage bloqué)</Statut>}
        </div>
        <div className="flex gap-2 sm:items-center">
          <Link
            href="/carte"
            className="flex min-h-12 shrink-0 items-center justify-center rounded-full px-4 text-base font-semibold hover:bg-primary-soft sm:border sm:border-control-line sm:bg-surface sm:px-6"
          >
            ← Retour
          </Link>
          {peutContinuer ? (
            <Link
              href="/export"
              className="flex min-h-12 flex-1 items-center justify-center rounded-full bg-primary px-4 text-base font-semibold text-white hover:bg-primary/90 sm:flex-none sm:px-8"
            >
              Générer mon PRD →
            </Link>
          ) : (
            <span
              aria-describedby={aideVisible ? aideId : undefined}
              className="flex min-h-12 flex-1 cursor-not-allowed items-center justify-center rounded-full bg-wont-soft px-4 text-base font-semibold text-muted sm:flex-none sm:px-8"
            >
              Générer mon PRD →
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
