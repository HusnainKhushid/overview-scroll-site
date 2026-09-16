import { useEffect, useRef } from 'react'

/* Adds `is-in` once a section crosses into view, which is all the CSS needs to
   run its stagger. One observer per section, disconnected after it fires. */
export default function useReveal(threshold = 0.25) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        el.classList.add('is-in')
        io.disconnect()
      },
      { threshold },
    )

    io.observe(el)
    return () => io.disconnect()
  }, [threshold])

  return ref
}
