/* vite-src/components/RegistroAnalisisIAT.jsx */
import { useState } from 'react';
import { supabaseSeguridad, subirEvidenciaFoto } from '../lib/supabaseSeguridadClient';
import { dataIAT } from '../data/iatData';
const SECCIONES_DETALLE = [
  {
    titulo: 'Datos del Accidente',
    campos: [
      { label: 'Fecha del Accidente', keys: ['fecha_accidente', 'fecha'], tipo: 'fecha' },
      { label: 'Hora del Accidente', keys: ['hora_accidente'] },
    ]
  },
  {
    titulo: 'Datos del Personal',
    campos: [
      { label: 'Nombre Completo', keys: ['nombre_completo', 'empleado'] },
      { label: 'Fecha de Nacimiento', keys: ['fecha_nacimiento'], tipo: 'fecha' },
      { label: 'Número de DUI', keys: ['numero_dui'] },
      { label: 'Teléfono', keys: ['telefono'] },
      { label: 'Cargo que Desempeña', keys: ['cargo_desempena', 'cargo'] },
      { label: 'Antigüedad en la Empresa', keys: ['antiguedad_empresa'] },
      { label: 'Experiencia en el Cargo', keys: ['experiencia_cargo'] },
      { label: 'Jefe Inmediato del Área', keys: ['jefe_inmediato'] },
    ]
  },
  {
    titulo: 'Sitio del Accidente',
    campos: [
      { label: 'Lugar Exacto', keys: ['lugar_exacto'] },
      { label: 'Actividad que Desempeñaba', keys: ['actividad_desempenaba'] },
      { label: 'Horario de Trabajo', keys: ['horario_trabajo'] },
    ]
  },
  {
    titulo: 'Tipo de Lesión',
    campos: [
      { label: 'Materia, Equipo o Herramienta', keys: ['materia_equipo_herramienta'] },
      { label: 'Parte del Cuerpo Afectada', keys: ['parte_cuerpo_afectada'] },
      { label: 'Detalle de la Incapacidad', keys: ['detalle_incapacidad'] },
    ]
  },
  {
    titulo: 'Evidencias y Herramientas',
    campos: [
      { label: 'Evidencias Fotográficas', keys: ['evidencias_fotograficas', 'evidencias_fotos'] },
      { label: 'Herramientas de Trabajo', keys: ['herramientas_trabajo'] },
      { label: 'Sujeción', keys: ['sujecion', 'sujeccion'] },
    ]
  },
  {
    titulo: 'Relato de los Hechos',
    campos: [
      { label: 'Reconstrucción de los Hechos', keys: ['reconstruccion_hechos'] },
      { label: 'Versión del Accidentado', keys: ['version_accidentado'] },
    ]
  },
  {
    titulo: 'Testigos',
    campos: [
      { label: 'Nombre del Testigo', keys: ['nombre_testigo'] },
      { label: 'Versión del Testigo', keys: ['version_testigo'] },
    ]
  },
];

const SECCIONES_EDICION = [
  {
    titulo: 'Datos del Accidente',
    campos: [
      { key: 'fecha_accidente', label: 'Fecha del Accidente', tipo: 'date' },
      { key: 'hora_accidente', label: 'Hora del Accidente', tipo: 'time' },
    ]
  },
  {
    titulo: 'Datos del Personal',
    campos: [
      { key: 'nombre_completo', label: 'Nombre Completo' },
      { key: 'fecha_nacimiento', label: 'Fecha de Nacimiento', tipo: 'date' },
      { key: 'numero_dui', label: 'Número de DUI' },
      { key: 'telefono', label: 'Teléfono' },
      { key: 'cargo_desempena', label: 'Cargo que Desempeña' },
      { key: 'antiguedad_empresa', label: 'Antigüedad en la Empresa' },
      { key: 'experiencia_cargo', label: 'Experiencia en el Cargo' },
      { key: 'jefe_inmediato', label: 'Jefe Inmediato del Área' },
    ]
  },
  {
    titulo: 'Sitio del Accidente',
    campos: [
      { key: 'lugar_exacto', label: 'Lugar Exacto', tipo: 'full' },
      { key: 'actividad_desempenaba', label: 'Actividad que Desempeñaba', tipo: 'textarea-full' },
      { key: 'horario_trabajo', label: 'Horario de Trabajo', tipo: 'select', opciones: ['7am a 4pm','6am a 5pm','5pm a 6am'] },
    ]
  },
  {
    titulo: 'Tipo de Lesión',
    campos: [
      { key: 'materia_equipo_herramienta', label: 'Materia, Equipo o Herramienta', tipo: 'textarea-full' },
      { key: 'parte_cuerpo_afectada', label: 'Parte del Cuerpo Afectada', tipo: 'textarea-full' },
      { key: 'detalle_incapacidad', label: 'Detalle de la Incapacidad', tipo: 'textarea-full' },
    ]
  },
  {
    titulo: 'Evidencias y Herramientas',
    campos: [
      { key: 'herramientas_trabajo', label: 'Herramientas de Trabajo', tipo: 'textarea-full' },
      { key: 'sujecion', label: 'Sujeción', tipo: 'textarea-full' },
    ]
  },
  {
    titulo: 'Relato de los Hechos',
    campos: [
      { key: 'reconstruccion_hechos', label: 'Reconstrucción de los Hechos', tipo: 'textarea-full' },
      { key: 'version_accidentado', label: 'Versión del Accidentado', tipo: 'textarea-full' },
    ]
  },
  {
    titulo: 'Testigos',
    campos: [
      { key: 'nombre_testigo', label: 'Nombre del Testigo', tipo: 'full' },
      { key: 'version_testigo', label: 'Versión del Testigo', tipo: 'textarea-full' },
    ]
  },
];

const STATUS_COLORS = {
  'CONCLUIDA': 'badge-green',
  'EN PROCESO': 'badge-amber',
  'ATRASADA': 'badge-red',
  'INICIO FUTURO': 'badge-gray',
  'CANCELADA': 'badge-gray',
};

const COLUMNAS_PLAN = [
  { key: 'causa', label: 'Causa Raíz' },
  { key: 'que', label: 'Qué (Acción)' },
  { key: 'porQue', label: 'Por Qué' },
  { key: 'quien', label: 'Quién' },
  { key: 'como', label: 'Cómo' },
  { key: 'cuando', label: 'Cuándo', tipo: 'fecha' },
  { key: 'donde', label: 'Dónde' },
  { key: 'control', label: 'Control' },
  { key: 'status', label: 'Status' },
];

function obtenerValor(registro, keys) {
  for (const k of keys) {
    if (registro[k] !== undefined && registro[k] !== null && registro[k] !== '') return registro[k];
  }
  return null;
}

function formatearFecha(valor) {
  if (!valor) return null;
  try {
    return new Date(valor + 'T12:00:00').toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return valor;
  }
}

function DetalleIATModal({ registro, accidente, onClose }) {
  const selecciones = registro.selections || registro.seleccione || {};
  const planAccion = registro.plan_accion || [];

  return (
    <div
      style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, padding:20 }}
      onClick={onClose}
    >
      <div
        className="card"
        style={{ maxWidth:900, width:'100%', maxHeight:'90vh', overflowY:'auto' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="card-header" style={{ position:'sticky', top:0, background:'var(--card-bg)', zIndex:1 }}>
          <h2>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
              <polyline points="14 2 14 8 20 8"/>
            </svg>
            Detalle del Análisis IAT
          </h2>
          <button className="btn btn-ghost btn-sm" onClick={onClose} title="Cerrar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div style={{ padding:'16px 20px', display:'flex', flexDirection:'column', gap:18 }}>

          {/* Accidente vinculado */}
          {accidente ? (
            <div style={{ padding:'12px 16px', borderRadius:8, background:'#fef2f2', border:'1px solid #fca5a5', display:'flex', flexDirection:'column', gap:8 }}>
              <span style={{ fontSize:10.5, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', color:'#b91c1c' }}>Accidente Vinculado</span>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(180px,1fr))', gap:10 }}>
                {[
                  ['Empleado',  accidente.empleado_nombre],
                  ['Fecha',     accidente.fecha_accidente ? new Date(accidente.fecha_accidente+'T12:00:00').toLocaleDateString('es-ES',{day:'2-digit',month:'short',year:'numeric'}) : '—'],
                  ['Área',      accidente.area],
                  ['Gravedad',  accidente.gravedad],
                  ['Días Perd.',String(accidente.dias_perdidos ?? 0)],
                ].map(([lbl, val]) => (
                  <div key={lbl}>
                    <div style={{ fontSize:10.5, fontWeight:600, color:'#b91c1c', marginBottom:2 }}>{lbl}</div>
                    <div style={{ fontSize:13, color:'var(--tx-heading)', fontWeight:500 }}>{val || '—'}</div>
                  </div>
                ))}
              </div>
              {accidente.descripcion_lesion && (
                <div>
                  <div style={{ fontSize:10.5, fontWeight:600, color:'#b91c1c', marginBottom:2 }}>Descripción</div>
                  <div style={{ fontSize:12.5, color:'var(--tx-heading)', lineHeight:1.5 }}>{accidente.descripcion_lesion}</div>
                </div>
              )}
            </div>
          ) : (
            <div style={{ padding:'10px 14px', borderRadius:8, background:'#f8fafc', border:'1px solid #e2e8f0', fontSize:12.5, color:'var(--tx-muted)' }}>
              Sin accidente vinculado.
            </div>
          )}

          {SECCIONES_DETALLE.map((sec, i) => {
            const valores = sec.campos
              .map(c => ({ ...c, valor: obtenerValor(registro, c.keys) }))
              .filter(c => c.valor !== null);
            if (!valores.length) return null;
            return (
              <div key={i}>
                <h3 style={{ fontSize:12.5, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.07em', color:'var(--tx-muted)', marginBottom:8, paddingBottom:6, borderBottom:'1px solid var(--card-bd)' }}>
                  {sec.titulo}
                </h3>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(220px, 1fr))', gap:12 }}>
                  {valores.map((c, j) => (
                    <div key={j}>
                      <div style={{ fontSize:11, fontWeight:600, color:'var(--tx-muted)', marginBottom:2 }}>{c.label}</div>
                      {c.keys.includes('evidencias_fotograficas') && /^https?:\/\//.test(c.valor) ? (
                        <a href={c.valor} target="_blank" rel="noopener noreferrer">
                          <img src={c.valor} alt="Evidencia fotográfica" style={{ maxWidth:'100%', maxHeight:240, borderRadius:8, border:'1px solid var(--card-bd)', objectFit:'cover' }} />
                        </a>
                      ) : (
                        <div style={{ fontSize:13.5, color:'var(--tx-heading)', whiteSpace:'pre-wrap' }}>
                          {c.tipo === 'fecha' ? (formatearFecha(c.valor) || c.valor) : c.valor}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {['PP','TC','CI','CB'].some(k => Array.isArray(selecciones[k]) && selecciones[k].length) && (
            <div>
              <h3 style={{ fontSize:12.5, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.07em', color:'var(--tx-muted)', marginBottom:8, paddingBottom:6, borderBottom:'1px solid var(--card-bd)' }}>
                Causas y Factores Detectados
              </h3>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(220px, 1fr))', gap:12 }}>
                {['PP','TC','CI','CB'].map(k => (
                  Array.isArray(selecciones[k]) && selecciones[k].length > 0 && (
                    <div key={k}>
                      <div style={{ fontSize:11, fontWeight:600, color:'var(--tx-muted)', marginBottom:4 }}>{k}</div>
                      <ul style={{ margin:0, paddingLeft:18, fontSize:12.5, color:'var(--tx-heading)' }}>
                        {selecciones[k].map((txt, idx) => <li key={idx}>{txt}</li>)}
                      </ul>
                    </div>
                  )
                ))}
              </div>
            </div>
          )}

          {planAccion.length > 0 && (
            <div>
              <h3 style={{ fontSize:12.5, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.07em', color:'var(--tx-muted)', marginBottom:8, paddingBottom:6, borderBottom:'1px solid var(--card-bd)' }}>
                Plan de Acción
              </h3>
              <div style={{ overflowX:'auto' }}>
                <table className="tbl">
                  <thead>
                    <tr>
                      {COLUMNAS_PLAN.map(col => <th key={col.key}>{col.label}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {planAccion.map((fila, idx) => (
                      <tr key={idx}>
                        {COLUMNAS_PLAN.map(col => (
                          <td key={col.key} style={{ fontSize:12.5 }}>
                            {col.key === 'status'
                              ? <span className={`badge ${fila.status === 'CONCLUIDA' ? 'badge-green' : fila.status === 'ATRASADA' ? 'badge-red' : 'badge-amber'}`}>{fila.status}</span>
                              : col.tipo === 'fecha'
                                ? (formatearFecha(fila[col.key]) || '—')
                                : (fila[col.key] || '—')}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function EditarIATModal({ registro, onClose, onGuardado }) {
  const [formData, setFormData] = useState(() => {
    const init = {};
    SECCIONES_EDICION.forEach(sec => sec.campos.forEach(c => { init[c.key] = registro[c.key] ?? ''; }));
    return init;
  });
  const [seleccione, setSeleccione] = useState(() => registro.selections || registro.seleccione || { PP: [], TC: [], CI: [], CB: [] });
  const [planAccion, setPlanAccion] = useState(() => registro.plan_accion || []);
  const [fotoUrl, setFotoUrl] = useState(registro.evidencias_fotograficas || registro.evidencias_fotos || '');
  const [fotoArchivo, setFotoArchivo] = useState(null);
  const [fotoPreview, setFotoPreview] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheck = (categoria, valor) => {
    setSeleccione(prev => {
      const actuales = prev[categoria] || [];
      return actuales.includes(valor)
        ? { ...prev, [categoria]: actuales.filter(v => v !== valor) }
        : { ...prev, [categoria]: [...actuales, valor] };
    });
  };

  const renderCheckbox = (valor, categoria) => {
    const checked = seleccione[categoria]?.includes(valor) || false;
    const checkboxId = `edit-${categoria}-${valor}`.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_-]/g, '');
    return (
      <label key={valor} htmlFor={checkboxId} style={{ display:'flex', alignItems:'center', gap:6, fontSize:12.5, padding:'2px 0', cursor:'pointer' }}>
        <input type="checkbox" id={checkboxId} checked={checked} onChange={() => handleCheck(categoria, valor)} />
        {valor}
      </label>
    );
  };

  const agregarFila = () => setPlanAccion(prev => [...prev, { causa:'', que:'', porQue:'', quien:'', como:'', cuando:'', donde:'', control:'', status:'EN PROCESO' }]);
  const actualizarFila = (idx, campo, valor) => setPlanAccion(prev => { const n=[...prev]; n[idx] = { ...n[idx], [campo]: valor }; return n; });
  const eliminarFila = (idx) => setPlanAccion(prev => prev.filter((_, i) => i !== idx));

  const handleGuardar = async (e) => {
    e.preventDefault();
    setGuardando(true);
    setMensaje(null);

    let evidenciasUrl = fotoUrl;
    if (fotoArchivo) {
      try {
        evidenciasUrl = await subirEvidenciaFoto(fotoArchivo);
      } catch (err) {
        setMensaje({ tipo:'error', texto:'Error al subir la foto: ' + err.message });
        setGuardando(false);
        return;
      }
    }

    const cambios = { ...formData, evidencias_fotograficas: evidenciasUrl, selections: seleccione, plan_accion: planAccion };

    try {
      const { data, error } = await supabaseSeguridad.from('analisis_iat').update(cambios).eq('id', registro.id).select();
      if (error) {
        setMensaje({ tipo:'error', texto:'Error al guardar: ' + error.message });
        setGuardando(false);
        return;
      }
      onGuardado({ ...registro, ...cambios, ...(data?.[0] || {}) });
    } catch (err) {
      setMensaje({ tipo:'error', texto:'Error: ' + err.message });
      setGuardando(false);
    }
  };

  return (
    <div
      style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, padding:20 }}
      onClick={onClose}
    >
      <div
        className="card"
        style={{ maxWidth:920, width:'100%', maxHeight:'90vh', overflowY:'auto' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="card-header" style={{ position:'sticky', top:0, background:'var(--card-bg)', zIndex:1 }}>
          <h2>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            Editar Análisis IAT
          </h2>
          <button className="btn btn-ghost btn-sm" onClick={onClose} title="Cerrar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <form onSubmit={handleGuardar}>
          <div style={{ padding:'16px 20px', display:'flex', flexDirection:'column', gap:18 }}>
            {mensaje && <div className={`msg msg-${mensaje.tipo}`}>{mensaje.texto}</div>}

            {SECCIONES_EDICION.map((sec, i) => (
              <div key={i}>
                <h3 style={{ fontSize:12.5, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.07em', color:'var(--tx-muted)', marginBottom:8, paddingBottom:6, borderBottom:'1px solid var(--card-bd)' }}>
                  {sec.titulo}
                </h3>
                <div className="form-grid">
                  {sec.campos.map(c => (
                    <div key={c.key} className={`field ${c.tipo === 'full' || c.tipo === 'textarea-full' ? 'full' : ''}`}>
                      <label htmlFor={c.key}>{c.label}</label>
                      {c.tipo === 'select' ? (
                        <select id={c.key} name={c.key} value={formData[c.key]} onChange={handleChange}>
                          <option value="">Seleccionar</option>
                          {c.opciones.map(op => <option key={op} value={op}>de {op}</option>)}
                        </select>
                      ) : c.tipo === 'textarea-full' ? (
                        <textarea id={c.key} name={c.key} value={formData[c.key]} onChange={handleChange} rows={3} />
                      ) : (
                        <input
                          id={c.key}
                          name={c.key}
                          type={c.tipo === 'date' ? 'date' : c.tipo === 'time' ? 'time' : 'text'}
                          value={formData[c.key]}
                          onChange={handleChange}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <div>
              <h3 style={{ fontSize:12.5, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.07em', color:'var(--tx-muted)', marginBottom:8, paddingBottom:6, borderBottom:'1px solid var(--card-bd)' }}>
                Evidencia Fotográfica
              </h3>
              <div style={{ display:'flex', alignItems:'center', gap:16, flexWrap:'wrap' }}>
                {(fotoPreview || fotoUrl) && (
                  <img src={fotoPreview || fotoUrl} alt="Evidencia" style={{ maxWidth:200, maxHeight:160, borderRadius:8, border:'1px solid var(--card-bd)', objectFit:'cover' }} />
                )}
                <label className="btn btn-outline btn-sm" style={{ cursor:'pointer' }}>
                  {fotoUrl || fotoPreview ? 'Reemplazar foto' : 'Subir foto'}
                  <input type="file" accept="image/*" style={{ display:'none' }} onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      setFotoPreview(URL.createObjectURL(file));
                      setFotoArchivo(file);
                    }
                  }} />
                </label>
                {(fotoUrl || fotoPreview) && (
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => { setFotoUrl(''); setFotoPreview(null); setFotoArchivo(null); }}>
                    Quitar foto
                  </button>
                )}
              </div>
            </div>

            {['PP','TC','CI','CB'].some(k => Array.isArray(seleccione[k])) && (
              <div>
                <h3 style={{ fontSize:12.5, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.07em', color:'var(--tx-muted)', marginBottom:8, paddingBottom:6, borderBottom:'1px solid var(--card-bd)' }}>
                  Causas y Factores (PP / TC / CI / CB)
                </h3>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(220px, 1fr))', gap:16 }}>
                  <div>
                    <div style={{ fontWeight:700, fontSize:12, marginBottom:4 }}>PP - Potencial de Pérdida</div>
                    {dataIAT.PP.tipo.map(v => renderCheckbox(v, 'PP'))}
                    {dataIAT.PP.severidad.map(v => renderCheckbox(v, 'PP'))}
                    {dataIAT.PP.probabilidad.map(v => renderCheckbox(v, 'PP'))}
                    {dataIAT.PP.frecuencia.map(v => renderCheckbox(v, 'PP'))}
                  </div>
                  <div>
                    <div style={{ fontWeight:700, fontSize:12, marginBottom:4 }}>TC - Tipo de Contacto</div>
                    {dataIAT.TC.map(v => renderCheckbox(v, 'TC'))}
                  </div>
                  <div>
                    <div style={{ fontWeight:700, fontSize:12, marginBottom:4 }}>CI - Causas Inmediatas</div>
                    {dataIAT.CI.actosSubestandar.map(v => renderCheckbox(v, 'CI'))}
                    {dataIAT.CI.condicionesSubestandar.map(v => renderCheckbox(v, 'CI'))}
                  </div>
                  <div style={{ maxHeight:260, overflowY:'auto' }}>
                    <div style={{ fontWeight:700, fontSize:12, marginBottom:4 }}>CB - Causas Básicas</div>
                    {Object.values(dataIAT.CB.factoresPersonales).flat().map(v => renderCheckbox(v, 'CB'))}
                    {Object.values(dataIAT.CB.factoresTrabajo).flat().map(v => renderCheckbox(v, 'CB'))}
                  </div>
                </div>
              </div>
            )}

            <div>
              <h3 style={{ fontSize:12.5, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.07em', color:'var(--tx-muted)', marginBottom:8, paddingBottom:6, borderBottom:'1px solid var(--card-bd)' }}>
                Plan de Acción
              </h3>
              <button type="button" className="btn btn-outline btn-sm" onClick={agregarFila} style={{ marginBottom:10 }}>
                + Agregar Acción
              </button>
              <div style={{ overflowX:'auto' }}>
                <table className="tbl">
                  <thead>
                    <tr>
                      {COLUMNAS_PLAN.map(col => <th key={col.key}>{col.label}</th>)}
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {planAccion.map((fila, idx) => (
                      <tr key={idx}>
                        {COLUMNAS_PLAN.map(col => (
                          <td key={col.key}>
                            {col.key === 'status' ? (
                              <select value={fila.status} onChange={e => actualizarFila(idx, 'status', e.target.value)}>
                                {Object.keys(STATUS_COLORS).map(s => <option key={s} value={s}>{s}</option>)}
                              </select>
                            ) : col.tipo === 'fecha' ? (
                              <input type="date" value={fila[col.key] || ''} onChange={e => actualizarFila(idx, col.key, e.target.value)} />
                            ) : (
                              <textarea value={fila[col.key] || ''} onChange={e => actualizarFila(idx, col.key, e.target.value)} rows={1} />
                            )}
                          </td>
                        ))}
                        <td>
                          <button type="button" className="btn btn-ghost btn-sm" onClick={() => eliminarFila(idx)} title="Eliminar fila">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                    {planAccion.length === 0 && (
                      <tr><td colSpan={COLUMNAS_PLAN.length + 1} style={{ textAlign:'center', color:'var(--tx-muted)', padding:16 }}>Sin acciones registradas</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div style={{ padding:'0 20px 20px', display:'flex', justifyContent:'flex-end', gap:10 }}>
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={guardando}>
              {guardando ? 'Guardando…' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function RegistroIAT({ lista, listaAcc, onActualizar }) {
  const merged = lista || [];
  const [seleccionado, setSeleccionado] = useState(null);
  const [editando, setEditando] = useState(null);

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:14 }}>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12 }}>
        {[
          { label:'Total Análisis',   value: merged.length,                                         color:'var(--navy-800)' },
          { label:'Completados',      value: merged.filter(r=>r.estado==='Completado').length,       color:'var(--green)' },
          { label:'En Proceso',       value: merged.filter(r=>r.estado!=='Completado').length,       color:'var(--amber)' },
        ].map((k,i) => (
          <div key={i} className="card" style={{ padding:'18px 20px' }}>
            <div style={{ fontSize:10.5, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.09em', color:'var(--tx-muted)', marginBottom:8 }}>{k.label}</div>
            <div style={{ fontSize:36, fontWeight:900, color:k.color, lineHeight:1, letterSpacing:'-0.03em' }}>{k.value}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-header">
          <h2>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
              <polyline points="14 2 14 8 20 8"/>
              <circle cx="11" cy="14.5" r="2.5"/>
              <path d="m13 16.5 1.5 1.5"/>
            </svg>
            Registros de Análisis IAT
          </h2>
          <span style={{ fontSize:12, color:'var(--tx-muted)' }}>{merged.length} registros</span>
        </div>
        <div style={{ overflowX:'auto' }}>
          <table className="tbl">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Empleado</th>
                <th>Cargo</th>
                <th>Causa Identificada</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {merged.map((r,i) => {
                const fecha = r.fecha_accidente || r.fecha;
                const cargo = r.cargo_desempena || r.cargo;
                const causa = r.causa || r.causa_raiz_directa || (r.plan_accion && r.plan_accion[0]?.causa);
                return (
                <tr key={r.id || i}>
                  <td style={{ whiteSpace:'nowrap', fontSize:12.5 }}>
                    {fecha ? new Date(fecha+'T12:00:00').toLocaleDateString('es-ES',{day:'2-digit',month:'short',year:'numeric'}) : '—'}
                  </td>
                  <td style={{ fontWeight:600 }}>{r.empleado || r.nombre_completo || '—'}</td>
                  <td style={{ fontSize:12.5, color:'var(--tx-muted)' }}>{cargo || '—'}</td>
                  <td style={{ fontSize:12.5, maxWidth:260 }}>{causa || '—'}</td>
                  <td>
                    <span className={`badge ${r.estado === 'Completado' ? 'badge-green' : 'badge-amber'}`}>
                      {r.estado || 'En proceso'}
                    </span>
                  </td>
                  <td style={{ whiteSpace:'nowrap' }}>
                    <button className="btn btn-ghost btn-sm" title="Ver detalles" onClick={() => setSeleccionado(r)}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                    </button>
                    <button className="btn btn-ghost btn-sm" title="Editar registro" onClick={() => setEditando(r)}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                    </button>
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {seleccionado && <DetalleIATModal registro={seleccionado} accidente={(listaAcc||[]).find(a => a.id === seleccionado.accidente_id) || null} onClose={() => setSeleccionado(null)} />}

      {editando && (
        <EditarIATModal
          registro={editando}
          onClose={() => setEditando(null)}
          onGuardado={(actualizado) => {
            setEditando(null);
            if (onActualizar) onActualizar(actualizado);
          }}
        />
      )}
    </div>
  );
}

window.RegistroIAT        = RegistroIAT;

export default RegistroIAT;
