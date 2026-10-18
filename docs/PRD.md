# PRD — mvp-mapper-fr (nom provisoire ?)

> Statut : brouillon à valider. `[hypothèse]` = déduit de l'idée, non confirmé. `?` = à trancher.

## Problème
- Un développeur a une idée de projet mais la liste en vrac : trop de fonctionnalités, pas de ligne MVP claire.
- Les outils de cadrage existants sont en anglais et ignorent les réalités locales (Mobile Money, WhatsApp, connexion faible) [hypothèse].
- Son brief à l'IA de code est flou → code partout, rien de livrable.

**Scène** : un dev à Cotonou [hypothèse] a une idée d'app de réservation. Il ouvre Claude Code et tape 3 lignes vagues. L'IA génère 40 fichiers dont la moitié hors sujet. Il aurait voulu arriver avec un PRD net.

## Utilisateur
Développeur francophone d'Afrique, qui code avec une IA (Claude Code).
- Appareil : laptop, parfois smartphone [hypothèse]
- Connexion : lente/instable → l'outil doit marcher léger et sans compte
- Paiement : gratuit ; aucun paiement dans l'outil
- Langue : français uniquement
- Les produits qu'il construit visent souvent Mobile Money + WhatsApp (rappels intégrés au parcours)

## Parcours
1. Arrive sur la page d'accueil, comprend la promesse en 5 secondes, clique « Commencer ».
2. Décrit son idée : nom, problème, utilisateur cible, appareil/connexion de la cible.
3. Liste les fonctionnalités qu'il imagine (une ligne chacune), avec suggestions locales (Mobile Money, WhatsApp, hors-ligne).
4. Classe chaque fonctionnalité : Must / Should / Could / Won't.
5. Voit la carte MVP : la ligne MVP (= les Must) et le reste en dessous.
6. Décrit le parcours utilisateur en 4 à 7 étapes.
7. Exporte `PRD.md` (téléchargement ou copie) à donner à Claude Code.

## Fonctionnalités
**Must**
- Formulaire « idée » (nom, problème, cible, contraintes)
- Saisie des fonctionnalités + classement Must/Should/Could/Won't
- Carte MVP visuelle avec ligne MVP
- Saisie du parcours (4 à 7 étapes)
- Export `PRD.md` en français (téléchargement + copie)
- Sauvegarde automatique locale (navigateur), sans compte
- Interface 100 % en français, légère (peu de JS, pas d'images lourdes)

**Should**
- Suggestions locales : cases à cocher Mobile Money, WhatsApp, hors-ligne, faible débit
- Alerte si plus de 7 Must (« ton MVP est trop gros »)
- Génération de tranches `/feature` à partir des Must
- Exemple pré-rempli pour comprendre en 1 minute

**Could**
- Plusieurs projets sauvegardés
- Import d'un PRD.md existant
- Partage par lien ou via WhatsApp (texte)
- Mode sombre

**Won't (v1)**
- Compte utilisateur / connexion
- Paiement, abonnement, publicité
- Génération du PRD par IA côté serveur
- Collaboration en équipe, commentaires
- Autres langues que le français
- Intégration directe à Claude Code

## Écrans
- **Accueil** : promesse + bouton « Commencer »
- **Idée** : saisir nom, problème, cible, contraintes
- **Fonctionnalités** : ajouter et classer (Must/Should/Could/Won't)
- **Carte MVP** : voir la ligne MVP, réordonner
- **Parcours** : saisir les étapes
- **Export** : prévisualiser et télécharger/copier `PRD.md`

## Données (stockées dans le navigateur [hypothèse])
- **Projet** : nom, problème, cible, appareil, connexion, date de modification
- **Fonctionnalité** : titre, catégorie (Must/Should/Could/Won't), ordre
- **Étape de parcours** : numéro, texte
- **Contraintes locales** : Mobile Money, WhatsApp, hors-ligne (oui/non)

## Critères de « terminé » [hypothèse, à valider]
- [ ] Un dev va de l'accueil à un `PRD.md` téléchargé en moins de 10 minutes
- [ ] Le fichier exporté suit la structure du PRD (problème → tranches) et reste lisible dans Claude Code
- [ ] Fermer puis rouvrir l'onglet retrouve le projet en cours
- [ ] Aucun compte ni paiement demandé
- [ ] Toute l'interface est en français
- [ ] La page d'accueil se charge correctement sur connexion lente (budget de poids à fixer ?)
- [ ] Utilisable sur smartphone (largeur 360 px)
- [ ] Au moins 3 développeurs réels testent et obtiennent un PRD exploitable ?

## Hors périmètre
Comptes, paiement, IA serveur, collaboration, multilingue, intégration Claude Code, application mobile native.

## Tranches de construction
1. `/feature "Page d'accueil en français et formulaire Idée (nom, problème, cible, appareil, connexion), sauvegarde automatique dans le navigateur, sans compte"`
2. `/feature "Écran Fonctionnalités : ajouter des fonctionnalités et les classer Must/Should/Could/Won't, persistance locale, alerte au-delà de 7 Must"`
3. `/feature "Écran Carte MVP : afficher la ligne MVP (Must) et le reste par catégorie, lisible sur mobile 360 px"`
4. `/feature "Écran Parcours (4 à 7 étapes) et écran Export : générer PRD.md en français selon la structure du PRD, avec téléchargement et copie"`
5. `/feature "Suggestions locales (Mobile Money, WhatsApp, hors-ligne, faible débit), génération des tranches /feature, exemple pré-rempli"`

## Questions ouvertes
- Nom du produit et ton (tutoiement/vouvoiement) ? Décision produit
- Quel budget de poids de page pour « connexion faible » ?
- Les contraintes Mobile Money/WhatsApp : simples rappels, ou questions guidées détaillées ?
- Le PRD exporté reprend-il exactement la structure de `/prd` ? [hypothèse : oui]
- Stockage navigateur suffisant, ou besoin de partage entre appareils ?
- Comment mesurer le succès après la v1 (nombre de PRD exportés) ? Sans compte, comment compter ?
- Cible géographique : tout le monde francophone d'Afrique, ou Bénin d'abord ?
