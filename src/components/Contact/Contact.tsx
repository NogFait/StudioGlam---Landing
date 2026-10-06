import styles from './Contact.module.css'
import { WHATSAPP_URL } from '../../data/contacto'


const Contact = () => {
  return (
    <section className={styles.contact} id="contacto">
        <div className={styles.contactInner}>
          <div className={styles.info} data-reveal>
            <h2 className={styles.heading}>Visitános en Mendoza</h2>
            <span className={styles.address}>Av. Arístides Villanueva 450</span>
            <p className={styles.city}>Ciudad de Mendoza Argentina</p>
            <span className={styles.scheduleLabel}>Horarios de Atención</span>
            <p className={styles.schedule}>Martes a Sábado | 10:00 - 20:00</p>
            <a className={styles.ctaButton} href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
              RESERVAR POR WHATSAPP
            </a>
          </div>

          <div className={styles.mapWrapper} data-reveal style={{ '--i': 1 } as React.CSSProperties}>
            <iframe
              src="https://www.google.com/maps?q=Av.+Arístides+Villanueva+450,+Mendoza,+Argentina&output=embed"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Ubicación Studio Glam"
            />
          </div>
        </div>
    </section>
  )
}

export default Contact
