# LifeTrack Training — 2-E.4.4

## Périmètre
- Trois modes de réalisation dans Prog > Séances types : répétitions, maintien isométrique, effort chronométré.
- Les deux modes chronométrés utilisent le chronomètre guidé existant.
- En mode effort chronométré, saisie du nombre de répétitions à la validation de la série, après le chrono ; durée et répétitions enregistrées ensemble.
- Affichage de la durée et des répétitions dans Stats > Progression lorsque les deux existent.
- Comparaison avec réserve lorsque les protocoles changent.
- Historique Progression : 10 cartes initiales, puis 10 supplémentaires par action (déjà présent dans la base 2-E.4.3).
- Pas de migration destructrice : les séances historiques sans mode explicite restent lisibles.

## Contrôles
61 assertions de tests existants réussies ; vérification syntaxique des fichiers TypeScript modifiés. Build complet non exécuté faute de dépendances React/Vite dans l'environnement. Tester GitHub Actions puis Safari/PWA.

## Recette
1. Dans Prog, configurer un exercice en Répétitions, enregistrer et réouvrir.
2. Passer en Maintien, régler 30 s, lancer une séance et vérifier le chrono.
3. Passer en Effort chronométré, lancer une séance et enregistrer les répétitions réalisées après le chrono.
4. Vérifier l'historique et Stats > Progression, puis les vues Synthèse et Muscles.
5. Vérifier la sauvegarde JSON et la restauration d'une ancienne séance.
