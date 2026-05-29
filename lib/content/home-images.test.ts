import { describe, it, expect } from 'vitest'
import { getHomeImages } from './home-images'

describe('getHomeImages', () => {
  it('returns an empty array when no image is set', () => {
    expect(getHomeImages({})).toEqual([])
  })

  it('keeps only filled slots, in order, capped at 3', () => {
    const images = getHomeImages({
      image1: '/images/a.jpg',
      image2: '/images/b.jpg',
      image3: '/images/c.jpg',
    })
    expect(images.map((i) => i.src)).toEqual(['/images/a.jpg', '/images/b.jpg', '/images/c.jpg'])
  })

  it('skips blank or whitespace-only sources and preserves order', () => {
    const images = getHomeImages({
      image1: '   ',
      image2: '/images/b.jpg',
      image3: '',
    })
    expect(images).toHaveLength(1)
    expect(images[0]?.src).toBe('/images/b.jpg')
  })

  it('trims src/alt and drops empty captions', () => {
    const images = getHomeImages({
      image1: '  /images/a.jpg  ',
      image1Alt: '  Salon  ',
      image1Caption: '   ',
    })
    expect(images[0]).toEqual({ src: '/images/a.jpg', alt: 'Salon' })
    expect(images[0]).not.toHaveProperty('caption')
  })

  it('keeps a non-empty caption', () => {
    const images = getHomeImages({
      image1: '/images/a.jpg',
      image1Caption: 'Test terrain à Bruxelles',
    })
    expect(images[0]?.caption).toBe('Test terrain à Bruxelles')
    expect(images[0]?.alt).toBe('')
  })
})
