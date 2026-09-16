import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { scroll } from '../lib/scroll.js'

const COUNT = 620

/* Points live in a unit square and get stretched to the viewport, so a resize
   never leaves a bare corner. Sizes are in raw pixels — the camera is
   orthographic, so attenuation is off and a star stays a star. */
const vertex = /* glsl */ `
  attribute float aSize;
  attribute float aPhase;
  uniform float uTime;
  uniform float uDpr;
  varying float vAlpha;

  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mv;
    float twinkle = 0.72 + 0.28 * sin(uTime * 0.9 + aPhase);
    vAlpha = twinkle;
    gl_PointSize = aSize * uDpr;
  }
`

const fragment = /* glsl */ `
  varying float vAlpha;
  void main() {
    vec2 d = gl_PointCoord - vec2(0.5);
    float r = length(d) * 2.0;
    float core = smoothstep(1.0, 0.1, r);
    float halo = smoothstep(1.0, 0.0, r) * 0.35;
    float a = (core + halo) * vAlpha;
    if (a < 0.01) discard;
    gl_FragColor = vec4(vec3(0.86, 0.92, 1.0), a);
  }
`

export default function Starfield({ width, height }) {
  const material = useRef()
  const field = useRef()

  const geometry = useMemo(() => {
    const positions = new Float32Array(COUNT * 3)
    const sizes = new Float32Array(COUNT)
    const phases = new Float32Array(COUNT)

    for (let i = 0; i < COUNT; i++) {
      positions[i * 3] = Math.random() - 0.5
      positions[i * 3 + 1] = Math.random() - 0.5
      positions[i * 3 + 2] = -1200 - Math.random() * 1400
      // mostly pinpricks, a handful of brighter ones as in the reference
      const roll = Math.random()
      sizes[i] = roll > 0.955 ? 2.6 + Math.random() * 1.5 : 0.8 + Math.random() * 1.1
      phases[i] = Math.random() * Math.PI * 2
    }

    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    g.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1))
    g.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1))
    return g
  }, [])

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uDpr: { value: Math.min(window.devicePixelRatio || 1, 2) },
    }),
    [],
  )

  const still = useMemo(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    [],
  )

  useFrame((state, delta) => {
    if (!still && material.current) material.current.uniforms.uTime.value += delta
    // the field lags the globe's pull-back by a hair, which reads as depth
    if (field.current) field.current.position.y = -scroll.p * 26
  })

  return (
    <points ref={field} geometry={geometry} scale={[width * 1.25, height * 1.25, 1]} frustumCulled={false}>
      <shaderMaterial
        ref={material}
        vertexShader={vertex}
        fragmentShader={fragment}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}
