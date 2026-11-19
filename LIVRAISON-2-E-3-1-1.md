# LifeTrack Training — 2-E.3.1.1

## Contenu
- Sélection de la variante anatomique sur l'écran de préparation d'une séance, avant démarrage.
- Présélection de la dernière variante enregistrée pour l'exercice ; à défaut, première variante standard.
- Enregistrement dans chaque cible de séance d'un identifiant de variante et d'une photographie indépendante de la classification musculaire, horodatée au démarrage.
- Historique antérieur sans variante conservé tel quel et non classé par défaut.
- Exercice bonus standard : photographie de variante à l'ajout.
- Vue Synthèse inchangée.

## Limites de ce lot
- Personnalisation manuelle des muscles principaux/secondaires non encore accessible à l'écran (lot suivant).
- Pas de migration IndexedDB nécessaire : champs optionnels enregistrés avec les séances.
- Tests automatisés existants : 40 assertions réussies ; build React/Vite et recette iPhone non exécutés (dépendances npm absentes).

## Recette iPhone
1. Exporter une sauvegarde JSON.
2. Sélectionner une séance type contenant Développé debout ou Gainage.
3. Vérifier le sélecteur de variante, changer la valeur et démarrer.
4. Terminer une séance, puis démarrer une nouvelle séance contenant le même exercice : dernière variante présélectionnée.
5. Vérifier que les anciennes séances et la vue Stats Synthèse restent inchangées.
