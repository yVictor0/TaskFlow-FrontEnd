import { useState, useEffect } from 'react';
import Header from './components/Header/Header.jsx';
import ListaTarefa from './components/ListaTarefa/ListaTarefa.jsx';
import Opcoes from './components/Opcaos/Opcaos.jsx';

function App() {
  const [tarefas, setTarefas] = useState([]);
  const [proximoId, setProximoId] = useState(1);
  const [texto, setTexto] = useState('');
  const [prioridade, setPrioridade] = useState();

  // EFEITO 1: Carregar do localStorage ao montar
  useEffect(() => {
    const salvo = localStorage.getItem('taskflow-tarefas');

    if (salvo) {
      const dados = JSON.parse(salvo);
      
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTarefas(dados);

      if (dados.length > 0) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setProximoId(dados[dados.length - 1].id + 1);
      }
    }
  }, []);

  // EFEITO 2: Salvar no localStorage sempre que 'tarefas' mudar
  useEffect(() => {
    localStorage.setItem('taskflow-tarefas', JSON.stringify(tarefas));
  }, [tarefas]);

  function adicionarTarefa() {
    if (texto.trim() === '') return;

    setTarefas([
      ...tarefas,
      {
        id: proximoId,
        texto: texto.trim(),
        concluida: false,
        prioridade: prioridade,
      },
    ]);

    setProximoId(proximoId + 1);
    setTexto('');
  }

  function deletarTarefa(id) {
    setTarefas(tarefas.filter(t => t.id !== id));
  }

  const alternarConcluida = (id) => {
    const tarefasAtualizadas = tarefas.map(tarefa => {
      if (tarefa.id === id) {
        return { ...tarefa, concluida: !tarefa.concluida };
      }
      return tarefa;
    });

    setTarefas(tarefasAtualizadas);
  };

  return (
    <div id='app'>
      <Header tarefas={tarefas} />

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
          <Opcoes
            novaPropriedade={prioridade}
            setNovaPropriedade={setPrioridade}
          />

          <button id='btn-adicionar' onClick={adicionarTarefa}>
            Adicionar
          </button>
        </section>

        <ListaTarefa
          tarefas={tarefas}
          onDeletar={deletarTarefa}
          onConcluir={alternarConcluida}
        />
      </main>

      <footer>
        <p>TaskFlow 2026 - Aluno: Yan</p>
      </footer>
    </div>
  );
}

export default App;