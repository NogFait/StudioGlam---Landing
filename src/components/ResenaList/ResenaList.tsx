import styles from './ResenaList.module.css'
import { resenas } from "../../data/dataResenas"
import { ResenaCard } from "../ResenaCard/ResenaCard"

const ResenaList = () => {
  return (
    <div className={styles.list}>
        {resenas.map((resena)=>(
            <ResenaCard key={resena.id} resena={resena}/>
        ))}
    </div>
  )
}

export default ResenaList
