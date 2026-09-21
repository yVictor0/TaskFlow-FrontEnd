import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router'; 
import styles from './sidebar.module.css';
import { useAuth } from '../../../contexts/AuthContext';

function Sidebar() {
  const [estaAberta, setEstaAberta] = useState(true);
  const { logado, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  const getLinkClass = ({ isActive }) => 
    isActive ? `${styles.link} ${styles.ativo}` : styles.link;

  return (
    <>
      <button 
        className={styles.btnToggle} 
        onClick={() => setEstaAberta((prev) => !prev)}
        aria-label="Alternar Menu"
        aria-expanded={estaAberta}
      >
        {estaAberta ? '✕' : '☰'}
      </button>
      {estaAberta && (
        <div 
          className={styles.overlay} 
          onClick={() => setEstaAberta(false)} 
          aria-hidden="true"
        />
      )}

      <aside 
        className={`${styles.sidebar} ${estaAberta ? styles.aberta : styles.fechada}`} 
        aria-label="Menu Lateral"
      >
        <div className={styles.logo}>
          <h1>TaskFlow</h1>
        </div>

        <nav className={styles.nav}>
          {!logado ? (
            <NavLink to="/login" className={getLinkClass}>
              Login
            </NavLink>
          ) : (
            <NavLink to="/taskflow" className={getLinkClass}>
              TaskFlow
            </NavLink>
          )}

          <NavLink to="/sobre" className={getLinkClass}>
            Sobre
          </NavLink>
        </nav>

        {logado && (
          <div className={styles.sidebarUsuario}>
            <button 
              type="button" 
              onClick={handleLogout}
              className={styles.btnLogout}
            >
              Sair
            </button>
          </div>
        )}
      </aside>
    </>
  );
}

export default Sidebar;