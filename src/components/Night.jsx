import useReveal from '../lib/useReveal.js'
import { ArrowRight } from './icons.jsx'
import './night.css'

export default function Night() {
  const ref = useReveal(0.2)

  return (
    <section className="night" id="preview" data-section="03-night" ref={ref}>
      {/* the planet is the left half of this frame, so the shade is a wipe
          rather than the radial pool section two uses */}
      <div className="night__shade" aria-hidden="true" />

      <div className="night__inner">
        <p className="night__chip">
          <span className="night__chip-key">Session 03</span>
          <span className="night__chip-text">
            Ninety minutes riding the terminator, filmed from low orbit.
          </span>
        </p>

        <h2 className="night__title">
          The dark half
          <br />
          is the busy half.
        </h2>

        <p className="night__copy">
          The line between day and night sweeps the surface at 1,670 kilometres an hour, and
          nearly everything worth watching happens on it — storms winding up, ice shelves
          letting go, an ocean handing back the heat it spent all day taking in.
        </p>

        <div className="night__actions">
          <a className="pill pill--lg night__go" href="#enroll">
            Watch the preview
            <ArrowRight width="15" height="15" />
          </a>
          <a className="pill pill--ghost" href="#modules">
            See the modules
          </a>
        </div>
      </div>
    </section>
  )
}
