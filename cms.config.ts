import type { CmsConfig } from '@/packages/cms/types'

export const cmsConfig: CmsConfig = {
  siteName: 'mon-aspirateur.be',
  repo: 'emd-project/mon-aspirateur-be',
  branch: 'claude/analyze-requirements-Ob4Ae',
  collections: {
    articles: {
      label: 'Articles',
      path: 'content/articles',
      format: 'mdx',
      fields: {
        title: { type: 'text', label: 'Titre', required: true },
        excerpt: { type: 'textarea', label: 'Description SEO', required: true },
        category: { type: 'text', label: 'Catégorie' },
        categorySlug: {
          type: 'select',
          label: 'Slug catégorie',
          required: true,
          options: [
            { label: 'Guide achat', value: 'guide-achat' },
            { label: 'Comparatif', value: 'comparatif' },
            { label: 'Test & avis', value: 'test-avis' },
            { label: 'Entretien', value: 'entretien' },
            { label: 'Marques', value: 'marques' },
          ],
        },
        publishedAt: { type: 'date', label: 'Date de publication', required: true },
        updatedAt: { type: 'date', label: 'Dernière modification' },
        readingTimeMin: { type: 'number', label: 'Temps de lecture (min)' },
        authorSlug: {
          type: 'select',
          label: 'Auteur',
          required: true,
          options: [{ label: 'Thomas V.', value: 'thomas-v' }],
        },
        locale: {
          type: 'select',
          label: 'Langue',
          required: true,
          options: [
            { label: 'Français', value: 'fr' },
            { label: 'English', value: 'en' },
          ],
        },
        image1: { type: 'text', label: 'Image 1 — URL (optionnel)' },
        image1Alt: { type: 'text', label: 'Image 1 — texte alternatif' },
        image1Caption: { type: 'text', label: 'Image 1 — légende' },
        image2: { type: 'text', label: 'Image 2 — URL (optionnel)' },
        image2Alt: { type: 'text', label: 'Image 2 — texte alternatif' },
        image2Caption: { type: 'text', label: 'Image 2 — légende' },
        image3: { type: 'text', label: 'Image 3 — URL (optionnel)' },
        image3Alt: { type: 'text', label: 'Image 3 — texte alternatif' },
        image3Caption: { type: 'text', label: 'Image 3 — légende' },
        draft: {
          type: 'select',
          label: 'Statut',
          options: [
            { label: 'Publié', value: 'false' },
            { label: 'Brouillon', value: 'true' },
          ],
        },
        faq: {
          type: 'repeater',
          label: 'FAQ',
          fields: {
            question: { type: 'text', label: 'Question', required: true },
            answer: { type: 'textarea', label: 'Réponse', required: true },
          },
        },
      },
    },
  },
  media: {
    path: 'public/images',
    allowedTypes: ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'],
    maxSizeMB: 5,
  },
}
