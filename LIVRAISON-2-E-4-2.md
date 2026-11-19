# LifeTrack Training 2-E.4.2 — Interface Progression

- Ajout de la troisième vue Stats « Progression », en conservant les vues Synthèse et Muscles.
- Graphique des répétitions minimales, résistance nominale et durées isométriques.
- Historique détaillé, séances partielles identifiées, fiabilité des comparaisons.
- Suggestions du moteur 2-E.4.1 sans modification automatique des objectifs.
- Filtre temporel commun aux trois vues.

## Contrôles
- Tests unitaires existants : 61 vérifications réussies.
- Compilation locale non validée : dépendances React/Vite absentes dans l'archive de travail.
- Recette iPhone et GitHub Actions à effectuer.

## Recette iPhone
1. Ouvrir Stats → Progression et sélectionner un exercice.
2. Alterner répétitions, résistance nominale et durée ; vérifier graphique et tableau.
3. Vérifier les séances partielles et l'indication de comparabilité.
4. Vérifier que les suggestions ne modifient aucune séance.
5. Vérifier que Stats → Synthèse et Muscles restent inchangées.
