import * as THREE from 'three'

/* The key light is scroll-driven.

   Sections one and two are daylit from high and slightly left. Section three
   swings the sun behind the planet and out to the right: the face towards you
   falls into night and all that survives is a hot line of air along the upper
   limb — which is the entire reason that framing reads the way it does.
   Section four brings it back round to the left and keeps it low, which lights
   a crescent down the globe's leading edge and leaves the rest in shadow. The
   footer drops it below the planet entirely, so the only lit thing left in the
   frame is the bottom limb arcing over the wordmark.

   Both vectors below are shared *mutable* objects. Shader uniforms hold the
   reference, so mutating them here updates every material for free. */
const DAY = new THREE.Vector3(-620, 900, 1400).normalize()
const NIGHT = new THREE.Vector3(900, 380, -640).normalize()
const CRESCENT = new THREE.Vector3(-980, 260, -470).normalize()
const UNDERLIT = new THREE.Vector3(-260, -960, -320).normalize()

export const sunDir = DAY.clone()
export const sunDirXY = new THREE.Vector2(DAY.x, DAY.y).normalize()

export function updateSun(toNight, toCrescent, toUnderlit) {
  sunDir
    .copy(DAY)
    .lerp(NIGHT, toNight)
    .lerp(CRESCENT, toCrescent)
    .lerp(UNDERLIT, toUnderlit)
    .normalize()
  sunDirXY.set(sunDir.x, sunDir.y).normalize()
}
