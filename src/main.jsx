import './index.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* Envolvemos toda la app con el contexto de autenticación */}
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>,
);
