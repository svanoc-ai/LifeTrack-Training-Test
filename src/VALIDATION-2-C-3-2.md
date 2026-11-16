# LifeTrack Training — 2-C.3.2 candidat de test

## Inclus
- Refonte compacte de l'en-tête du calendrier, icônes turquoise/gris, navigation intégrée, accès Aujourd'hui, ajout de séance par icône.
- Assistant de création en six étapes (nom, date/durée, structure répétée, bibliothèque, attribution des jours, validation).
- Brouillon d'assistant local dans localStorage (non inclus dans la sauvegarde JSON).
- Enregistrement du programme dans trainingPrograms et, si activé, planification répétée dans plannedWorkouts en transaction IndexedDB.
- Alerte de chevauchement de date avec confirmation explicite.
- Actualisation du calendrier après activation.

## Limites de ce lot
- Cycles évolutifs, propagation, séances multiples par jour dans l'assistant et éditeur avancé : lots ultérieurs.
- Le modèle de programme existant ne stocke pas encore les métadonnées durée/date/cycle : seules les séances planifiées sont conservées dans IndexedDB.
- Le brouillon de l'assistant ne fait pas partie de l'export JSON.
- Compilation locale non validée : dépendances npm indisponibles hors ligne. Vérifier GitHub Actions avant test iPhone.

## Tests recommandés
T01-10 : tests de non-régression 2-C.3.1.
T11 : calendrier compact, icônes et navigation Safari/PWA.
T12 : assistant 6 étapes, retour arrière et reprise du brouillon.
T13 : création sans activation, programme visible dans Mes programmes.
T14 : activation sur deux semaines, séances correctement datées et visibles.
T15 : conflit avec séance existante : confirmation obligatoire et aucune suppression.
T16 : export/import JSON des programmes et séances activées.
