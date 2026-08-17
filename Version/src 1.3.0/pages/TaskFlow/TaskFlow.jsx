import { useState, useEffect } from 'react';
import axios from 'axios';

import Header from '../../components/TaskFlow/Header/Header.jsx';
import ListaTarefa from '../../components/TaskFlow/ListaTarefa/ListaTarefa.jsx';
import Opcoes from '../../components/TaskFlow/Opcaos/Opcaos.jsx';
import Colunas from '../../components/TaskFlow/Colunas/Colunas.jsx';
import ModalTarefa from '../../components/TaskFlow/TarefaModal/TarefaModal.jsx'; // 👈 Importação do Modal

import styles from './TaskFlow.module.css';

function TaskFlow() {
  const [tarefas, setTarefas] = useState(() => {
    const salvo = localStorage.getItem('taskflow-tarefas');
    return salvo ? JSON.parse(salvo) : [];
  });

  const [texto, setTexto] = useState('');
  const [cep, setCep] = useState('');
  const [prioridade, setPrioridade] = useState('Baixa 🟢');
  const [modalAberto, setModalAberto] = useState(false);
  const [tarefaEmEdicao, setTarefaEmEdicao] = useState(null);

  useEffect(() => {
    localStorage.setItem('taskflow-tarefas', JSON.stringify(tarefas));
  }, [tarefas]);

  async function consultarCidade(cepDigitado) {
    const apenasNumeros = cepDigitado.replace(/\D/g, '');
    
    if (apenasNumeros.length !== 8) {
      alert('CEP inválido! O CEP deve conter 8 dígitos.');
      return ''; 
    }

    try {
      const resposta = await axios.get(`https://viacep.com.br/ws/${apenasNumeros}/json/`);
      
      if (resposta.data.erro) {
        alert('CEP não encontrado!');
        return '';
      }

      return `${resposta.data.localidade} - ${resposta.data.uf}`;
    } catch (erro) {
      console.error('Erro ao buscar o CEP:', erro);
      alert('Erro ao buscar o CEP. Verifique sua conexão.');
      return '';
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

  function abrirModalEdicao(tarefa) {
    setTarefaEmEdicao(tarefa);
    setModalAberto(true);
  }

  function salvarTarefaEditada(tarefaAtualizada) {
    setTarefas(prev => {
      const listaAtualizada = prev.map(t => {
        if (String(t.id) === String(tarefaAtualizada.id)) {
          return { ...t, ...tarefaAtualizada };
        }
        return t;
      });

      localStorage.setItem('taskflow-tarefas', JSON.stringify(listaAtualizada));
      return listaAtualizada;
    });

    setModalAberto(false);
    setTarefaEmEdicao(null);
  }

  return (
    <div className={styles.app}>
      <main className={styles.container}>
        <Header tarefas={tarefas} />

        <section className={styles.formulario}>
          <input
            className={styles.inputTarefa}
            type='text'
            value={texto}
            required
            autoComplete='off'
            onChange={e => setTexto(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && adicionarTarefa()}
            placeholder='Nova Tarefa...'
          />
          <input
            className={styles.input}
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

          <button className={styles.btnAdicionar} onClick={adicionarTarefa}>
            Adicionar
          </button>
        </section>

        <Colunas
          tarefas={tarefas}
          onMover={moverTarefas}
          onDeletar={deletarTarefa}
          onEditar={abrirModalEdicao} 
        />

        <ListaTarefa
          tarefas={tarefas}
          onDeletar={deletarTarefa}
          onConcluir={alternarConcluida}
          onEditar={abrirModalEdicao}
        />
      </main>

      <ModalTarefa
        aberto={modalAberto}
        tarefa={tarefaEmEdicao}
        onSalvar={salvarTarefaEditada}
        onFechar={() => {
          setModalAberto(false);
          setTarefaEmEdicao(null);
        }}
      />

      <footer className={styles.footer}>
        <p>TaskFlow 2026 - Aluno: Yan</p>
      </footer>
    </div>
  );
}

export default TaskFlow;