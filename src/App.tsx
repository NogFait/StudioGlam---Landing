import styles from './App.module.css'
import About from './components/About/About'
import Contact from './components/Contact/Contact'
import Footer from './components/Footer/Footer'
import Hero from './components/Hero/Hero'
import Navbar from './components/Navbar/Navbar'
import Resenas from './components/Resenas/Resenas'
import Servicios from './components/Servicios/Servicios'
import { useReveal } from './motion/useReveal'

function App() {
  useReveal()

  return (
    <div className={styles.app}>
      <Navbar/>
      <Hero/>
      <About/>
      <Servicios/>
      <Resenas/>
      <Contact/>
      <Footer/>
    </div>
  )
}

export default App
