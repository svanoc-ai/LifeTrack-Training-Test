# LifeTrack Training — Livraison 2-E.3.1.3

## Contenu
- Personnalisation des muscles principaux et secondaires de chaque variante depuis l'écran de préparation de séance.
- Enregistrement des correspondances dans le magasin IndexedDB `settings` (clé `muscleVariantOverrides`) sans changement de version de la base.
- À chaque démarrage, capture immuable de la classification courante dans le `muscleSnapshot` de l'exercice.
- Les séances antérieures conservent leurs snapshots et ne sont pas reclassées.
- Possibilité de restaurer les correspondances standard.
- Stats Synthèse non modifiée.

## Déploiement
Extraire le ZIP différentiel à la racine du dépôt, en conservant les chemins `src/`.
Sauvegarder le JSON avant mise à jour, puis attendre les Actions GitHub vertes.

## Recette iPhone
1. Préparer une séance avec développé debout, choisir une variante et ouvrir « Personnaliser les muscles ».
2. Modifier un muscle principal/secondaire et enregistrer ; vérifier l'indication « Classification personnalisée ».
3. Démarrer puis terminer la séance, vérifier l'historique et la persistance après fermeture/réouverture de la PWA.
4. Restaurer les valeurs standard et vérifier que cela ne modifie pas la séance déjà enregistrée.
5. Vérifier que Stats — Synthèse reste identique.

## Vérifications réalisées
- `npm test` : 40 assertions réussies (7 progression, 20 stats, 13 muscles).
- Vérification syntaxique TypeScript : erreurs de syntaxe corrigées ; compilation complète non réalisable ici faute de dépendances React installées.
- Tests Safari/PWA : à effectuer après déploiement.
