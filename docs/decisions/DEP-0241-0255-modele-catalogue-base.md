# DEP-0241 à DEP-0255 — Modèle catalogue de base

## Périmètre

Définir les structures de données du **catalogue produits multi-tenant** : catégories,
produits, variantes, médias, mots-clés et synonymes, allergènes/notes, disponibilité,
statuts vedette/populaire/archivé, déclinaisons par tenant (produits, catégories,
zones de livraison, prix internes). Documentation uniquement, aucun seed ni code.

---

## Principes généraux

- Identifiants : `uuid` pour toutes les entités, horodatage `created_at` / `updated_at`.
- Langues : valeurs texte minimales en `fr` par défaut, extensibles par champ `lang`.
- Nommage : tables en `snake_case`, slugs en `kebab-case`, unités explicites (ex: `ml`, `g`).
- Multi-tenant : un catalogue canonique + des surcharges par tenant (visibilité, libellé, prix).
- Accessibilité : chaque support visuel transporte `alt_text` et ordre d'affichage.

---

## DEP-0241 — Structure d’une catégorie produit

Représente une catégorie canonique (hors tenant).

- `id` (uuid)
- `slug` (kebab-case stable)
- `label` (fr, 64-80 chars max)
- `description` (optionnelle, 240 chars max)
- `parent_id` (nullable) pour hiérarchie
- `depth` (0 = racine)
- `path` (ex: `boissons/energisants`)
- `display_order` (int, contrôle l’ordre dans une même fratrie)
- `is_active` (bool)

## DEP-0242 — Structure d’un produit

Produit canonique sans prix public (prix géré par tenant).

- `id` (uuid)
- `category_id` (uuid, DEP-0241)
- `sku` (optionnel, code interne)
- `label` (nom produit court)
- `brand` (optionnel)
- `description` (courte, 280 chars max)
- `default_variant_id` (uuid, variante principale)
- `tags` (liste simple de mots-clés métiers)
- `status` (`draft` | `active`)

## DEP-0243 — Structure d’une variante de produit

Variante vendable d’un produit.

- `id` (uuid)
- `product_id` (uuid, DEP-0242)
- `label` (ex: "33cl", "6x33cl", "1L")
- `gtin` ou `barcode` (optionnel)
- `unit_value` (decimal) + `unit_label` (`ml`, `g`, `kg`, `L`, `unite`)
- `package_type` (ex: `bouteille`, `canette`, `pack`, `boite`)
- `pack_quantity` (int, défaut 1)
- `is_default` (bool, aligne avec `default_variant_id`)
- `shelf_life_days` (optionnel)
- `temperature_zone` (`ambiant` | `frais` | `congele`)
- `sort_weight` (int, ordre d’affichage interne)

## DEP-0244 — Structure d’une photo produit

Média associé à un produit ou une variante.

- `id` (uuid)
- `product_id` (uuid) et/ou `variant_id` (uuid)
- `url` (chemin stockage ou CDN)
- `alt_text` (obligatoire)
- `width` / `height` (px)
- `is_primary` (bool)
- `order_index` (int, tri d’affichage)
- `source` (`upload` | `fournisseur` | `stock`)

## DEP-0245 — Structure d’un mot-clé produit

Mot-clé associé à la recherche et aux filtres.

- `id` (uuid)
- `product_id` (uuid)
- `text` (normalisé, minuscule)
- `lang` (code ISO 639-1, défaut `fr`)
- `weight` (int, influence le scoring)
- `type` (`recherche` | `seo` | `voix`)

## DEP-0246 — Structure d’un synonyme produit

Variante textuelle pour recherche/voix.

- `id` (uuid)
- `product_id` (uuid) ou `variant_id` (uuid)
- `text` (forme saisie ou orale)
- `normalized_text` (forme sans accents/ponctuation)
- `lang` (ISO 639-1)
- `weight` (int, priorité de correspondance)
- `context` (optionnel, ex: `marque`, `forme`, `gout`)

## DEP-0247 — Structure d’une allergie ou note produit

Notes de sécurité ou informations utiles.

- `id` (uuid)
- `product_id` (uuid) ou `variant_id` (uuid)
- `type` (`allergene` | `note`)
- `code` (liste contrôlée pour allergènes : `gluten`, `arachide`, `lactose`, etc.)
- `text` (note libre courte pour instructions client/livreur)
- `severity` (`info` | `avertissement` | `critique`)

## DEP-0248 — Structure d’une disponibilité produit

État de disponibilité d’une variante.

- `variant_id` (uuid)
- `state` (`en_stock` | `faible_stock` | `rupture`)
- `quantity_available` (int, optionnel)
- `restock_eta` (datetime, optionnel)
- `source` (`manuel` | `import` | `api_fournisseur`)
- `updated_at` (datetime, obligatoire)

## DEP-0249 — Structure d’un produit vedette

Mise en avant éditoriale (non calculée).

- `id` (uuid)
- `variant_id` (uuid) ou `product_id` (uuid)
- `tenant_id` (uuid) ou `global` (flag)
- `reason` (texte court, ex: "Nouveau", "Promo locale")
- `start_at` / `end_at` (datetime, optionnels)
- `priority` (int, plus bas = plus haut)
- `placement` (`home_hero` | `catalogue_section` | `panier_suggestion`)

## DEP-0250 — Structure d’un produit populaire

Statut calculé sur l’historique de commandes.

- `id` (uuid)
- `variant_id` (uuid)
- `tenant_id` (uuid)
- `period` (`7j` | `30j`)
- `order_count` (int sur la période)
- `last_order_at` (datetime)
- `rank` (int, 1 = plus commandé)

## DEP-0251 — Structure d’un produit archivé

Variante retirée du catalogue actif.

- `variant_id` (uuid)
- `archived_at` (datetime)
- `reason` (`remplace` | `definitif` | `pause`)
- `replaced_by_variant_id` (uuid, optionnel)
- `visibility` (`cache` | `historique_only`)

## DEP-0252 — Structure d’un produit par tenant client

Surcharge d’un produit pour un tenant.

- `id` (uuid)
- `tenant_id` (uuid)
- `product_id` (uuid)
- `visible` (bool)
- `label_override` / `description_override` (optionnels)
- `category_override_id` (uuid, DEP-0253)
- `default_variant_override_id` (uuid)
- `sort_weight` (int, ordre spécifique au tenant)
- `notes_tenant` (texte interne pour l’équipe du tenant)

## DEP-0253 — Structure d’une catégorie par tenant client

Surcharge d’une catégorie pour un tenant.

- `id` (uuid)
- `tenant_id` (uuid)
- `category_id` (uuid, DEP-0241)
- `label_override` (optionnel)
- `description_override` (optionnel)
- `parent_override_id` (uuid, permet de réorganiser la hiérarchie)
- `display_order` (int spécifique au tenant)
- `visible` (bool)

## DEP-0254 — Structure d’une zone de livraison par tenant client

Zone de desserte et règles associées.

- `id` (uuid)
- `tenant_id` (uuid)
- `name` (ex: "Plateau-Mont-Royal Ouest")
- `geometry` (polygone ou liste de codes postaux)
- `currency` (ISO 4217)
- `minimum_order_amount` (decimal)
- `delivery_fee` (decimal, optionnel)
- `schedule` (plages horaires actives)
- `priority` (int, pour résoudre les chevauchements)

## DEP-0255 — Structure d’un prix interne par tenant client

Prix internes (coût d’achat ou prix de base) par variante et tenant.

- `id` (uuid)
- `tenant_id` (uuid)
- `variant_id` (uuid)
- `price_type` (`cout_achat` | `prix_base` | `prix_promo`)
- `amount` (decimal)
- `currency` (ISO 4217)
- `tax_included` (bool)
- `valid_from` / `valid_to` (datetime, optionnels)
- `source` (`manuel` | `import` | `api_fournisseur`)
