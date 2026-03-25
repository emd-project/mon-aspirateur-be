import type { Article } from '../types'

export const ARTICLES: Article[] = [
  {
    slug: 'robot-aspirateur-moins-de-500-euros',
    title: 'Meilleur robot aspirateur à moins de 500 € en 2026 : notre sélection belge',
    excerpt:
      'En pratique, dépenser plus de 500 € pour un robot aspirateur se justifie rarement pour un appartement standard. Voici notre sélection testée pour la Belgique.',
    category: 'Guide achat',
    categorySlug: 'guide-achat',
    publishedAt: '2026-01-15T09:00:00Z',
    updatedAt: '2026-03-01T09:00:00Z',
    readingTimeMin: 8,
    authorSlug: 'thomas-v',
    locale: 'fr',
    body: `## Pourquoi les robots à moins de 500 € suffisent pour 80 % des foyers ?

En pratique, la majorité des appartements belges (60–100 m²) n'ont pas besoin d'un robot à 800 €. Les modèles entre 300 et 500 € offrent désormais la navigation LiDAR, une autonomie de 100 à 120 minutes et une filtration correcte.

Notre verdict : au-delà de 500 €, vous payez surtout pour l'autovidage automatique — utile uniquement si vous avez des animaux à poils longs.

## Critères de sélection

Nous avons retenu quatre critères décisifs pour le marché belge :

- **Niveau sonore** : moins de 65 dB — on peut regarder la TV en même temps
- **Surface couverte** : minimum 80 m² par charge
- **Filtration** : HEPA ou équivalent — décisif si vous êtes allergique
- **Disponibilité BE** : chez Coolblue, MediaMarkt ou enseigne locale

## Notre sélection testée

### 1. Modèle A — 349 €
Score compatibilité : 91/100 pour un appartement de 80 m² avec parquet.

Niveau sonore mesuré : 62 dB. Autonomie réelle : 110 minutes. Navigation LiDAR précise, cartographie 3 pièces en 18 minutes.

### 2. Modèle B — 449 €
Score compatibilité : 87/100. Idéal pour les foyers avec animaux (brosse anti-emmêlement).

Niveau sonore mesuré : 64 dB. Bac 0,45 L — à vider tous les 2 passages sur 80 m².

## Notre verdict

Pour un appartement bruxellois standard (parquet, 80 m², sans animal), le Modèle A à 349 € est notre recommandation principale. Le Modèle B vaut le surcoût uniquement si vous avez un chien ou un chat à poils longs.`,
    faq: [
      {
        question: 'Un robot aspirateur à 300 € suffit-il pour 80 m² ?',
        answer:
          'Oui, à condition de choisir un modèle avec navigation LiDAR. Les robots à 300–400 € couvrent généralement 80 à 100 m² par charge en 2026.',
      },
      {
        question: 'La filtration HEPA est-elle indispensable ?',
        answer:
          `La filtration HEPA n'est pas un argument marketing : c'est décisif si vous êtes allergique aux acariens ou aux poils d'animaux. Pour un foyer sans allergie, une filtration standard suffit.`,
      },
      {
        question: 'Où acheter un robot aspirateur en Belgique ?',
        answer:
          'Coolblue (livraison J+1 en Belgique), MediaMarkt et les enseignes locales offrent souvent de meilleures garanties SAV que les pure players. Comparez le prix EUR et la disponibilité des pièces détachées.',
      },
      {
        question: 'Quelle autonomie minimale pour 80 m² ?',
        answer:
          'Comptez 90 minutes minimum pour couvrir 80 m² avec obstacles. En pratique, 100–120 minutes est le confort idéal pour ne pas interrompre le cycle en cours.',
      },
      {
        question: 'Robot aspirateur ou aspirateur balai sans fil ?',
        answer:
          `Le robot aspirateur entretient au quotidien ; l'aspirateur balai sans fil gère les nettoyages en profondeur et les zones difficiles (escaliers, coins). Les deux sont complémentaires pour une surface > 80 m².`,
      },
      {
        question: `Le bruit d'un robot est-il gênant au quotidien ?`,
        answer:
          'En dessous de 65 dB, on peut regarder la TV en même temps. La majorité des modèles récents se situent entre 60 et 68 dB. Vérifiez le niveau mesuré, pas celui indiqué par le fabricant.',
      },
    ],
  },
]

export const getArticle = (slug: string, locale: string): Article | undefined =>
  ARTICLES.find((a) => a.slug === slug && a.locale === locale)

export const getArticles = (locale: string): Article[] =>
  ARTICLES.filter((a) => a.locale === locale)
