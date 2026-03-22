import { useMemo, useRef, useEffect } from 'react'
import normalFrag from './bubbles/normal.glsl?raw';
import rainbowFrag from './bubbles/rainbow.glsl?raw';
import blueFrag from './bubbles/blue.glsl?raw';


// Deterministic pseudo-random — same seed always gives the same layout
function sr(n) {
  const x = Math.sin(n + 1) * 10000
  return x - Math.floor(x)
}

const COUNT = 24

function Bubbles({ pos = 'fixed' }) {
  const items = useMemo(() => (
    Array.from({ length: COUNT }, (_, i) => ({
      id:      i,
      size:    16 + sr(i * 3)      * 54,
      left:    sr(i * 3 + 1) * 94 + 3,
      delay:  -(sr(i * 3 + 2) * 14),
      dur:     7  + sr(i * 7)      * 10,
      drift:   (sr(i * 5) - 0.5)   * 110,
      opacity: 0.28 + sr(i * 11)   * 0.42,
    }))
  ), [])

  return (
    <div style={{ position: pos, inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
      {items.map(b => (
        <div
          key={b.id}
          style={{
            position: 'absolute',
            left: `${b.left}%`,
            bottom: -(b.size + 12),
            width: b.size, height: b.size,
            borderRadius: '50%',
            opacity: b.opacity,
            animation: `float-bubble ${b.dur}s ${b.delay}s linear infinite`,
            '--b-drift': `${b.drift}px`,
            background: 'radial-gradient(circle at 38% 32%, rgba(255,255,255,0.55) 0%, rgba(200,240,255,0.22) 35%, rgba(100,200,255,0.08) 65%, transparent 100%)',
            border: '1px solid rgba(255,255,255,0.26)',
            overflow: 'hidden',
          }}
        >
          <div style={{
            position: 'absolute', top: '4%', left: '12%', right: '12%', height: '42%',
            borderRadius: '50% 50% 0 0 / 80% 80% 0 0',
            background: 'linear-gradient(to bottom, rgba(255,255,255,0.62), rgba(255,255,255,0.05))',
            pointerEvents: 'none',
          }} />
        </div>
      ))}
    </div>
  )
}

// ── Soap bubbles WebGL shader ──────────────────────────────────────────────────

const VERT_SRC = `
  attribute vec2 a_pos;
  void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
`

const FRAG_SRCS = { normal: normalFrag, rainbow: rainbowFrag, blue: blueFrag }

function compileShader(gl, type, src) {
  const sh = gl.createShader(type)
  gl.shaderSource(sh, src)
  gl.compileShader(sh)
  return sh
}

function SoapBubbles({ pos = 'fixed', variant = 'normal' }) {
    const canvasRef = useRef(null)

    useEffect(() => {
      const canvas = canvasRef.current
      if (!canvas) return
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
      if (!gl) return

      const vert = compileShader(gl, gl.VERTEX_SHADER,   VERT_SRC)
      const frag = compileShader(gl, gl.FRAGMENT_SHADER, FRAG_SRCS[variant] || normalFrag)
      const prog = gl.createProgram()
      gl.attachShader(prog, vert)
      gl.attachShader(prog, frag)
      gl.linkProgram(prog)
      gl.useProgram(prog)
  
      // Full-screen quad
      const buf = gl.createBuffer()
      gl.bindBuffer(gl.ARRAY_BUFFER, buf)
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW)
      const loc = gl.getAttribLocation(prog, 'a_pos')
      gl.enableVertexAttribArray(loc)
      gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)
  
      const uTime      = gl.getUniformLocation(prog, 'iTime')
      const uRes       = gl.getUniformLocation(prog, 'iResolution')
      const uSpeed     = gl.getUniformLocation(prog, 'u_speed')
      const uCount     = gl.getUniformLocation(prog, 'u_bubbleCount')
      const uSize      = gl.getUniformLocation(prog, 'u_bubbleSize')
      const uIntensity = gl.getUniformLocation(prog, 'u_animationIntensity')
  
      gl.uniform1f(uSpeed,     1.0)
      gl.uniform1f(uCount,     1.0)
      gl.uniform1f(uSize,      1.0)
      gl.uniform1f(uIntensity, 1.0)
  
      let raf
      let start = null
  
      function resize() {
        const w = canvas.clientWidth  || canvas.offsetWidth  || window.innerWidth  || 300
        const h = canvas.clientHeight || canvas.offsetHeight || window.innerHeight || 300
        if (canvas.width !== w || canvas.height !== h) {
          canvas.width  = w
          canvas.height = h
          gl.viewport(0, 0, w, h)
        }
      }
  
      function frame(ts) {
        raf = requestAnimationFrame(frame)
        if (!start) start = ts
        resize()
        gl.uniform1f(uTime, (ts - start) / 1000)
        gl.uniform2f(uRes, canvas.width, canvas.height)
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
      }
  
      raf = requestAnimationFrame(frame)
      return () => cancelAnimationFrame(raf)
    }, [variant])
  
    return (
      <canvas
        ref={canvasRef}
        style={{ position: pos, inset: 0, pointerEvents: 'none', zIndex: 0 }}
      />
    )
  }

export default function BgEffect({ effect, variant = 'normal', pos = 'fixed' }) {
  if (effect === 'bubbles')      return <Bubbles     pos={pos} />
  if (effect === 'soap-bubbles') return <SoapBubbles pos={pos} variant={variant} />
  return null
}
