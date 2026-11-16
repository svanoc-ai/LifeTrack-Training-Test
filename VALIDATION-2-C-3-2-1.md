# LifeTrack Training 2-C.3.2.1 — Correctif ergonomique iPhone

Base : 2-C.3.2 candidat de test (GitHub Actions vert signalé par l'utilisateur).

## Modifications
- Calendrier : sélecteur de date masqué à l'ouverture, accessible par l'icône calendrier, refermable et automatiquement fermé après sélection.
- Calendrier : sélecteur date contraint à la largeur du conteneur sur iPhone.
- Assistant étape 2 : durée 1–52 semaines via boutons −/+ sans clavier ni zéros initiaux.
- Assistant : boutons Suivant / Enregistrer en turquoise #36D7C6 ; champs ajustés à la largeur iPhone.

## Tests recommandés
1. Ouvrir Prog : sélecteur de date absent ; icône calendrier le fait apparaître/disparaître.
2. Choisir une date : semaine et jour corrects, sélecteur se ferme.
3. Assistant étape 2 : 8 → 9 → 8 semaines, aucune ouverture du clavier ; bornes 1 et 52.
4. Bouton Suivant turquoise ; aucune largeur débordante.
5. Créer un programme, planifier et rouvrir la PWA.
6. Non-régression : menu 05, séance, historique, statistiques, JSON.

## Vérifications locales
- Tests de régression Node : 7 PASS.
- Compilation TypeScript/Vite non vérifiable ici : dépendances React absentes de l'environnement local. Vérifier GitHub Actions avant test Safari.
