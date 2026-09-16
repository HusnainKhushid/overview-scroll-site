/* One mutable cell the whole app reads from.

   The 3D scene must not re-render React on every scroll frame, so scroll lives
   outside React: the listener writes here, useFrame reads here, and the DOM
   gets CSS custom properties instead of a state update. */
export const scroll = {
  y: 0,
  /** 0 = hero limb, 1 = the globe has pulled back into section two */
  p: 0,
  /** 0 = section two, 1 = zoomed onto the night side in section three */
  p2: 0,
  /** 0 = section three, 1 = stood off to the right in section four */
  p3: 0,
  /** 0 = section four, 1 = risen above the frame, bottom limb over the footer */
  p4: 0,
}

const clamp01 = (v) => Math.min(Math.max(v, 0), 1)

export function setScroll(y) {
  const vh = Math.max(window.innerHeight, 1)
  scroll.y = y
  scroll.p = clamp01(y / vh)
  scroll.p2 = clamp01((y - vh) / vh)
  scroll.p3 = clamp01((y - vh * 2) / vh)
  scroll.p4 = clamp01((y - vh * 3) / vh)

  const root = document.documentElement.style
  root.setProperty('--sp', String(scroll.p))
  root.setProperty('--sp2', String(scroll.p2))
  root.setProperty('--sp3', String(scroll.p3))
  root.setProperty('--sp4', String(scroll.p4))
}
