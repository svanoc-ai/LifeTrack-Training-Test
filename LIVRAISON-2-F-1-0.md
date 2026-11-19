# LifeTrack Training — 2-F.1.0 — Prototype interactif

Base : 2-F.0.1 validée (GitHub Actions et affichage de version). Le prototype ajoute un quatrième onglet Stats : « 3D ». Les contenus et moteurs de calcul de Synthèse, Muscles et Progression sont conservés. Aucun changement de schéma IndexedDB.

## Périmètre
- Géométrie originale constituée de volumes triangulés 3D (tête, tronc, membres et 12 régions musculaires de référence). Pas de téléchargement, modèle tiers ni nouvelle dépendance npm. Silhouette schématique, non médicale ; elle ne distingue pas encore les faisceaux ou les muscles profonds individuellement.
- Projection orthographique et rendu local Canvas 2D des triangles 3D, avec éclairage approximatif et classement en profondeur. Pas de WebGL. La sélection utilise les triangles visibles ; rotation horizontale, zoom 100–240 %, déplacement vertical quand zoomé, touches directes et liste accessible. En cas d'indisponibilité du Canvas, la liste des groupes reste utilisable.
- Couleurs neutres de démonstration ; turquoise pour le groupe sélectionné. Aucune donnée d'entraînement n'est utilisée pour la coloration à ce stade. La période Stats reste disponible mais ne pilote pas encore le prototype.
- Modèle généré par code, sans ressource anatomique tierce à redistribuer. Un modèle anatomique détaillé avec licence explicite reste à choisir avant la version définitive.

## Contrôles réellement exécutés
- `NODE_PATH=$(npm root -g) npm test` : neuf suites réussies, dont les 14 vérifications du prototype et la sélection géométrique de ses 12 régions (au moins un angle pour chaque région).
- TypeScript strict autonome sur la géométrie : réussi.
- Vérification de version : 2-F.1.0 synchronisée.
- Rendu local de deux orientations avec skia-canvas : contrôlé visuellement (silhouette volontairement simplifiée).
- Compilation complète tentée (`npm run build`) : bloquée par l'absence des dépendances React/Vite et de leurs types dans l'environnement. Elle reste à valider sur GitHub Actions ; aucun test navigateur ou iPhone réalisé.

## Recette sur iPhone
1. Vérifier le déploiement GitHub Actions et Plus → À propos : 2-F.1.0.
2. Ouvrir Stats → 3D. Vérifier que le corps est entièrement visible au zoom 100 %.
3. Glisser horizontalement, tester Face/Dos et les boutons de rotation. Pincer pour zoomer, glisser verticalement quand zoomé ; vérifier que seul le canvas capture les gestes.
4. Toucher pectoraux, dos, quadriceps et mollets ; vérifier le surlignage turquoise et le libellé. La liste permet aussi de sélectionner tous les groupes.
5. Tester Réinitialiser, puis la réouverture de l'onglet. Observer les ralentissements éventuels et la valeur « dernier rendu local » (indicative ; ce n'est pas un FPS).
6. Après premier chargement et activation du cache, tester en mode avion. Vérifier que les trois autres vues Stats restent conformes.

## Suite
Après recette : modèle anatomique détaillé (licence vérifiée), sélection au niveau anatomique pertinent et coloration par données pondérées existantes en respectant la période et les séances non classées. Les mesures de séries ne sont pas des mesures d'activation physiologique. Le parcours de lancement illustré (Play, photo, illustration par défaut) reste au backlog.
