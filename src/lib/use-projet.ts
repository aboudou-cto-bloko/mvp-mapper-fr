"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  CATEGORIE_PAR_DEFAUT,
  FONCTIONNALITES_MAX,
  ETAPES_MAX,
  creerEtape,
  creerFonctionnalite,
  etapesEcritureSchema,
  ecrireProjet,
  lireProjet,
  fonctionnalitesEcritureSchema,
  projetVide,
  type Categorie,
  type EtapeParcours,
  type Fonctionnalite,
  type Projet,
} from "./projet";

type Patch = Partial<Omit<Projet, "modifieLe">>;

export type EtatSauvegarde = "idle" | "enregistre" | "erreur";

const DELAI_MS = 400;

export function useProjet() {
  const [projet, setProjet] = useState<Projet>(projetVide);
  const [pret, setPret] = useState(false);
  const [etat, setEtat] = useState<EtatSauvegarde>("idle");

  const courant = useRef<Projet>(projet);
  const sale = useRef(false);
  const minuteur = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flush = useCallback(() => {
    if (minuteur.current !== null) {
      clearTimeout(minuteur.current);
      minuteur.current = null;
    }
    if (!sale.current) return;
    sale.current = false;
    setEtat(ecrireProjet(courant.current) ? "enregistre" : "erreur");
  }, []);

  useEffect(() => {
    const enregistre = lireProjet();
    if (enregistre && !sale.current) {
      courant.current = enregistre;
      setProjet(enregistre);
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- signale la fin de la lecture
    setPret(true);

    const surMasque = () => {
      if (document.visibilityState === "hidden") flush();
    };
    window.addEventListener("pagehide", flush);
    document.addEventListener("visibilitychange", surMasque);
    return () => {
      window.removeEventListener("pagehide", flush);
      document.removeEventListener("visibilitychange", surMasque);
      flush();
    };
  }, [flush]);

  const maj = useCallback(
    (patch: Patch | ((courant: Projet) => Patch)) => {
      const delta = typeof patch === "function" ? patch(courant.current) : patch;
      courant.current = {
        ...courant.current,
        ...delta,
        modifieLe: new Date().toISOString(),
      };
      sale.current = true;
      setProjet(courant.current);
      if (minuteur.current !== null) clearTimeout(minuteur.current);
      minuteur.current = setTimeout(flush, DELAI_MS);
    },
    [flush],
  );

  const appliquer = useCallback(
    (transforme: (fs: Fonctionnalite[]) => Fonctionnalite[] | null): boolean => {
      const suivantes = transforme(courant.current.fonctionnalites);
      if (suivantes === null) return false;
      const ok = fonctionnalitesEcritureSchema.safeParse(suivantes);
      if (!ok.success) return false;
      maj({ fonctionnalites: ok.data });
      return true;
    },
    [maj],
  );

  const ajouterFonctionnalite = useCallback(
    (titre: string, categorie: Categorie = CATEGORIE_PAR_DEFAUT): boolean =>
      appliquer((fs) => {
        if (titre.trim().length === 0 || fs.length >= FONCTIONNALITES_MAX) return null;
        return [...fs, creerFonctionnalite(titre, categorie)];
      }),
    [appliquer],
  );

  const classer = useCallback(
    (id: string, categorie: Categorie): boolean =>
      appliquer((fs) => fs.map((f) => (f.id === id ? { ...f, categorie } : f))),
    [appliquer],
  );

  const renommer = useCallback(
    (id: string, titre: string): boolean =>
      appliquer((fs) =>
        titre.trim().length === 0 ? null : fs.map((f) => (f.id === id ? { ...f, titre } : f)),
      ),
    [appliquer],
  );

  const supprimer = useCallback(
    (id: string): boolean => appliquer((fs) => fs.filter((f) => f.id !== id)),
    [appliquer],
  );

  const appliquerEtapes = useCallback(
    (transforme: (es: EtapeParcours[]) => EtapeParcours[] | null): boolean => {
      const suivantes = transforme(courant.current.parcours);
      if (suivantes === null) return false;
      const ok = etapesEcritureSchema.safeParse(suivantes);
      if (!ok.success) return false;
      maj({ parcours: ok.data });
      return true;
    },
    [maj],
  );

  const ajouterEtape = useCallback(
    (texte: string): boolean =>
      appliquerEtapes((es) => {
        if (texte.trim().length === 0 || es.length >= ETAPES_MAX) return null;
        return [...es, creerEtape(texte)];
      }),
    [appliquerEtapes],
  );

  const modifierEtape = useCallback(
    (id: string, texte: string): boolean =>
      appliquerEtapes((es) => {
        if (texte.trim().length === 0 || !es.some((e) => e.id === id)) return null;
        return es.map((e) => (e.id === id ? { ...e, texte } : e));
      }),
    [appliquerEtapes],
  );

  const supprimerEtape = useCallback(
    (id: string): boolean =>
      appliquerEtapes((es) => (es.some((e) => e.id === id) ? es.filter((e) => e.id !== id) : null)),
    [appliquerEtapes],
  );

  const deplacerEtape = useCallback(
    (id: string, delta: -1 | 1): boolean =>
      appliquerEtapes((es) => {
        const i = es.findIndex((e) => e.id === id);
        const j = i + delta;
        if (i < 0 || j < 0 || j >= es.length) return null;
        const copie = [...es];
        [copie[i], copie[j]] = [copie[j], copie[i]];
        return copie;
      }),
    [appliquerEtapes],
  );

  return {
    projet,
    maj,
    pret,
    etat,
    ajouterFonctionnalite,
    classer,
    renommer,
    supprimer,
    ajouterEtape,
    modifierEtape,
    supprimerEtape,
    deplacerEtape,
  };
}
