import tourStopsJson from './tourStops.json?raw'

export type TourStop = {
  id: string
  city: string
  venue: string
  dateLabel: string
  lat: number
  lng: number
  slug: string
  teaser: string
}

const parsed = JSON.parse(tourStopsJson) as TourStop[]

export const tourStops: TourStop[] = parsed
