# LifeTrack Training — 2-F.1.1

Correctif de compilation après le journal GitHub `Version mismatch: 2-F.1.0 2-F.0.1`.

- Source unique `src/version.ts`. Le script synchronise `public/sw.js` avant TypeScript/Vite et vérifie `dist/sw.js` après génération. Le contrôle strict reste disponible sans option.
- Prototype 3D de 2-F.1.0 conservé intégralement.
- Différentiel cumulatif par rapport à 2-F.0.1 (dernière version verte), utilisable aussi pour corriger 2-F.1.0.
- Importer les fichiers en respectant leurs chemins, idéalement en un seul commit. Vérifier les logs du dernier commit et la version 2-F.1.1 dans Plus → À propos.
- Tests unitaires de synchronisation : ancien cache, correction, contrôle de sortie, déclarations invalides.
- Compilation TypeScript/Vite et recette iPhone à confirmer sur l'environnement complet.
