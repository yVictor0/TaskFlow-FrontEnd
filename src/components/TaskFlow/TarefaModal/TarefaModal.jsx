import { useState, useEffect } from "react";
import axios from "axios";
import styles from "./Tarefamoldal.module.css";
import { mensagensDeErro } from "../../../interceptor/api";

function paraNumero(valor) {
  return valor ? Number(valor) : null;
}

function ModalTarefa({
  aberto,
  onFechar,
  onSalvar,
  tarefa = null,
  coluna = "afazer",
  prioridades = [],
  usuarios = [],
  projetos = [],
  usuario = null,
}) {
  const [texto, setTexto] = useState("");
  const [cep, setCep] = useState("");
  const [cidade, setCidade] = useState("");
  const [idPrioridade, setIdPrioridade] = useState(2); // 2 = Média
  const [idUsuario, setIdUsuario] = useState("");
  const [idProjeto, setIdProjeto] = useState("");

  const [erros, setErros] = useState([]);
  const [salvando, setSalvando] = useState(false);

  // Executa apenas quando a abertura do modal ou a tarefa selecionada mudam
  useEffect(() => {
    if (!aberto) return;

    setErros([]);

    if (tarefa) {
      setTexto(tarefa.texto || tarefa.titulo || "");
      setCidade(tarefa.cidade || "");
      setCep("");
      setIdPrioridade(tarefa.prioridade_id || tarefa.idprioridade || 2);
      setIdUsuario(tarefa.usuario_id || usuario?.id || "");
      setIdProjeto(tarefa.projeto_id || "");
    } else {
      setTexto("");
      setCep("");
      setCidade("");
      setIdPrioridade(2);
      setIdUsuario(usuario?.id || usuarios[0]?.id || "");
      setIdProjeto(projetos[0]?.id || "");
    }
  }, [aberto, tarefa]);

  // Fechar com a tecla ESC
  useEffect(() => {
    function tratarKeyDown(event) {
      if (event.key === "Escape" && aberto) {
        onFechar();
      }
    }

    window.addEventListener("keydown", tratarKeyDown);
    return () => window.removeEventListener("keydown", tratarKeyDown);
  }, [aberto, onFechar]);

  async function procurarCidade(cepDigitado) {
    const cepLimpo = cepDigitado.replace(/\D/g, "");

    if (cepLimpo.length !== 8) {
      if (cepLimpo.length === 0) setCidade("");
      return;
    }

    try {
      const { data } = await axios.get(
        `https://viacep.com.br/ws/${cepLimpo}/json/`
      );
      if (!data.erro) {
        setCidade(`${data.localidade} - ${data.uf}`);
      } else {
        setCidade("CEP não encontrado");
      }
    } catch (e) {
      console.error("Erro ao buscar CEP:", e);
      setCidade("Erro ao buscar CEP");
    }
  }

  async function handleSalvar() {
    setErros([]);
    setSalvando(true);

    try {
      await onSalvar({
        ...tarefa,
        id: tarefa?.id,
        texto: texto.trim(),
        titulo: texto.trim(),
        cidade: cidade,
        coluna: tarefa?.coluna || coluna,
        prioridade_id: paraNumero(idPrioridade),
        usuario_id: paraNumero(idUsuario),
        projeto_id: paraNumero(idProjeto),
      });

      onFechar();
    } catch (e) {
      setErros(mensagensDeErro(e));
    } finally {
      setSalvando(false);
    }
  }

  if (!aberto) return null;

  return (
    <div className={styles.overlay} onClick={onFechar}>
      <div className={styles.card} onClick={(e) => e.stopPropagation()}>
        <h2>{tarefa ? "Editar tarefa" : "Nova tarefa"}</h2>

        <div className={styles.campo}>
          <label htmlFor="tarefa-texto">Tarefa</label>
          <input
            id="tarefa-texto"
            placeholder="Descreva a tarefa"
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
          />
        </div>

        <div className={styles.campo}>
          <label htmlFor="tarefa-cep">CEP (opcional)</label>
          <input
            id="tarefa-cep"
            placeholder="CEP (opcional)..."
            maxLength={9}
            value={cep}
            onChange={(e) => {
              setCep(e.target.value);
              procurarCidade(e.target.value);
            }}
          />
          {cidade && <p className={styles.cidade}>📍 {cidade}</p>}
        </div>

        <div className={styles.campo}>
          <label htmlFor="tarefa-responsavel">Responsável</label>
          <select
            id="tarefa-responsavel"
            value={idUsuario}
            onChange={(e) => setIdUsuario(e.target.value)}
          >
            <option value="">Selecione um responsável</option>
            {usuarios.map((u) => (
              <option key={u.id} value={u.id}>
                {u.nome}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.campo}>
          <label htmlFor="tarefa-projeto">Projeto</label>
          <select
            id="tarefa-projeto"
            value={idProjeto}
            onChange={(e) => setIdProjeto(e.target.value)}
          >
            <option value="">Selecione um projeto</option>
            {projetos.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nome}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.campo}>
          <label htmlFor="tarefa-prioridade">Prioridade</label>
          <select
            id="tarefa-prioridade"
            value={idPrioridade}
            onChange={(e) => setIdPrioridade(e.target.value)}
          >
            {prioridades.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nome || p.descricao}
              </option>
            ))}
          </select>
        </div>

        {erros.length > 0 && (
          <ul className={styles.erros}>
            {erros.map((mensagem, i) => (
              <li key={i}>{mensagem}</li>
            ))}
          </ul>
        )}

        <div className={styles.botoes}>
          <button type="button" onClick={onFechar}>
            Cancelar
          </button>
          <button type="button" onClick={handleSalvar} disabled={salvando}>
            {salvando ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ModalTarefa;