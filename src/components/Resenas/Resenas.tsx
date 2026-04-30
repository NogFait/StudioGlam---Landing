import styles from './Resenas.module.css'
import ResenaList from "../ResenaList/ResenaList"


const Resenas = () => {
  return (
    <section className={styles.resenas} id="resenas">
        <div className={styles.header}>
          <span className={styles.label}>TESTIMONIOS</span>
          <h2 className={styles.heading}>Nuestras Clientas</h2>
        </div>
        <ResenaList/>
    </section>
  )
}

export default Resenas
