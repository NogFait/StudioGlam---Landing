import styles from './Servicios.module.css'
import ServiciosList from "../ServiciosList/ServiciosList"


const Servicios = () => {
  return (
    <section className={styles.servicios} id="servicios">
        <div className={styles.header} data-reveal>
          <h2 className={styles.heading}>Servicios que realzan tu estilo</h2>
          <hr className={styles.divider} />
        </div>
        <ServiciosList/>
    </section>
  )
}

export default Servicios
