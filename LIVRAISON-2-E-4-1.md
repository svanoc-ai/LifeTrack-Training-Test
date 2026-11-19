# LifeTrack Training — 2-E.4.1

Socle de calcul de progression ajouté dans `src/progressionAnalysis.ts`, sans modifier les écrans existants ni les données IndexedDB.

- Historique des séries validées, y compris les séances partielles identifiées.
- Comparaison directe / avec réserve / séparée selon la variante, la résistance nominale, le nombre de séries et les données disponibles.
- Suggestions non exécutoires de progression en répétitions, résistance ou durée selon RIR et qualité technique.
- Les données manquantes sont conservées comme inconnues.

## Contrôles

`npm test` : 61 assertions réussies (7 progression existante, 20 Stats, 13 référentiel, 9 muscles, 12 nouveau moteur).

Compilation complète non vérifiée : les dépendances React/Vite ne sont pas installées dans cet environnement. Le typecheck global échoue principalement pour cette raison. Test iPhone à réaliser lors de l'intégration de l'interface 2-E.4.2.

## Préservation

Aucun changement de `StatsDashboard.tsx`, `muscleStats.ts`, `ProgressionHistory.tsx`, des écrans de séance, ni du stockage.
