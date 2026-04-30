import styles from './Footer.module.css'


const Footer = () => {
  return (
    <footer className={styles.footer}>
        <h2 className={styles.brand}>STUDIO GLAM</h2>
        <ul className={styles.navList}>
            <li className={styles.navItem}><a href="#about">Sobre nosotros</a></li>
            <li className={styles.navItem}><a href="#servicios">Servicios</a></li>
            <li className={styles.navItem}><a href="#resenas">Reseñas</a></li>
            <li className={styles.navItem}><a href="#contacto">Contacto</a></li>
        </ul>
        <hr className={styles.divider} />
        <p className={styles.copyright}>© {new Date().getFullYear()} Fausto Chirino. Todos los derechos reservados.</p>
      
    </footer>
  )
}

export default Footer
