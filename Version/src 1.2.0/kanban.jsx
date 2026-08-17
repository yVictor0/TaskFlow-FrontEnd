import { useState, useEffect } from 'react';
import axios from 'axios';
import Header from './components/Header/Header.jsx';
import ListaTarefa from './components/ListaTarefa/ListaTarefa.jsx';
import Opcoes from './components/Opcaos/Opcaos.jsx';
import Colunas from './components/Colunas/Colunas.jsx';

function Kanban() {
  const [tarefas, setTarefas] = useState(() => {
    const salvo = localStorage.getItem('taskflow-tarefas');
    return salvo ? JSON.parse(salvo) : [];
  });

  const [texto, setTexto] = useState('');
  const [cep, setCep] = useState('');
  const [prioridade, setPrioridade] = useState('Baixa 🟢');

  useEffect(() => {
    localStorage.setItem('taskflow-tarefas', JSON.stringify(tarefas));
  }, [tarefas]);

  async function consultarCidade(cepDigitado) {
    const apenasNumeros = cepDigitado.replace(/\D/g, '');
    
    if (apenasNumeros.length !== 8) {
      alert('CEP inválido! O CEP deve conter 8 dígitos.');
      return null;
    }

    try {
      const resposta = await axios.get(`https://viacep.com.br/ws/${apenasNumeros}/json/`);
      
      if (resposta.data.erro) {
        alert('CEP não encontrado!');
        return null;
      }

      return `${resposta.data.localidade} - ${resposta.data.uf}`;
    } catch (erro) {
      console.error('Erro ao buscar o CEP:', erro);
      alert('Erro ao buscar o CEP. Verifique sua conexão.');
      return null;
    }
  }

  async function adicionarTarefa() {
    if (texto.trim() === '') return;

    let cidadeEncontrada = '';

    if (cep.trim() !== '') {
      cidadeEncontrada = await consultarCidade(cep);
    }

    const novaTarefa = {
      id: Date.now(),
      texto: texto.trim(),
      cidade: cidadeEncontrada,
      concluida: false,
      prioridade: prioridade,
      coluna: 'afazer'
    };

    setTarefas(prev => [...prev, novaTarefa]);
    setTexto('');
    setCep('');
  }

  function moverTarefas(id, novaColuna) {
    setTarefas(prev =>
      prev.map(t => (t.id === id ? { ...t, coluna: novaColuna } : t))
    );
  }

  function deletarTarefa(id) {
    setTarefas(prev => prev.filter(t => t.id !== id));
  }

  function alternarConcluida(id) {
    setTarefas(prev =>
      prev.map(t => (t.id === id ? { ...t, concluida: !t.concluida } : t))
    );
  }

  return (
    <div id='app'>
      <main className='container'>
        <Header tarefas={tarefas} />

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
          <input
            className="input"
            type="text"
            value={cep}
            autoComplete='off'
            maxLength={9}
            onChange={(e) => setCep(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && adicionarTarefa()}
            placeholder="CEP (opcional)..."
          />
          <Opcoes
            novaPropriedade={prioridade}
            setNovaPropriedade={setPrioridade}
          />

          <button id='btn-adicionar' onClick={adicionarTarefa}>
            Adicionar
          </button>
        </section>

        <Colunas
          tarefas={tarefas}
          onMover={moverTarefas}
          onDeletar={deletarTarefa}
        />

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

export default Kanban;