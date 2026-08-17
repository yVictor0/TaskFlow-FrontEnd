import styles from './Colunas.module.css';
import ItemTarefa from '../ItemTarefa/ItemTarefa.jsx';

function Colunas({ tarefas, onMover, onDeletar }) {
  const aFazer = tarefas.filter(t => t.coluna === 'afazer' || !t.coluna);
  const emAndamento = tarefas.filter(t => t.coluna === 'emandamento');
  const concluidas = tarefas.filter(t => t.coluna === 'concluido');

  const renderColuna = (titulo, lista, idColuna) => (
    <div className={`${styles.coluna} ${styles[`coluna-${idColuna}`]}`}>
      <div className={styles['coluna-header']}>
        <h3>{titulo}</h3>
        <span className={styles.contador}>{lista.length}</span>
      </div>
      <div className={styles['coluna-body']}>
        {lista.length === 0 ? (
          <p className={styles.vazio}>Nenhuma tarefa</p>
        ) : (
          <ul className={styles.listaKanban}>
            {lista.map(tarefa => (
              <ItemTarefa
                key={tarefa.id}
                tarefa={tarefa}
                onMover={onMover}
                onDeletar={onDeletar}
                exibirAcoesKanban={true}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  );

  return (
    <div className={styles['quadro-kanban']}>
      {renderColuna('📋 A Fazer', aFazer, 'afazer')}
      {renderColuna('⌛ Em Andamento', emAndamento, 'emandamento')}
      {renderColuna('✅ Concluído', concluidas, 'concluido')}
    </div>
  );
}

export default Colunas;