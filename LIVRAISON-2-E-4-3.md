# LifeTrack Training — 2-E.4.3 — correctif ergonomique Progression

Base : archive complète 2-E.4.2.

## Réalisé
- Remplacement du tableau horizontal de l'historique Progression par des cartes compactes repliables, avec détail et comparabilité.
- Indicateurs de progression filtrés selon la présence de données de durée ou de répétitions, pour ne pas proposer systématiquement « Maintien minimal » aux exercices à répétitions.
- La dernière performance masque les mesures non pertinentes / absentes.
- Aucune modification des vues Stats Synthèse et Muscles, du moteur de calcul, ni des données historiques.

## Différé (nécessite une évolution de l'exécution guidée)
- Trois modes de réalisation explicites : répétitions, maintien isométrique, effort chronométré avec répétitions mesurées. Le système existant prend en charge répétitions ou chronométrage, mais ne capture pas encore les répétitions réalisées pendant un effort chronométré. Ne pas considérer cette partie comme livrée.

## Contrôles
- Tests Node existants : 61 vérifications réussies (7+20+13+9+12).
- Intégrité ZIP : vérifiée.
- Build React/Vite et recette iPhone : à effectuer après déploiement.

## Recette
1. Ouvrir Stats > Progression et consulter l'historique sur iPhone sans débordement horizontal.
2. Ouvrir et refermer une carte ; vérifier variante, séries, qualité et comparabilité.
3. Sur un exercice à répétitions, vérifier que « Maintien minimal » n'est pas proposé si aucune durée n'est enregistrée.
4. Vérifier que Synthèse et Muscles restent inchangées.
