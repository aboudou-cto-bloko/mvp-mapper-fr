# Design — mvp-mapper-fr

Maquette dans Lunacy (page courante) : 7 frames. Références : tableau Pinterest privé « MVP Mapper FR - UI » (4 épingles : matrice de priorisation, 2 formulaires en étapes, hero de landing).

Statut : **maquette validée** par l'utilisateur. Correction relevée dans Lunacy : sur l'accueil, la rangée de 3 cartes du bas (Mobile Money, WhatsApp, Connexion faible) est supprimée ; l'accueil = barre, hero, aperçu de la carte MVP.

## Écrans (frames Lunacy)
| Frame | Taille | Écran PRD |
|-------|--------|-----------|
| 01 · Accueil | 1440×900 | Accueil |
| 06 · Idée | 1440×900 | Idée |
| 02 · Fonctionnalités | 1440×900 | Fonctionnalités |
| 03 · Carte MVP | 1440×900 | Carte MVP |
| 07 · Parcours | 1440×900 | Parcours |
| 04 · Export PRD | 1440×900 | Export |
| 05 · Carte MVP mobile | 390×844 | Carte MVP, smartphone |

## Principes
- Une action principale par écran (bouton vert plein), le reste en secondaire.
- Stepper en 5 étapes en haut ; sauvegarde locale visible (« Sauvegardé sur cet appareil »).
- Couleur = sens : vert Must, bleu Should, ambre Could, gris Won't.
- Mobile : colonnes repliées en accordéons, bouton fixe en bas.
- Léger : aucune image, une seule police, ombres rares (faible débit).

## Tokens
| Rôle | Valeur |
|------|--------|
| Fond | `#F6F4EE` |
| Surface | `#FFFFFF` |
| Texte | `#14201A` |
| Texte atténué | `#5E6B63` |
| Bordure | `#D9D5C8` |
| Primaire / Must | `#0B6B4D` (fond doux `#DDF0E6`) |
| Should | `#2563EB` (fond doux `#E0E9FD`) |
| Could | `#B7791F` (fond doux `#FBEFD3`) |
| Won't | `#5E6B63` (fond doux `#ECECEA`) |
| Texte Should sur fond doux (AA) | `#1F4FD6` (5,48:1) |
| Texte Could sur fond doux (AA) | `#8A5A14` (5,18:1) |
| Police | Inter (Regular, Medium, SemiBold, Bold) |
| Rayons | cartes 16–24, champs 12–14, boutons pilule |
| Espacement | 4 / 8 / 12 / 16 / 24 / 32 |

## À valider
- Palette et nom « MVP Mapper » : provisoires, décision produit.
- Écran Idée : manque l'état d'erreur et l'état vide.
- Contraste du texte atténué sur fond crème à vérifier (AA).
