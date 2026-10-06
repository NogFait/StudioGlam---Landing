import { useState } from 'react'
import styles from './ServicioCard.module.css'
import type { Servicio } from "../../types/Servicio"
import { formatPrecio } from "../../data/format"

type Props = {
  servicio: Servicio;
  onOpen: (servicio: Servicio, card: HTMLElement) => void;
}

const ServicioCard = ({servicio, onOpen}:Props) => {
  const [imageFailed, setImageFailed] = useState(false)

  return (
    <article className={styles.card} data-servicio={servicio.id}>
      <div className={styles.imageWrapper}>
        {imageFailed || !servicio.img ? (
          <div className={styles.imagePlaceholder}>Foto próximamente</div>
        ) : (
          <img src={servicio.img} alt="" draggable={false} onError={() => setImageFailed(true)} />
        )}
      </div>

      <div className={styles.content}>
        <h3 className={styles.title}>{servicio.titulo}</h3>
        <p className={styles.description}>{servicio.descripcion}</p>
        <div className={styles.footer}>
          <p className={styles.price}>{formatPrecio(servicio.precio)}</p>
          {/* Stretched over the whole card: one big target, real <button> semantics. */}
          <button
            type="button"
            className={styles.open}
            aria-haspopup="dialog"
            aria-label={`Ver detalle de ${servicio.titulo}`}
            onClick={(e) => onOpen(servicio, e.currentTarget.closest('article') as HTMLElement)}
          >
            Ver detalle
          </button>
        </div>
      </div>
    </article>
  )
}

export default ServicioCard
