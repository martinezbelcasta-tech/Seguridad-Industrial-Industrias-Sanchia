import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { supabaseSeguridad } from './lib/supabaseSeguridadClient';
import Dashboard from './components/Dashboard';
import Accidentes from './components/Accidentes';
import AnalisisAccidentes from './components/AnalisisAccidentes';
import RegistroAccidentes from './components/RegistroAccidentes';
import RegistroAnalisisIAT from './components/RegistroAnalisisIAT';
import Login from './components/Login';
import './App.css';

const NAV_ITEMS = [
  { id: 'dashboard',          label: 'Inspecciones',    icon: 'clipboard' },
  { id: 'accidentes',         label: 'Accidentes',      icon: 'shield' },
  { id: 'analisis',           label: 'Análisis IAT',    icon: 'chart' },
  { id: 'registroAccidentes', label: 'Reg. Accidentes', icon: 'file-plus' },
  { id: 'registroAnalisisIAT',label: 'Registros IAT',   icon: 'file-search' },
];

const PAGE_TITLES = {
  dashboard:           'Inspecciones de Planta',
  accidentes:          'Registro de Accidentes',
  analisis:            'Análisis de Accidentes (IAT)',
  registroAccidentes:  'Historial de Accidentes',
  registroAnalisisIAT: 'Registros de Análisis IAT',
};

const ICONS = {
  clipboard:    <><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="m9 12 2 2 4-4"/></>,
  shield:       <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></>,
  chart:        <><path d="M3 3v18h18"/><path d="m7 16 4-4 4 4 4-4"/></>,
  'file-plus':  <><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></>,
  'file-search':<><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><circle cx="11" cy="14.5" r="2.5"/><path d="m13 16.5 1.5 1.5"/></>,
};

function App() {
  const [session, setSession]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [view, setView]         = useState('dashboard');
  const [listaAcc, setListaAcc] = useState([]);
  const [listaIAT, setListaIAT] = useState([]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) return;
    supabaseSeguridad.from('analisis_iat').select('*').order('fecha_registro', { ascending: false })
      .then(({ data, error }) => {
        if (!error && data) setListaIAT(data);
      });
    supabaseSeguridad.from('accidentes').select('*').order('fecha_accidente', { ascending: false })
      .then(({ data, error }) => {
        if (!error && data) setListaAcc(data);
      });
  }, [session]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
  };

  if (loading) return (
    <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', background:'var(--navy-900)', gap:16 }}>
      <div style={{ width:40, height:40, border:'3px solid rgba(255,255,255,0.1)', borderTopColor:'var(--gold)', borderRadius:'50%', animation:'spin 0.9s linear infinite' }}></div>
      <p style={{ fontFamily:'Inter', fontSize:12, letterSpacing:'0.12em', textTransform:'uppercase', color:'rgba(255,255,255,0.4)' }}>Cargando…</p>
    </div>
  );

  if (!session) return <Login onLoginSuccess={setSession} />;

  const userEmail = session?.user?.email || '';

  return (
    <div style={{ display:'flex', minHeight:'100vh' }}>
      {/* ── SIDEBAR ── */}
      <aside style={{ background:'var(--sb-bg)', display:'flex', flexDirection:'column', position:'fixed', width:'var(--sb-width)', height:'100vh', top:0, left:0, zIndex:100, borderRight:'1px solid rgba(255,255,255,0.04)' }}>
        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', gap:11, padding:'0 16px', height:56, flexShrink:0, borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ width:38, height:38, borderRadius:9, background:'#fff', display:'grid', placeItems:'center', flexShrink:0, overflow:'hidden', boxShadow:'0 2px 8px rgba(0,0,0,0.3)', position:'relative' }}>
            <img src="/logo.png" alt="Logo" style={{ width:30, height:30, objectFit:'contain', position:'relative', zIndex:1 }} />
            <span style={{ position:'absolute', top:'-50%', left:'-75%', width:'50%', height:'200%', background:'linear-gradient(120deg,transparent,rgba(255,255,255,0.75),transparent)', transform:'skewX(-15deg)', animation:'logoShine 2s ease-in-out infinite', pointerEvents:'none', zIndex:2 }}/>
          </div>
          <div className="sb-brand-text">
            <div style={{ fontSize:13, fontWeight:800, color:'#fff', letterSpacing:'-0.01em', whiteSpace:'nowrap' }}>Ind. Sanchia</div>
            <div style={{ fontSize:9, fontWeight:600, letterSpacing:'0.16em', textTransform:'uppercase', color:'var(--gold)', marginTop:1 }}>Seg. Industrial</div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex:1, padding:'12px 8px', display:'flex', flexDirection:'column', gap:2, overflowY:'auto' }}>
          <div className="sb-label" style={{ fontSize:9.5, fontWeight:700, letterSpacing:'0.14em', color:'var(--sb-muted)', padding:'8px 10px 6px', textTransform:'uppercase' }}>MENÚ</div>
          {NAV_ITEMS.map(item => {
            const active = view === item.id;
            return (
              <button key={item.id} onClick={() => setView(item.id)}
                style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 12px', background: active ? 'var(--sb-active)' : 'transparent', border:'none', borderRadius:8, color: active ? '#fff' : 'var(--sb-text)', cursor:'pointer', width:'100%', textAlign:'left', transition:'background 0.12s', position:'relative', fontFamily:'Inter' }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.background='var(--sb-hover)'; }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.background='transparent'; }}>
                {active && <span style={{ position:'absolute', left:0, top:8, bottom:8, width:3, borderRadius:'0 3px 3px 0', background:'var(--gold)' }}/>}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="17" height="17" style={{ flexShrink:0 }}>{ICONS[item.icon]}</svg>
                <span className="sb-label" style={{ fontSize:13, fontWeight: active ? 600 : 500, whiteSpace:'nowrap' }}>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div style={{ padding:'12px 12px 14px', borderTop:'1px solid rgba(255,255,255,0.06)', flexShrink:0 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
            <div style={{ width:32, height:32, borderRadius:'50%', background:'linear-gradient(135deg,var(--navy-700) 0%,var(--gold-dark) 100%)', display:'grid', placeItems:'center', fontSize:13, fontWeight:700, color:'#fff', flexShrink:0 }}>
              {userEmail.charAt(0).toUpperCase()}
            </div>
            <div className="sb-user-info" style={{ minWidth:0 }}>
              <div style={{ fontSize:12, fontWeight:600, color:'rgba(255,255,255,0.85)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:140 }}>{userEmail}</div>
              <div style={{ fontSize:10, color:'var(--sb-muted)', marginTop:1 }}>Administrador</div>
            </div>
          </div>
          <button onClick={handleLogout}
            style={{ display:'flex', alignItems:'center', gap:8, width:'100%', padding:'8px 11px', background:'rgba(220,38,38,0.10)', border:'1px solid rgba(220,38,38,0.18)', borderRadius:7, cursor:'pointer', color:'#f87171', fontSize:12.5, fontWeight:600, fontFamily:'Inter', transition:'background 0.12s' }}
            onMouseEnter={e => e.currentTarget.style.background='rgba(220,38,38,0.20)'}
            onMouseLeave={e => e.currentTarget.style.background='rgba(220,38,38,0.10)'}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="15" height="15"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            <span className="sb-logout-label">Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* ── RIGHT COLUMN ── */}
      <div style={{ marginLeft:'var(--sb-width)', flex:1, display:'flex', flexDirection:'column', minWidth:0 }}>
        {/* Topbar */}
        <header style={{ position:'sticky', top:0, height:56, zIndex:90, background:'#fff', borderBottom:'1px solid var(--card-bd)', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 24px', boxShadow:'0 1px 0 var(--card-bd)', flexShrink:0 }}>
          <h1 style={{ fontSize:17, fontWeight:800, color:'var(--tx-heading)', letterSpacing:'-0.02em' }}>
            {PAGE_TITLES[view]}
          </h1>
          <div style={{ display:'flex', alignItems:'center', gap:8, padding:'5px 12px', background:'var(--page-bg)', border:'1px solid var(--card-bd)', borderRadius:999 }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15" style={{ color:'var(--tx-muted)' }}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            <span style={{ fontSize:13, color:'var(--tx-muted)', fontWeight:500, maxWidth:200, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{userEmail}</span>
          </div>
        </header>

        {/* Main */}
        <main style={{ flex:1, background:'var(--page-bg)', padding:'22px 24px 48px' }}>
          {view === 'dashboard'           && <Dashboard />}
          {view === 'accidentes'          && <Accidentes onGuardar={a => setListaAcc(p=>[...p,a])} />}
          {view === 'analisis'            && <AnalisisAccidentes accidentes={listaAcc} onGuardarAnalisis={a => setListaIAT(p=>[a,...p])} />}
          {view === 'registroAccidentes'  && <RegistroAccidentes lista={listaAcc} listaIAT={listaIAT} onActualizar={a => setListaAcc(p => p.map(r => r.id === a.id ? a : r))} />}
          {view === 'registroAnalisisIAT' && <RegistroAnalisisIAT lista={listaIAT} listaAcc={listaAcc} onActualizar={a => setListaIAT(p => p.map(r => r.id === a.id ? a : r))} />}
        </main>
      </div>
    </div>
  );
}

export default App;
