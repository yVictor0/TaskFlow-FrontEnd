import { Route, Routes } from "react-router-dom";

import Rotaprivada from "./components/TaskFlow/Rotaprivada/Rotaprivada";
import Login from "./pages/Login/Login";
import Kanban from "./pages/TaskFlow/TaskFlow";
import Sobre from "./pages/Sobre";
import Sidebar from "./components/TaskFlow/Sidebar/Sidebar";

function App() {
  return (
      <div className="app-layout">
        <Sidebar />
        <main>
          <Routes>
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