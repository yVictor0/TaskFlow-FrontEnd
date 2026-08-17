import { useEffect } from 'react';
import styles from './ModalConfirmacao.module.css';

function ModalConfirmacao({ aberto, titulo, mensagem, onConfirmar, onCancelar }) {
      useEffect(() => {
    function tratarTeclaKeyDown(event) {
      if (event.key === 'Escape' && aberto) {
        onCancelar();
      }
    }
    window.addEventListener('keydown', tratarTeclaKeyDown);
    return () => {
      window.removeEventListener('keydown', tratarTeclaKeyDown);
    };
  }, [aberto, onCancelar]);

  if (!aberto) return null;

  return (
    <div className={styles.overlay} onClick={onCancelar}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <h3>{titulo || 'Confirmar Ação'}</h3>
        <p>{mensagem || 'Tem certeza que deseja prosseguir?'}</p>

        <div className={styles.acoes}>
          <button className={styles.btnCancelar} onClick={onCancelar}>
            Cancelar
          </button>
          <button className={styles.btnDeletar} onClick={onConfirmar}>
            Sim, Deletar
          </button>
        </div>
      </div>
    </div>
  );
}

export default ModalConfirmacao;