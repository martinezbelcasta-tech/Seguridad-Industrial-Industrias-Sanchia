import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

function EyeOpen() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="17" height="17"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z"/><circle cx="12" cy="12" r="3"/></svg>;
}
function EyeClosed() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="17" height="17"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61M2 2l20 20"/></svg>;
}

export default function Login({ onLoginSuccess }) {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd]   = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('sanchia_email');
    if (saved) setEmail(saved);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Por favor completa todos los campos.'); return; }
    setLoading(true);
    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) {
        setError('Credenciales incorrectas. Verifica tu correo y contraseña.');
      } else {
        if (remember) localStorage.setItem('sanchia_email', email);
        else localStorage.removeItem('sanchia_email');
        if (onLoginSuccess) onLoginSuccess(data.session);
      }
    } catch (err) {
      setError('Error de conexión. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display:'grid', gridTemplateColumns:'1.15fr 0.85fr', minHeight:'100vh', fontFamily:"'Inter',sans-serif" }}>
      {/* ── PANEL IZQUIERDO ── */}
      <div style={{ background:'var(--navy-900)', display:'flex', flexDirection:'column', padding:'48px 52px', position:'relative', overflow:'hidden', gap:0 }}>
        <div style={{ position:'absolute', inset:0, backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='52' viewBox='0 0 60 52'%3E%3Cpolygon points='30,2 58,17 58,47 30,62 2,47 2,17' fill='none' stroke='rgba(200,168,75,0.07)' stroke-width='1'/%3E%3C/svg%3E")`, backgroundSize:'60px 52px', pointerEvents:'none' }}/>
        <div style={{ position:'absolute', top:-140, right:-140, width:440, height:440, borderRadius:'50%', background:'radial-gradient(circle,rgba(200,168,75,0.10) 0%,transparent 70%)', pointerEvents:'none' }}/>
        <div style={{ position:'absolute', bottom:-100, left:-100, width:360, height:360, borderRadius:'50%', background:'radial-gradient(circle,rgba(27,58,107,0.5) 0%,transparent 70%)', pointerEvents:'none' }}/>
        <div style={{ position:'absolute', top:0, right:0, width:3, height:'100%', background:'linear-gradient(180deg,transparent 0%,rgba(200,168,75,0.5) 30%,rgba(200,168,75,0.5) 70%,transparent 100%)' }}/>

        {/* Brand */}
        <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:40, position:'relative', zIndex:1 }}>
          <div style={{ width:56, height:56, borderRadius:13, background:'white', display:'grid', placeItems:'center', flexShrink:0, overflow:'hidden', boxShadow:'0 4px 16px rgba(0,0,0,0.25)', position:'relative' }}>
            <img src="/logo.png" alt="Logo" style={{ width:40, height:40, objectFit:'contain', position:'relative', zIndex:1 }} />
            <span style={{ position:'absolute', top:'-50%', left:'-75%', width:'50%', height:'200%', background:'linear-gradient(120deg,transparent,rgba(255,255,255,0.75),transparent)', transform:'skewX(-15deg)', animation:'logoShine 2s ease-in-out infinite', zIndex:2 }}/>
          </div>
          <div>
            <div style={{ fontSize:16, fontWeight:800, color:'#fff', letterSpacing:'-0.01em' }}>Industrias Sanchia</div>
            <div style={{ fontSize:10, fontWeight:600, letterSpacing:'0.18em', textTransform:'uppercase', color:'var(--gold)', marginTop:2 }}>Seguridad Industrial</div>
          </div>
        </div>

        <div style={{ flex:1, display:'flex', flexDirection:'column', justifyContent:'center', gap:32, position:'relative', zIndex:1 }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'6px 14px', border:'1px solid rgba(200,168,75,0.25)', borderRadius:999, fontSize:11.5, fontWeight:600, color:'var(--gold)', background:'rgba(200,168,75,0.08)', alignSelf:'flex-start' }}>
            <span style={{ display:'inline-block', width:7, height:7, borderRadius:'50%', background:'var(--gold)', animation:'pulse-dot 1.5s ease-in-out infinite' }}/>
            Sistema en línea
          </div>
          <div>
            <h2 style={{ fontSize:34, fontWeight:900, color:'#fff', lineHeight:1.2, letterSpacing:'-0.02em', marginBottom:14 }}>
              Gestión de<br /><span style={{ color:'var(--gold)' }}>Seguridad</span><br />Industrial
            </h2>
            <p style={{ fontSize:14, color:'rgba(255,255,255,0.55)', lineHeight:1.65, maxWidth:340 }}>
              Registra, supervisa y analiza incidentes y el cumplimiento de seguridad en toda la planta.
            </p>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {[
              { label:'Inspecciones de Planta', sub:'Control por área y semana' },
              { label:'Registro de Accidentes', sub:'Contador de días sin incidentes' },
              { label:'Análisis IAT',            sub:'Investigación de accidentes' },
            ].map((m, i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:13, padding:'11px 14px', borderRadius:10, background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.07)' }}>
                <div style={{ width:36, height:36, borderRadius:8, flexShrink:0, background:'rgba(200,168,75,0.15)', border:'1px solid rgba(200,168,75,0.2)', display:'grid', placeItems:'center', color:'var(--gold)' }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="18" height="18">
                    {i===0 && <><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></>}
                    {i===1 && <><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></>}
                    {i===2 && <><path d="M3 3v18h18"/><path d="m7 16 4-4 4 4 4-4"/></>}
                  </svg>
                </div>
                <div>
                  <div style={{ fontSize:13, fontWeight:600, color:'#fff' }}>{m.label}</div>
                  <div style={{ fontSize:11, color:'rgba(255,255,255,0.5)', marginTop:1 }}>{m.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', position:'relative', zIndex:1 }}>
          <span style={{ fontSize:11, color:'rgba(255,255,255,0.35)' }}>© 2026 · Industrias Sanchia</span>
          <span style={{ fontSize:11, color:'rgba(200,168,75,0.6)', fontWeight:600 }}>v1.0</span>
        </div>
      </div>

      {/* ── PANEL DERECHO ── */}
      <div style={{ background:'#f0f4fb', display:'flex', alignItems:'center', justifyContent:'center', padding:40 }}>
        <div style={{ background:'#fff', borderRadius:16, padding:'38px 36px', width:'100%', maxWidth:420, boxShadow:'0 4px 32px rgba(13,30,53,0.12)', border:'1px solid #e2e8f0' }}>
          <div style={{ marginBottom:28 }}>
            <div style={{ fontSize:11, fontWeight:700, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--gold)', marginBottom:8 }}>Acceso al sistema</div>
            <h3 style={{ fontSize:24, fontWeight:800, color:'var(--tx-heading)', letterSpacing:'-0.02em', marginBottom:8 }}>Iniciar Sesión</h3>
            <p style={{ fontSize:13.5, color:'var(--tx-muted)', lineHeight:1.55 }}>Ingresa tus credenciales para acceder al sistema de seguridad industrial.</p>
          </div>

          {error && (
            <div className="msg msg-error" style={{ marginBottom:16, display:'flex', gap:8, alignItems:'flex-start' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15" style={{ flex:'none', marginTop:1 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:16 }}>
            <div className="field">
              <label htmlFor="l-email">Correo electrónico</label>
              <div style={{ position:'relative' }}>
                <input id="l-email" type="email" placeholder="correo@sanchia.com" value={email} onChange={e=>setEmail(e.target.value)} autoComplete="email" required style={{ paddingLeft:38 }}/>
                <svg viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.8" width="15" height="15" style={{ position:'absolute', left:11, top:'50%', transform:'translateY(-50%)', pointerEvents:'none' }}><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 7 10 8 10-8"/></svg>
              </div>
            </div>
            <div className="field">
              <label htmlFor="l-pwd">Contraseña</label>
              <div style={{ position:'relative' }}>
                <input id="l-pwd" type={showPwd?'text':'password'} placeholder="••••••••" value={password} onChange={e=>setPassword(e.target.value)} autoComplete="current-password" required style={{ paddingLeft:38, paddingRight:40 }}/>
                <svg viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.8" width="15" height="15" style={{ position:'absolute', left:11, top:'50%', transform:'translateY(-50%)', pointerEvents:'none' }}><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                <button type="button" onClick={()=>setShowPwd(!showPwd)} style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'#9ca3af', display:'flex' }}>
                  {showPwd ? <EyeOpen/> : <EyeClosed/>}
                </button>
              </div>
            </div>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <label style={{ display:'flex', alignItems:'center', gap:7, cursor:'pointer', fontSize:13 }}>
                <input type="checkbox" checked={remember} onChange={e=>setRemember(e.target.checked)} style={{ accentColor:'var(--navy-700)' }}/>
                Recordarme
              </label>
              <a href="#" style={{ fontSize:13, color:'var(--navy-700)', fontWeight:500, textDecoration:'none' }}>¿Olvidaste tu contraseña?</a>
            </div>
            <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ width:'100%', justifyContent:'center', marginTop:4 }}>
              {loading ? <>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16" style={{ animation:'spin 0.8s linear infinite' }}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                Verificando...
              </> : <>Iniciar Sesión <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><path d="M5 12h14M12 5l7 7-7 7"/></svg></>}
            </button>
          </form>
          <div style={{ marginTop:24, textAlign:'center', fontSize:12, color:'var(--tx-light)' }}>
            Sistema protegido · <span style={{ color:'var(--tx-muted)', fontWeight:500 }}>Industrias Sanchia</span>
          </div>
        </div>
      </div>
    </div>
  );
}
