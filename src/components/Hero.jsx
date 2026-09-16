import { ArrowDown } from './icons.jsx'
import './hero.css'

export default function Hero() {
  return (
    <main className="hero" id="top" data-section="01-hero">
      <div className="hero__content">
        <p className="hero__eyebrow">From orbit</p>

        <h1 className="hero__title">Earth</h1>

        <span className="hero__rule" aria-hidden="true" />

        <p className="hero__copy">
          Six weeks on the only planet we know that works, taught from four hundred
          kilometres up. Seats open today. Early Bird pricing holds for one week, then
          it&rsquo;s gone.
        </p>

        <div className="hero__cta">
          <a className="pill pill--lg" href="#enroll">
            Save a seat
          </a>
        </div>
      </div>

      <a className="hero__scroll" href="#modules" aria-label="Scroll to the next section">
        <ArrowDown width="18" height="18" />
      </a>
    </main>
  )
}
