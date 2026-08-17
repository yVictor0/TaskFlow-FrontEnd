import { useState } from 'react';
import Header from './components/Header/Header.jsx';
import ListaTarefa from './components/ListaTarefa/ListaTarefa.jsx';
import Opcoes from './components/Opcaos/Opcaos.jsx';

function App() {
  const [tarefas, setTarefas] = useState([]);
  const [proximoId, setProximoId] = useState(1); 
  const [texto, setTexto] = useState('');

  const [prioridade, setPrioridade] = useState();

  function adicionarTarefa() {
    if (texto.trim() === '') return;
    
    setTarefas([...tarefas, {
      id: proximoId,
      texto: texto.trim(),
      concluid: false,
      prioridade: prioridade,
    }]);

    setProximoId(proximoId + 1);
    setTexto('');
  }

  function deletarTarefa(id){
    setTarefas(tarefas.filter(t => t.id !== id));
  }

  function concluirTarefa(id){
    setTarefas(tarefas.map(t => t.id === id ? {...t, concluida: !t.concluida} : t));
  }

  return (
    <div id='app'>
      <Header />
      <main className='container'>
        <section id='formulario'>
          <input
            id='input-tarefa'
            type='text'
            value={texto}
            required
            autoComplete='off'
            onChange={e => setTexto(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && adicionarTarefa()}
            placeholder='Nova Tarefa...'
          />
          <Opcoes novaPropriedade={prioridade} setNovaPropriedade={setPrioridade} />

          <button id='btn-adicionar' onClick={adicionarTarefa}>
            Adicionar
          </button>
        </section>
        <ListaTarefa 
          tarefas={tarefas}
          onDeletar={deletarTarefa}
          onConcluir={concluirTarefa} 
        />
      </main>
      <footer>
        <p>TaskFlow 2026 - Aluno: Yan</p>
      </footer>
    </div>
  );
}

export default App;