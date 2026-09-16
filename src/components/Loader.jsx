import { useEffect, useState } from 'react'
import { useProgress } from '@react-three/drei'
import './loader.css'

/* The globe is a 15 MB glb, so the first paint would otherwise be an empty
   starless void. Hold a dark card over it and count the bytes in. */
export default function Loader() {
  const { progress, active } = useProgress()
  const [gone, setGone] = useState(false)

  useEffect(() => {
    if (progress < 100) return
    const t = setTimeout(() => setGone(true), 700)
    return () => clearTimeout(t)
  }, [progress])

  if (gone) return null

  return (
    <div className={`loader ${progress >= 100 && !active ? 'is-done' : ''}`}>
      <span className="loader__mark">
        over<span>view</span>
      </span>
      <span className="loader__bar">
        <span style={{ transform: `scaleX(${Math.max(progress, 4) / 100})` }} />
      </span>
      <span className="loader__pct">{Math.round(progress)}%</span>
    </div>
  )
}
