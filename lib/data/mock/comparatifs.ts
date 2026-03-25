import type { Comparatif } from '../types'

export const COMPARATIFS: Comparatif[] = [
  {
    slug: 'dyson-vs-miele',
    title: 'Dyson vs Miele 2026 : quel aspirateur balai choisir pour un appartement belge ?',
    brandA: 'Dyson',
    brandB: 'Miele',
    excerpt:
      'Dyson mise sur la technologie et le design, Miele sur la durabilité et la filtration. Notre verdict pour le marché belge.',
    publishedAt: '2026-02-01T09:00:00Z',
    readingTimeMin: 10,
    authorSlug: 'thomas-v',
    locale: 'fr',
    body: `## Dyson vs Miele : deux philosophies d'aspirateur

En pratique, choisir entre Dyson et Miele revient à arbitrer entre innovation technologique et fiabilité longue durée.

### Dyson : pour qui ?

Les modèles Dyson V-series sont taillés pour les utilisateurs qui veulent un aspirateur balai sans fil léger, performant sur parquet et polyvalent. Leur point fort : la technologie cyclonique et une autonomie correcte (40–60 minutes).

**Point faible** : la durabilité des batteries se dégrade après 3–4 ans. Le SAV belge Dyson est correct mais les pièces sont coûteuses.

### Miele : pour qui ?

Miele Triflex et Complete C3 sont des valeurs sûres pour les ménages qui aspirent 3–4 fois par semaine et veulent un appareil qui dure 10 ans. Leur filtration HEPA est réellement efficace — testée, pas juste annoncée.

**Point fort** : disponibilité des sacs et filtres dans les grandes surfaces belges.

## Tableau comparatif

| Critère | Dyson V15 | Miele Triflex |
|---------|-----------|---------------|
| Prix BE | ~600 € | ~550 € |
| Autonomie | 60 min | 120 min |
| Poids | 3,1 kg | 3,5 kg |
| Filtration | HEPA | HEPA |
| Bruit mesuré | 78 dB | 72 dB |
| Durabilité | ★★★☆☆ | ★★★★★ |
| SAV Belgique | Correct | Excellent |

## Notre verdict

Notre verdict : pour un appartement de 80 m² avec parquet et pas d'animaux, les deux sont excellents. Choisissez Dyson si vous privilégiez la légèreté et la technologie. Choisissez Miele si vous cherchez à investir sur 10 ans.

Pour les foyers avec animaux à poils longs, Dyson V15 Detect prend l'avantage grâce à son détecteur de particules.`,
    verdict: 'Miele pour la durabilité, Dyson pour la technologie et les foyers avec animaux.',
  },
]

export const getComparatif = (slug: string, locale: string): Comparatif | undefined =>
  COMPARATIFS.find((c) => c.slug === slug && c.locale === locale)

export const getComparatifs = (locale: string): Comparatif[] =>
  COMPARATIFS.filter((c) => c.locale === locale)
