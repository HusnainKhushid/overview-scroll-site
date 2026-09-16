import { useEffect } from 'react'
import Lenis from 'lenis'
import { setScroll } from './scroll.js'

/* Lenis carries the page between the two framings; without it the globe's
   pull-back is only as smooth as the wheel's notches. */
export default function useSmoothScroll() {
  useEffect(() => {
    setScroll(window.scrollY)

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const onScroll = () => setScroll(window.scrollY)
      window.addEventListener('scroll', onScroll, { passive: true })
      return () => window.removeEventListener('scroll', onScroll)
    }

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => 1 - Math.pow(1 - t, 4),
      smoothWheel: true,
    })

    lenis.on('scroll', ({ scroll: y }) => setScroll(y))

    // same-page links should glide too, not teleport past the animation
    const onClick = (e) => {
      const a = e.target.closest?.('a[href^="#"]')
      if (!a) return
      const hash = a.getAttribute('href')
      if (!hash || hash.length < 2) return
      const target = document.querySelector(hash)
      if (!target) return
      e.preventDefault()
      lenis.scrollTo(target)
    }
    document.addEventListener('click', onClick)

    let frame = requestAnimationFrame(function raf(time) {
      lenis.raf(time)
      frame = requestAnimationFrame(raf)
    })

    return () => {
      document.removeEventListener('click', onClick)
      cancelAnimationFrame(frame)
      lenis.destroy()
    }
  }, [])
}
