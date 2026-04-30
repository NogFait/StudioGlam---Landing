import styles from './About.module.css'


const About = () => {
  return (
    <section className={styles.about} id="about">
        <div className={styles.imageWrapper}>
          <img src="https://www.shutterstock.com/image-vector/vector-hair-salon-seamless-pattern-600nw-2363885867.jpg" alt="herramientas peluqueria" />
        </div>
        <div className={styles.content}>
          <span className={styles.label}>NUESTRA ESENCIA</span>
          <h2 className={styles.heading}>El Arte De Un Buen Peinado</h2>
          <p className={styles.text}> En Studio Glam, entendemos que tu cabello es la máxima expresión de tu identidad. Ubicados en el corazón de Mendoza, nuestro equipo de expertos fusiona la técnica de vanguardia con un enfoque artesanal para crear estilos que no solo siguen tendencias, sino que definen personalidades. </p>
          <p className={styles.text}> Creemos en el cuidado personalizado. Cada visita comienza con una consulta profunda para entender tus necesidades, garantizando resultados que exudan lujo, salud y confianza. </p>
        </div>
    </section>
  )
}

export default About
