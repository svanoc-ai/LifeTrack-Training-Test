# LifeTrack Training — tests navigateur automatisés (premier lot)

## Installation
Déposer le ZIP différentiel à la racine du dépôt GitHub, en conservant les dossiers. Un nouveau workflow **Tests navigateur LifeTrack Training** s’exécute indépendamment du déploiement GitHub Pages.

## Périmètre réel
Trois tests de fumée : navigation, création et persistance d’une séance type fictive, validation du nom obligatoire. Deux moteurs : Chromium et WebKit en profil mobile (6 exécutions). Chaque test possède son propre contexte navigateur et sa base IndexedDB vierge.

## À ne pas confondre
Le workflow de déploiement existant n’est pas modifié. Son statut vert ne prouve pas que le workflow Playwright est vert. Cette première version ne couvre pas encore les sept scénarios 2-D.2.2, les recommandations, ni les chronomètres. Il faudra les ajouter après validation de l’infrastructure.

## Diagnostic
GitHub > Actions > Tests navigateur LifeTrack Training. Si rouge, télécharger l’artifact `playwright-report` pour voir captures et traces. Si la CI échoue, ne pas considérer les tests fonctionnels validés.

## Local
`npm install`, `npx playwright install chromium webkit`, `npm run test:e2e`.
