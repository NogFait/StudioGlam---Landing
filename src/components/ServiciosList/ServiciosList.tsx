import { useCallback, useState } from 'react'
import styles from './ServiciosList.module.css'
import { servicios } from "../../data/dataServicios"
import type { Servicio } from "../../types/Servicio"
import ServicioCard from "../ServicioCard/ServicioCard"
import ServicioPanel from "../ServicioPanel/ServicioPanel"

type Open = { servicio: Servicio; card: HTMLElement }

const ServiciosList = () => {
  const [open, setOpen] = useState<Open | null>(null)

  const handleClosed = useCallback(() => {
    setOpen((current) => {
      // Focus goes back to the card that opened the panel.
      const card = current?.card
      requestAnimationFrame(() => card?.querySelector<HTMLElement>('button')?.focus())
      return null
    })
  }, [])

  return (
    <>
      <div className={styles.list}>
          {servicios.map((servicio, i)=>(
              <div key={servicio.id} data-reveal style={{ '--i': i } as React.CSSProperties}>
                <ServicioCard servicio={servicio} onOpen={(s, card) => setOpen({ servicio: s, card })}/>
              </div>
          ))}
      </div>
      {open && <ServicioPanel servicio={open.servicio} origin={open.card} onClosed={handleClosed} />}
    </>
  )
}

export default ServiciosList
