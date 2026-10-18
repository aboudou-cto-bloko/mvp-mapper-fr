"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ecrireProjet, lireProjet, projetVide, type Projet } from "./projet";

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
    (patch: Partial<Omit<Projet, "modifieLe">>) => {
      courant.current = {
        ...courant.current,
        ...patch,
        modifieLe: new Date().toISOString(),
      };
      sale.current = true;
      setProjet(courant.current);
      if (minuteur.current !== null) clearTimeout(minuteur.current);
      minuteur.current = setTimeout(flush, DELAI_MS);
    },
    [flush],
  );

  return { projet, maj, pret, etat };
}
