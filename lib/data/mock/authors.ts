import type { Author } from '../types'

export const AUTHORS: Author[] = [
  {
    slug: 'thomas-v',
    name: 'Thomas V.',
    monogram: 'TV',
    title: 'Expert électroménager & testeur aspirateurs',
    bioShort:
      'Thomas V. teste des aspirateurs depuis 2019. Il aide les ménages belges à choisir sans se faire avoir par le marketing.',
    bioLong: `Ingénieur industriel de formation avec une spécialisation en domotique, Thomas V. a commencé à tester des aspirateurs en 2019 après une déconvenue personnelle : un robot à 500 € incapable de gérer correctement les tapis à poils longs de son appartement bruxellois.

Depuis, il a testé et comparé plus de 60 modèles — robots, aspirateurs balais sans fil, traîneaux — en se concentrant sur des critères qui comptent vraiment pour les ménages belges : superficie couverte, niveau sonore réel (mesuré, pas indiqué), durabilité sur parquet, efficacité sur poils d'animaux et disponibilité chez les distributeurs locaux.

Sa méthode repose sur un protocole de test répété sur 80 m² (parquet + moquette + carrelage), complété par une analyse des fiches techniques et des retours d'utilisateurs belges francophones.

Thomas écrit sur mon-aspirateur.be pour offrir des recommandations claires, sourcées et adaptées aux réalités du marché belge — prix EUR, garanties locales, disponibilité chez Coolblue, MediaMarkt et les enseignes indépendantes.

Voix éditoriale : chaleureux, direct, expert — conseiller de confiance, jamais vendeur.`,
    publishedArticles: 10,
    knowsAbout: [
      'aspirateurs',
      'robots aspirateurs',
      'aspirateurs balais sans fil',
      'électroménager',
      'entretien maison',
      'marché belge électroménager',
    ],
  },
]

export const getAuthor = (slug: string): Author | undefined =>
  AUTHORS.find((a) => a.slug === slug)
