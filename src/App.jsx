import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import Dashboard from './components/Dashboard';
import Accidentes from './components/Accidentes';
import AnalisisAccidentes from './components/AnalisisAccidentes';
import RegistroAccidentes from './components/RegistroAccidentes';
import RegistroAnalisisIAT from './components/RegistroAnalisisIAT';
import Login from './components/Login';
import './App.css';

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [vistaActual, setVistaActual] = useState('dashboard');

  const [listaAccidentes, setListaAccidentes] = useState([]);
  const [listaAnalisisIAT, setListaAnalisisIAT] = useState([]);

  const guardarAccidente = (nuevoAccidente) => setListaAccidentes(prev => [...prev, nuevoAccidente]);
  const guardarAnalisis = (nuevoAnalisis) => setListaAnalisisIAT(prev => [...prev, nuevoAnalisis]);
  const actualizarAnalisis = (analisisActualizado) => {
    setListaAnalisisIAT(prev => prev.map(item =>
      item.fechaRegistro === analisisActualizado.fechaRegistro ? analisisActualizado : item
    ));
  };

  const titulos = {
    dashboard: 'Inspecciones de Planta',
    accidentes: 'Registro de Accidentes',
    analisis: 'Analisis de Accidentes (IAT)',
    registroAccidentes: 'Registro de Accidentes',
    registroAnalisisIAT: 'Registros de Analisis IAT'
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLoginSuccess = (session) => {
    setSession(session);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Cargando...</p>
      </div>
    );
  }

  if (!session) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo">
            <svg width="28" height="28" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 2L4 10V20C4 30 11.5 38 20 40C28.5 38 36 30 36 20V10L20 2Z" fill="#e74c3c"/>
              <path d="M20 8L10 13V20C10 26 15 30 20 32C25 30 30 26 30 20V13L20 8Z" fill="#fff"/>
            </svg>
          </div>
          <h2>Seguridad</h2>
        </div>

        <nav className="sidebar-nav">
          <button
            className={`nav-item ${vistaActual === 'dashboard' ? 'active' : ''}`}
            onClick={() => setVistaActual('dashboard')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7"></rect>
              <rect x="14" y="3" width="7" height="7"></rect>
              <rect x="14" y="14" width="7" height="7"></rect>
              <rect x="3" y="14" width="7" height="7"></rect>
            </svg>
            <span>Inspecciones</span>
          </button>

          <button
            className={`nav-item ${vistaActual === 'accidentes' ? 'active' : ''}`}
            onClick={() => setVistaActual('accidentes')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2L2 22H22L12 2Z"></path>
              <line x1="12" y1="9" x2="12" y2="13"></line>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
            <span>Accidentes</span>
          </button>

          <button
            className={`nav-item ${vistaActual === 'analisis' ? 'active' : ''}`}
            onClick={() => setVistaActual('analisis')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
            <span>Analisis IAT</span>
          </button>

          <button
            className={`nav-item ${vistaActual === 'registroAccidentes' ? 'active' : ''}`}
            onClick={() => setVistaActual('registroAccidentes')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="3" y1="9" x2="21" y2="9"></line>
              <line x1="3" y1="15" x2="21" y2="15"></line>
              <line x1="9" y1="3" x2="9" y2="21"></line>
              <line x1="15" y1="3" x2="15" y2="21"></line>
            </svg>
            <span>Registro Accidentes</span>
          </button>

          <button
            className={`nav-item ${vistaActual === 'registroAnalisisIAT' ? 'active' : ''}`}
            onClick={() => setVistaActual('registroAnalisisIAT')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
            <span>Registros IAT</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <p>Industrias Sanchia</p>
          <p className="version">v1.0</p>
          <button className="btn-logout" onClick={handleLogout}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            <span>Cerrar Sesion</span>
          </button>
        </div>
      </aside>

      <header className="topnavbar">
        <div className="navbar-title">{titulos[vistaActual]}</div>
        <div className="navbar-user">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
          <span>{session?.user?.email}</span>
        </div>
      </header>

      <main className="main-content">
        {vistaActual === 'dashboard' && <Dashboard />}
        {vistaActual === 'accidentes' && <Accidentes onGuardar={guardarAccidente} />}
        {vistaActual === 'analisis' && <AnalisisAccidentes onGuardarAnalisis={guardarAnalisis} />}
        {vistaActual === 'registroAccidentes' && <RegistroAccidentes lista={listaAccidentes} />}
        {vistaActual === 'registroAnalisisIAT' && <RegistroAnalisisIAT lista={listaAnalisisIAT} onActualizar={actualizarAnalisis} />}
      </main>
    </div>
  );
}

export default App;