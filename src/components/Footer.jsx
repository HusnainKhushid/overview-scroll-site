import useReveal from '../lib/useReveal.js'
import './footer.css'

const COLUMNS = [
  {
    title: 'Menu',
    links: [
      ['Modules', '#modules'],
      ['Preview', '#preview'],
      ['Enroll', '#enroll'],
      ['Journal', '#journal'],
    ],
  },
  {
    title: 'Socials',
    links: [
      ['X', '#x'],
      ['Instagram', '#instagram'],
      ['YouTube', '#youtube'],
    ],
  },
]

const RESOURCES = [
  ['Field notes', '#notes'],
  ['Reading list', '#reading'],
  ['Newsletter', '#newsletter'],
]

export default function Footer() {
  const ref = useReveal(0.15)

  return (
    <footer className="footer" id="footer" data-section="05-footer" ref={ref}>
      {/* the bottom limb arcs through this band — nothing sits in it */}
      <div className="footer__sky" aria-hidden="true" />

      <div className="footer__cols">
        {COLUMNS.map((col) => (
          <nav className="fcol" key={col.title} aria-label={col.title}>
            <h2 className="fcol__title">{col.title}</h2>
            <ul className="fcol__list">
              {col.links.map(([label, href]) => (
                <li key={label}>
                  <a href={href}>{label}</a>
                </li>
              ))}
            </ul>
          </nav>
        ))}

        <div className="fcol">
          <h2 className="fcol__title">Resources</h2>
          <ul className="fcol__list">
            {RESOURCES.map(([label, href]) => (
              <li key={label}>
                <a href={href}>{label}</a>
              </li>
            ))}
          </ul>
          <a className="pill pill--ghost fcol__cta" href="#enroll">
            Send a message
          </a>
        </div>
      </div>

      <p className="footer__legal">
        <span>&copy; 2026 Overview</span>
        <span>Taught from 400 km up</span>
      </p>

      {/* the wordmark bleeds past both gutters and is clipped by the bottom of
          the frame — decorative, so the real name stays in the nav */}
      <p className="footer__wordmark" aria-hidden="true">
        over<span>view</span>
      </p>
    </footer>
  )
}
