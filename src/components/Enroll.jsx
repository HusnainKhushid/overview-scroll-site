import useReveal from '../lib/useReveal.js'
import { Orbit, ArrowRight } from './icons.jsx'
import './enroll.css'

const META = ['Six live sessions', 'Recordings kept a year', 'Starts 12 October']

export default function Enroll() {
  const ref = useReveal(0.2)

  return (
    <section className="enroll" id="enroll" data-section="04-enroll" ref={ref}>
      <div className="enroll__shade" aria-hidden="true" />

      <div className="enroll__inner">
        <p className="enroll__eyebrow">
          <Orbit width="15" height="15" />
          Autumn cohort — 2026
        </p>

        <h2 className="enroll__title">
          Save the seat
          <br />
          by the window
        </h2>

        <p className="enroll__copy">
          One planet, six weeks, and an orbital feed that never cuts away. You keep the
          recordings, the raw imagery and the reading list for a year after the cohort ends.
        </p>

        <ul className="enroll__meta">
          {META.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>

        <div className="enroll__actions">
          <a className="pill pill--lg enroll__go" href="#enroll">
            Save a seat
            <ArrowRight width="15" height="15" />
          </a>
          <a className="enroll__link" href="#modules">
            Read the modules first
          </a>
        </div>

        <p className="enroll__fine">
          Early Bird pricing holds for one week. Seats transfer freely up to 48 hours before the
          first session.
        </p>
      </div>
    </section>
  )
}
