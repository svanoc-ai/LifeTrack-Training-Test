# LifeTrack Training — 2-C.3.1 — Lot calendrier, candidat de test

Base : 2-C.2.2 MENU-05 validée.

Modifié : `src/PlanningCalendar.tsx`, `src/style.css`.
Menu inférieur, exécution, historique et statistiques non modifiés.

## Inclus
- Calendrier lundi-dimanche compact, sélection d'un jour et détail des séances.
- Navigation par semaine, retour à aujourd'hui et accès direct à une date.
- Plusieurs séances par jour, séances libres ou rattachées à un programme.
- Ajout, déplacement, annulation, réactivation, suppression des planifications non exécutées.
- Protection des séances réalisées, partielles ou abandonnées contre la modification/suppression depuis le calendrier.
- Persistance via les magasins IndexedDB existants, identifiants conservés lors des reports.
- Vue « Mes programmes » en lecture seule ; éditeur de programmes existant conservé plus bas.

## Limites du lot
- Pas encore d'assistant guidé, de cycles, de propagation ou d'alerte de conflit.
- Classification musculation/cardio déduite des identifiants d'exercices, à vérifier avec les modèles personnalisés.
- La compilation n'a pas pu être vérifiée dans l'environnement de préparation : dépendances npm absentes et registre inaccessible. Le CI GitHub Actions doit être exécuté avant essai iPhone.

## Tests demandés
T01 ouverture semaine actuelle ; T02 navigation ; T03 sélection ; T04 deux séances même jour ; T05 persistance ; T06 report sans doublon ; T07 PWA ; T08 JSON ; T09 exécution ; T10 historique/stats.

Ne pas déployer en production avant validation du CI et des tests.
