import { useEffect, useState } from 'react'
import { RepeatWrapping, SRGBColorSpace, Texture, TextureLoader } from 'three'

type OptionalTextureOptions = {
  srgb?: boolean
  repeat?: [number, number]
}

export function useOptionalTexture(
  src: string | null | undefined,
  options?: OptionalTextureOptions,
): Texture | null {
  const [loaded, setLoaded] = useState<{ src: string; texture: Texture } | null>(
    null,
  )

  useEffect(() => {
    let cancelled = false
    let loadedTexture: Texture | null = null

    if (!src) {
      return () => {}
    }

    const loader = new TextureLoader()
    loader.load(
      src,
      (nextTexture) => {
        if (cancelled) {
          nextTexture.dispose()
          return
        }

        if (options?.srgb) {
          nextTexture.colorSpace = SRGBColorSpace
        }

        if (options?.repeat) {
          nextTexture.wrapS = RepeatWrapping
          nextTexture.wrapT = RepeatWrapping
          nextTexture.repeat.set(options.repeat[0], options.repeat[1])
        }

        loadedTexture = nextTexture
        setLoaded({ src, texture: nextTexture })
      },
      undefined,
      () => {
        if (!cancelled) {
          setLoaded((previous) => {
            if (previous?.texture) {
              previous.texture.dispose()
            }
            return null
          })
        }
      },
    )

    return () => {
      cancelled = true
      if (loadedTexture) {
        loadedTexture.dispose()
      }
    }
  }, [src, options?.srgb, options?.repeat])

  if (!src) {
    return null
  }

  if (!loaded || loaded.src !== src) {
    return null
  }

  return loaded.texture
}
