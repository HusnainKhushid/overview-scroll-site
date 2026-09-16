import useReveal from '../lib/useReveal.js'
import './about.css'

const FACTS = [
  { value: '12,742', unit: 'km', label: 'Mean diameter' },
  { value: '29.78', unit: 'km/s', label: 'Orbital velocity' },
  { value: '71', unit: '%', label: 'Surface under water' },
  { value: '4.54', unit: 'bn yrs', label: 'Age' },
]

export default function About() {
  const ref = useReveal(0.2)

  return (
    <section className="about" id="modules" data-section="02-about" ref={ref}>
      {/* the globe is behind everything here, so the copy gets its own pool of
          shade rather than a page-wide scrim that would dull the limb */}
      <div className="about__shade" aria-hidden="true" />

      <div className="about__inner">
        <p className="about__eyebrow">Module 01 — The whole thing at once</p>

        <h2 className="about__title">
          Nothing looks the same<br />
          from up here
        </h2>

        <p className="about__copy">
          Far enough out, the coastlines, the currents and the weather stop being separate
          subjects and become one system. Six sessions follow that system from its molten
          first hour to the thin shell of air still holding it together.
        </p>

        <a className="pill pill--ghost" href="#enroll">
          Start the module
        </a>
      </div>

      <dl className="about__facts">
        {FACTS.map((f) => (
          <div className="fact" key={f.label}>
            <dt className="fact__value">
              {f.value}
              <span>{f.unit}</span>
            </dt>
            <dd className="fact__label">{f.label}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
