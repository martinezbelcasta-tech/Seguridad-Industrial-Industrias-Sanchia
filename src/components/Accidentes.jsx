import { useState, useEffect } from 'react';
import { supabaseSeguridad, subirEvidenciaFoto } from '../lib/supabaseSeguridadClient';

const AREAS_ACC = [
  'MANTENIMIENTO','MAQUINAS','SEMITERMINADO','RECICLADO Y PELETIZADO',
  'ENSAMBLE','MEZCLAS','BODEGA ELÉCTRICA','BODEGA DE INSUMOS',
  'BODEGA DE EMPAQUES','BODEGA CD','BODEGA MATERIA PRIMA',
  'CARPINTERÍA','OFICINAS ADMINISTRATIVAS','TRANSPORTE',
  'RECURSOS HUMANOS','ÁREA DE VIGILANCIA'
];

const FECHA_INICIO = new Date('2026-01-01T00:00:00');

function getDiasSin(accidentes) {
  const graves = accidentes.filter(a => a.gravedad === 'Grave' || a.gravedad === 'Muy Grave');
  if (!graves.length) return Math.floor((new Date() - FECHA_INICIO) / 86400000);
  const ultimo = [...graves].sort((a,b) => new Date(b.fecha_accidente) - new Date(a.fecha_accidente))[0];
  return Math.floor((new Date() - new Date(ultimo.fecha_accidente + 'T00:00:00')) / 86400000);
}

function Accidentes({ onGuardar }) {
  const [accidentes, setAccidentes] = useState([]);
  const [cargando, setCargando]     = useState(true);
  const [form, setForm]             = useState({
    fecha_accidente:'', empleado_nombre:'', area:'',
    descripcion_lesion:'', causa_raiz:'', dias_perdidos:'', gravedad:'Leve',
    correo_electronico:'', direccion_domicilio:'', numero_isss:''
  });
  const [fotoArchivo, setFotoArchivo] = useState(null);
  const [fotoPreview, setFotoPreview] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje]     = useState(null);
  const [showForm, setShowForm]   = useState(false);
  const [anioSel, setAnioSel]     = useState(new Date().getFullYear());

  useEffect(() => {
    supabaseSeguridad
      .from('accidentes')
      .select('*')
      .order('fecha_accidente', { ascending: false })
      .then(({ data, error }) => {
        setCargando(false);
        if (!error && data) setAccidentes(data);
      });
  }, []);

  const anioActual = new Date().getFullYear();

  const aniosDisponibles = [...new Set([
    anioActual,
    ...accidentes.map(a => new Date(a.fecha_accidente + 'T12:00:00').getFullYear()),
  ])].sort((a, b) => b - a);

  const dias    = getDiasSin(accidentes);
  const record  = Math.max(dias, 0);
  const total   = accidentes.length;
  const areaTop = accidentes.reduce((acc, a) => {
    acc[a.area] = (acc[a.area] || 0) + 1; return acc;
  }, {});
  const areaMas = Object.entries(areaTop).sort((a,b) => b[1]-a[1])[0]?.[0] || '—';

  const onChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const onSubmit = async e => {
    e.preventDefault();
    if (!form.fecha_accidente || !form.empleado_nombre || !form.area || !form.descripcion_lesion) {
      setMensaje({ tipo:'error', texto:'Completa todos los campos requeridos.' });
      return;
    }
    setGuardando(true);

    let foto_url = null;
    if (fotoArchivo) {
      try {
        foto_url = await subirEvidenciaFoto(fotoArchivo);
      } catch (err) {
        setMensaje({ tipo:'error', texto:'Error al subir la foto: ' + err.message });
        setGuardando(false);
        return;
      }
    }

    const payload = {
      fecha_accidente:     form.fecha_accidente,
      empleado_nombre:     form.empleado_nombre,
      area:                form.area,
      descripcion_lesion:  form.descripcion_lesion,
      causa_raiz:          form.causa_raiz || null,
      dias_perdidos:       parseInt(form.dias_perdidos) || 0,
      gravedad:            form.gravedad,
      correo_electronico:  form.correo_electronico || null,
      direccion_domicilio: form.direccion_domicilio || null,
      numero_isss:         form.numero_isss || null,
      foto_url,
    };

    const { data, error } = await supabaseSeguridad
      .from('accidentes').insert(payload).select().single();
    setGuardando(false);
    if (error) {
      setMensaje({ tipo:'error', texto:'Error al guardar: ' + error.message });
      return;
    }
    setAccidentes(p => [data, ...p]);
    if (onGuardar) onGuardar(data);
    setForm({ fecha_accidente:'', empleado_nombre:'', area:'', descripcion_lesion:'', causa_raiz:'', dias_perdidos:'', gravedad:'Leve', correo_electronico:'', direccion_domicilio:'', numero_isss:'' });
    setFotoArchivo(null);
    setFotoPreview(null);
    const esGrave = ['Grave','Muy Grave'].includes(form.gravedad);
    setMensaje({ tipo:'success', texto: esGrave ? 'Accidente registrado. Contador reiniciado a 0.' : 'Accidente leve registrado correctamente.' });
    setShowForm(false);
    setTimeout(() => setMensaje(null), 4500);
  };

  const diasColor = dias >= 30 ? '#16a34a' : dias < 5 ? '#dc2626' : '#d97706';

  // ── Monthly heatmap ──
  const MESES = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
  const mesActual = new Date().getMonth();

  const porMes = Array.from({ length: 12 }, () => ({ leves:0, graves:0, muyGraves:0, total:0 }));
  accidentes.forEach(a => {
    const d = new Date(a.fecha_accidente + 'T12:00:00');
    if (d.getFullYear() !== anioSel) return;
    const m = d.getMonth();
    porMes[m].total++;
    if (a.gravedad === 'Muy Grave')     porMes[m].muyGraves++;
    else if (a.gravedad === 'Grave')    porMes[m].graves++;
    else                                porMes[m].leves++;
  });

  const totalAnual  = porMes.reduce((s, m) => s + m.total, 0);
  const maxMes      = Math.max(...porMes.map(m => m.total), 1);
  const esPasado    = anioSel < anioActual;

  const cardColor = (cnt, isFuture) => {
    if (isFuture) return { bg:'#f8fafc', border:'#e2e8f0', num:'#cbd5e1', label:'#94a3b8' };
    if (cnt === 0) return { bg:'#f0fdf4', border:'#86efac', num:'#16a34a', label:'#15803d' };
    if (cnt <= 1)  return { bg:'#fffbeb', border:'#fde68a', num:'#d97706', label:'#b45309' };
    return { bg:'#fef2f2', border:'#fca5a5', num:'#dc2626', label:'#b91c1c' };
  };

  const iconForCount = cnt => {
    if (cnt === 0) return { sym:'✓', color:'#16a34a' };
    if (cnt === 1) return { sym:'⚠', color:'#d97706' };
    return { sym:'✕', color:'#dc2626' };
  };

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:14 }}>

      {/* ── Top bar ── */}
      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
        <button className="btn btn-primary" onClick={() => setShowForm(p => !p)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15">
            {showForm
              ? <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>
              : <><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>}
          </svg>
          {showForm ? 'Cancelar' : 'Nuevo Reporte'}
        </button>
        {mensaje && <div className={`msg msg-${mensaje.tipo}`}>{mensaje.texto}</div>}
      </div>

      {/* ── KPI Row ── */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12 }}>

        {/* Días sin accidente */}
        <div className="card" style={{ overflow:'hidden', position:'relative' }}>
          <div style={{ position:'absolute', inset:0, background:`linear-gradient(135deg, ${diasColor}18 0%, transparent 60%)`, pointerEvents:'none' }}/>
          <div style={{ padding:'20px 22px', display:'flex', flexDirection:'column', gap:4, position:'relative' }}>
            <div style={{ fontSize:11, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color: diasColor, marginBottom:6 }}>
              Días sin Accidente
            </div>
            <div style={{ fontSize:56, fontWeight:900, color: diasColor, lineHeight:1, letterSpacing:'-0.04em' }}>
              {cargando ? '…' : dias}
            </div>
            <div style={{ fontSize:12, color:'var(--tx-muted)', marginTop:4 }}>
              Récord del año: <strong style={{ color:diasColor }}>{record} días</strong>
            </div>
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

        {/* Área más afectada */}
        <div className="card">
          <div style={{ padding:'20px 22px' }}>
            <div style={{ fontSize:11, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--tx-muted)', marginBottom:10 }}>Área Más Afectada</div>
            <div style={{ fontSize:16, fontWeight:800, color:'var(--tx-heading)', lineHeight:1.3 }}>{areaMas}</div>
            <div style={{ marginTop:8, fontSize:12, color:'var(--tx-muted)' }}>
              {areaTop[areaMas] || '—'} incidente(s) registrado(s)
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
                <div className="field">
                  <label>Correo Electrónico</label>
                  <input type="email" name="correo_electronico" value={form.correo_electronico} onChange={onChange} placeholder="correo@ejemplo.com"/>
                </div>
                <div className="field">
                  <label>Número de ISSS</label>
                  <input type="text" name="numero_isss" value={form.numero_isss} onChange={onChange} placeholder="Ej. 123456789"/>
                </div>
                <div className="field full">
                  <label>Dirección del Domicilio</label>
                  <input type="text" name="direccion_domicilio" value={form.direccion_domicilio} onChange={onChange} placeholder="Dirección completa del empleado"/>
                </div>
                <div className="field full">
                  <label>Descripción de la Lesión *</label>
                  <textarea name="descripcion_lesion" value={form.descripcion_lesion} onChange={onChange} placeholder="Describe detalladamente la lesión o incidente…" required/>
                </div>
                <div className="field full">
                  <label>Causa Raíz</label>
                  <textarea name="causa_raiz" value={form.causa_raiz} onChange={onChange} placeholder="Causa raíz del incidente…" style={{ minHeight:60 }}/>
                </div>
                <div className="field full">
                  <label>Fotografía del Accidente</label>
                  <div style={{ display:'flex', alignItems:'center', gap:14, flexWrap:'wrap' }}>
                    {fotoPreview && (
                      <img src={fotoPreview} alt="Vista previa" style={{ maxWidth:160, maxHeight:120, borderRadius:8, border:'1px solid var(--card-bd)', objectFit:'cover' }}/>
                    )}
                    <label className="btn btn-outline btn-sm" style={{ cursor:'pointer' }}>
                      {fotoPreview ? 'Cambiar foto' : 'Subir foto'}
                      <input type="file" accept="image/*" style={{ display:'none' }} onChange={e => {
                        const f = e.target.files[0];
                        if (f) { setFotoArchivo(f); setFotoPreview(URL.createObjectURL(f)); }
                      }}/>
                    </label>
                    {fotoPreview && (
                      <button type="button" className="btn btn-ghost btn-sm" onClick={() => { setFotoArchivo(null); setFotoPreview(null); }}>
                        Quitar foto
                      </button>
                    )}
                  </div>
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

      {/* ── Gráfica por área ── */}
      <div className="card">
        <div className="card-header">
          <h2>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><path d="M3 3v18h18"/><rect x="7" y="10" width="3" height="8"/><rect x="13" y="6" width="3" height="12"/></svg>
            Accidentes por Área
          </h2>
          <span style={{ fontSize:12, color:'var(--tx-muted)' }}>{accidentes.length} registros</span>
        </div>
        <div style={{ padding:'16px 22px 20px' }}>
          {(() => {
            const porArea = {};
            accidentes.forEach(a => {
              const k = a.area || 'Sin área';
              if (!porArea[k]) porArea[k] = { total:0, muyGraves:0, graves:0, leves:0 };
              porArea[k].total++;
              if (a.gravedad === 'Muy Grave')   porArea[k].muyGraves++;
              else if (a.gravedad === 'Grave')  porArea[k].graves++;
              else                              porArea[k].leves++;
            });
            const filas = Object.entries(porArea).sort((a,b) => b[1].total - a[1].total);
            if (!filas.length) return <p style={{ color:'var(--tx-muted)', fontSize:13 }}>Sin accidentes registrados.</p>;
            const max = filas[0][1].total;
            return (
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                <div style={{ display:'flex', gap:16, marginBottom:4 }}>
                  {[['#7c2d12','Muy Graves'],['#dc2626','Graves'],['#f59e0b','Leves']].map(([color, label]) => (
                    <span key={label} style={{ display:'flex', alignItems:'center', gap:5, fontSize:11, color:'var(--tx-muted)' }}>
                      <span style={{ width:10, height:10, borderRadius:2, background:color, display:'inline-block' }}/> {label}
                    </span>
                  ))}
                </div>
                {filas.map(([area, cnt]) => {
                  const pct = n => (n / max) * 100;
                  return (
                    <div key={area} style={{ display:'flex', alignItems:'center', gap:10 }}>
                      <div style={{ width:180, fontSize:12, fontWeight:600, color:'var(--tx-heading)', textAlign:'right', flexShrink:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                        {area}
                      </div>
                      <div style={{ flex:1, height:22, background:'#f1f5f9', borderRadius:5, overflow:'hidden', display:'flex' }}>
                        {cnt.muyGraves > 0 && (
                          <div style={{ width:`${pct(cnt.muyGraves)}%`, background:'#7c2d12', transition:'width 0.4s', display:'flex', alignItems:'center', justifyContent:'center' }}>
                            <span style={{ fontSize:10, color:'#fff', fontWeight:700, padding:'0 4px' }}>{cnt.muyGraves}</span>
                          </div>
                        )}
                        {cnt.graves > 0 && (
                          <div style={{ width:`${pct(cnt.graves)}%`, background:'#dc2626', transition:'width 0.4s', display:'flex', alignItems:'center', justifyContent:'center' }}>
                            <span style={{ fontSize:10, color:'#fff', fontWeight:700, padding:'0 4px' }}>{cnt.graves}</span>
                          </div>
                        )}
                        {cnt.leves > 0 && (
                          <div style={{ width:`${pct(cnt.leves)}%`, background:'#f59e0b', transition:'width 0.4s', display:'flex', alignItems:'center', justifyContent:'center' }}>
                            <span style={{ fontSize:10, color:'#fff', fontWeight:700, padding:'0 4px' }}>{cnt.leves}</span>
                          </div>
                        )}
                      </div>
                      <div style={{ width:28, fontSize:13, fontWeight:800, color:'var(--tx-heading)', textAlign:'right', flexShrink:0 }}>
                        {cnt.total}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>
      </div>

      {/* ── Resumen Mensual ── */}
      <div className="card">
        <div className="card-header">
          <h2>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
              <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            Accidentes por Mes
          </h2>

          <div style={{ display:'flex', alignItems:'center', gap:14 }}>
            {/* Leyenda */}
            <div style={{ display:'flex', gap:12 }}>
              {[['#7c2d12','Muy Grave'],['#dc2626','Grave'],['#f59e0b','Leve']].map(([c,l]) => (
                <span key={l} style={{ display:'flex', alignItems:'center', gap:5, fontSize:11, color:'var(--tx-muted)' }}>
                  <span style={{ width:9, height:9, borderRadius:2, background:c, display:'inline-block' }}/>{l}
                </span>
              ))}
            </div>

            {/* Selector de año */}
            <div style={{ display:'flex', alignItems:'center', gap:6 }}>
              <button
                onClick={() => setAnioSel(p => p - 1)}
                style={{ width:26, height:26, border:'1px solid #e2e8f0', borderRadius:6, background:'#fff', cursor:'pointer', display:'grid', placeItems:'center', color:'#64748b' }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="13" height="13"><polyline points="15 18 9 12 15 6"/></svg>
              </button>
              <span style={{ fontSize:13, fontWeight:800, color:'var(--tx-heading)', minWidth:40, textAlign:'center' }}>
                {anioSel}
              </span>
              <button
                onClick={() => setAnioSel(p => Math.min(p + 1, anioActual))}
                disabled={anioSel >= anioActual}
                style={{ width:26, height:26, border:'1px solid #e2e8f0', borderRadius:6, background:'#fff', cursor: anioSel >= anioActual ? 'not-allowed' : 'pointer', display:'grid', placeItems:'center', color: anioSel >= anioActual ? '#cbd5e1' : '#64748b', opacity: anioSel >= anioActual ? 0.5 : 1 }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="13" height="13"><polyline points="9 18 15 12 9 6"/></svg>
              </button>
            </div>
          </div>
        </div>

        <div style={{ padding:'16px 20px 20px' }}>
          {/* Badge año histórico */}
          {esPasado && (
            <div style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'4px 12px', borderRadius:999, background:'#eff6ff', border:'1px solid #bfdbfe', fontSize:11, fontWeight:700, color:'#1d4ed8', marginBottom:14 }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12"><path d="M12 8v4l3 3"/><circle cx="12" cy="12" r="10"/></svg>
              Historial {anioSel} — archivo guardado
            </div>
          )}

          {/* Grid 4x3 */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:10 }}>
            {MESES.map((mes, i) => {
              const isFuture = !esPasado && i > mesActual;
              const data = porMes[i];
              const col  = cardColor(data.total, isFuture);
              const icon = isFuture ? null : iconForCount(data.total);
              const barW = n => `${(n / maxMes) * 100}%`;

              return (
                <div key={i}
                  style={{
                    background: col.bg,
                    border: `1.5px solid ${col.border}`,
                    borderRadius: 10,
                    padding: '12px 14px',
                    transition: 'transform 0.15s, box-shadow 0.15s',
                    cursor: 'default',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 6px 20px rgba(0,0,0,0.09)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow=''; }}
                >
                  {/* Mes + icono */}
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6 }}>
                    <span style={{ fontSize:11, fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', color: col.label }}>
                      {mes}
                    </span>
                    {icon && <span style={{ fontSize:13, fontWeight:800, color: icon.color }}>{icon.sym}</span>}
                  </div>

                  {/* Número */}
                  <div style={{ fontSize: isFuture ? 28 : 34, fontWeight:900, color: col.num, lineHeight:1, letterSpacing:'-0.03em', marginBottom: isFuture ? 0 : 8 }}>
                    {isFuture ? '—' : data.total}
                  </div>

                  {/* Mini barras */}
                  {!isFuture && (
                    <div style={{ display:'flex', flexDirection:'column', gap:3 }}>
                      {[['#7c2d12', data.muyGraves, 'MG'], ['#dc2626', data.graves, 'G'], ['#f59e0b', data.leves, 'L']].map(([clr, cnt, lbl]) => (
                        <div key={lbl} style={{ display:'flex', alignItems:'center', gap:5 }}>
                          <span style={{ fontSize:9, fontWeight:700, color: clr, width:14, flexShrink:0 }}>{lbl}</span>
                          <div style={{ flex:1, height:4, background:'rgba(0,0,0,0.07)', borderRadius:2, overflow:'hidden' }}>
                            <div style={{ width: barW(cnt), height:'100%', background: clr, borderRadius:2, transition:'width 0.5s ease' }}/>
                          </div>
                          <span style={{ fontSize:10, fontWeight:700, color: clr, width:14, textAlign:'right', flexShrink:0 }}>{cnt}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Barra total anual */}
          <div style={{
            marginTop:14,
            background:'linear-gradient(135deg, #112447 0%, #1b3a6b 100%)',
            borderRadius:10,
            padding:'14px 20px',
            display:'flex',
            alignItems:'center',
            justifyContent:'space-between',
            flexWrap:'wrap',
            gap:10,
          }}>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" width="18" height="18">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <span style={{ fontSize:13, fontWeight:700, color:'rgba(255,255,255,0.85)', letterSpacing:'0.06em', textTransform:'uppercase' }}>
                Total Acumulado {anioSel}
              </span>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:24 }}>
              {[
                ['#fca5a5', 'Leves',      porMes.reduce((s,m) => s + m.leves, 0)],
                ['#f87171', 'Graves',     porMes.reduce((s,m) => s + m.graves, 0)],
                ['#fcd34d', 'Muy Graves', porMes.reduce((s,m) => s + m.muyGraves, 0)],
              ].map(([clr, label, val]) => (
                <div key={label} style={{ textAlign:'center' }}>
                  <div style={{ fontSize:20, fontWeight:900, color: clr, lineHeight:1 }}>{val}</div>
                  <div style={{ fontSize:10, color:'rgba(255,255,255,0.55)', marginTop:2, fontWeight:600 }}>{label}</div>
                </div>
              ))}
              <div style={{ width:1, height:36, background:'rgba(255,255,255,0.15)' }}/>
              <div style={{ textAlign:'center' }}>
                <div style={{ fontSize:28, fontWeight:900, color:'#fff', lineHeight:1 }}>{totalAnual}</div>
                <div style={{ fontSize:10, color:'rgba(255,255,255,0.6)', marginTop:2, fontWeight:600, letterSpacing:'0.05em' }}>TOTAL</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Accidentes;
