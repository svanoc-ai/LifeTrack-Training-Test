# LifeTrack Training — Livraison 2-E.3.2

## Périmètre
- **Prog → Séances types → Modifier** : personnalisation des correspondances musculaires directement sous l'exercice. La variante à personnaliser est sélectionnable ; les modifications sont conservées dans IndexedDB (`settings/muscleVariantOverrides`).
- **Séance** : choix rapide de variante conservé avant démarrage ; suppression du formulaire permanent de classification musculaire.
- **Stats → Muscles** : séries principales et secondaires par groupe, détail anatomique déroulant, comptage des séries validées uniquement, séances historiques non classées signalées, observations descriptives sans seuil arbitraire.
- Réduction de la **police uniquement** dans les sélecteurs de classification ; dimensions des sélecteurs inchangées.
- **Stats → Synthèse** : contenu, calculs, filtres et graphiques préservés. Seul le sélecteur d'onglet permet désormais d'accéder à Muscles.

## Calculs
- Principal : 1 série par groupe ; secondaire : 0,25 série par groupe ; priorité au principal si plusieurs muscles d'un même groupe sont sollicités.
- Les valeurs anatomiques sont des contributions non additives. Aucun équivalent musculation n'est imputé aux séances cardio.
- Les anciennes séances sans `muscleSnapshot` restent inconnues ; aucune attribution rétroactive.
- Une modification des correspondances n'affecte que les futures séances ; les snapshots historiques restent intacts.

## Tests
- 7 assertions progression, 20 statistiques, 13 référentiel, 9 statistiques musculaires : **49 contrôles réussis**.
- Vérification de syntaxe TypeScript sur les cinq fichiers modifiés/ajoutés : aucune erreur de syntaxe.
- **Build React/Vite non vérifié** : dépendances absentes du conteneur (installation hors ligne impossible).
- **Recette iPhone requise** après déploiement GitHub Actions.

## Recette iPhone
1. Sauvegarder les données JSON avant le déploiement.
2. Prog → Séances types → Modifier une séance → ouvrir la classification sous un exercice ; vérifier les trois libellés et la fermeture.
3. Enregistrer une personnalisation, rouvrir et vérifier la persistance.
4. Séance → sélectionner la même séance : la variante reste modifiable, mais la classification permanente n'est plus affichée.
5. Stats → Muscles : vérifier la période, les groupes, le détail anatomique, les séances sans classification.
6. Stats → Synthèse : vérifier visuellement qu'aucun élément validé n'a changé.

URL de test après déploiement : https://svanoc-ai.github.io/LifeTrack-Training-Test/
