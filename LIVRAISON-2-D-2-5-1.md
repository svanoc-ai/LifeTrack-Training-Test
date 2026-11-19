# LifeTrack Training — Candidate 2-D.2.5.1

Base : archive `LifeTrack-Training-Test-main 7.zip` transmise par l'utilisateur.

## Modifications
- Historique : action « Modifier ou supprimer la séance » dans le détail.
- Édition : séries enregistrées (répétitions, charge, RIR, validation), forme, difficulté, commentaire. La séance est remplacée avec le même identifiant dans IndexedDB.
- Suppression : confirmation en deux temps, suppression de l'enregistrement IndexedDB, mise à jour immédiate de l'historique. Si la séance était liée à une planification, celle-ci redevient prévue.
- Les statistiques et recommandations utilisant la liste des séances sont recalculées à partir de l'historique mis à jour.
- Affichage des recommandations du moteur existant dans chaque exercice de musculation de l'historique.
- Légende « Série non validée » affichée uniquement lorsqu'au moins une série est marquée non validée.

## Vérification
- Analyse syntaxique TSX des trois fichiers concernés : OK.
- `node tests/progression.test.cjs` : 7 contrôles OK.
- Compilation TypeScript complète et Playwright : NON EXÉCUTÉS (dépendances npm indisponibles dans cet environnement).

## Recette iPhone
1. Déployer les fichiers différentiels en respectant `src/`.
2. Vérifier GitHub Actions. En cas d'échec, ne pas poursuivre la recette.
3. Historique > séance fictive « Test Full body » > « Modifier ou supprimer la séance ».
4. Vérifier l'affichage du conseil Hip Thrust 2 × 20 → 2 × 21.
5. Modifier temporairement le commentaire, enregistrer, rouvrir et vérifier la persistance.
6. Supprimer uniquement la séance fictive identifiée par son commentaire. Confirmer deux fois.
7. Vérifier sa disparition et l'absence d'altération des autres séances.

Avant toute suppression, effectuer une sauvegarde JSON des données locales via l'application si cette option est disponible.
