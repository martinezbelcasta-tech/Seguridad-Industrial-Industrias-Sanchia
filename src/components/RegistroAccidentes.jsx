import { useState } from 'react';
import { supabaseSeguridad, subirEvidenciaFoto } from '../lib/supabaseSeguridadClient';

const AREAS_ACC = [
  'MANTENIMIENTO','MAQUINAS','SEMITERMINADO','RECICLADO Y PELETIZADO',
  'ENSAMBLE','MEZCLAS','BODEGA ELÉCTRICA','BODEGA DE INSUMOS',
  'BODEGA DE EMPAQUES','BODEGA CD','BODEGA MATERIA PRIMA',
  'CARPINTERÍA','OFICINAS ADMINISTRATIVAS','TRANSPORTE',
  'RECURSOS HUMANOS','ÁREA DE VIGILANCIA'
];

const EMPTY_FORM = {
  fecha_accidente:'', empleado_nombre:'', area:'', descripcion_lesion:'',
  causa_raiz:'', dias_perdidos:'', gravedad:'Leve',
  correo_electronico:'', direccion_domicilio:'', numero_isss:'', foto_url:''
};

function RegistroAccidentes({ lista, listaIAT, onActualizar }) {
  const merged = lista || [];
  const iatPorAccidente = (listaIAT || []).reduce((acc, r) => {
    if (r.accidente_id) acc[r.accidente_id] = (acc[r.accidente_id] || []).concat(r);
    return acc;
  }, {});
  const [verItem, setVerItem]     = useState(null);
  const [editItem, setEditItem]   = useState(null);
  const [form, setForm]           = useState(EMPTY_FORM);
  const [fotoArchivo, setFotoArchivo] = useState(null);
  const [fotoPreview, setFotoPreview] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje]     = useState(null);

  const openEdit = acc => {
    setEditItem(acc);
    setForm({
      fecha_accidente:     acc.fecha_accidente    || '',
      empleado_nombre:     acc.empleado_nombre    || '',
      area:                acc.area               || '',
      descripcion_lesion:  acc.descripcion_lesion || '',
      causa_raiz:          acc.causa_raiz         || '',
      dias_perdidos:       acc.dias_perdidos ?? '',
      gravedad:            acc.gravedad           || 'Leve',
      correo_electronico:  acc.correo_electronico || '',
      direccion_domicilio: acc.direccion_domicilio|| '',
      numero_isss:         acc.numero_isss        || '',
      foto_url:            acc.foto_url           || '',
    });
    setFotoArchivo(null);
    setFotoPreview(acc.foto_url || null);
    setMensaje(null);
  };

  const closeEdit = () => { setEditItem(null); setFotoArchivo(null); setFotoPreview(null); };

  const onChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const onSave = async e => {
    e.preventDefault();
    if (!form.fecha_accidente || !form.empleado_nombre || !form.area || !form.descripcion_lesion) {
      setMensaje({ tipo:'error', texto:'Completa todos los campos requeridos.' });
      return;
    }
    setGuardando(true);

    let foto_url = form.foto_url || null;
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
      .from('accidentes').update(payload).eq('id', editItem.id).select().single();
    setGuardando(false);
    if (error) {
      setMensaje({ tipo:'error', texto:'Error al guardar: ' + error.message });
      return;
    }
    if (onActualizar) onActualizar(data);
    closeEdit();
  };

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:14 }}>

      {/* KPIs */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12 }}>
        {[
          { label:'Total Registros',    value: merged.length,                                                         color:'var(--navy-800)' },
          { label:'Accidentes Graves',  value: merged.filter(a=>a.gravedad==='Grave'||a.gravedad==='Muy Grave').length, color:'var(--red)' },
          { label:'Días Perdidos Tot.', value: merged.reduce((s,a)=>s+(parseInt(a.dias_perdidos)||0),0),              color:'var(--amber)' },
        ].map((k,i) => (
          <div key={i} className="card" style={{ padding:'18px 20px' }}>
            <div style={{ fontSize:10.5, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.09em', color:'var(--tx-muted)', marginBottom:8 }}>{k.label}</div>
            <div style={{ fontSize:36, fontWeight:900, color:k.color, lineHeight:1, letterSpacing:'-0.03em' }}>{k.value}</div>
          </div>
        ))}
      </div>

      {/* Tabla */}
      <div className="card">
        <div className="card-header">
          <h2>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
              <polyline points="14 2 14 8 20 8"/>
            </svg>
            Historial Completo de Accidentes
          </h2>
          <span style={{ fontSize:12, color:'var(--tx-muted)' }}>{merged.length} registros</span>
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
                <th style={{ textAlign:'center' }}>Días Perd.</th>
                <th>Análisis IAT</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {merged.map((a,i) => (
                <tr key={a.id || i}>
                  <td style={{ whiteSpace:'nowrap', fontSize:12.5 }}>
                    {a.fecha_accidente ? new Date(a.fecha_accidente+'T12:00:00').toLocaleDateString('es-ES',{day:'2-digit',month:'short',year:'numeric'}) : '—'}
                  </td>
                  <td style={{ fontWeight:600 }}>{a.empleado_nombre || '—'}</td>
                  <td style={{ fontSize:12, color:'var(--tx-muted)' }}>{(a.area||'').replace('_',' ')}</td>
                  <td style={{ fontSize:12.5, maxWidth:280 }}>{a.descripcion_lesion || '—'}</td>
                  <td>
                    <span className={`badge ${(a.gravedad==='Grave'||a.gravedad==='Muy Grave') ? 'badge-red' : 'badge-amber'}`}>
                      {a.gravedad || 'Leve'}
                    </span>
                  </td>
                  <td style={{ textAlign:'center', fontWeight:700, color:(parseInt(a.dias_perdidos)||0)>0 ? 'var(--red)' : 'var(--tx-muted)' }}>
                    {a.dias_perdidos || 0}
                  </td>
                  <td style={{ textAlign:'center' }}>
                    {iatPorAccidente[a.id]
                      ? <span className="badge badge-green" title={`${iatPorAccidente[a.id].length} análisis vinculado(s)`}>
                          IAT ✓ {iatPorAccidente[a.id].length > 1 ? `×${iatPorAccidente[a.id].length}` : ''}
                        </span>
                      : <span style={{ color:'var(--tx-muted)', fontSize:12 }}>—</span>}
                  </td>
                  <td style={{ whiteSpace:'nowrap' }}>
                    <div style={{ display:'flex', gap:4, justifyContent:'center' }}>
                    <button className="btn btn-ghost btn-sm" title="Ver detalles" onClick={() => setVerItem(a)}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                    </button>
                    <button className="btn btn-ghost btn-sm" title="Editar registro" onClick={() => openEdit(a)}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                    </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal ver detalles */}
      {verItem && (
        <div
          style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.45)', zIndex:999, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}
          onClick={e => { if (e.target === e.currentTarget) setVerItem(null); }}
        >
          <div className="card" style={{ width:'100%', maxWidth:620, maxHeight:'90vh', overflowY:'auto', margin:0 }}>
            <div className="card-header" style={{ position:'sticky', top:0, background:'var(--card-bg)', zIndex:1 }}>
              <h2>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
                Detalle del Accidente #{verItem.id}
              </h2>
              <button className="btn btn-ghost btn-sm" onClick={() => setVerItem(null)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <div className="card-body" style={{ display:'flex', flexDirection:'column', gap:16 }}>
              {verItem.foto_url && (
                <img src={verItem.foto_url} alt="Foto del accidente" style={{ width:'100%', maxHeight:240, objectFit:'cover', borderRadius:8, border:'1px solid var(--card-bd)' }}/>
              )}
              {[
                ['Fecha del Accidente',    verItem.fecha_accidente ? new Date(verItem.fecha_accidente+'T12:00:00').toLocaleDateString('es-ES',{day:'2-digit',month:'long',year:'numeric'}) : '—'],
                ['Empleado',               verItem.empleado_nombre || '—'],
                ['Área',                   verItem.area || '—'],
                ['Gravedad',               verItem.gravedad || '—'],
                ['Días Perdidos',          verItem.dias_perdidos ?? '0'],
                ['Correo Electrónico',     verItem.correo_electronico || '—'],
                ['Número de ISSS',         verItem.numero_isss || '—'],
                ['Dirección del Domicilio',verItem.direccion_domicilio || '—'],
              ].map(([label, val]) => (
                <div key={label} style={{ display:'flex', flexDirection:'column', gap:3 }}>
                  <span style={{ fontSize:10.5, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', color:'var(--tx-muted)' }}>{label}</span>
                  <span style={{ fontSize:13.5, color:'var(--tx-heading)', fontWeight:500 }}>{val}</span>
                </div>
              ))}
              {verItem.descripcion_lesion && (
                <div style={{ display:'flex', flexDirection:'column', gap:3 }}>
                  <span style={{ fontSize:10.5, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', color:'var(--tx-muted)' }}>Descripción de la Lesión</span>
                  <span style={{ fontSize:13.5, color:'var(--tx-heading)', lineHeight:1.6 }}>{verItem.descripcion_lesion}</span>
                </div>
              )}
              {verItem.causa_raiz && (
                <div style={{ display:'flex', flexDirection:'column', gap:3 }}>
                  <span style={{ fontSize:10.5, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', color:'var(--tx-muted)' }}>Causa Raíz</span>
                  <span style={{ fontSize:13.5, color:'var(--tx-heading)', lineHeight:1.6 }}>{verItem.causa_raiz}</span>
                </div>
              )}
              {(() => {
                const iats = iatPorAccidente[verItem.id];
                if (!iats) return (
                  <div style={{ padding:'10px 14px', borderRadius:8, background:'#f8fafc', border:'1px solid #e2e8f0', fontSize:12.5, color:'var(--tx-muted)' }}>
                    Sin análisis IAT vinculado a este accidente.
                  </div>
                );
                return (
                  <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                    <span style={{ fontSize:10.5, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', color:'var(--tx-muted)' }}>Análisis IAT Vinculados</span>
                    {iats.map((r, i) => (
                      <div key={r.id || i} style={{ padding:'10px 14px', borderRadius:8, background:'#f0fdf4', border:'1px solid #86efac', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:8 }}>
                        <div style={{ display:'flex', flexDirection:'column', gap:2 }}>
                          <span style={{ fontSize:13, fontWeight:700, color:'#15803d' }}>
                            {r.nombre_completo || r.empleado || '—'}
                          </span>
                          <span style={{ fontSize:11.5, color:'#166534' }}>
                            {(() => { const f = r.fecha_registro || r.created_at; return f ? new Date(f).toLocaleDateString('es-ES',{day:'2-digit',month:'short',year:'numeric'}) : '—'; })()}
                          </span>
                        </div>
                        <span className="badge badge-green">{r.estado || 'En proceso'}</span>
                      </div>
                    ))}
                  </div>
                );
              })()}
              <div style={{ paddingTop:4 }}>
                <button className="btn btn-outline" onClick={() => setVerItem(null)}>Cerrar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal edición */}
      {editItem && (
        <div
          style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.45)', zIndex:999, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}
          onClick={e => { if (e.target === e.currentTarget) closeEdit(); }}
        >
          <div className="card" style={{ width:'100%', maxWidth:700, maxHeight:'90vh', overflowY:'auto', margin:0 }}>
            <div className="card-header" style={{ position:'sticky', top:0, background:'var(--card-bg)', zIndex:1 }}>
              <h2>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
                Editar Accidente #{editItem.id}
              </h2>
              <button className="btn btn-ghost btn-sm" onClick={closeEdit}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <div className="card-body">
              {mensaje && <div className={`msg msg-${mensaje.tipo}`} style={{ marginBottom:14 }}>{mensaje.texto}</div>}
              <form onSubmit={onSave}>
                <div className="form-grid">
                  <div className="field">
                    <label>Fecha del Accidente *</label>
                    <input type="date" name="fecha_accidente" value={form.fecha_accidente} onChange={onChange} required/>
                  </div>
                  <div className="field">
                    <label>Nombre del Empleado *</label>
                    <input type="text" name="empleado_nombre" value={form.empleado_nombre} onChange={onChange} required/>
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
                    <input type="number" name="dias_perdidos" value={form.dias_perdidos} onChange={onChange} min="0"/>
                  </div>
                  <div className="field">
                    <label>Correo Electrónico</label>
                    <input type="email" name="correo_electronico" value={form.correo_electronico} onChange={onChange}/>
                  </div>
                  <div className="field">
                    <label>Número de ISSS</label>
                    <input type="text" name="numero_isss" value={form.numero_isss} onChange={onChange}/>
                  </div>
                  <div className="field full">
                    <label>Dirección del Domicilio</label>
                    <input type="text" name="direccion_domicilio" value={form.direccion_domicilio} onChange={onChange}/>
                  </div>
                  <div className="field full">
                    <label>Descripción de la Lesión *</label>
                    <textarea name="descripcion_lesion" value={form.descripcion_lesion} onChange={onChange} required/>
                  </div>
                  <div className="field full">
                    <label>Causa Raíz</label>
                    <textarea name="causa_raiz" value={form.causa_raiz} onChange={onChange} style={{ minHeight:60 }}/>
                  </div>
                  <div className="field full">
                    <label>Fotografía</label>
                    <div style={{ display:'flex', alignItems:'center', gap:14, flexWrap:'wrap' }}>
                      {fotoPreview && (
                        <img src={fotoPreview} alt="Foto" style={{ maxWidth:160, maxHeight:120, borderRadius:8, border:'1px solid var(--card-bd)', objectFit:'cover' }}/>
                      )}
                      <label className="btn btn-outline btn-sm" style={{ cursor:'pointer' }}>
                        {fotoPreview ? 'Cambiar foto' : 'Subir foto'}
                        <input type="file" accept="image/*" style={{ display:'none' }} onChange={e => {
                          const f = e.target.files[0];
                          if (f) { setFotoArchivo(f); setFotoPreview(URL.createObjectURL(f)); }
                        }}/>
                      </label>
                      {fotoPreview && (
                        <button type="button" className="btn btn-ghost btn-sm" onClick={() => { setFotoArchivo(null); setFotoPreview(null); setForm(p=>({...p,foto_url:''})); }}>
                          Quitar foto
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                <div style={{ display:'flex', gap:10, marginTop:20 }}>
                  <button type="submit" className="btn btn-primary btn-lg" disabled={guardando}>
                    {guardando ? 'Guardando…' : 'Guardar Cambios'}
                  </button>
                  <button type="button" className="btn btn-outline btn-lg" onClick={closeEdit}>Cancelar</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RegistroAccidentes;
