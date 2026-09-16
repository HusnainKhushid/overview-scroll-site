import Scene from './components/Scene.jsx'
import Navbar from './components/Navbar.jsx'
import Hero from './components/Hero.jsx'
import About from './components/About.jsx'
import Night from './components/Night.jsx'
import Enroll from './components/Enroll.jsx'
import Footer from './components/Footer.jsx'
import Loader from './components/Loader.jsx'
import useSmoothScroll from './lib/useSmoothScroll.js'

export default function App() {
  useSmoothScroll()

  return (
    <>
      <Scene />
      <Loader />
      <div className="page">
        <Navbar />
        <Hero />
        <About />
        <Night />
        <Enroll />
        <Footer />
      </div>
    </>
  )
}
