import styles from './Hero.module.css'
import peinando from '../../assets/peinando.webp'

const Hero = () => {
  return (
    <section className={styles.hero} style={{ backgroundImage: `url(${peinando})` }}>
        <h1 className={styles.title}>Studio Glam</h1>
        <hr className={styles.divider} />
        <h2 className={styles.subtitle}>CORTES, COLORACIÓN Y ESTILO PROFESIONAL</h2>
        <hr className={styles.divider} />
        <button className={styles.ctaButton}>RESERVAR TURNO POR WHATSAPP</button>

    </section>
  )
}

export default Hero
