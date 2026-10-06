import styles from './ResenaList.module.css'
import { resenas } from "../../data/dataResenas"
import { ResenaCard } from "../ResenaCard/ResenaCard"

const ResenaList = () => {
  return (
    <div className={styles.list}>
        {resenas.map((resena, i)=>(
            <div key={resena.id} data-reveal style={{ '--i': i } as React.CSSProperties}>
              <ResenaCard resena={resena}/>
            </div>
        ))}
    </div>
  )
}

export default ResenaList
