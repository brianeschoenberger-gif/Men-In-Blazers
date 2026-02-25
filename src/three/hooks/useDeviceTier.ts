import { useEffect, useState } from 'react'

export type DeviceTier = 'low' | 'mid' | 'high'

export type DeviceTierState = {
  tier: DeviceTier
  isMobile: boolean
  dprCap: number
  particleMultiplier: number
  allowHeavyEffects: boolean
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
    }
  }

  if (tier === 'high') {
    return {
      tier,
      isMobile,
      dprCap: 2,
      particleMultiplier: 1,
      allowHeavyEffects: true,
    }
  }

  return {
    tier,
    isMobile,
    dprCap: 1.5,
    particleMultiplier: 0.65,
    allowHeavyEffects: false,
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

