# LifeTrack Training — Livraison 2-E.2.2

## Périmètre
- Onglet Stats : vue Synthèse réelle (remplacement des données fictives).
- Lecture seule des stores IndexedDB `executions` et `plannedWorkouts`.
- Sélection 7 jours, 4/8/12 semaines ou période personnalisée.
- Indicateurs : séances, partielles, séries, volume nominal, fréquence, assiduité, durées connues, cardio, répartition par activité, histogramme hebdomadaire.
- Rafraîchissement au retour de l'application et bouton Actualiser.
- Vues Muscles et Progression affichées comme non disponibles (lots futurs).

## Limites et précautions
- Le temps de repos isolé n'est pas mesuré par le moteur 2-E.2.1 ; affichage « Non disponible ».
- Le temps total n'est que la somme des durées disponibles ; le libellé signale la couverture.
- L'agrégation par catégorie dépend des identifiants d'exercices et de la catégorie cardio/musculation sauvegardée.
- La date des séances est celle de leur clôture (ou dernière mise à jour en absence de clôture).
- Pas de modification de schéma ni de données utilisateur.

## Contrôles effectués
- `node tests/progression.test.cjs` : 7 vérifications réussies.
- `node tests/statsEngine.test.cjs` : 20 assertions réussies.
- Compilation Vite / vérification TypeScript complète : **non exécutées** (dépendances npm indisponibles dans cet environnement).
- Tests iPhone : **à effectuer après déploiement**.

## Installation
1. Sauvegarder les données via l'export JSON de l'application.
2. Décompresser le ZIP différentiel à la racine du dépôt GitHub en conservant les chemins `src/`.
3. Attendre le succès de GitHub Actions, puis ouvrir Safari/PWA.
4. Vérifier l'onglet Stats sur 7 jours, 4 semaines et période personnalisée.
5. Tester une correction de séance, puis actualiser Stats.

Site de test : https://svanoc-ai.github.io/LifeTrack-Training-Test/
