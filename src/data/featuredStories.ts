import featuredStoriesJson from './featuredStories.json?raw'

export type FeaturedStory = {
  id: string
  title: string
  dek: string
  category: string
  slug: string
}

const parsed = JSON.parse(featuredStoriesJson) as FeaturedStory[]

export const featuredStories: FeaturedStory[] = parsed
