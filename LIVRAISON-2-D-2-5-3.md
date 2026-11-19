# LifeTrack Training — 2-D.2.5.3

Correctif ciblé après recette iPhone de 2-D.2.5.2.

- Les boutons « Modifier la séance » et « Supprimer la séance » ont la même hauteur, une largeur égale et un alignement vertical commun.
- Le bouton rouge de suppression conserve ses couleurs existantes.
- Aucun changement de logique métier, de données ou de validation.

## Installation
Décompresser le ZIP différentiel à la racine du dépôt GitHub, en remplaçant `src/style.css` et en ajoutant ce fichier de livraison. Attendre les GitHub Actions puis vérifier les deux boutons dans Historique sur iPhone (état normal et « Annuler la suppression »).

## Contrôle
Contrôle statique de la règle CSS et de l'intégrité ZIP effectué. Compilation et Playwright à vérifier dans GitHub Actions.
