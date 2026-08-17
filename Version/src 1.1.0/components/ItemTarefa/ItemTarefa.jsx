import styles from './ItemTarefa.module.css';

function ItemTarefa({ prioridade, texto, concluida, onDeletar, onConcluir }) {
  const classeItem = `${styles.tarefa} ${concluida ? styles.concluida : ''}`;
  const classeTexto = `${styles.textoTarefa} ${concluida ? styles.textoConcluido : ''}`;
  
  return (
    <li className={classeItem} onClick={onConcluir}>
      <span className={classeTexto}>{texto}</span>
      
      <div className={styles.acoes}>
        <span className={styles.badgePrioridade}>
          {prioridade}
        </span>

        <button 
          type="button"
          className={styles.btnDeletar} 
          onClick={(e) => {
            e.stopPropagation();
            onDeletar();
          }}
        >
          🗑️
        </button>
      </div>
    </li>
  );
}

export default ItemTarefa;