# LifeTrack Training 2-C.2.2 — Candidat à validation automatisée

Ce ZIP contient du **code source**, et non une application compilée. Ne pas importer dans le dépôt de production.

## Contrôles locaux réussis
- 7 tests de non-régression sur les paliers, séries supplémentaires, dates et regroupements.
- Transpilation syntaxique de 8 fichiers TS/TSX.

## Contrôle obligatoire sur le dépôt GitHub de test
Le workflow `.github/workflows/deploy.yml` exécute désormais `npm test`, puis `npm run build`. **Le déploiement n'a lieu que si ces deux commandes réussissent**. En cas d'échec, ne pas tester sur iPhone et transmettre le journal d'erreur.

## Procédure
1. Conserver une sauvegarde du dépôt GitHub de test et exporter les données JSON de l'application avant toute mise à jour.
2. Remplacer les fichiers du dépôt **de test uniquement** par ceux de cette archive (en conservant les dossiers `.github`, `src`, `public`, `tests`).
3. Consulter GitHub > Actions > Deploy LifeTrack Training Test. Attendre la réussite de `Regression tests`, `Build` et `Deploy`.
4. Ouvrir l'URL GitHub Pages du **dépôt de test**, puis vérifier historique, filtres, séances mixtes, paliers, et import/export sur des données de test.
5. En cas d'échec de compilation, ne pas utiliser le déploiement et transmettre le log. Aucun contrôle réel Safari/PWA n'a encore été effectué.

## Limite
Le registre npm est inaccessible depuis l'environnement de préparation : la compilation complète React/Vite n'a pas pu être effectuée ici. Le statut reste **candidat à compiler**, et non **livraison validée**.


## Correctif CI du 16 novembre 2026
- ProgressionHistory : accès protégés aux points précédent/suivant pour TypeScript strict.
- TrainingHistory : suppression de la déclaration inutilisée showTop/setShowTop.
- 7 tests de régression réussis localement.
- Compilation intégrale à confirmer dans GitHub Actions (dépendances npm indisponibles localement).
