import { useState, useEffect } from 'react';
import axios from 'axios';

import api from '../../interceptor/api';
import Header from '../../components/TaskFlow/Header/Header.jsx';
import ListaTarefa from '../../components/TaskFlow/ListaTarefa/ListaTarefa.jsx';
import Opcoes from '../../components/TaskFlow/Opcaos/Opcaos.jsx';
import Colunas from '../../components/TaskFlow/Colunas/Colunas.jsx';
import ModalTarefa from '../../components/TaskFlow/TarefaModal/TarefaModal.jsx';
import ModalConfirmacao from '../../components/TaskFlow/ModalConfirmacao/ModalConfirmacao.jsx';

import styles from './TaskFlow.module.css';

function TaskFlow() {
  const [tarefas, setTarefas] = useState([]);
  const [carregar, setCarregar] = useState(true);
  const [erro, setErro] = useState('');

  const [texto, setTexto] = useState('');
  const [cep, setCep] = useState('');
  const [prioridade, setPrioridade] = useState('Baixa 🟢');
  const [modalAberto, setModalAberto] = useState(false);
  const [tarefaEmEdicao, setTarefaEmEdicao] = useState(null);
  const [colunaParaNovaTarefa, setColunaParaNovaTarefa] = useState('afazer');

  const [modalDeletarAberto, setModalDeletarAberto] = useState(false);
  const [idParaDeletar, setIdParaDeletar] = useState(null);

  // BUSCA ATUALIZADA (Sessão 7.3) — Token injetado via Interceptor
  useEffect(() => {
    async function carregarTarefas() {
      try {
        setCarregar(true);
        setErro('');
        // api.get — token injetado automaticamente pelo interceptor
        const resposta = await api.get('/tarefas');
        setTarefas(resposta.data);
      } catch (e) {
        setErro('Erro ao carregar tarefas. Verifique a conexão.');
        console.error(e);
      } finally {
        setCarregar(false);
      }
    }

    carregarTarefas();
  }, []);

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

    try {
      const { data: novaTarefa } = await api.post('/tarefas', {
        texto: texto.trim(),
        cidade: cidadeEncontrada,
        concluida: false,
        prioridade: prioridade,
        coluna: 'afazer'
      });

      setTarefas(prev => [...prev, novaTarefa]);
      setTexto('');
      setCep('');
    } catch (e) {
      setErro('Erro ao adicionar tarefa.');
      console.error(e);
    }
  }

  // SALVAR — POST / PUT conforme instrução do professor
  async function salvarTarefa(dados) {
    let cidadeEncontrada = dados.cidade || '';

    if (dados.cep && dados.cep.trim() !== '') {
      cidadeEncontrada = await consultarCidade(dados.cep);
    }

    const payload = {
      ...dados,
      cidade: cidadeEncontrada
    };

    if (dados.id === undefined) {
      // CRIAR — POST /tarefas
      try {
        const resposta = await api.post('/tarefas', payload);
        // id real vem do servidor
        setTarefas(prev => [...prev, resposta.data]);
        setModalAberto(false);
      } catch (err) {
        setErro('Erro ao criar tarefa.');
        console.error(err);
      }
    } else {
      // EDITAR — PUT /tarefas/:id
      try {
        const resposta = await api.put(`/tarefas/${dados.id}`, payload);
        // garante que o estado reflete o servidor
        setTarefas(prev => prev.map(t => (t.id === dados.id ? resposta.data : t)));
        setModalAberto(false);
      } catch (err) {
        setErro('Erro ao editar tarefa.');
        console.error(err);
      }
    }
  }

  // DELETAR — DELETE /tarefas/:id
  async function deletarTarefa(id) {
    try {
      await api.delete(`/tarefas/${id}`);
      // só remove do estado após confirmar no servidor
      setTarefas(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      setErro('Erro ao deletar tarefa.');
      console.error(err);
    }
  }

  // MOVER — PUT /tarefas/:id com nova coluna
  async function moverTarefa(id, novaColuna) {
    try {
      const resposta = await api.put(`/tarefas/${id}`, { coluna: novaColuna });
      setTarefas(prev => prev.map(t => (t.id === id ? resposta.data : t)));
    } catch (err) {
      setErro('Erro ao mover tarefa.');
      console.error(err);
    }
  }

  function solicitarDelecao(id) {
    setIdParaDeletar(id);
    setModalDeletarAberto(true);
  }

  function confirmarDelecao() {
    if (idParaDeletar) deletarTarefa(idParaDeletar);
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
    setColunaParaNovaTarefa(typeof idColuna === 'string' ? idColuna : 'afazer');
    setModalAberto(true);
  }

  return (
    <div className={styles.app}>
      <main className={styles.container}>
        <Header tarefas={tarefas} />
        {carregar && <div className={styles.loading}>Carregando tarefas...</div>}
        {erro && <div className={styles.erro}>{erro}</div>}

        <section className={styles.formulario}>
          <input
            className={styles.inputTarefa}
            type="text"
            value={texto}
            required
            autoComplete="off"
            onChange={e => setTexto(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && adicionarTarefa()}
            placeholder="Nova Tarefa..."
          />
          <input
            className={styles.input}
            type="text"
            value={cep}
            autoComplete="off"
            maxLength={9}
            onChange={e => setCep(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && adicionarTarefa()}
            placeholder="CEP (opcional)..."
          />
          <Opcoes novaPropriedade={prioridade} setNovaPropriedade={setPrioridade} />
          <button className={styles.btnAdicionar} onClick={adicionarTarefa}>
            Adicionar
          </button>
        </section>

        <Colunas
          tarefas={tarefas}
          onMover={moverTarefa}
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