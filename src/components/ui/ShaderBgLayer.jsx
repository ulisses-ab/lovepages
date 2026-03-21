import { Suspense } from 'react'
import { ShaderGradientCanvas, ShaderGradient } from '@shadergradient/react'

/**
 * Renders a ShaderGradient as a background layer.
 * pos: 'fixed' for the public page, 'absolute' for editor preview panels / containers.
 */
export default function ShaderBgLayer({ shaderProps, pos = 'absolute' }) {
  if (!shaderProps) return null
  return (
    <Suspense fallback={null}>
      <ShaderGradientCanvas
        style={{ position: pos, inset: 0, zIndex: 0, pointerEvents: 'none' }}
        pixelDensity={1}
      >
        <ShaderGradient {...shaderProps} />
      </ShaderGradientCanvas>
    </Suspense>
  )
}
