import { useState } from 'react'
import styles from './Navbar.module.css'

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)

  const toggleMenu = () => setIsOpen(prev => !prev)

  const closeMenu = () => setIsOpen(false)

  return (
    <>
      <nav className={styles.navbar}>
          <div className={styles.navbarInner}>
            <h2 className={styles.brand}>STUDIO GLAM</h2>

            <ul className={`${styles.navList} ${isOpen ? styles.navListOpen : ''}`}>
                <li className={styles.navItem}><a href="#about" onClick={closeMenu}>Sobre nosotros</a></li>
                <li className={styles.navItem}><a href="#servicios" onClick={closeMenu}>Servicios</a></li>
                <li className={styles.navItem}><a href="#resenas" onClick={closeMenu}>Reseñas</a></li>
                <li className={styles.navItem}><a href="#contacto" onClick={closeMenu}>Contacto</a></li>
            </ul>

            <button
              className={`${styles.burger} ${isOpen ? styles.burgerOpen : ''}`}
              onClick={toggleMenu}
              aria-label="Toggle navigation"
              aria-expanded={isOpen}
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>
      </nav>

      <div
        className={`${styles.overlay} ${isOpen ? styles.overlayOpen : ''}`}
        onClick={closeMenu}
      />
    </>
  )
}

export default Navbar
