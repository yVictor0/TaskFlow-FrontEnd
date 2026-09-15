import { useState, useEffect } from 'react';
import axios from 'axios';

import Header from '../../components/TaskFlow/Header/Header.jsx';
import ListaTarefa from '../../components/TaskFlow/ListaTarefa/ListaTarefa.jsx';
import Opcoes from '../../components/TaskFlow/Opcaos/Opcaos.jsx';
import Colunas from '../../components/TaskFlow/Colunas/Colunas.jsx';
import ModalTarefa from '../../components/TaskFlow/TarefaModal/TarefaModal.jsx';
import ModalConfirmacao from '../../components/TaskFlow/ModalConfirmacao/ModalConfirmacao.jsx';

import styles from './TaskFlow.module.css';

const api_url = 'https://6a85aef09c451dc67a63f689.mockapi.io/tarefas';

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

  useEffect(() => {
    async function carregarTarefas() {
      try {
        setCarregar(true);
        setErro('');
        const resposta = await axios.get(api_url);
        setTarefas(resposta.data);
      } catch (e) {
        setErro('Deu Erro ao carregar');
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
      const { data: novaTarefa } = await axios.post(api_url, {
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

  //erro \/


  async function salvarTarefa(dados) {
    try {
      if (dados.id !== undefined) {
        const { data: tarefaEditada } = await axios.put(`${api_url}/${dados.id}`, {
          ...dados,
          coluna: String(dados.coluna || 'afazer'),
        });
        setTarefas(tarefasAtuais => tarefasAtuais.map(t => (t.id === dados.id ? tarefaEditada : t)));
      } else {
        const { data: novaTarefa } = await axios.post(api_url, {
          ...dados,
          coluna: String(dados.coluna || 'afazer'),
        });
        setTarefas(tarefasAtuais => [...tarefasAtuais, novaTarefa]);
      }
      setModalAberto(false);
      setTarefaEmEdicao(null);
    } catch (e) {
      setErro('Erro ao salvar tarefa.');
      console.error(e);
    }
  }

  //erro /\

  async function deletarTarefa(id) {
    try {
      await axios.delete(`${api_url}/${id}`);
      setTarefas(tarefasAtuais => tarefasAtuais.filter(t => t.id !== id));
    } catch (e) {
      setErro('Erro ao deletar tarefa. Tente novamente.');
      console.error(e);
    }
  }

  async function moverTarefa(id, novaColuna) {
    try {
      const tarefaAtual = tarefas.find(t => t.id === id);
      if (!tarefaAtual) return;

      let proximaColuna = novaColuna;
      if (!proximaColuna || typeof proximaColuna !== 'string') {
        if (tarefaAtual.coluna === 'afazer') proximaColuna = 'emandamento';
        else if (tarefaAtual.coluna === 'emandamento') proximaColuna = 'concluido';
        else proximaColuna = 'afazer';
      }

      const objetoAtualizado = {
        ...tarefaAtual,
        coluna: proximaColuna
      };

      const { data: tarefaMovida } = await axios.put(`${api_url}/${id}`, objetoAtualizado);

      setTarefas(tarefasAtuais =>
        tarefasAtuais.map(t => (t.id === id ? tarefaMovida : t))
      );
      setErro('');
    } catch (e) {
      setErro('Erro ao mover tarefa. Tente novamente.');
      console.error('Erro na requisição PUT:', e);
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
    setTarefas(prev => prev.map(t => (t.id === id ? { ...t, concluida: !t.concluida } : t)));
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