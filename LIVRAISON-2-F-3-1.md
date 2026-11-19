# 2-F.3.1 — Candidat d'intégration Free Muscle

Base 2-F.2.0 validée (ne pas installer 2-F.3.0). Ce lot est un candidat technique, pas un modèle final validé.

## Acquisition et licence
- Source : https://github.com/tiralonghipol/free-muscles ; documentation consultée : README, LICENSE et scripts/build-anatomy.py. Modèle dérivé de Z-Anatomy / BodyParts3D, CC BY-SA 4.0. Code amont MIT. Le modèle GLB amont est indiqué à ~1,7 Mo et ~310 000 triangles par le projet. Les données binaires n'ont pas pu être téléchargées dans l'environnement de préparation (DNS/accès externe indisponible).
- `npm run build` déclenche `prepare:anatomy` : résolution d'un commit Git amont (ou ANATOMY_REVISION explicite), téléchargement du GLB et de la licence à ce commit, audit du format et des douze familles, copie du décodeur Draco local depuis Three.js ; écrit provenance.json (commit, SHA256, comptages). La résolution de main n'est pas immuable d'une compilation à l'autre ; après premier build vert et validation, relever la révision et la fixer pour les builds suivants. Le modèle original n'est pas modifié sur disque ; affichage recoloré à l'exécution. Attribution visible et fichiers de licence/provenance inclus dans dist. Pas de téléchargement amont à l'exécution de la PWA.
- Le ZIP ne contient pas le fichier GLB ni les dépendances npm. GitHub Actions doit pouvoir accéder à l'amont et au registre npm. Un échec d'acquisition/audit fait échouer le build plutôt que publier une carte supposée validée.

## Intégration
- Three.js / @types/three introduits (0.180.0). Rendu orthographique WebGL, géométries regroupées par groupes LifeTrack pour limiter les appels de rendu. L'ancienne silhouette reste la solution de repli explicite en cas de problème WebGL/chargement. L'interface et les gestes de 2-F.2.0 sont conservés. Aucun changement du registre ou des calculs Stats. La correspondance anatomique utilise les libellés, pas les groupes upstream (conventions différentes, notamment moyen/petit fessier). Les éléments non reconnus ou ambigus ne sont pas colorés. Les 12 groupes doivent être représentés mais cet audit ne prouve pas la précision de chaque maillage ou sa visibilité superficielle.
- Ressources locales ajoutées au précache PWA ; version 2-F.3.1. Le moteur détaillé est activé lorsque l'état indique « Modèle anatomique détaillé actif ». Ne pas accepter une silhouette de secours comme validation du nouveau modèle.

## Contrôles faits
- Les 12 suites Node/TypeScript transpilation passent, dont les 22 assertions de correspondance / GLB synthétique ; syntaxe des trois fichiers TS/TSX concernés contrôlée ; version source synchronisée.
- NON vérifiés : acquisition du vrai GLB, installation des dépendances, compilation TypeScript/Vite complète, rendu du modèle réel, orientation Face/Dos, taux d'images, comportement de cache sur iPhone. Les tests de correspondance n'utilisent pas les maillages amont réels ; l'audit de couverture s'exécutera pendant la compilation.

## Recette de ce candidat
1. Déployer le ZIP complet sur le dépôt test (conserver la référence 2-F.2.0 et une sauvegarde JSON). GitHub doit afficher « Anatomy GLB verified » et les 12 comptages non nuls. Relever provenance.json.
2. PWA version 2-F.3.1 ; ouvrir Stats > 3D. Vérifier le statut « Modèle anatomique détaillé actif », le rendu face/dos/profil et les proportions. Vérifier la distinction entre groupes, notamment fessiers/abducteurs et biceps/ischio-jambiers. Tester rotation, zoom, sélection et reset, puis les deux modes et la cohérence avec Muscles sur deux périodes.
3. Après activation de la mise à jour PWA, ouvrir le modèle puis tester hors ligne. En cas de défaut, conserver 2-F.2.0 comme référence stable.
