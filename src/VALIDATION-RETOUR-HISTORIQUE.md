# LifeTrack Training 2-C.2.2 — Correctif navigation et séparation

## Changements
- Retour du détail vers l'historique : restauration du défilement dans la phase de rendu, sans repositionnement différé.
- Conservation du mois, du filtre et de l'état du bilan lors de l'ouverture/fermeture d'un détail.
- Conservation du surlignage temporaire de la carte consultée.
- Deux vues distinctes « Exécution » et « Historique », sans juxtaposition sur la même page.
- L'historique reste alimenté par les séances enregistrées dans IndexedDB ; aucune migration des données.
- Navigation tactile de 44 px minimum, affichage adapté au petit écran.

## Contrôles locaux
- 7 tests de régression : réussis.
- Analyse syntaxique TypeScript/TSX des deux fichiers modifiés : réussie.
- Compilation complète React/Vite : non exécutée localement (dépendances absentes). À confirmer via GitHub Actions.

## Vérifications sur iPhone après build vert
1. Historique : descendre plusieurs dates, ouvrir une séance, revenir : même position et carte temporairement éclaircie.
2. Refaire le test avec filtre Cardio puis un autre mois.
3. Vérifier que les vues Exécution et Historique sont séparées et commutables.
4. Vérifier qu'une séance en cours reste intacte lors d'un aller-retour entre les deux vues.
5. Tester dans Safari puis dans la PWA après actualisation.
