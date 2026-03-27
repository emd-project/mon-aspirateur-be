# Guide de rédaction — Articles de blog mon-aspirateur.be

Ce document explique comment structurer un article `.mdx` pour qu'il s'affiche correctement sur le site et dans le CMS.

---

## 1. Emplacement du fichier

```
content/articles/{locale}/{categorySlug}/{slug}.mdx
```

**Exemples :**
```
content/articles/fr/guide-achat/meilleur-aspirateur-balai-2026.mdx
content/articles/fr/comparatif/robot-aspirateur-vs-balai.mdx
content/articles/en/buying-guide/best-robot-vacuum-2026.mdx
```

---

## 2. Frontmatter — champs obligatoires et optionnels

Le frontmatter est le bloc entre les deux `---` en début de fichier. Il est lu par le CMS **et** par le site.

```yaml
---
title: "Meilleur aspirateur balai sans fil 2026 : notre sélection"
metaTitle: "Meilleur aspirateur balai sans fil 2026 | mon-aspirateur.be"
metaDescription: "Quel aspirateur balai sans fil choisir en 2026 ? Comparatif complet, tests terrain et avis pour trouver le meilleur modèle selon votre logement."
excerpt: "Après 8 semaines de tests, voici les 5 aspirateurs balais qui se distinguent vraiment — par autonomie, puissance et facilité d'entretien."
category: "Guide achat"
categorySlug: "guide-achat"
publishedAt: "2026-04-01T09:00:00Z"
updatedAt: "2026-04-01T09:00:00Z"
readingTimeMin: 12
authorSlug: "thomas-v"
locale: "fr"
faq:
  - question: "Quelle autonomie minimum pour un aspirateur balai sans fil ?"
    answer: "Comptez au minimum 30 minutes en mode standard pour couvrir un appartement de 80 m². En dessous, vous risquez de devoir recharger en cours de session."
  - question: "Un aspirateur balai sans fil remplace-t-il un aspirateur traineau ?"
    answer: "Pour les sols durs et moquettes courtes, oui. Sur moquette épaisse ou en cas d'allergie sévère, le traineau avec sac reste supérieur en puissance de filtration."
---
```

### Référence des champs

| Champ | Obligatoire | Format | Notes |
|---|---|---|---|
| `title` | ✅ | Texte entre guillemets | Affiché en H1 dans le hero |
| `metaTitle` | — | Texte, max 60 car. | Balise `<title>` — si absent, `title` est utilisé |
| `metaDescription` | — | Texte, max 155 car. | Meta description SEO |
| `excerpt` | ✅ | Texte entre guillemets | Hero + cartes blog + meta de secours |
| `category` | ✅ | Label affiché | Ex : `"Guide achat"`, `"Comparatif"` |
| `categorySlug` | ✅ | Slug sans espaces | `guide-achat` · `comparatif` · `test-avis` · `entretien` · `marques` |
| `publishedAt` | ✅ | ISO 8601 | `"2026-04-01T09:00:00Z"` |
| `updatedAt` | — | ISO 8601 | Affiché si différent de `publishedAt` |
| `readingTimeMin` | ✅ | Nombre entier | Calculer : ~200 mots/min |
| `authorSlug` | ✅ | Slug auteur | `thomas-v` (seul auteur actif) |
| `locale` | ✅ | `fr` ou `en` | Doit correspondre au dossier |
| `faq` | — | Tableau YAML | Voir section 3 ci-dessous |

---

## 3. Format de la FAQ

La FAQ est affichée dans un **accordéon interactif** en bas de l'article, séparé du contenu. Elle est aussi utilisée pour le JSON-LD `FAQPage` (SEO).

### Format frontmatter (recommandé — compatible CMS)

```yaml
faq:
  - question: "La question complète avec point d'interrogation ?"
    answer: "La réponse en texte brut. Pas de markdown. 2-4 phrases maximum."
  - question: "Deuxième question ?"
    answer: "Deuxième réponse."
```

**Règles :**
- `question` et `answer` sont les seules clés valides
- Texte brut uniquement dans `answer` — pas de gras, pas de liens
- Les guillemets sont obligatoires si la question contient `:` ou `#`
- 4 à 8 questions par article est la plage idéale

### Format body alternatif (articles importés sans frontmatter FAQ)

Si la FAQ est rédigée dans le corps de l'article, le site l'extrait automatiquement à condition de respecter cette structure :

```markdown
## FAQ

### La question complète avec point d'interrogation ?

La réponse en un paragraphe. Pas de liste, pas de titre imbriqué.

### Deuxième question ?

Deuxième réponse.
```

> **Note :** Le format frontmatter est préférable — il est lu par le CMS et permet d'éditer les FAQ dans le repeater. Le format body est un filet de sécurité pour les imports.

---

## 4. Composants MDX disponibles

Ces composants s'utilisent directement dans le corps de l'article. Ils reprennent la charte graphique du site.

### `<AISummarize>` — Résumé IA

Bloc de résumé en début d'article. Optimisé pour les extraits en IA générative (GEO).

```mdx
<AISummarize
  question="Quel est le meilleur aspirateur balai sans fil en 2026 ?"
  points="Recommandation principale : Dyson V15 à 649 € — puissance et filtre HEPA | Budget : Samsung Jet 60 à 249 € — bon rapport qualité-prix | Animaux : Miele Triflex HX2 Cat&Dog à 499 €"
/>
```

- `question` : la requête SEO principale
- `points` : résumés séparés par ` | ` (pipe + espace)

---

### `<TLDRBox>` — Tableau résumé rapide

Tableau de sélection visible immédiatement après le résumé IA.

```mdx
<TLDRBox items="Notre choix principal | Dyson V15 | 649 € --- Budget | Samsung Jet 60 | 249 € --- Animaux | Miele Triflex HX2 | 499 €" />
```

- Chaque ligne : `Label | Produit | Prix`
- Les lignes sont séparées par ` --- ` (espace + triple tiret + espace)

---

### `<Tip>` — Conseil (fond vert)

```mdx
<Tip title="Le vrai tip : autonomie réelle vs annoncée">
Divisez l'autonomie annoncée par 1,3 pour obtenir la durée réelle en mode standard. Un modèle annoncé à 60 min tient en pratique 40 à 45 min sur une utilisation mixte sols durs et moquette.
</Tip>
```

---

### `<Warning>` — Avertissement (fond orange)

```mdx
<Warning title="Prix vérifiés en avril 2026">
Les prix sont relevés chez les distributeurs belges (Coolblue, MediaMarkt, Amazon.be). Ils varient selon les promotions.
</Warning>
```

---

### `<Verdict>` — Encadré verdict (bord terracotta)

```mdx
<Verdict title="Notre verdict Dyson V15 Detect">
Pour un appartement de 60 à 120 m² avec sols mixtes, c'est la référence. La détection laser des particules est la seule technologie qui prouve objectivement que le sol est propre.
</Verdict>
```

---

### `<PullQuote>` — Citation mise en avant

```mdx
<PullQuote>
Un aspirateur balai à 400 € fait 90 % du travail d'un modèle à 700 €. La différence se mesure dans la filtration et la durabilité — pas dans la puissance d'aspiration brute.
</PullQuote>
```

---

### `<StatCard>` — Chiffre clé

```mdx
<StatCard value="8 semaines" label="Durée de tests" sub="Sur parquet, moquette et carrelage — appartement de 90 m²" />
```

---

### `<ProConTable>` — Tableau pour / contre

```mdx
<ProConTable
  pros="Filtration HEPA certifiée | Autonomie 60 min réelle | Tête pivotante 270° | Brosse anti-emmêlement incluse"
  cons="Prix élevé (649 €) | Brosse de remplacement à 49 € tous les 12 mois | Station d'accueil volumineuse"
/>
```

- Items séparés par ` | ` (pipe + espace)
- Pas de gras, pas de markdown dans les items

---

## 5. Structure recommandée d'un article

```mdx
---
[frontmatter complet]
---

<AISummarize ... />

<TLDRBox ... />

---

## Question H2 avec le mot-clé principal ?

Réponse directe dès la première phrase...

<StatCard ... />

---

## Quel modèle recommander pour [usage] ?

...

<ProConTable ... />

<Verdict ...>
...
</Verdict>

---

## Comment choisir : les critères décisifs ?

### Critère 1 est-il vraiment important ?

...

<Tip ...>
...
</Tip>

### Tableau comparatif

| Modèle | Prix | Spec | Score |
|---|---|---|---|
| ... | ... | ... | ... |

<Warning ...>
...
</Warning>

---

## Notre verdict final

...

<PullQuote>
...
</PullQuote>
```

---

## 6. Règles éditoriales

| Règle | ✅ Correct | ❌ Interdit |
|---|---|---|
| Pronom | **vous** | tu, te, ton, ta |
| Verdict | indicatif présent | conditionnel ("serait", "pourrait") |
| Marque | factuel | "honnête", "coup de cœur" |
| Superlatifs | chiffres à l'appui | "révolutionnaire", "incroyable", "game-changer" |
| H2/H3 | question avec mot-clé | titre affirmatif sans mot-clé |
| Premier §/H2 | réponse directe | contexte historique |
| Gras | noms de produits + prix + chiffres | adjectifs qualificatifs |
| Images | SVG inline uniquement | `<img>`, `next/image`, picsum |

**Formules maison à utiliser :**
- `En pratique,` — pour les conseils terrain
- `En clair :` — pour les synthèses
- `Le vrai tip :` — dans le titre d'un `<Tip>`

---

## 7. Checklist avant import dans le CMS

```
[ ] title et excerpt renseignés (sans guillemets superflus)
[ ] categorySlug correspond exactement à l'un des 5 slugs valides
[ ] publishedAt au format ISO 8601 avec heure (T09:00:00Z)
[ ] authorSlug = "thomas-v"
[ ] locale = "fr" ou "en" — correspond au dossier de destination
[ ] readingTimeMin calculé (nb mots ÷ 200, arrondi)
[ ] faq avec clés "question" et "answer" (pas "q"/"a")
[ ] Zéro "tu" dans tout l'article
[ ] Zéro conditionnel dans les verdicts
[ ] Les composants MDX utilisent la syntaxe exacte de ce guide
[ ] Pas d'image raster (SVG uniquement)
```
