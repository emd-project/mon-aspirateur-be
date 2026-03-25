import type { Guide } from '../types'

export const GUIDES: Guide[] = [
  {
    slug: 'choisir-robot-aspirateur',
    title: 'Comment choisir son robot aspirateur en 2026 : le guide complet pour la Belgique',
    excerpt:
      `Surface, type de sol, présence d'animaux, budget : tous les critères pour choisir le bon robot aspirateur sans se faire avoir par le marketing.`,
    publishedAt: '2026-01-10T09:00:00Z',
    updatedAt: '2026-03-10T09:00:00Z',
    readingTimeMin: 12,
    authorSlug: 'thomas-v',
    locale: 'fr',
    body: `## Les 6 critères décisifs pour choisir un robot aspirateur

En pratique, 80 % des erreurs d'achat viennent de la même cause : acheter selon les arguments marketing plutôt que selon ses besoins réels.

### 1. La surface en m²

C'est le premier filtre. Un robot pour 50 m² n'a pas besoin d'une autonomie de 180 minutes. Calculez : votre surface habitable divisée par 0,8 (obstacle factor) = autonomie minimale en minutes.

Pour Marie, 80 m², il faut minimum 100 minutes d'autonomie réelle.

### 2. Le type de sol

- **Parquet / carrelage** : tous les robots fonctionnent bien
- **Moquette courte** : vérifier la hauteur de passage (minimum 8 mm)
- **Moquette épaisse** : seuls les robots avec aspiration > 2 000 Pa sont efficaces

### 3. Présence d'animaux

Si vous avez un chien ou un chat : brosses anti-emmêlement obligatoires. Les poils longs bloquent les brosses standard en moins d'une semaine.

### 4. Le niveau sonore réel

Notre verdict : le niveau sonore est souvent sous-estimé. En dessous de 65 dB, on peut regarder la TV en même temps. Méfiez-vous des chiffres fabricants — nos tests mesurent le niveau réel.

### 5. La navigation

- **Navigation aléatoire** (< 200 €) : couvre la surface mais manque des zones
- **Navigation infrarouge** (200–350 €) : correcte pour surfaces simples
- **Navigation LiDAR** (> 300 €) : cartographie précise, passages d'obstacles efficaces

### 6. Le budget réaliste pour le marché belge

| Budget | Ce qu'on obtient |
|--------|-----------------|
| < 200 € | Navigation basique, autonomie limitée |
| 200–350 € | Navigation infrarouge, bonne autonomie |
| 350–500 € | LiDAR, filtration HEPA, app mobile |
| > 500 € | Autovidage, mapping multi-étage |

## Notre recommandation par profil

**Marie, 80 m², parquet, chat :** budget 400–450 €, LiDAR + brosse anti-emmêlement.`,
    faq: [
      {
        question: 'Quelle surface un robot aspirateur peut-il couvrir ?',
        answer:
          'La plupart des robots à navigation LiDAR couvrent 80 à 200 m² par charge. Pour un appartement standard belge (60–100 m²), tous les modèles > 300 € sont adaptés.',
      },
      {
        question: 'La filtration HEPA est-elle indispensable sur un robot ?',
        answer:
          `La filtration HEPA n'est pas un argument marketing : c'est décisif si vous êtes allergique. Pour un foyer sans allergie, une filtration standard suffit.`,
      },
      {
        question: 'Quelle est la différence entre un robot aspirateur et un aspirateur balai ?',
        answer:
          `Le robot entretient automatiquement au quotidien ; l'aspirateur balai gère les nettoyages en profondeur. Complémentaires pour > 80 m².`,
      },
      {
        question: 'Un robot aspirateur est-il efficace sur moquette ?',
        answer:
          'Oui, à condition de choisir un modèle avec aspiration > 2 000 Pa pour les moquettes à poils longs.',
      },
      {
        question: 'Combien coûte un bon robot aspirateur en Belgique en 2026 ?',
        answer:
          `Entre 350 et 500 € pour 80 % des besoins. En dessous de 300 €, la navigation est limitée. Au-delà de 500 €, vous payez surtout pour l'autovidage automatique.`,
      },
      {
        question: 'Où acheter un robot aspirateur en Belgique avec garantie SAV ?',
        answer:
          'Coolblue (livraison J+1), MediaMarkt et les enseignes électroménager locales. Comparez le prix EUR et la disponibilité du SAV belge.',
      },
    ],
  },
]

export const getGuide = (slug: string, locale: string): Guide | undefined =>
  GUIDES.find((g) => g.slug === slug && g.locale === locale)

export const getGuides = (locale: string): Guide[] =>
  GUIDES.filter((g) => g.locale === locale)
