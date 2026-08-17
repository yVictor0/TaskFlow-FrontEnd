import "./ListaTarefa.modulo.css";
import ItemTarefa from "../ItemTarefa/ItemTarefa.jsx";

function ListaTarefa({ tarefas = [], onDeletar, onConcluir }) {
  return (
    <section id="lista-section">
      {tarefas.length === 0 && (
        <p className="msg-vazia">Nenhuma Tarefa Cadastrada. Adicione uma acima!</p>
      )}

      {tarefas.length > 0 && (
        <ul id="lista-tarefas">
          {tarefas.map((t) => (
            <ItemTarefa
              key={t.id}
              texto={t.texto}
              concluida={t.concluida}
              prioridade={t.prioridade}
              onDeletar={() => onDeletar(t.id)}
              onConcluir={() => onConcluir(t.id)}
            />
          ))}
        </ul>
      )}
    </section>
  );
}

export default ListaTarefa;