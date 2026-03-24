// src/App.jsx
//
// SETUP — se ainda não instalou o react-router-dom, rode:
//   npm install react-router-dom
//
// Este arquivo assume que você já tem:
//   - src/pages/LandingPage.jsx   (o arquivo entregue)
//   - src/pages/LoginPage.jsx     (já existente no projeto)
//   - src/pages/RegisterPage.jsx  (já existente no projeto)
//   - src/pages/Dashboard.jsx     (ou a página principal após login)
//
// Adapte os imports abaixo conforme os nomes reais dos seus arquivos.

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LandingPage  from "./pages/LandingPage";
import LoginPage    from "./pages/LoginPage";      // ajuste o caminho se necessário
import RegisterPage from "./pages/RegisterPage";   // ajuste o caminho se necessário
import Dashboard    from "./pages/Dashboard";      // ajuste o caminho se necessário

// ─────────────────────────────────────────────
// Guarda de rota: redireciona para /login se
// não houver token salvo no localStorage.
// Adapte a lógica caso você use Context/Redux.
// ─────────────────────────────────────────────
function PrivateRoute({ children }) {
  const token = localStorage.getItem("token"); // ou o nome que você usa
  return token ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Landing page — rota raiz, pública */}
        <Route path="/" element={<LandingPage />} />

        {/* Autenticação — públicas */}
        <Route path="/login"    element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Área logada — protegida */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />

        {/* Qualquer rota desconhecida → landing */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  );
}
