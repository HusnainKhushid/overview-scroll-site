import { Suspense, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useProgress } from '@react-three/drei'
import Earth from './Earth.jsx'
import Starfield from './Starfield.jsx'
import { sunDir } from '../lib/sun.js'
import './scene.css'

/* --------------------------------------------------------------------------
   Three framings of one globe, and the scroll between them.

   1. Hero — measured off the reference frame (1199 x 899):
        limb apex ....... y = 617px  ->  0.186 frame-heights below centre
        limb at x = 0 ... y = 830px  ->  solves to a circle of r = 951px
                                         = 0.79 frame-widths

   2. Whole sphere, centred, sized so the halo still clears the stat row.

   3. Night side — the limb's crossings on the left and right edges of its own
      reference (1284 x 785) plus a chosen radius fix the centre, which is then
      expressed back in units of R so the composition holds on any aspect ratio
      instead of only on the one I measured. Backed off the reference's zoom
      and pushed further left than it, to keep open sky in the upper right:
      the limb now runs from ~14% down the left edge to ~60% down the right.

   4. Stood off to the right — measured off its own reference (890 x 538): the
      limb reaches furthest left at (370, 300) and crosses the top edge at
      x = 490, which solves to r = 435px centred at (805, 300). In units of R
      that is x = +0.828R, y = -0.071R, so most of the sphere hangs off the
      right edge and the copy gets the open half of the frame.

   5. Footer — the centre rises clear above the frame so only the bottom limb
      arcs in, bottoming out 0.08 frame-heights above the middle. Parameterised
      by that nadir rather than by the centre, which is the number you actually
      look at when deciding how much room the footer copy gets.

   The camera is orthographic at zoom 1, so one world unit is one CSS pixel and
   every one of those measurements drops straight in.
   -------------------------------------------------------------------------- */
const HERO_R_BY_WIDTH = 0.79
const HERO_R_BY_HEIGHT = 0.52
const HERO_APEX_LANDSCAPE = -0.186
const HERO_APEX_PORTRAIT = -0.04
const FULL_R_BY_WIDTH = 0.3
const FULL_R_BY_HEIGHT = 0.36
const NIGHT_R_BY_WIDTH = 1.18
const NIGHT_R_BY_HEIGHT = 1.93
const NIGHT_X_BY_R = -0.24
const NIGHT_Y_BY_R = -0.792
const RIGHT_R_BY_WIDTH = 0.489
const RIGHT_R_BY_HEIGHT = 0.808
const RIGHT_X_BY_R = 0.828
const RIGHT_Y_BY_R = -0.071
const FOOT_R_BY_WIDTH = 0.72
const FOOT_R_BY_HEIGHT = 1.15
const FOOT_NADIR = 0.08

function useFraming() {
  const { width, height } = useThree((s) => s.viewport)

  return useMemo(() => {
    const heroR = Math.max(width * HERO_R_BY_WIDTH, height * HERO_R_BY_HEIGHT)
    const apex = height * (width / height > 1 ? HERO_APEX_LANDSCAPE : HERO_APEX_PORTRAIT)
    const fullR = Math.min(width * FULL_R_BY_WIDTH, height * FULL_R_BY_HEIGHT)
    const nightR = Math.max(width * NIGHT_R_BY_WIDTH, height * NIGHT_R_BY_HEIGHT)
    const rightR = Math.max(width * RIGHT_R_BY_WIDTH, height * RIGHT_R_BY_HEIGHT)
    const footR = Math.max(width * FOOT_R_BY_WIDTH, height * FOOT_R_BY_HEIGHT)

    return {
      heroR,
      heroY: apex - heroR,
      fullR,
      fullY: 0,
      nightR,
      nightX: nightR * NIGHT_X_BY_R,
      nightY: nightR * NIGHT_Y_BY_R,
      rightR,
      rightX: rightR * RIGHT_X_BY_R,
      rightY: rightR * RIGHT_Y_BY_R,
      footR,
      footY: height * FOOT_NADIR + footR,
      width,
      height,
    }
  }, [width, height])
}

/* Whole-scene drift: the globe and the stars slide against the pointer by a
   few pixels, which is what sells a rendered sphere over a flat plate. */
function Parallax({ children }) {
  const group = useRef()
  const still = useMemo(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    [],
  )

  useFrame(({ pointer }, delta) => {
    const g = group.current
    if (!g || still) return
    const a = 1 - Math.pow(0.001, delta)
    g.position.x += (pointer.x * 22 - g.position.x) * a
    g.position.y += (pointer.y * 12 - g.position.y) * a
  })

  return <group ref={group}>{children}</group>
}

/* Earth mutates the shared sun vector each frame; the key light just follows
   it, so the shader rim and the real lighting can never disagree. */
function KeyLight() {
  const light = useRef()

  useFrame(() => {
    if (light.current) light.current.position.copy(sunDir).multiplyScalar(2400)
  })

  return <directionalLight ref={light} intensity={3.1} color="#fff6e8" />
}

function Stage() {
  const framing = useFraming()

  return (
    <>
      <KeyLight />
      {/* cool bounce so the unlit side never goes fully black */}
      <directionalLight position={[500, -700, 600]} intensity={0.35} color="#3f7fd8" />
      <ambientLight intensity={0.22} color="#9fc4ff" />

      <Parallax>
        <Starfield width={framing.width} height={framing.height} />
        <Suspense fallback={null}>
          <Earth framing={framing} />
        </Suspense>
      </Parallax>
    </>
  )
}

export default function Scene() {
  const { progress } = useProgress()
  const ready = progress >= 100

  return (
    <div className={`scene ${ready ? 'is-ready' : ''}`} aria-hidden="true">
      {/* Orthographic, so pulling the camera way back costs nothing in scale
          and guarantees the zoomed-in night sphere — whose radius can exceed
          3000px on a wide display — never swallows the near plane. */}
      <Canvas
        orthographic
        dpr={[1, 2]}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
        camera={{ zoom: 1, position: [0, 0, 20000], near: 1, far: 45000 }}
      >
        <Stage />
      </Canvas>
    </div>
  )
}
