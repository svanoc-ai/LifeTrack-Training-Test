# LifeTrack Training — 2-E.3.1 — Référentiel musculaire (socle)

## Réalisé
- 12 groupes anatomiques ; muscles détaillés ; 19 variantes stables sur 14 exercices de musculation.
- Coefficients 1 (principal) / 0,25 (secondaire), priorité au principal, pas de cumul de muscles du même groupe.
- Fonctions pures de personnalisation, capture de classification, présélection de la dernière variante connue, agrégation des séries validées.
- Séances historiques sans variante identifiée : classification inconnue (aucune attribution automatique).
- Aucun changement de la vue Synthèse 2-E.2.2, ni du schéma IndexedDB, ni de l'exécution.

## Tests
- npm test : 7 régressions progression, 20 statistiques, 13 référentiel musculaire, tous réussis.
- Vérification TypeScript autonome du module muscleRegistry.ts réussie.

## Limites / lot complémentaire nécessaire
- Les fonctions de variantes ne sont pas encore reliées aux formulaires de préparation de séance ni aux enregistrements IndexedDB.
- Les snapshots de classification ne sont pas encore écrits avec les exécutions.
- Aucun test iPhone du sélecteur de variantes n'est possible à ce stade.
- Le module Muscles visuel sera traité en 2-E.3.2 après raccordement persistant.

## Déploiement
Copier le différentiel à la racine du dépôt, ou utiliser le ZIP complet. Une sauvegarde JSON préalable est recommandée. Aucun changement visuel attendu sur cette livraison.
