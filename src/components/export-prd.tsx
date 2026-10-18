"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { diagnosticPrd, genererPrd, nomFichierPrd } from "@/lib/prd";
import { useProjet } from "@/lib/use-projet";

const SECTIONS = [
  "Problème et utilisateur",
  "Parcours en étapes",
  "Fonctionnalités Must, Should, Could, Won't",
  "Hors périmètre",
  "Critères de « terminé »",
  "Tranches de construction",
  "Questions ouvertes",
] as const;

function lienManque(manque: string): { href: string; label: string } {
  if (manque.startsWith("Nom")) return { href: "/idee", label: "Ajouter le nom" };
  if (manque.includes("Must")) return { href: "/fonctionnalites", label: "Classer un Must" };
  return { href: "/parcours", label: "Écrire le parcours" };
}

const bouton =
  "flex min-h-12 w-full items-center justify-center rounded-full px-6 text-base font-semibold aria-disabled:cursor-not-allowed";

export function ExportPrd() {
  const { projet, pret } = useProjet();
  const texte = useMemo(() => genererPrd(projet), [projet]);
  const diag = diagnosticPrd(projet);
  const bloque = !pret || diag.manques.length > 0;
  const [message, setMessage] = useState("");
  const apercuRef = useRef<HTMLPreElement>(null);

  const telecharger = () => {
    if (bloque) return;
    const blob = new Blob([texte], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = nomFichierPrd(projet.nom);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    setMessage("PRD.md téléchargé");
  };

  const copier = async () => {
    if (bloque) return;
    try {
      await navigator.clipboard?.writeText(texte);
      if (navigator.clipboard) {
        setMessage("Texte copié");
        return;
      }
    } catch {
      // repli ci-dessous
    }
    try {
      const el = apercuRef.current;
      const sel = window.getSelection();
      if (el && sel) {
        const plage = document.createRange();
        plage.selectNodeContents(el);
        sel.removeAllRanges();
        sel.addRange(plage);
        if (document.execCommand("copy")) {
          setMessage("Texte copié");
          return;
        }
      }
    } catch {
      // dernier recours ci-dessous
    }
    setMessage("Copie impossible : sélectionne le texte ci-dessus et copie-le");
  };

  return (
    <div className="flex flex-1 flex-col gap-6">
      {pret && diag.manques.length > 0 && (
        <section
          aria-labelledby="manques-titre"
          className="flex flex-col gap-3 rounded-2xl border border-line bg-could-soft p-4"
        >
          <h2 id="manques-titre" className="text-lg font-semibold text-could-ink">
            Il manque quelques éléments pour générer ton PRD
          </h2>
          <ul className="flex flex-col gap-2">
            {diag.manques.map((m) => {
              const l = lienManque(m);
              return (
                <li key={m} className="flex flex-wrap items-center gap-x-3 text-base text-could-ink">
                  <span>{m}</span>
                  <Link
                    href={l.href}
                    className="flex min-h-11 items-center font-semibold underline underline-offset-2"
                  >
                    {l.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}
      {pret && diag.manques.length === 0 && diag.avertissements.length > 0 && (
        <ul className="flex flex-col gap-2">
          {diag.avertissements.map((a) => (
            <li key={a} className="rounded-xl bg-could-soft px-3 py-2 text-sm font-medium text-could-ink">
              {a}.{" "}
              <Link href="/parcours" className="inline-flex min-h-11 items-center font-semibold underline">
                Compléter le parcours
              </Link>
            </li>
          ))}
        </ul>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_340px] lg:items-start">
        <div className="order-2 min-w-0 lg:order-1">
          {pret && diag.manques.length === 0 ? (
            <pre
              ref={apercuRef}
              tabIndex={0}
              aria-label="Aperçu du PRD"
              className="max-h-[28rem] overflow-auto whitespace-pre-wrap break-words rounded-2xl bg-ink p-4 font-mono text-sm leading-relaxed text-bg sm:p-6 lg:max-h-[36rem]"
            >
              {texte}
            </pre>
          ) : (
            <div
              aria-hidden="true"
              className="h-64 rounded-2xl bg-wont-soft motion-safe:animate-pulse"
            />
          )}
        </div>

        <div className="order-1 flex min-w-0 flex-col gap-4 lg:order-2">
          <section
            aria-labelledby="actions-titre"
            className="flex flex-col gap-3 rounded-2xl border border-line bg-surface p-4"
          >
            <h2 id="actions-titre" className="text-lg font-semibold">
              Que veux-tu faire ?
            </h2>
            <button
              type="button"
              aria-disabled={bloque}
              onClick={telecharger}
              className={`${bouton} bg-primary text-white hover:bg-primary/90 aria-disabled:bg-wont-soft aria-disabled:text-muted aria-disabled:hover:bg-wont-soft`}
            >
              Télécharger PRD.md
            </button>
            <button
              type="button"
              aria-disabled={bloque}
              onClick={copier}
              className={`${bouton} border border-control-line bg-surface hover:bg-primary-soft aria-disabled:border-line aria-disabled:text-muted aria-disabled:hover:bg-surface`}
            >
              Copier le texte
            </button>
            <div role="status" aria-live="polite" className="min-h-5 text-sm font-medium text-primary">
              {message}
            </div>
            <p className="text-sm text-muted">
              Place le fichier à la racine de ton projet, puis demande à Claude Code de lire PRD.md
              et de lancer la première tranche.
            </p>
          </section>

          <section
            aria-labelledby="contenu-titre"
            className="flex flex-col gap-2 rounded-2xl bg-primary-soft p-4"
          >
            <h2 id="contenu-titre" className="text-base font-semibold">
              Ce que contient ton PRD
            </h2>
            <ul className="flex list-disc flex-col gap-1 pl-5 text-sm text-ink">
              {SECTIONS.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </section>
        </div>
      </div>

      <div className="sticky bottom-0 -mx-4 mt-auto flex border-t border-line bg-bg px-4 py-2 sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:px-0 sm:py-3">
        <Link
          href="/parcours"
          className="flex min-h-12 items-center justify-center rounded-full px-4 text-base font-semibold hover:bg-primary-soft sm:border sm:border-control-line sm:bg-surface sm:px-6"
        >
          ← Retour
        </Link>
      </div>
    </div>
  );
}
