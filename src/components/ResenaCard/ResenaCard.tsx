import styles from './ResenaCard.module.css'
import type{ Resena } from "../../types/Resena";
interface Props {
  resena: Resena;
}

export const ResenaCard = ({ resena }: Props) => {
  return (
    <div className={styles.card}>
      <span className={styles.quoteMark}>"</span>
      <p className={styles.description}>{resena.descripcion}</p>
      <p className={styles.stars}>{'★'.repeat(resena.estrellas)}{'☆'.repeat(5 - resena.estrellas)}</p>
      <p className={styles.author}>{resena.persona}</p>
    </div>
  );
};
