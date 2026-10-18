@AGENTS.md

# mvp-mapper-fr

> Outil gratuit en français qui aide les développeurs francophones d'Afrique à transformer une idée en carte MVP (Must/Should/Could/Won't, ligne MVP) et à exporter un `PRD.md` prêt pour Claude Code, sans compte, données locales.

Stack : Next.js 16 · TypeScript · Tailwind.

## Commandes
```bash
npm run dev                 # serveur de dev
npm run build               # build
npx tsc --noEmit   # typecheck
npm run lint                # lint
```

## Où lire (charger seulement ce qui sert)
| Besoin | Fichier |
|--------|---------|
| Ce qu'on construit, pourquoi, hors périmètre (créé par `/prd`) | `docs/PRD.md` |
| Index de la documentation | `docs/INDEX.md` |
| Architecture, flux, où se trouve quoi | `docs/ARCHITECTURE.md` |
| Pièges de la stack | skill `stack-gotchas` |

## Workflow
- `/prd` (cadrer une idée), `/feature`, `/fix`, `/verify`, `/ship` (agents `architect`, `backend-dev`, `frontend-dev`, `reviewer`).
- Branche `feat/` ou `fix/`, jamais de push sur `main` ; commits conventionnels `type(scope): description`.
- Lire avant d'éditer. Pas de déploiement, push ni suppression de données sans confirmation.

## Règles
- Pas de `any` (`unknown` + type guards) ; validation Zod aux frontières ; aucun secret en dur (variables d'environnement).
- Pas de SQL brut (ORM ou requêtes préparées).
- Next.js 16 : `middleware.ts` devient `proxy.ts` (détails : skill `stack-gotchas`).
