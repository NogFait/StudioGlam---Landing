import styles from './Hero.module.css'
import peinando from '../../assets/peinando.webp'
import { WHATSAPP_URL } from '../../data/contacto'

const Hero = () => {
  return (
    <section className={styles.hero} style={{ backgroundImage: `url(${peinando})` }}>
        <h1 className={styles.title}>Studio Glam</h1>
        <hr className={styles.divider} />
        <h2 className={styles.subtitle}>CORTES, COLORACIÓN Y ESTILO PROFESIONAL</h2>
        <hr className={styles.divider} />
        <a className={styles.ctaButton} href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
          RESERVAR TURNO POR WHATSAPP
        </a>

    </section>
  )
}

export default Hero
