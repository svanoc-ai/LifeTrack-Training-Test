# LifeTrack Training — 2-E.2.1 — Moteur statistique

Base : 2-D.2.5.3. Lot **moteur uniquement**, sans modification de l'interface Stats ni des données IndexedDB.

## Fichiers
- `src/statsEngine.ts` : calcul pur de synthèse sur les exécutions et planifications 2-D.
- `tests/statsEngine.test.cjs` : vérifications automatisées du moteur.
- `package.json` : `npm test` exécute les tests de progression existants et les tests Stats.

## Règles implémentées
- Périodes calendaires locales inclusives ; 7, 28, 56, 84 jours ou période personnalisée.
- Séances terminées ou partielles comptées uniquement avec travail enregistré ; séances abandonnées exclues.
- Séries validées : `validated !== false` pour compatibilité avec les anciens enregistrements.
- Volume nominal : somme `charge nominale × répétitions` des séries validées ; ne représente pas une mesure mécanique de résistance élastique.
- Gainage : durée des séries validées enregistrée séparément.
- Cardio : durée, distance, dénivelé, si renseignés ; catégories Tapis/Vélo/Randonnée/Autre.
- Assiduité : planifications échues non annulées, réalisées par une exécution valide liée par `plannedId` ; les séances libres sont exclues du dénominateur.
- Durées : total actif enregistré + pauses enregistrées ; le repos n'est pas isolable dans les données historiques et reste `null`.
- Calcul à la demande, aucune écriture dans IndexedDB, aucun changement de schéma.

## Vérifications effectuées
- `NODE_PATH=$(npm root -g) node tests/statsEngine.test.cjs` : PASS (20 assertions).
- `NODE_PATH=$(npm root -g) node tests/progression.test.cjs` : PASS (7 assertions).

## Limites explicites
- Le moteur n'est pas encore branché à l'onglet Stats (prévu en 2-E.2.2).
- Pas de déploiement GitHub Pages réalisé depuis cette livraison.
- Le build complet Vite/React et les tests Playwright n'ont pas été exécutés dans cet environnement (dépendances du projet non installées).
- La ventilation des minutes de musculation par activité n'est pas disponible dans les données historiques.
- La classification musculaire détaillée et les variantes restent prévues pour 2-E.3.
