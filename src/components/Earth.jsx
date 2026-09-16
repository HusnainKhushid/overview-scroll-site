import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF, useAnimations } from '@react-three/drei'
import * as THREE from 'three'
import { scroll } from '../lib/scroll.js'
import { sunDir, sunDirXY, updateSun } from '../lib/sun.js'

const GLB = `${import.meta.env.BASE_URL}earth.glb`
const TILT = THREE.MathUtils.degToRad(23.4) // real axial tilt, leaned left
const SPIN = 0.016 // rad/s — slow enough to read as a planet, not a globe toy

/* ---------------------------------------------------------------------------
   Air, in three layers.

   The naive trick — a back-facing shell with a fresnel term — is wrong here:
   on a back face the fresnel peaks at the *shell's* own silhouette, so the
   glow is brightest along its outer boundary and reads as a hoop floating
   above the planet. The outside layers below instead measure how far a
   fragment sits beyond the limb and decay exponentially outward, which is how
   scattered air actually falls off. Fresnel only gets used where it is
   correct: on the front face, where it does peak at the limb.
   --------------------------------------------------------------------------- */

const shellVertex = /* glsl */ `
  varying vec3 vLocal;
  varying vec3 vNormalW;
  void main() {
    vLocal = position;                                   // unit sphere
    vNormalW = normalize(mat3(modelMatrix) * normal);
    gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
  }
`

// outside the limb: brightest against the edge, gone by the end of the band
const limbFragment = /* glsl */ `
  uniform vec3 uColor;
  uniform vec2 uSun;
  uniform float uShell;      // shell radius, in earth radii
  uniform float uFalloff;
  uniform float uIntensity;
  varying vec3 vLocal;

  void main() {
    float rho = length(vLocal.xy) * uShell;              // distance from centre
    float d = (rho - 1.0) / max(uShell - 1.0, 1e-4);     // 0 at limb, 1 at shell edge
    if (d < 0.0) discard;                                // that part is planet

    float glow = exp(-d * uFalloff) * smoothstep(1.0, 0.7, d);
    vec2 dir = normalize(vLocal.xy + vec2(1e-5));
    float lit = 0.5 + 0.5 * max(dot(dir, uSun), 0.0);

    float a = glow * lit * uIntensity;
    gl_FragColor = vec4(uColor * a, a);
  }
`

// on the disc: the haze that thickens as the surface turns away from you
const hazeFragment = /* glsl */ `
  uniform vec3 uColor;
  uniform vec3 uSun;
  uniform float uPower;
  uniform float uIntensity;
  varying vec3 vNormalW;

  void main() {
    vec3 n = normalize(vNormalW);
    float fres = pow(1.0 - abs(dot(n, vec3(0.0, 0.0, 1.0))), uPower);
    float lit = 0.28 + 0.72 * max(dot(n, uSun), 0.0);
    float a = fres * lit * uIntensity;
    gl_FragColor = vec4(uColor * a, a);
  }
`

function LimbGlow({ shell, color, falloff, intensity }) {
  const uniforms = useMemo(
    () => ({
      uColor: { value: new THREE.Color(color) },
      uSun: { value: sunDirXY }, // shared object, mutated by updateSun
      uShell: { value: shell },
      uFalloff: { value: falloff },
      uIntensity: { value: intensity },
    }),
    [color, shell, falloff, intensity],
  )

  return (
    <mesh scale={shell} renderOrder={2}>
      <sphereGeometry args={[1, 128, 128]} />
      <shaderMaterial
        vertexShader={shellVertex}
        fragmentShader={limbFragment}
        uniforms={uniforms}
        transparent
        blending={THREE.AdditiveBlending}
        side={THREE.BackSide}
        depthWrite={false}
      />
    </mesh>
  )
}

function DiscHaze({ color, power, intensity }) {
  const uniforms = useMemo(
    () => ({
      uColor: { value: new THREE.Color(color) },
      uSun: { value: sunDir }, // shared object, mutated by updateSun
      uPower: { value: power },
      uIntensity: { value: intensity },
    }),
    [color, power, intensity],
  )

  return (
    <mesh scale={1.002} renderOrder={3}>
      <sphereGeometry args={[1, 128, 128]} />
      <shaderMaterial
        vertexShader={shellVertex}
        fragmentShader={hazeFragment}
        uniforms={uniforms}
        transparent
        blending={THREE.AdditiveBlending}
        side={THREE.FrontSide}
        depthWrite={false}
      />
    </mesh>
  )
}

const smoothstep = (t) => t * t * (3 - 2 * t)

export default function Earth({ framing }) {
  const { scene, animations } = useGLTF(GLB)
  const spinner = useRef()
  const tilter = useRef()
  const anchor = useRef()
  const sizer = useRef()
  const surface = useRef(null) // land/ocean material, lifted by earthshine
  const clock = useRef({ p: 0, p2: 0, p3: 0, p4: 0, born: 0 })
  const { actions } = useAnimations(animations, spinner)

  useEffect(() => {
    scene.traverse((o) => {
      if (!o.isMesh) return
      o.frustumCulled = false
      const mats = Array.isArray(o.material) ? o.material : [o.material]

      mats.forEach((m) => {
        /* The cloud shell ships as a *grayscale cloud mask* wired into
           baseColor with a flat 0.94 alpha — an almost opaque gray sheet that
           drains every bit of colour out of the globe underneath. Rewire it to
           what it actually is: white cloud, transparent where the mask is
           black. */
        if (m.name === 'Material.002' && m.map) {
          const mask = m.map
          mask.colorSpace = THREE.NoColorSpace // it is data, not colour
          m.alphaMap = mask
          m.map = null
          m.color.set('#ffffff')
          m.opacity = 0.92
          m.transparent = true
          m.depthWrite = false
          m.roughness = 1
        } else {
          /* On the night side a directional light leaves the surface flat
             black. A trace of emissive off the colour map stands in for
             earthshine, so continents stay readable behind the copy. */
          surface.current = m
          m.emissive = new THREE.Color('#2c4f86')
          m.emissiveIntensity = 0
        }

        /* Sketchfab put metalness on the ocean mask with no environment to
           reflect, which reads as tar. Zero it and let the roughness map carry
           the sun's specular instead. */
        m.metalness = 0
        m.envMapIntensity = 0
        m.side = THREE.FrontSide

        for (const key of ['map', 'alphaMap', 'emissiveMap', 'normalMap', 'roughnessMap']) {
          if (m[key]) {
            m[key].anisotropy = 8
            m[key].needsUpdate = true
          }
        }
        m.needsUpdate = true
      })
    })
  }, [scene])

  // the model ships a slow cloud-shell drift on an armature
  useEffect(() => {
    Object.values(actions).forEach((a) => {
      if (!a) return
      a.reset().play()
      a.timeScale = 0.25
    })
  }, [actions])

  useFrame((state, delta) => {
    const c = clock.current
    if (spinner.current) spinner.current.rotation.y += SPIN * delta

    /* Scroll drives the framing. Lenis already smooths the page, but the globe
       gets its own damping on top so a trackpad flick reads as the planet
       easing between shots rather than snapping. */
    c.p = THREE.MathUtils.damp(c.p, scroll.p, 5, delta)
    c.p2 = THREE.MathUtils.damp(c.p2, scroll.p2, 5, delta)
    c.p3 = THREE.MathUtils.damp(c.p3, scroll.p3, 5, delta)
    c.p4 = THREE.MathUtils.damp(c.p4, scroll.p4, 5, delta)
    const eased = [
      smoothstep(c.p),
      smoothstep(c.p2),
      smoothstep(c.p3),
      smoothstep(c.p4),
    ]

    /* hero limb -> whole sphere -> night side -> off to the right -> risen
       above the footer. Each stage finishes before the next begins, so folding
       the keyframes through one lerp per stage is enough; no timeline needed,
       and adding a section is one more entry per track. */
    const track = (keys) =>
      keys.reduce((acc, k, i) => (i === 0 ? k : THREE.MathUtils.lerp(acc, k, eased[i - 1])))

    const r = track([framing.heroR, framing.fullR, framing.nightR, framing.rightR, framing.footR])
    const y = track([framing.heroY, framing.fullY, framing.nightY, framing.rightY, framing.footY])
    const x = track([0, 0, framing.nightX, framing.rightX, 0])

    updateSun(eased[1], eased[2], eased[3])
    if (surface.current) surface.current.emissiveIntensity = eased[1] * 0.24

    // entrance: the limb settles down into frame over ~1.8s
    c.born = Math.min(c.born + delta, 1.8)
    const t = 1 - Math.pow(1 - c.born / 1.8, 4)

    if (anchor.current) {
      anchor.current.position.x = x
      anchor.current.position.y = y + (1 - t) * r * 0.06
    }
    if (sizer.current) sizer.current.scale.setScalar(r * (1 + (1 - t) * 0.04))
    // lean the north pole a touch towards the viewer as the sphere comes whole
    if (tilter.current) tilter.current.rotation.x = eased[0] * 0.16
  })

  return (
    <group ref={anchor}>
      <group ref={sizer}>
        {/* wide soft bloom, then the thin bright line of air on the limb */}
        <LimbGlow shell={1.16} color="#1f6ad2" falloff={4.2} intensity={0.62} />
        <LimbGlow shell={1.022} color="#b6e4ff" falloff={7.5} intensity={1.15} />
        <DiscHaze color="#4aa6ff" power={5.0} intensity={0.6} />

        {/* tilt on the outside, spin on the inside, so the globe turns about
            its own leaning axis instead of wobbling */}
        <group ref={tilter}>
          <group rotation={[0, 0, -TILT]}>
            <group ref={spinner}>
              <primitive object={scene} />
            </group>
          </group>
        </group>
      </group>
    </group>
  )
}

useGLTF.preload(GLB)
