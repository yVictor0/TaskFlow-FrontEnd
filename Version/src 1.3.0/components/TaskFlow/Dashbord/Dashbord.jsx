import { useState } from 'react';
import ModalTarefa from '../componentes/TarefaModal/TarefaModal';
import ListaTarefas from './ListaTarefas'; 

function Dashbord() {
  const [tarefas, setTarefas] = useState([]);
  const [modalAberto, setModalAberto] = useState(false);
  const [tarefaEditando, setTarefaEditando] = useState(null);
  const [colunaAtiva, setColunaAtiva] = useState('afazer');


  function abrirModalCriar(coluna) {
    setTarefaEditando(null); 
    setColunaAtiva(coluna);
    setModalAberto(true);
  }

  function abrirModalEditar(tarefa) {
    setTarefaEditando(tarefa); 
    setModalAberto(true);
  }

  function deletarTarefa(id) {
    setTarefas(tarefas.filter((t) => t.id !== id));
  }

  function moverTarefa(id, novaColuna) {
    setTarefas(
      tarefas.map((t) => (t.id === id ? { ...t, coluna: novaColuna } : t))
    );
  }

  function salvarTarefa(dados) {
    if (dados.id) {
      setTarefas(tarefas.map((t) => (t.id === dados.id ? { ...t, ...dados } : t)));
    } else {
      setTarefas([...tarefas, { ...dados, id: Date.now() }]);
    }
  }

  return (
    <div className="kanban-container">
      <div className="kanban-coluna">
        <div className="kanban-coluna-header">
          <h3>A Fazer</h3>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span className="kanban-contador">
              {tarefas.filter((t) => t.coluna === 'afazer').length}
            </span>
            <button
              className="kanban-btn-add"
              onClick={() => abrirModalCriar('afazer')}
            >
              +
            </button>
          </div>
        </div>

      <ListaTarefas
          tarefas={tarefas.filter((t) => t.coluna === 'afazer')}
          onDeletar={deletarTarefa}
          onEditar={abrirModalEditar}
          onMover={moverTarefa}
          colunaAnterior={null}
          colunaProxima="andamento"
        />
      </div>

      
      <ModalTarefa
        key={tarefaEditando ? tarefaEditando.id : `nova-${colunaAtiva}`}
        aberto={modalAberto}
        onFechar={() => setModalAberto(false)}
        onSalvar={salvarTarefa}
        tarefa={tarefaEditando}
        coluna={colunaAtiva}
      />
    </div>
  );
}

export default Dashbord;