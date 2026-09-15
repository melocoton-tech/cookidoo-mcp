# /courses — Liste de courses de la semaine

Quand l'utilisateur invoque `/courses`, exécute exactement ces étapes dans l'ordre :

## Étapes

1. **Récupère le planning de la semaine courante**
   - Appelle `cookidoo_get_calendar_week` avec la date du jour (format YYYY-MM-DD).
   - Note chaque jour qui a des recettes et leur `id`.

2. **Ajoute les ingrédients à la liste de courses**
   - Collecte tous les `recipeIds` uniques trouvés sur la semaine.
   - Appelle `cookidoo_add_recipe_ingredients` avec ce tableau d'IDs en une seule fois.

3. **Récupère la liste de courses consolidée**
   - Appelle `cookidoo_get_ingredient_items` pour obtenir tous les items (avec quantités et état `isOwned`).

4. **Crée un artifact HTML — liste de courses à cocher**
   - Titre : "Liste de courses – semaine du [lundi de la semaine]"
   - En haut : un résumé du menu (jour → nom de la recette), visuellement léger.
   - En dessous : la liste de courses fusionnée, items regroupés si le même ingrédient apparaît plusieurs fois (additionne les quantités quand elles sont dans la même unité, sinon liste séparément).
   - Chaque item est une case à cocher. L'état coché est mémorisé en localStorage (clé = id de l'item) pour persister entre ouvertures.
   - Un bouton "Tout décocher" remet à zéro.
   - Design : sobre, lisible sur mobile, bon contraste light/dark.

## Comportement attendu

- Si un jour n'a aucune recette planifiée, l'ignorer silencieusement.
- Si `cookidoo_add_recipe_ingredients` retourne une erreur d'auth (401), afficher un message clair : "Session Cookidoo expirée — le serveur va se reconnecter automatiquement, réessaie dans 30 secondes."
- Ne pas demander de confirmation avant d'ajouter à la liste : l'action est idempotente (Cookidoo n'ajoute pas en double).
