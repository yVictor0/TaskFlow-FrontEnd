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
  const [prioridade, setPrioridade] = useState('Média 🟡'); 
  const [modalAberto, setModalAberto] = useState(false);
  const [tarefaEmEdicao, setTarefaEmEdicao] = useState(null);
  const [colunaParaNovaTarefa, setColunaParaNovaTarefa] = useState('afazer');

  const [modalDeletarAberto, setModalDeletarAberto] = useState(false);
  const [idParaDeletar, setIdParaDeletar] = useState(null);

  // BUSCA INICIAL DE TAREFAS
  useEffect(() => {
    async function carregarTarefas() {
      try {
        setCarregar(true);
        setErro('');
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

  // CONSULTA CEP (VIACEP)
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

    await salvarTarefa({
      texto: texto.trim(),
      cep: cep,
      concluida: false,
      prioridade: prioridade,
      coluna: 'afazer',
      usuarioId: null
    });

    setTexto('');
    setCep('');
  }

  async function salvarTarefa(dados) {
    setErro('');
    let cidadeEncontrada = dados.cidade || '';

    if (dados.cep && dados.cep.trim() !== '') {
      cidadeEncontrada = await consultarCidade(dados.cep);
    }

     const payload = {
      ...dados,
       cidade: cidadeEncontrada,
       usuarioId: dados.usuarioId ?? null
    };

    if (dados.id === undefined) {
      try {
        const resposta = await api.post('/tarefas', dados);
        setTarefas([...tarefas, resposta.data]);
      } catch (err) {
        setErro('Erro ao adicionar tarefa. Verifique o servidor e o payload.');
        console.error('Erro de requisição:', err.response?.data || err.message);
      }
    } else {
      try {
        const resposta = await api.put(`/tarefas/${dados.id}`, payload);
        setTarefas(tarefas.map(t => (t.id === dados.id ? resposta.data : t)));
      } catch (err) {
        setErro('Erro ao editar tarefa.');
        console.error('Erro de requisição:', err.response?.data || err.message);
      }
    }
  }
  

  async function deletarTarefa(id) {
    try {
      await api.delete(`/tarefas/${id}`);
      setTarefas(tarefas.filter(t => t.id !== id));
    } catch (err) {
      setErro('Erro ao deletar tarefa.');
      console.error(err);
    }
  }

  async function moverTarefa(id, novaColuna) {
    try {
      const resposta = await api.put(`/tarefas/${id}`, { coluna: novaColuna });
      setTarefas(tarefas.map(t => (t.id === id ? resposta.data : t)));
    } catch (err) {
      setErro('Erro ao mover tarefa.');
      console.error(err);
    }
  }

  async function alternarConcluida(id) {
    setErro('');
    const tarefa = tarefas.find(t => t.id === id);
    if (!tarefa) return;

    try {
      const resposta = await api.patch(`/tarefas/${id}`, { concluida: !tarefa.concluida });
      setTarefas(prev => prev.map(t => (t.id === id ? resposta.data : t)));
    } catch (err) {
      setErro('Erro ao alterar status da tarefa.');
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