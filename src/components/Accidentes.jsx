/* vite-src/components/Accidentes.jsx — convertido para Vite */
import { useState } from 'react';

/* Accidentes.jsx — Registro de Accidentes */

const AREAS_ACC = [
  'MANTENIMIENTO','MAQUINAS','SEMITERMINADO','RECICLADO Y PELETIZADO',
  'ENSAMBLE','MEZCLAS','BODEGA ELÉCTRICA','BODEGA DE INSUMOS',
  'BODEGA DE EMPAQUES','BODEGA CD','BODEGA MATERIA PRIMA',
  'CARPINTERÍA','OFICINAS ADMINISTRATIVAS','TRANSPORTE',
  'RECURSOS HUMANOS','ÁREA DE VIGILANCIA'
];

const MOCK_ACCIDENTES = [
  { id:1, fecha_accidente:'2026-05-28', empleado_nombre:'Carlos Méndez', area:'MAQUINAS', descripcion_lesion:'Corte superficial en mano derecha al manipular rebaba', causa_raiz:'No uso de guantes de protección', dias_perdidos:1, gravedad:'Leve' },
  { id:2, fecha_accidente:'2026-05-20', empleado_nombre:'Luis Peralta', area:'ENSAMBLE', descripcion_lesion:'Golpe en rodilla por caída de tarima', causa_raiz:'Tarima mal estibada, área desordenada', dias_perdidos:3, gravedad:'Grave' },
  { id:3, fecha_accidente:'2026-05-14', empleado_nombre:'Roberto Castro', area:'MANTENIMIENTO', descripcion_lesion:'Irritación ocular por salpicadura de aceite', causa_raiz:'No uso de gafas de seguridad', dias_perdidos:0, gravedad:'Leve' },
];

const FECHA_INICIO = new Date('2026-05-14T00:00:00');

function getDiasSin(accidentes) {
  const graves = accidentes.filter(a => a.gravedad === 'Grave' || a.gravedad === 'Muy Grave');
  if (!graves.length) {
    return Math.floor((new Date() - FECHA_INICIO) / 86400000);
  }
  const ultimo = graves.sort((a,b) => new Date(b.fecha_accidente) - new Date(a.fecha_accidente))[0];
  return Math.floor((new Date() - new Date(ultimo.fecha_accidente + 'T00:00:00')) / 86400000);
}

function formatFecha(d) {
  if (!d) return '—';
  return new Date(d + 'T12:00:00').toLocaleDateString('es-ES', { day:'2-digit', month:'short', year:'numeric' });
}

function Accidentes() {
  const [accidentes, setAccidentes] = useState(MOCK_ACCIDENTES);
  const [form, setForm] = useState({
    fecha_accidente:'', empleado_nombre:'', area:'',
    descripcion_lesion:'', causa_raiz:'', dias_perdidos:'', gravedad:'Leve'
  });
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje]     = useState(null);
  const [showForm, setShowForm]   = useState(false);

  const dias    = getDiasSin(accidentes);
  const record  = Math.max(dias, 26);
  const total   = accidentes.length;
  const areaTop = accidentes.reduce((acc, a) => {
    acc[a.area] = (acc[a.area]||0) + 1; return acc;
  }, {});
  const areaMas = Object.entries(areaTop).sort((a,b)=>b[1]-a[1])[0]?.[0]?.replace('_',' ') || '—';

  const onChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const onSubmit = async e => {
    e.preventDefault();
    if (!form.fecha_accidente || !form.empleado_nombre || !form.area || !form.descripcion_lesion) {
      setMensaje({ tipo:'error', texto:'Completa todos los campos requeridos.' }); return;
    }
    setGuardando(true);
    await new Promise(r => setTimeout(r, 800));
    const nuevo = { ...form, id: Date.now(), dias_perdidos: parseInt(form.dias_perdidos)||0 };
    setAccidentes(p => [nuevo, ...p]);
    setForm({ fecha_accidente:'', empleado_nombre:'', area:'', descripcion_lesion:'', causa_raiz:'', dias_perdidos:'', gravedad:'Leve' });
    const esGrave = ['Grave','Muy Grave'].includes(form.gravedad);
    setMensaje({ tipo:'success', texto: esGrave ? 'Accidente registrado. Contador reiniciado.' : 'Accidente leve registrado correctamente.' });
    setGuardando(false);
    setShowForm(false);
    setTimeout(() => setMensaje(null), 4500);
  };

  const diasColor = dias >= 30 ? '#16a34a' : dias < 5 ? '#dc2626' : '#d97706';

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:14 }}>

      {/* ── Top bar ── */}
      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
        <button className="btn btn-primary" onClick={() => setShowForm(p => !p)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15">
            {showForm ? <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>
              : <><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>}
          </svg>
          {showForm ? 'Cancelar' : 'Nuevo Reporte'}
        </button>
        {mensaje && <div className={`msg msg-${mensaje.tipo}`}>{mensaje.texto}</div>}
      </div>

      {/* ── KPI Row ── */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12 }}>
        {/* Días sin accidentes */}
        <div className="card" style={{ gridRow:'span 1', overflow:'hidden', position:'relative' }}>
          <div style={{ position:'absolute', inset:0, background:`linear-gradient(135deg, ${diasColor}18 0%, transparent 60%)`, pointerEvents:'none' }}/>
          <div style={{ padding:'20px 22px', display:'flex', flexDirection:'column', gap:4, position:'relative' }}>
            <div style={{ fontSize:11, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color: diasColor, marginBottom:6 }}>
              Días sin Accidentes Graves
            </div>
            <div style={{ fontSize:56, fontWeight:900, color: diasColor, lineHeight:1, letterSpacing:'-0.04em' }}>{dias}</div>
            <div style={{ fontSize:12, color:'var(--tx-muted)', marginTop:4 }}>Récord del año: <strong style={{ color:diasColor }}>{record} días</strong></div>
          </div>
        </div>

        {/* Total accidentes */}
        <div className="card">
          <div style={{ padding:'20px 22px' }}>
            <div style={{ fontSize:11, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--tx-muted)', marginBottom:10 }}>Total Accidentes</div>
            <div style={{ fontSize:44, fontWeight:900, color:'var(--tx-heading)', lineHeight:1, letterSpacing:'-0.03em' }}>{total}</div>
            <div style={{ marginTop:10, display:'flex', flexDirection:'column', gap:4 }}>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, color:'var(--tx-muted)' }}>
                <span>Graves</span>
                <span style={{ fontWeight:700, color:'#dc2626' }}>{accidentes.filter(a => a.gravedad==='Grave'||a.gravedad==='Muy Grave').length}</span>
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, color:'var(--tx-muted)' }}>
                <span>Leves</span>
                <span style={{ fontWeight:700, color:'#d97706' }}>{accidentes.filter(a => a.gravedad==='Leve').length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Área más incidentes */}
        <div className="card">
          <div style={{ padding:'20px 22px' }}>
            <div style={{ fontSize:11, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--tx-muted)', marginBottom:10 }}>Área Más Afectada</div>
            <div style={{ fontSize:16, fontWeight:800, color:'var(--tx-heading)', lineHeight:1.3 }}>{areaMas}</div>
            <div style={{ marginTop:8, fontSize:12, color:'var(--tx-muted)' }}>
              {areaTop[areaMas.replace(' ','_')] || areaTop[areaMas] || '—'} incidente(s) registrado(s)
            </div>
          </div>
        </div>
      </div>

      {/* ── Form ── */}
      {showForm && (
        <div className="card">
          <div className="card-header">
            <h2>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>
              Nuevo Reporte de Accidente
            </h2>
          </div>
          <div className="card-body">
            <form onSubmit={onSubmit}>
              <div className="form-grid">
                <div className="field">
                  <label>Fecha del Accidente *</label>
                  <input type="date" name="fecha_accidente" value={form.fecha_accidente} onChange={onChange} required/>
                </div>
                <div className="field">
                  <label>Nombre del Empleado *</label>
                  <input type="text" name="empleado_nombre" value={form.empleado_nombre} onChange={onChange} placeholder="Nombre completo" required/>
                </div>
                <div className="field">
                  <label>Área *</label>
                  <select name="area" value={form.area} onChange={onChange} required>
                    <option value="">Seleccionar área</option>
                    {AREAS_ACC.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
                <div className="field">
                  <label>Gravedad *</label>
                  <select name="gravedad" value={form.gravedad} onChange={onChange} required>
                    <option value="Leve">Leve</option>
                    <option value="Grave">Grave</option>
                    <option value="Muy Grave">Muy Grave</option>
                  </select>
                </div>
                <div className="field">
                  <label>Días Perdidos</label>
                  <input type="number" name="dias_perdidos" value={form.dias_perdidos} onChange={onChange} placeholder="0" min="0"/>
                </div>
                <div className="field full">
                  <label>Descripción de la Lesión *</label>
                  <textarea name="descripcion_lesion" value={form.descripcion_lesion} onChange={onChange} placeholder="Describe detalladamente la lesión o incidente…" required/>
                </div>
                <div className="field full">
                  <label>Causa Raíz</label>
                  <textarea name="causa_raiz" value={form.causa_raiz} onChange={onChange} placeholder="Causa raíz del incidente…" style={{ minHeight:60 }}/>
                </div>
              </div>
              <div style={{ marginTop:20 }}>
                <button type="submit" className="btn btn-primary btn-lg" disabled={guardando}>
                  {guardando ? 'Guardando…' : 'Guardar Reporte'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Historial ── */}
      <div className="card">
        <div className="card-header">
          <h2>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/></svg>
            Historial de Accidentes
          </h2>
          <span style={{ fontSize:12, color:'var(--tx-muted)' }}>{accidentes.length} registros</span>
        </div>
        <div style={{ overflowX:'auto' }}>
          <table className="tbl">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Empleado</th>
                <th>Área</th>
                <th>Descripción</th>
                <th>Gravedad</th>
                <th style={{ textAlign:'center' }}>Días</th>
              </tr>
            </thead>
            <tbody>
              {accidentes.map(a => (
                <tr key={a.id}>
                  <td style={{ whiteSpace:'nowrap', fontSize:12.5 }}>{formatFecha(a.fecha_accidente)}</td>
                  <td style={{ fontWeight:600 }}>{a.empleado_nombre}</td>
                  <td style={{ fontSize:12, color:'var(--tx-muted)' }}>{a.area?.replace('_',' ')}</td>
                  <td style={{ maxWidth:280, fontSize:13 }}>{a.descripcion_lesion}</td>
                  <td>
                    <span className={`badge ${a.gravedad==='Leve' ? 'badge-amber' : 'badge-red'}`}>
                      {a.gravedad || 'Leve'}
                    </span>
                  </td>
                  <td style={{ textAlign:'center', fontWeight:700, color: a.dias_perdidos > 0 ? 'var(--red)' : 'var(--tx-muted)' }}>
                    {a.dias_perdidos || 0}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Accidentes;
