import { useState } from 'react'
import styles from './ServicioCard.module.css'
import type { Servicio } from "../../types/Servicio"

type Props = {
  servicio: Servicio;
}

const ServicioCard = ({servicio}:Props) => {
  const [imageFailed, setImageFailed] = useState(false)

  return (
    <div className={styles.card}>
      <div className={styles.imageWrapper}>
        {imageFailed || !servicio.img ? (
          <div className={styles.imagePlaceholder}>Foto próximamente</div>
        ) : (
          <img src={servicio.img} alt={servicio.titulo} onError={() => setImageFailed(true)} />
        )}
      </div>

      <div className={styles.content}>
        <h3 className={styles.title}>{servicio.titulo}</h3>
        <p className={styles.description}>{servicio.descripcion}</p>
        <p className={styles.price}>${servicio.precio}</p>
      </div>
    </div>
  )
}

export default ServicioCard
