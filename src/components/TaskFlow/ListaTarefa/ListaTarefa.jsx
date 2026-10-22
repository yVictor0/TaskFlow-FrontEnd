import "./ListaTarefa.modulo.css";
import ItemTarefa from "../ItemTarefa/ItemTarefa.jsx";

const CLASSE_PRIORIDADE = { 1: 'baixa', 2: 'media', 3: 'alta' };

function ListaTarefa({ tarefas = [], prioridades = [], onDeletar, onConcluir, onEditar }) {
  return (
    <section id="lista-section">
      {tarefas.length === 0 ? (
        <p className="msg-vazia">Nenhuma Tarefa Cadastrada. Adicione uma acima!</p>
      ) : (
        <ul id="lista-tarefas">
          {tarefas.map((tarefa) => {
            const prioridadeObjeto = prioridades.find(
              (p) => p.id === (tarefa.prioridade_id || tarefa.idprioridade)
            );

            return (
              <ItemTarefa
                key={tarefa.id}
                tarefa={tarefa}
                prioridade={CLASSE_PRIORIDADE[tarefa.prioridade_id || tarefa.idprioridade] || 'media'}
                rotuloPrioridade={prioridadeObjeto?.descricao || prioridadeObjeto?.nome}
                onDeletar={onDeletar}
                onConcluir={onConcluir}
                onEditar={onEditar}
                exibirAcoesKanban={false}
              />
            );
          })}
        </ul>
      )}
    </section>
  );
}

export default ListaTarefa;