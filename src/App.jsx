import { Route, Routes, Navigate } from "react-router-dom";

import Rotaprivada from "./components/TaskFlow/Rotaprivada/Rotaprivada";
import Login from "./pages/Login/Login";
import Kanban from "./pages/TaskFlow/TaskFlow";
import Sobre from "./pages/Sobre";
import Sidebar from "./components/TaskFlow/Sidebar/Sidebar";
import { useAuth } from "./contexts/AuthContext"; 


function App() {
  const { token } = useAuth();
  return (
    <div className="app-layout">
      {token && <Sidebar />}
      marginLeft: token ? '220px' : '0'
      <main>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />

          <Route
            path="/taskflow"
            element={
              <Rotaprivada>
                <Kanban />
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