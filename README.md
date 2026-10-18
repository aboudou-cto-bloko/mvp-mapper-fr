# MVP Mapper

Outil gratuit, en français, qui transforme une idée de projet en carte MVP (Must, Should, Could, Won't, avec ligne MVP) et exporte un `PRD.md` prêt à donner à Claude Code. Sans compte : les données restent dans le navigateur.

## Parcours

1. **Idée** : nom, problème, appareil et connexion de la cible.
2. **Fonctionnalités** : liste, classement Must/Should/Could/Won't, suggestions locales (Mobile Money, WhatsApp, hors-ligne, faible débit), exemple pré-rempli.
3. **Carte MVP** : ligne MVP et alerte si trop de Must.
4. **Parcours** : 4 à 7 étapes du parcours utilisateur.
5. **Export** : `PRD.md` à télécharger ou copier, avec tranches `/feature`.

## Commandes

```bash
npm run dev         # serveur de développement
npm run typecheck   # TypeScript (app et tests)
npm run lint        # ESLint
npm test            # tests Vitest
npm run build       # build de production
npm start           # sert le build
```

## Structure

- `src/app` : routes (pages serveur statiques), layout, icône.
- `src/components` : composants d'interface ; les éditeurs sont des composants client.
- `src/lib` : logique pure (schéma Zod, hook `useProjet`, générateur de PRD, suggestions, exemple) et ses tests.
- `docs` : PRD, design, architecture.

## Données

Le projet est enregistré dans le `localStorage` sous la clé `mvp-mapper-fr:projet:v1`. L'application n'émet aucune requête sortante. La lecture est tolérante (champs invalides ignorés ou remis par défaut) ; en cas de changement de schéma incompatible, la clé passera à `v2` avec une migration depuis `v1` (pas encore nécessaire). Vider les données du site efface le projet.

## Déploiement

Prévu sur Vercel (`npm run build`, aucune variable d'environnement). Les en-têtes de sécurité et la CSP sont définis dans `next.config.ts` (CSP en production uniquement).

## État du projet

MVP fonctionnel : les 5 écrans, la sauvegarde locale, les suggestions, l'exemple et l'export sont en place. Pas de multi-projets, d'import ni de mode sombre pour l'instant.

Licence : [MIT](LICENSE).
