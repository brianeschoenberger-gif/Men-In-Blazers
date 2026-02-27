import type { TextureSet } from '../../config/visualProfiles'

export type AssetKind =
  | 'texture'
  | 'sprite'
  | 'overlay'
  | 'lut'
  | 'hdr'
  | 'brand'
  | 'model'

export type AssetKey =
  | 'tunnel_wall_albedo'
  | 'tunnel_wall_normal'
  | 'tunnel_wall_roughness'
  | 'tunnel_wall_ao'
  | 'tunnel_floor_albedo'
  | 'tunnel_floor_normal'
  | 'tunnel_floor_roughness'
  | 'tunnel_floor_ao'
  | 'ceiling_emissive_strip'
  | 'portal_gradient'
  | 'grime_decal_atlas'
  | 'dust_soft'
  | 'dust_sharp'
  | 'glow_soft'
  | 'light_streak'
  | 'confetti_atlas'
  | 'waveform_mask'
  | 'noise_tile'
  | 'haze_plate_a'
  | 'haze_plate_b'
  | 'film_grain'
  | 'vignette'
  | 'lens_dirt'
  | 'lut_cool_cinematic'
  | 'env_tunnel'
  | 'env_stadium_night'
  | 'brand_wordmark_light'
  | 'brand_mark_light'
  | 'tunnel_model'
  | 'scanline_overlay'
  | 'radial_burst_mask'
  | 'stadium_crowd_plate'
  | 'stadium_tunnel_portal'
  | 'stadium_portal_plate_clean'

export type AssetEntry = {
  key: AssetKey
  kind: AssetKind
  path: string
  optional?: boolean
  notes?: string
}

export const ASSET_MANIFEST: Record<AssetKey, AssetEntry> = {
  tunnel_wall_albedo: {
    key: 'tunnel_wall_albedo',
    kind: 'texture',
    path: '/src/assets/textures/tunnel/wall_albedo.webp',
  },
  tunnel_wall_normal: {
    key: 'tunnel_wall_normal',
    kind: 'texture',
    path: '/src/assets/textures/tunnel/wall_normal.webp',
  },
  tunnel_wall_roughness: {
    key: 'tunnel_wall_roughness',
    kind: 'texture',
    path: '/src/assets/textures/tunnel/wall_roughness.webp',
  },
  tunnel_wall_ao: {
    key: 'tunnel_wall_ao',
    kind: 'texture',
    path: '/src/assets/textures/tunnel/wall_ao.webp',
    optional: true,
  },
  tunnel_floor_albedo: {
    key: 'tunnel_floor_albedo',
    kind: 'texture',
    path: '/src/assets/textures/tunnel/floor_albedo.webp',
  },
  tunnel_floor_normal: {
    key: 'tunnel_floor_normal',
    kind: 'texture',
    path: '/src/assets/textures/tunnel/floor_normal.webp',
  },
  tunnel_floor_roughness: {
    key: 'tunnel_floor_roughness',
    kind: 'texture',
    path: '/src/assets/textures/tunnel/floor_roughness.webp',
  },
  tunnel_floor_ao: {
    key: 'tunnel_floor_ao',
    kind: 'texture',
    path: '/src/assets/textures/tunnel/floor_ao.webp',
    optional: true,
  },
  ceiling_emissive_strip: {
    key: 'ceiling_emissive_strip',
    kind: 'texture',
    path: '/src/assets/textures/lights/ceiling_emissive_strip.webp',
    optional: true,
  },
  portal_gradient: {
    key: 'portal_gradient',
    kind: 'texture',
    path: '/src/assets/textures/lights/portal_gradient.webp',
    optional: true,
  },
  grime_decal_atlas: {
    key: 'grime_decal_atlas',
    kind: 'texture',
    path: '/src/assets/textures/decals/grime_atlas.webp',
    optional: true,
  },
  dust_soft: {
    key: 'dust_soft',
    kind: 'sprite',
    path: '/src/assets/sprites/dust_soft.png',
    optional: true,
  },
  dust_sharp: {
    key: 'dust_sharp',
    kind: 'sprite',
    path: '/src/assets/sprites/dust_sharp.png',
    optional: true,
  },
  glow_soft: {
    key: 'glow_soft',
    kind: 'sprite',
    path: '/src/assets/sprites/glow_soft.png',
    optional: true,
  },
  light_streak: {
    key: 'light_streak',
    kind: 'sprite',
    path: '/src/assets/sprites/light_streak.png',
    optional: true,
  },
  confetti_atlas: {
    key: 'confetti_atlas',
    kind: 'sprite',
    path: '/src/assets/sprites/confetti_atlas.png',
    optional: true,
  },
  waveform_mask: {
    key: 'waveform_mask',
    kind: 'texture',
    path: '/src/assets/textures/transition/waveform_mask.webp',
    optional: true,
  },
  noise_tile: {
    key: 'noise_tile',
    kind: 'texture',
    path: '/src/assets/textures/noise/noise_tile.webp',
    optional: true,
  },
  haze_plate_a: {
    key: 'haze_plate_a',
    kind: 'texture',
    path: '/src/assets/textures/atmosphere/haze_a.webp',
    optional: true,
  },
  haze_plate_b: {
    key: 'haze_plate_b',
    kind: 'texture',
    path: '/src/assets/textures/atmosphere/haze_b.webp',
    optional: true,
  },
  film_grain: {
    key: 'film_grain',
    kind: 'overlay',
    path: '/src/assets/overlays/film_grain.webp',
    optional: true,
  },
  vignette: {
    key: 'vignette',
    kind: 'overlay',
    path: '/src/assets/overlays/vignette.webp',
    optional: true,
  },
  lens_dirt: {
    key: 'lens_dirt',
    kind: 'overlay',
    path: '/src/assets/overlays/lens_dirt.webp',
    optional: true,
  },
  lut_cool_cinematic: {
    key: 'lut_cool_cinematic',
    kind: 'lut',
    path: '/src/assets/luts/cool_cinematic.png',
    optional: true,
  },
  env_tunnel: {
    key: 'env_tunnel',
    kind: 'hdr',
    path: '/src/assets/hdr/env_tunnel_2k.hdr',
    optional: true,
  },
  env_stadium_night: {
    key: 'env_stadium_night',
    kind: 'hdr',
    path: '/src/assets/hdr/env_stadium_night_2k.hdr',
    optional: true,
  },
  brand_wordmark_light: {
    key: 'brand_wordmark_light',
    kind: 'brand',
    path: '/src/assets/brand/wordmark_light.svg',
    optional: true,
  },
  brand_mark_light: {
    key: 'brand_mark_light',
    kind: 'brand',
    path: '/src/assets/brand/mark_light.svg',
    optional: true,
  },
  tunnel_model: {
    key: 'tunnel_model',
    kind: 'model',
    path: '/src/assets/models/tunnel.glb',
    optional: true,
  },
  scanline_overlay: {
    key: 'scanline_overlay',
    kind: 'overlay',
    path: '/src/assets/overlays/scanline.webp',
    optional: true,
  },
  radial_burst_mask: {
    key: 'radial_burst_mask',
    kind: 'texture',
    path: '/src/assets/textures/transition/radial_burst_mask.webp',
    optional: true,
  },
  stadium_crowd_plate: {
    key: 'stadium_crowd_plate',
    kind: 'texture',
    path: '/src/assets/textures/hero/stadium_crowd_plate.webp',
    optional: true,
  },
  stadium_tunnel_portal: {
    key: 'stadium_tunnel_portal',
    kind: 'texture',
    path: '/src/assets/textures/hero/stadium_tunnel_portal.png',
    optional: true,
  },
  stadium_portal_plate_clean: {
    key: 'stadium_portal_plate_clean',
    kind: 'texture',
    path: '/src/assets/textures/hero/stadium_portal_plate_clean.png',
    optional: true,
  },
}

export function getAssetPath(key: AssetKey) {
  return ASSET_MANIFEST[key].path
}

export function getTextureVariantPath(key: AssetKey, textureSet: TextureSet) {
  const base = getAssetPath(key)
  if (textureSet === '2k') {
    return base
  }

  if (base.includes('/textures/')) {
    const extensionIndex = base.lastIndexOf('.')
    if (extensionIndex > -1) {
      return `${base.slice(0, extensionIndex)}_1k${base.slice(extensionIndex)}`
    }
  }

  return base
}
