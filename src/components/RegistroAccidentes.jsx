/* vite-src/components/RegistroAccidentes.jsx */
import { useState } from 'react';

/* Registros.jsx — Historial de Accidentes y Registros IAT */

const MOCK_REG_ACC = [
  { id:1, fecha:'2026-05-28', empleado:'Carlos Méndez', area:'MAQUINAS', gravedad:'Leve', dias:1, descripcion:'Corte superficial en mano derecha al manipular rebaba sin guantes' },
  { id:2, fecha:'2026-05-20', empleado:'Luis Peralta', area:'ENSAMBLE', gravedad:'Grave', dias:3, descripcion:'Golpe en rodilla por caída de tarima mal estibada' },
  { id:3, fecha:'2026-05-14', empleado:'Roberto Castro', area:'MANTENIMIENTO', gravedad:'Leve', dias:0, descripcion:'Irritación ocular por salpicadura de aceite sin gafas de seguridad' },
];

const MOCK_REG_IAT = [
  { id:1, fecha:'2026-05-21', empleado:'Luis Peralta', cargo:'Operador de Ensamble', estado:'Completado', causa:'Tarima mal estibada, área desordenada' },
  { id:2, fecha:'2026-05-29', empleado:'Carlos Méndez', cargo:'Operador de Máquinas', estado:'En proceso', causa:'Falta de EPP — no uso de guantes de corte' },
];

function RegistroAccidentes({ lista }) {
  const merged = lista && lista.length ? [...lista, ...MOCK_REG_ACC] : MOCK_REG_ACC;

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:14 }}>

      {/* KPIs */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12 }}>
        {[
          { label:'Total Registros',   value: merged.length,                                          color:'var(--navy-800)' },
          { label:'Accidentes Graves', value: merged.filter(a=>a.gravedad==='Grave'||a.gravedad==='Muy Grave').length, color:'var(--red)' },
          { label:'Días Perdidos Tot.',value: merged.reduce((s,a)=>s+(parseInt(a.dias)||0),0),        color:'var(--amber)' },
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
                <th style={{ textAlign:'center' }}>Días Perdidos</th>
              </tr>
            </thead>
            <tbody>
              {merged.map((a,i) => (
                <tr key={a.id || i}>
                  <td style={{ whiteSpace:'nowrap', fontSize:12.5 }}>
                    {a.fecha ? new Date(a.fecha+'T12:00:00').toLocaleDateString('es-ES',{day:'2-digit',month:'short',year:'numeric'}) : '—'}
                  </td>
                  <td style={{ fontWeight:600 }}>{a.empleado || a.empleado_nombre || '—'}</td>
                  <td style={{ fontSize:12, color:'var(--tx-muted)' }}>{(a.area||'').replace('_',' ')}</td>
                  <td style={{ fontSize:12.5, maxWidth:300 }}>{a.descripcion || a.descripcion_lesion || '—'}</td>
                  <td>
                    <span className={`badge ${(a.gravedad==='Grave'||a.gravedad==='Muy Grave') ? 'badge-red' : 'badge-amber'}`}>
                      {a.gravedad || 'Leve'}
                    </span>
                  </td>
                  <td style={{ textAlign:'center', fontWeight:700, color: (parseInt(a.dias)||0)>0 ? 'var(--red)' : 'var(--tx-muted)' }}>
                    {a.dias || a.dias_perdidos || 0}
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

export default RegistroAccidentes;
