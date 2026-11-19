# LifeTrack Training — 2-F.0.0 — Étude technique et fondation carte anatomique 3D

## État de référence
- 2-E.5.1 validée par l’utilisateur sur iPhone. Synthèse, Muscles et Progression restent inchangés.
- 2-F est un **prototype technique**, pas encore une carte 3D visible dans l’application.

## Implémentation livrée
- `src/anatomy3d.ts` : adaptateur de données anatomiques vers une échelle relative 0–1, sans recalcul des séries.
- Audit des noms de maillages d’un futur modèle 3D (couverture, noms manquants, collisions).
- Tests unitaires dédiés, exécutés dans la suite npm test.
- Version et cache synchronisés sur 2-F.0.0.

## Analyse de faisabilité
- Le registre existant contient 12 groupes musculaires, chacun associé à plusieurs muscles anatomiques.
- `calculateMuscleStats` expose déjà les séries pondérées par muscle via `anatomy`, avec 1 pour principal et 0,25 pour secondaire.
- Ces chiffres ne mesurent **ni l’activation physiologique, ni la force, ni l’hypertrophie**.
- L’interface 3D devra reprendre les filtres de période de Stats, les données locales IndexedDB et l’état des séances non classées.
- Une correspondance explicite entre noms des maillages du modèle et identifiants `MuscleId` sera nécessaire. Le nouvel audit contrôle cette correspondance.

## Choix à valider avant l’interface 3D
1. Sélectionner un modèle anatomique avec licence vérifiable autorisant la redistribution dans une PWA, et une granularité compatible avec le registre.
2. Mesurer sur Safari iPhone : taille du modèle, FPS, temps de chargement, mémoire et interaction tactile.
3. Prévoir un mode dégradé 2D accessible si WebGL est indisponible ou trop lent.
4. Séparer les vues avant/arrière, rotation, zoom, sélection et fiche du muscle; conserver une légende qui ne laisse pas croire à une mesure biologique.
5. Ne pas embarquer d’assets anatomiques dont la licence n’est pas confirmée.

## Critères d’acceptation du futur prototype 2-F.1
- Rotation/zoom fluides sur iPhone, sans défilement de page involontaire.
- Touche sur un muscle → groupe, séries pondérées et période.
- Mise à jour des couleurs au changement de période, sans recalcul divergent.
- Anciennes séances sans classification exclues de la coloration et signalées.
- Fonctionnement hors ligne après premier chargement.
- Les vues Stats 2-E validées restent inchangées.

## Autres chantiers en attente
- UX démarrage : Play dans carte de séance, écran d’accueil illustré, photo de séance type et illustration générique.
- Intégration LifeTrack : définir et valider l’export, la correspondance des séances et les tests d’import.
- Consolidation générale : restauration JSON, PWA hors ligne, régression iPhone.
