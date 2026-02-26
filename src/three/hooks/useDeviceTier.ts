import { useEffect, useState } from 'react'

export type DeviceTier = 'low' | 'mid' | 'high'

export type DeviceTierState = {
  tier: DeviceTier
  isMobile: boolean
  dprCap: number
  particleMultiplier: number
  allowHeavyEffects: boolean
  allowPostFx: boolean
  textureSet: '1k' | '2k'
  particleCap: number
}

type NavigatorWithMemory = Navigator & {
  deviceMemory?: number
}

function detectDeviceTier(): DeviceTierState {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return {
      tier: 'mid',
      isMobile: false,
      dprCap: 1.5,
      particleMultiplier: 0.7,
      allowHeavyEffects: false,
      allowPostFx: false,
      textureSet: '1k',
      particleCap: 650,
    }
  }

  const width = window.innerWidth
  const isMobile = width < 900
  const cores = navigator.hardwareConcurrency ?? 4
  const memory = (navigator as NavigatorWithMemory).deviceMemory ?? 4

  const lowTier = isMobile || cores <= 4 || memory <= 4
  const highTier = !isMobile && cores >= 10 && memory >= 8

  const tier: DeviceTier = lowTier ? 'low' : highTier ? 'high' : 'mid'

  if (tier === 'low') {
    return {
      tier,
      isMobile,
      dprCap: 1.25,
      particleMultiplier: 0.35,
      allowHeavyEffects: false,
      allowPostFx: false,
      textureSet: '1k',
      particleCap: 320,
    }
  }

  if (tier === 'high') {
    return {
      tier,
      isMobile,
      dprCap: 2,
      particleMultiplier: 1,
      allowHeavyEffects: true,
      allowPostFx: true,
      textureSet: '2k',
      particleCap: 1200,
    }
  }

  return {
    tier,
    isMobile,
    dprCap: 1.5,
    particleMultiplier: 0.65,
    allowHeavyEffects: false,
    allowPostFx: false,
    textureSet: '1k',
    particleCap: 650,
  }
}

export function useDeviceTier() {
  const [deviceTier, setDeviceTier] = useState<DeviceTierState>(() =>
    detectDeviceTier(),
  )

  useEffect(() => {
    const onResize = () => setDeviceTier(detectDeviceTier())
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  return deviceTier
}
