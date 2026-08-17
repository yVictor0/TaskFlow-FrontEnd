import { NavLink, useNavigate } from 'react-router-dom';
import styles from './sidebar.module.css';
import { useAuth } from '../../../contexts/AuthContext';

function Sidebar() {
  const { logado, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getLinkClass = ({ isActive }) => 
    isActive ? `${styles.link} ${styles.ativo}` : styles.link;

  return (
    <aside className={styles.sidebar} aria-label="Menu Lateral">
      <div className={styles.logo}>
        <h1>MeuApp</h1>
      </div>

      <nav className={styles.nav}>
        {!logado && (
          <NavLink to="/login" className={getLinkClass}>
            Login
          </NavLink>
        )}

        {logado && (
          <NavLink to="/taskflow" className={getLinkClass}>
            TaskFlow
          </NavLink>
        )}

        <NavLink to="/sobre" className={getLinkClass}>
          Sobre
        </NavLink>
      </nav>

      {logado && (
        <button 
          type="button" 
          onClick={handleLogout}
          className={styles.btnLogout}
        >
          Sair
        </button>
      )}
    </aside>
  );
}

export default Sidebar;