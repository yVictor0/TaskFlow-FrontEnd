import "./ListaTarefa.modulo.css";
import ItemTarefa from "../ItemTarefa/ItemTarefa.jsx";

function ListaTarefa({ tarefas, onDeletar, onConcluir, onEditar }) {
  return (
    <section id="lista-section">
      {tarefas.length === 0 ? (
        <p className="msg-vazia">Nenhuma Tarefa Cadastrada. Adicione uma acima!</p>
      ) : (
        <ul id="lista-tarefas">
          {tarefas.map((t) => (
            <ItemTarefa
              key={t.id}
              tarefa={t}
              onDeletar={onDeletar}
              onConcluir={onConcluir}
              exibirAcoesKanban={false}
              onEditar={onEditar}
            />
          ))}
        </ul>
        
      )}
    </section>
    
  );
}

export default ListaTarefa;