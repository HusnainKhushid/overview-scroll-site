import { useEffect, useState } from 'react'
import { Menu, Close } from './icons.jsx'
import './navbar.css'

const LINKS = ['Modules', 'Preview', 'Enroll', 'Journal']

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('keydown', onKey)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  return (
    <header className={`nav ${scrolled ? 'is-scrolled' : ''}`} data-section="00-navbar">
      <div className="nav__inner">
        <a className="nav__logo" href="#top">
          over<span>view</span>
        </a>

        <nav className="nav__links" aria-label="Primary">
          {LINKS.map((label, i) => (
            <a
              key={label}
              className={`nav__link ${i === 0 ? 'is-active' : ''}`}
              href={`#${label.toLowerCase()}`}
              aria-current={i === 0 ? 'page' : undefined}
            >
              {label}
            </a>
          ))}
          <a className="pill nav__cta" href="#enroll">
            Save a seat
          </a>
        </nav>

        <button
          className="nav__toggle"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
        >
          {open ? <Close width="22" height="22" /> : <Menu width="22" height="22" />}
        </button>
      </div>

      <div className={`nav__sheet ${open ? 'is-open' : ''}`}>
        {LINKS.map((label) => (
          <a key={label} href={`#${label.toLowerCase()}`} onClick={() => setOpen(false)}>
            {label}
          </a>
        ))}
        <a className="pill nav__cta" href="#enroll" onClick={() => setOpen(false)}>
          Save a seat
        </a>
      </div>
    </header>
  )
}
