import styles from './ServiciosList.module.css'
import { servicios } from "../../data/dataServicios"
import ServicioCard from "../ServicioCard/ServicioCard"

const ServiciosList = () => {
  return (
    <div className={styles.list}>
        {servicios.map((servicio)=>(
            <ServicioCard key={servicio.id} servicio={servicio}/>
        ))}
    </div>
  )
}

export default ServiciosList
