import { MathUtils } from 'three'
import type { TourStop } from './tourStops'

export const US_BOUNDS = {
  minLat: 24,
  maxLat: 50,
  minLng: -125,
  maxLng: -66,
}

export function projectStopToPercent(stop: TourStop) {
  return {
    xPercent: MathUtils.mapLinear(
      stop.lng,
      US_BOUNDS.minLng,
      US_BOUNDS.maxLng,
      7,
      93,
    ),
    yPercent: MathUtils.mapLinear(
      stop.lat,
      US_BOUNDS.minLat,
      US_BOUNDS.maxLat,
      88,
      10,
    ),
  }
}

export function projectStopToMapSpace(
  stop: TourStop,
  mapWidth: number,
  mapHeight: number,
) {
  return [
    MathUtils.mapLinear(
      stop.lng,
      US_BOUNDS.minLng,
      US_BOUNDS.maxLng,
      -mapWidth * 0.44,
      mapWidth * 0.46,
    ),
    MathUtils.mapLinear(
      stop.lat,
      US_BOUNDS.minLat,
      US_BOUNDS.maxLat,
      mapHeight * 0.42,
      -mapHeight * 0.36,
    ),
  ] as const
}
