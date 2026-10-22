import styles from './ItemTarefa.module.css';

function ItemTarefa({
  tarefa,
  onDeletar,
  onConcluir,
  onMover,
  exibirAcoesKanban = false,
  onEditar
}) {
  // Desestruturando as variáveis vindas da consulta SQL (JOIN)
  const { id, texto, cidade, prioridade_nome, prioridade_cor, concluida } = tarefa;
  
  const coluna = tarefa.coluna || 'afazer';

  const classeItem = `${styles.tarefa} ${concluida ? styles.concluida : ''}`;
  const classeTexto = `${styles.textoTarefa} ${concluida ? styles.textoConcluido : ''}`;

  return (
    <li className={classeItem} onClick={() => onConcluir && onConcluir(id)}>
      <div className={styles.conteudo}>
        <span className={classeTexto}>{texto}</span>
        {cidade && <p className={styles.cidade}>📍 {cidade}</p>}
      </div>

      <div className={styles.acoes}>
        {/* Badge da Prioridade com Cor e Nome dinâmicos do Banco */}
        <span 
          className={styles.badgePrioridade}
          style={{ backgroundColor: prioridade_cor || '#ccc' }}
        >
          {prioridade_nome}
        </span>

        {exibirAcoesKanban && (
          <div className={styles.botoesMover}>
            {coluna !== 'afazer' && (
              <button 
                type="button"
                onClick={(e) => { 
                  e.stopPropagation(); 
                  onMover(id, 'afazer'); 
                }}
              >
                ← A Fazer
              </button>
            )}
            {coluna !== 'emandamento' && (
              <button 
                type="button"
                onClick={(e) => { 
                  e.stopPropagation(); 
                  onMover(id, 'emandamento'); 
                }}
              >
                {coluna === 'concluido' ? '← Em Andamento' : 'Em Andamento →'}
              </button>
            )}
            {coluna !== 'concluido' && (
              <button 
                type="button"
                onClick={(e) => { 
                  e.stopPropagation(); 
                  onMover(id, 'concluido'); 
                }}
              >
                Concluir →
              </button>
            )}
          </div>
        )}

        {onEditar && (
          <button 
            type="button"
            className={styles.btnDeletar} 
            onClick={(e) => {
              e.stopPropagation();
              onEditar(tarefa);
            }}
          >
            📝
          </button>
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
  );
}

export default ItemTarefa;