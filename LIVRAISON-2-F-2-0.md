# LifeTrack Training — 2-F.2.0

Base : 2-F.1.1 validée sur iPhone (12/12). Cette livraison connecte la silhouette 3D existante aux statistiques musculaires réelles. Elle ne change ni les maillages ni les moteurs Stats.

- Volume : groupes colorés selon le nombre de séries pondérées de la période commune. Maximum de la période = 100 %, quatre classes positives et gris pour zéro. Pas de seuil physiologique ni mesure d'activation.
- Sélection : mode précédent conservé, surbrillance turquoise. Dans Volume les couleurs restent fidèles aux données même quand un groupe est sélectionné.
- Détail : total, séries principales et secondaires pondérées, détail anatomique non additif. Les séries non classées ne sont pas attribuées.
- Mise à jour : changement de période ou actualisation des statistiques répercute les valeurs et les couleurs. Période invalide/lecture impossible indiquée comme indisponible.
- Version unique 2-F.2.0 ; synchronisation automatique du cache au build.

## Vérifications locales
11 suites de tests réussies (`NODE_PATH=$(npm root -g) npm test`), dont 19 assertions nouvelles sur la normalisation et les groupes. Le contrôle de version source passe. `npm run build` tenté : s'arrête à TypeScript car React et ses déclarations ne sont pas installés localement. Compilation GitHub et recette iPhone requises. Pas de test visuel iPhone réalisé ici.

## Recette
1. Vérifier version et onglet 3D. 2. Comparer un groupe avec le total de Stats > Muscles sur la même période. 3. Changer de période (y compris vide), vérifier la légende et les détails. 4. Vérifier sélection turquoise en mode Sélection et conservation des couleurs en mode Volume. 5. Vérifier gestes, face/dos, remise à zéro et fonctionnement hors ligne. 6. Vérifier les trois onglets existants.

Le modèle demeure schématique. Le réalisme anatomique et la licence éventuelle d'un modèle externe restent à traiter.
