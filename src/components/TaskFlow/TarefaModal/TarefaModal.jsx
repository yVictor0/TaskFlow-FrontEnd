import { useState, useEffect } from 'react';
import styles from './Tarefamoldal.module.css';
import axios from 'axios';

function ModalTarefa({ aberto, tarefa, coluna, onSalvar, onFechar }) {
  const [texto, setTexto] = useState('');
  const [cep, setCep] = useState('');
  const [cidade, setCidade] = useState('');
  const [prioridade, setPrioridade] = useState('Média 🟡');

  useEffect(() => {
    if (aberto) {
      if (tarefa) {
        setTexto(tarefa.texto || '');
        setCidade(tarefa.cidade || '');
        setPrioridade(tarefa.prioridade || 'Média 🟡');
        setCep('');
      } else {
        setTexto('');
        setCep('');
        setCidade('');
        setPrioridade('Média 🟡');
      }
    }
  }, [aberto, tarefa]);

  useEffect(() => {
    function tratarKeyDown(event) {
      if (event.key === 'Escape' && aberto) {
        onFechar();
      }
    }

    window.addEventListener('keydown', tratarKeyDown);

    return () => {
      window.removeEventListener('keydown', tratarKeyDown);
    };
  }, [aberto, onFechar]);

  async function procurarCidade(cepDigitado) {
    const cepLimpo = cepDigitado.replace(/\D/g, '');
    
    if (cepLimpo.length !== 8) {
      if (cepLimpo.length === 0) setCidade('');
      return;
    }

    try {
      const { data } = await axios.get(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      if (!data.erro) {
        setCidade(`${data.localidade} - ${data.uf}`);
      } else {
        setCidade('CEP não encontrado');
      }
    } catch (e) {
      console.error('Erro ao buscar CEP:', e);
      setCidade('Erro ao buscar CEP');
    }
  }

  function handleSalvar() {
    if (texto.trim() === '') return;

    const dadosAtualizados = {
      ...tarefa,
      id: tarefa?.id || Date.now(), 
      texto: texto.trim(),
      cidade: cidade,
      prioridade: prioridade,
      concluida: tarefa?.concluida || false,
      coluna: tarefa?.coluna || coluna || 'afazer',
    };

    onSalvar(dadosAtualizados);
    onFechar();
  }

  if (!aberto) return null;

  return (
    <div className={styles.overlay} onClick={onFechar}>
      <div className={styles.card} onClick={(e) => e.stopPropagation()}>
        <h2>{tarefa ? 'Editar tarefa' : 'Nova tarefa'}</h2>
        
        <input
          placeholder="Texto da tarefa..."
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
        />
        
        <input
          placeholder="CEP (opcional)..."
          maxLength={9}
          value={cep}
          onChange={(e) => {
            setCep(e.target.value);
            procurarCidade(e.target.value);
          }}
        />
        
        {cidade && <p className={styles.cidade}>📍 {cidade}</p>}
        
        <select value={prioridade} onChange={(e) => setPrioridade(e.target.value)}>
          <option value="Alta 🔴">Alta 🔴</option>
          <option value="Média 🟡">Média 🟡</option>
          <option value="Baixa 🟢">Baixa 🟢</option>
        </select>

        <div className={styles.botoes}>
          <button type="button" onClick={onFechar}>Cancelar</button>
          <button type="button" onClick={handleSalvar}>Salvar</button>
        </div>
      </div>
    </div>
  );
}

export default ModalTarefa;