# Architecture mvp-mapper-fr

Application Next.js 16 entièrement côté navigateur : pas de backend, pas de base de données, aucune requête sortante.

## Couches
- Pages (`src/app/*/page.tsx`) : Server Components statiques (`○ Static`), qui ne portent que le titre, le `SiteHeader`, le `Stepper` et un composant client. Routes : `/` (accueil), `/idee`, `/fonctionnalites`, `/carte`, `/parcours`, `/export`.
- Composants (`src/components`) : les éditeurs et l'export sont des composants client (`"use client"`) qui lisent et modifient le projet via `useProjet`. Les composants de structure (`site-header`, `stepper`, `logo`, `ui`) restent serveur.
- Domaine (`src/lib`) : TypeScript pur, testé avec Vitest (`*.test.ts`).
- Données : `localStorage`, clé `mvp-mapper-fr:projet:v1`. Un seul projet.

## Où se trouve quoi
| Besoin | Fichier |
|--------|---------|
| Schéma Zod, constantes (limites), lecture/écriture localStorage, helpers (compteurs, id) | `src/lib/projet.ts` |
| Hook unique par page : état, sauvegarde différée, actions | `src/lib/use-projet.ts` |
| Génération du PRD.md (pure), tranches `/feature`, nom de fichier, diagnostic | `src/lib/prd.ts` |
| Suggestions locales (Mobile Money, WhatsApp, hors-ligne, faible débit) et contraintes déduites | `src/lib/suggestions.ts` |
| Projet d'exemple et aperçu d'accueil | `src/lib/exemple.ts` |
| Nom du site, ancre de l'aperçu | `src/lib/site.ts` |
| Logo (SVG inline), favicon | `src/components/logo.tsx`, `src/app/icon.svg` |
| En-têtes de sécurité et CSP (production seulement) | `next.config.ts` |

## Flux principaux
1. Chaque page client appelle `useProjet()` : lecture de `localStorage` après montage (`pret`), valeur vide avant pour garder le HTML statique.
2. Une modification passe par `maj` ou une action (`classer`, `ajouterEtape`, ...) : validation Zod en écriture (stricte), mise à jour de l'état, écriture différée de 400 ms. Écriture forcée au masquage de l'onglet, à `pagehide` et au démontage.
3. Un événement `storage` d'un autre onglet remplace l'état local : l'autre onglet fait foi.
4. `/export` : `genererPrd(projet)` produit le Markdown, puis téléchargement (`Blob`) ou copie (`navigator.clipboard`).

## Décisions structurantes
- Sans compte ni serveur : confidentialité, rapidité sur connexion faible, coût nul. Contrepartie : les données restent sur l'appareil.
- Lecture tolérante, écriture stricte : un champ corrompu dans le stockage retombe sur sa valeur par défaut (les entrées invalides d'une liste sont ignorées) au lieu de bloquer l'app ; les actions refusent toute donnée invalide.
- Clé versionnée (`:v1`) : un changement de schéma incompatible doit passer à `:v2` avec une migration depuis `v1` (aucune migration n'existe encore).
- `genererPrd` est pure et indépendante de React, donc testable seule.
- CSP stricte en production (`unsafe-inline` requis pour les scripts d'amorçage inline de Next), absente en dev (Next y a besoin de `unsafe-eval`).
