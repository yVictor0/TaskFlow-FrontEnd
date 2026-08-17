import { useState, useEffect } from 'react';
import axios from 'axios';

import Header from '../../components/TaskFlow/Header/Header.jsx';
import ListaTarefa from '../../components/TaskFlow/ListaTarefa/ListaTarefa.jsx';
import Opcoes from '../../components/TaskFlow/Opcaos/Opcaos.jsx';
import Colunas from '../../components/TaskFlow/Colunas/Colunas.jsx';
import ModalTarefa from '../../components/TaskFlow/TarefaModal/TarefaModal.jsx';
import ModalConfirmacao from '../../components/TaskFlow/ModalConfirmacao/ModalConfirmacao.jsx';

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
  const [colunaParaNovaTarefa, setColunaParaNovaTarefa] = useState('afazer');

  const [modalDeletarAberto, setModalDeletarAberto] = useState(false);
  const [idParaDeletar, setIdParaDeletar] = useState(null);

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

  function solicitarDelecao(id) {
    setIdParaDeletar(id);
    setModalDeletarAberto(true);
  }

  function confirmarDelecao() {
    if (idParaDeletar) {
      setTarefas(prev => prev.filter(t => t.id !== idParaDeletar));
    }
    setModalDeletarAberto(false);
    setIdParaDeletar(null);
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

  function abrirModalNovaTarefa(idColuna) {
    setTarefaEmEdicao(null);
    setColunaParaNovaTarefa(idColuna);
    setModalAberto(true);
  }

  function salvarTarefa(tarefaRecebida) {
    setTarefas(prev => {
      const existe = prev.some(t => String(t.id) === String(tarefaRecebida.id));
      
      if (existe) {
        return prev.map(t => 
          String(t.id) === String(tarefaRecebida.id) ? { ...t, ...tarefaRecebida } : t
        );
      }
      
      return [...prev, { ...tarefaRecebida, cidade: tarefaRecebida.cidade || '' }];
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
          onDeletar={solicitarDelecao}
          onEditar={abrirModalEdicao}
          onAdicionar={abrirModalNovaTarefa}
        />

        <ListaTarefa
          tarefas={tarefas}
          onDeletar={solicitarDelecao}
          onConcluir={alternarConcluida}
          onEditar={abrirModalEdicao}
        />
      </main>

      <ModalTarefa
        aberto={modalAberto}
        tarefa={tarefaEmEdicao}
        coluna={colunaParaNovaTarefa}
        onSalvar={salvarTarefa}
        onFechar={() => {
          setModalAberto(false);
          setTarefaEmEdicao(null);
        }}
      />

      <ModalConfirmacao
        aberto={modalDeletarAberto}
        titulo="Excluir Tarefa?"
        mensagem="Tem certeza que deseja excluir esta tarefa?"
        onConfirmar={confirmarDelecao}
        onCancelar={() => {
          setModalDeletarAberto(false);
          setIdParaDeletar(null);
        }}
      />

      <footer className={styles.footer}>
        <p>TaskFlow 2026 - Aluno: Yan</p>
      </footer>
    </div>
  );
}

export default TaskFlow;