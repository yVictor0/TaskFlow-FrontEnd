import styles from './ItemTarefa.module.css';


function ItemTarefa({tarefa, onDeletar, onConcluir, onMover, exibirAcoesKanban = false, onEditar
}) {
  const { id, texto, cidade, prioridade, concluida, coluna } = tarefa;

  const classeItem = `${styles.tarefa} ${concluida ? styles.concluida : ''}`;
  const classeTexto = `${styles.textoTarefa} ${concluida ? styles.textoConcluido : ''}`;

  return (
    <li className={classeItem} onClick={() => onConcluir && onConcluir(id)}>
      <div className={styles.conteudo}>
        <span className={classeTexto}>{texto}</span>
        {cidade && <p className={styles.cidade}>📍 {cidade}</p>}
      </div>

      <div className={styles.acoes}>
        <span className={styles.badgePrioridade}>{prioridade}</span>

        {exibirAcoesKanban && (
          <div className={styles.botoesMover}>
            {coluna !== 'afazer' && (
              <button onClick={(e) => { e.stopPropagation(); onMover(id, 'afazer'); }}>
                ← A Fazer
              </button>
            )}
            {coluna !== 'emandamento' && (
              <button onClick={(e) => { e.stopPropagation(); onMover(id, 'emandamento'); }}>
                {coluna === 'concluido' ? '← Em Andamento' : 'Em Andamento →'}
              </button>
            )}
            {coluna !== 'concluido' && (
              <button onClick={(e) => { e.stopPropagation(); onMover(id, 'concluido'); }}>
                Concluir →
              </button>
            )}
          </div>
        )}

        {onEditar && (
          <button className={styles.btnDeletar} onClick={() => onEditar(tarefa)}>📝</button>
        )}


        {onDeletar && (
          <button
            type="button"
            className={styles.btnDeletar}
            onClick={(e) => {
              e.stopPropagation();
              onDeletar(id);
            }}
          >
            🗑️
          </button>
          

        )}
      </div>
    </li>
    
  )
}

export default ItemTarefa;