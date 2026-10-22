import { useState, useEffect } from "react";
import axios from "axios";

import api, { mensagensDeErro } from "../../interceptor/api";
import Header from "../../components/TaskFlow/Header/Header.jsx";
import ListaTarefa from "../../components/TaskFlow/ListaTarefa/ListaTarefa.jsx";
import Opcoes from "../../components/TaskFlow/Opcaos/Opcaos.jsx";
import Colunas from "../../components/TaskFlow/Colunas/Colunas.jsx";
import ModalTarefa from "../../components/TaskFlow/TarefaModal/TarefaModal.jsx";
import ModalConfirmacao from "../../components/TaskFlow/ModalConfirmacao/ModalConfirmacao.jsx";

import styles from "./TaskFlow.module.css";

function TaskFlow() {
  const usuarioSalvo = JSON.parse(localStorage.getItem("usuario") || "{}");
  const USUARIO_LOGADO_ID = usuarioSalvo.id || 12;

  const [tarefas, setTarefas] = useState([]);
  const [carregar, setCarregar] = useState(true);
  const [erro, setErro] = useState("");

  const [texto, setTexto] = useState("");
  const [cep, setCep] = useState("");
  const [prioridade, setPrioridade] = useState("");
  const [modalAberto, setModalAberto] = useState(false);
  const [tarefaEmEdicao, setTarefaEmEdicao] = useState(null);
  const [colunaParaNovaTarefa, setColunaParaNovaTarefa] = useState("afazer");

  const [modalDeletarAberto, setModalDeletarAberto] = useState(false);
  const [idParaDeletar, setIdParaDeletar] = useState(null);

  const [listaPrioridades, setListaPrioridades] = useState([]);
  const [listaUsuarios, setListaUsuarios] = useState([]);
  const [listaProjetos, setListaProjetos] = useState([]);

  useEffect(() => {
    async function carregarDadosIniciais() {
      try {
        setCarregar(true);
        setErro("");

        const [respPrioridades, respTarefas, respUsuarios, respProjetos] =
          await Promise.all([
            api.get("/prioridades"),
            api.get(`/tarefas?usuario_id=${USUARIO_LOGADO_ID}`),
            api.get("/usuarios"),
            api.get("/projetos"),
          ]);

        setListaPrioridades(respPrioridades.data);
        setTarefas(respTarefas.data);
        setListaUsuarios(respUsuarios.data);
        setListaProjetos(respProjetos.data);
      } catch (e) {
        const msg = mensagensDeErro(e).join("\n");
        setErro("Erro ao carregar dados. Verifique a conexão.");
        console.error(msg);
      } finally {
        setCarregar(false);
      }
    }

    carregarDadosIniciais();
  }, [USUARIO_LOGADO_ID]);

  const ColunaEmAndamento = (nomeColuna) => {
    if (!nomeColuna) return false;
    const col = nomeColuna.toLowerCase();
    return col === "emandamento" || col === "andamento";
  };

  async function consultarCidade(cepDigitado) {
    const apenasNumeros = cepDigitado.replace(/\D/g, "");
    if (apenasNumeros.length !== 8) {
      alert("CEP inválido! O CEP deve conter 8 dígitos.");
      return "";
    }

    try {
      const resposta = await axios.get(
        `https://viacep.com.br/ws/${apenasNumeros}/json/`
      );
      if (resposta.data.erro) {
        alert("CEP não encontrado!");
        return "";
      }
      return `${resposta.data.localidade} - ${resposta.data.uf}`;
    } catch (erro) {
      console.error("Erro ao buscar o CEP:", erro);
      alert("Erro ao buscar o CEP. Verifique sua conexão.");
      return "";
    }
  }

  async function adicionarTarefa() {
    if (texto.trim() === "") return;

    await salvarTarefa({
      texto: texto.trim(),
      cep: cep,
      concluida: false,
      prioridade_id: prioridade || 1,
      coluna: "afazer",
      usuario_id: USUARIO_LOGADO_ID,
    });

    setTexto("");
    setCep("");
  }

  async function salvarTarefa(dados) {
    setErro("");

    if (ColunaEmAndamento(dados.coluna)) {
      const totalEmAndamento = tarefas.filter(
        (t) => ColunaEmAndamento(t.coluna) && t.id !== dados.id
      ).length;

      if (totalEmAndamento >= 2) {
        setErro("Você tem tarefas demais em andamento");
        return;
      }
    }

    let cidadeEncontrada = dados.cidade || "";
    if (dados.cep && dados.cep.trim() !== "") {
      cidadeEncontrada = await consultarCidade(dados.cep);
    }

    const payload = {
      ...dados,
      cidade: cidadeEncontrada,
      usuario_id: dados.usuario_id || USUARIO_LOGADO_ID,
    };

    try {
      if (dados.id) {
        const resposta = await api.put(`/tarefas/${dados.id}`, payload);
        setTarefas(tarefas.map((t) => (t.id === dados.id ? resposta.data : t)));
      } else {
        const resposta = await api.post("/tarefas", payload);
        setTarefas([...tarefas, resposta.data]);
      }
    } catch (e) {
      alert(mensagensDeErro(e).join("\n"));
    }
  }

  async function deletarTarefa(id) {
    try {
      await api.delete(`/tarefas/${id}`);
      setTarefas(tarefas.filter((t) => t.id !== id));
    } catch (e) {
      alert(mensagensDeErro(e).join("\n"));
    }
  }

  async function moverTarefa(id, novaColuna) {
    setErro("");

    if (ColunaEmAndamento(novaColuna)) {
      const totalEmAndamento = tarefas.filter(
        (t) => ColunaEmAndamento(t.coluna) && t.id !== id
      ).length;

      if (totalEmAndamento >= 2) {
        alert("Chegou ao limite de tarefas em andamento");
        return;
      }
    }

    const tarefaAtual = tarefas.find((t) => t.id === id);
    if (!tarefaAtual) return;

    try {
      const resposta = await api.put(`/tarefas/${id}`, {
        ...tarefaAtual,
        coluna: novaColuna,
      });

      setTarefas(tarefas.map((t) => (t.id === id ? resposta.data : t)));
    } catch (e) {
      alert(mensagensDeErro(e).join("\n"));
    }
  }

  async function alternarConcluida(id) {
    setErro("");
    const tarefa = tarefas.find((t) => t.id === id);
    if (!tarefa) return;

    try {
      const resposta = await api.patch(`/tarefas/${id}`, {
        concluida: !tarefa.concluida,
      });
      setTarefas((prev) =>
        prev.map((t) => (t.id === id ? resposta.data : t))
      );
    } catch (e) {
      alert(mensagensDeErro(e).join("\n"));
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
    setColunaParaNovaTarefa(
      typeof idColuna === "string" ? idColuna : "afazer"
    );
    setModalAberto(true);
  }

  return (
    <div className={styles.app}>
      <main className={styles.container}>
        <Header tarefas={tarefas} />
        {carregar && (
          <div className={styles.loading}>Carregando tarefas...</div>
        )}
        {erro && <div className={styles.erro}>{erro}</div>}



        
{/* 

           !!!!!!ARRUMAR!!!! CRIAR UM COMPONENTE SOMENTE P ISSO 
           !!!!!!ARRUMAR!!!! CRIAR UM COMPONENTE SOMENTE P ISSO 
           !!!!!!ARRUMAR!!!! CRIAR UM COMPONENTE SOMENTE P ISSO 
           !!!!!!ARRUMAR!!!! CRIAR UM COMPONENTE SOMENTE P ISSO 
           !!!!!!ARRUMAR!!!! CRIAR UM COMPONENTE SOMENTE P ISSO 
           !!!!!!ARRUMAR!!!! CRIAR UM COMPONENTE SOMENTE P ISSO 

           


        <section className={styles.formulario}>
          <input
            className={styles.inputTarefa}
            type="text"
            value={texto}
            required
            autoComplete="off"
            onChange={(e) => setTexto(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && adicionarTarefa()}
            placeholder="Nova Tarefa..."
          />
          <input
            className={styles.input}
            type="text"
            value={cep}
            autoComplete="off"
            maxLength={9}
            onChange={(e) => setCep(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && adicionarTarefa()}
            placeholder="CEP (opcional)..."
          />
          <Opcoes
            novaPropriedade={prioridade}
            setNovaPropriedade={setPrioridade}
            prioridades={listaPrioridades}
          />
          <button className={styles.btnAdicionar} onClick={adicionarTarefa}>
            Adicionar
          </button>
        </section>
        
        
         !!!!!!ARRUMAR!!!! CRIAR UM COMPONENTE SOMENTE P ISSO 
         !!!!!!ARRUMAR!!!! CRIAR UM COMPONENTE SOMENTE P ISSO 
         !!!!!!ARRUMAR!!!! CRIAR UM COMPONENTE SOMENTE P ISSO 
         !!!!!!ARRUMAR!!!! CRIAR UM COMPONENTE SOMENTE P ISSO 
         !!!!!!ARRUMAR!!!! CRIAR UM COMPONENTE SOMENTE P ISSO 

        
        */}

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
          prioridade={listaPrioridades}
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
        prioridades={listaPrioridades}
        usuarios={listaUsuarios}
        projetos={listaProjetos}
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