/* vite-src/components/RegistroAnalisisIAT.jsx */
import { useState } from 'react';
const MOCK_REG_IAT = [
  { id: 1, fecha_accidente: '2026-05-20', nombre_completo: 'Luis Peralta', cargo: 'Operador de Ensamble', lugar_exacto: 'Área de ensamble, línea 3', estado: 'Completado' },
  { id: 2, fecha_accidente: '2026-05-28', nombre_completo: 'Carlos Méndez', cargo: 'Operador de Máquinas', lugar_exacto: 'Área de máquinas, máquina #7', estado: 'En proceso' }
];
function RegistroIAT({ lista, onActualizar }) {
  const merged = lista && lista.length ? [...lista, ...MOCK_REG_IAT] : MOCK_REG_IAT;

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
              {merged.map((r,i) => (
                <tr key={r.id || i}>
                  <td style={{ whiteSpace:'nowrap', fontSize:12.5 }}>
                    {r.fecha ? new Date(r.fecha+'T12:00:00').toLocaleDateString('es-ES',{day:'2-digit',month:'short',year:'numeric'}) : '—'}
                  </td>
                  <td style={{ fontWeight:600 }}>{r.empleado || r.nombre_completo || '—'}</td>
                  <td style={{ fontSize:12.5, color:'var(--tx-muted)' }}>{r.cargo || '—'}</td>
                  <td style={{ fontSize:12.5, maxWidth:260 }}>{r.causa || r.causa_raiz_directa || '—'}</td>
                  <td>
                    <span className={`badge ${r.estado === 'Completado' ? 'badge-green' : 'badge-amber'}`}>
                      {r.estado || 'En proceso'}
                    </span>
                  </td>
                  <td>
                    <button className="btn btn-ghost btn-sm" title="Ver detalles">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                    </button>
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

window.RegistroIAT        = RegistroIAT;

export default RegistroIAT;
