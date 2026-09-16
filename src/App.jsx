import { Route, Routes, Navigate } from "react-router-dom";

import Rotaprivada from "./components/TaskFlow/Rotaprivada/Rotaprivada";
import Login from "./pages/Login/Login";
import Taskflow from "./pages/TaskFlow/TaskFlow";
import Sobre from "./pages/Sobre/Sobre";
import Sidebar from "./components/TaskFlow/Sidebar/Sidebar";
import { useAuth } from "./contexts/AuthContext";

function App() {
  const { token } = useAuth();

  return (
    <div className="app-layout">
      {/* Exibe a Sidebar apenas quando o usuário possui token */}
      {token && <Sidebar />}

      <main style={{ marginLeft: token ? '220px' : '0', transition: 'margin-left 0.3s' }}>
        <Routes>
          {/* Redireciona a raiz '/' para '/taskflow' caso esteja autenticado, ou '/login' */}
          <Route 
            path="/" 
            element={<Navigate to={token ? "/taskflow" : "/login"} replace />} 
          />

          <Route
            path="/taskflow"
            element={
              <Rotaprivada>
                <Taskflow />
              </Rotaprivada>
            }
          />
          
          <Route path="/login" element={<Login />} />
          <Route path="/sobre" element={<Sobre />} />
        </Routes>   
      </main>
    </div>
  );
}

export default App;