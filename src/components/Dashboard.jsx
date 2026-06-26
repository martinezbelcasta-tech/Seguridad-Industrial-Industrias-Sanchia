/* vite-src/components/Dashboard.jsx — convertido para Vite */
import { useState, useEffect, useRef } from 'react';
import { supabaseSeguridad } from '../lib/supabaseSeguridadClient';

/* Dashboard.jsx — Inspecciones de Planta con Gráfica Live Dorada */

const AREAS_DATA = [
  { id:'MANTENIMIENTO', nombre:'MANTENIMIENTO', fecha:'6/5/2026', items:[
    'Corregir fuga de aceite','Corregir fuga de agua','Limpieza de succionadoras',
    'Ordenamiento de herramientas','Recoleccion de cajas de aceite','Recoger mangueras',
    'Colocar tapones en moldes','Ordenamiento de mangueras','Presentacion personal',
    'Orden y limpieza de estantes','Clasificacion correcta de desechos',
    'No tener implementos personales','Cajas de lubricacion limpia',
    'Uso de equipo de proteccion personal','Maquinas torno limpias','Extintores en posicion'
  ]},
  { id:'MAQUINAS', nombre:'MAQUINAS', fecha:'9/5/2026', inspector:'OMAR', items:[
    'Recoger rebaba de piso','Limpieza de maquinas','Limpieza de materia prima en canon',
    'Retirar melcocha en canon','Ordenar sacos vacios','Retirar cajas con agua',
    'Reprocesar piezas rechazadas','Recoger implementos que utilizan para retirar melcocha','Limpieza de pasillos',
    'Clasificacion correcta de desechos','No tener implementos personales',
    'Mesas limpias','Extintores en posicion','Uso de EPP','Presentacion personal'
  ]},
  { id:'SEMITERMINADO', nombre:'SEMITERMINADO', fecha:'2/5/2026', items:[
    'Retirar tarimas del area de maquina','No colocar tarimas verticalmente',
    'Ordenar tarimas mal estibadas','Retirar piezas malas','Retirar javas con rebaba',
    'Tarimas en los pasillos','Presentacion personal','Mezanines ordenados y limpios',
    'Areas frontales limpia','Areas frente a maquinas','Area de chasis gavetero',
    'Area de vin ordenada','Area chasis terecita','Area a un costado de despacho',
    'Contenedores ordenados','Equipos limpios','Extintores en posicion'
  ]},
  { id:'RECICLADO_PELETIZADO', nombre:'RECICLADO Y PELETIZADO', items:[
    'Maquinas limpias','Javas con rebaba ordenadas','Recoger derrames de material',
    'Orden y limpieza de reciclado','Javas ordenadas','Uso de EPP',
    'Jumbos con stretchfilm ordenados','Jumbos con materia reciclada','Herramientas ordenadas',
    'Extintores en posicion','No tener implementos personales',
    'Material Reciclado Identificado','Presentacion personal'
  ]},
  { id:'ENSAMBLE', nombre:'ENSAMBLE', items:[
    'Recoger rebaba de piso','Limpieza de mesas','Limpieza de estantes',
    'Ordenar piezas para reciclado','Ordenar sacos vacios','Orden de tarimas vacias',
    'Orden de tarimas con semiterminado','Orden de herramientas','Limpieza de pasillos',
    'Pasillos despejados','Clasificacion correcta de desechos',
    'No tener implementos personales','Extintores en posicion',
    'Flejadoras apagadas','Ventiladores limpios','Presentacion personal'
  ]},
  { id:'MEZCLAS', nombre:'MEZCLAS', items:[
    'Retirar barriles y jumbos vacios','Retirar bolsas vacias de materia prima',
    'Recoger derrames de materia prima','Orden y limpieza de Mezcladoras',
    'Mezclas contaminadas ordenadas','Barriles ordenados','Tarimas ordenadas',
    'Mezclas sobrantes ordenadas','Jumbos con materia prima ordenados',
    'Maquinas mezcladoras limpias','No tener implementos personales',
    'Uso de equipo de proteccion personal','Presentacion personal'
  ]},
];

const SEMANAS = [
  { id:1, label:'Semana 1', fechaInicio:'2026-05-01' },
  { id:2, label:'Semana 2', fechaInicio:'2026-05-08' },
  { id:3, label:'Semana 3', fechaInicio:'2026-05-15' },
  { id:4, label:'Semana 4', fechaInicio:'2026-05-22' },
  { id:5, label:'Semana 5', fechaInicio:'2026-05-29' },
];

function colorPct(p) {
  if (p === null || p === undefined) return '#94a3b8';
  if (p >= 80) return '#16a34a';
  if (p >= 50) return '#d97706';
  return '#dc2626';
}

// ── Smooth bezier path ──
function smoothCurve(pts) {
  if (pts.length < 2) return '';
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i < pts.length; i++) {
    const p0 = pts[i - 1], p1 = pts[i];
    const t = 0.38;
    d += ` C ${p0.x + (p1.x - p0.x) * t} ${p0.y}, ${p1.x - (p1.x - p0.x) * t} ${p1.y}, ${p1.x} ${p1.y}`;
  }
  return d;
}

// ── Live Trend Chart ──
function TrendChart({ data }) {
  const [hovered, setHovered] = useState(null);
  const W = 560, H = 240, PX = 52, PY = 44;
  const cW = W - PX * 2, cH = H - PY * 2 - 30;
  const DS = 7; // diamond half-size

  const pts = data.map((d, i) => ({
    x: PX + (i / (data.length - 1)) * cW,
    y: PY + (1 - d.value / 100) * cH,
    ...d,
  }));

  const lineD = smoothCurve(pts);
  const areaD = lineD + ` L ${pts[pts.length - 1].x} ${PY + cH} L ${pts[0].x} ${PY + cH} Z`;

  const diamond = (cx, cy, s) =>
    `${cx},${cy - s} ${cx + s},${cy} ${cx},${cy + s} ${cx - s},${cy}`;

  return (
    <div style={{ position:'relative', width:'100%' }}>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ overflow:'visible', display:'block' }}>
        <defs>
          <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#c8a84b" stopOpacity="0.18"/>
            <stop offset="100%" stopColor="#c8a84b" stopOpacity="0.01"/>
          </linearGradient>
          <filter id="goldGlow">
            <feGaussianBlur stdDeviation="3" result="blur"/>
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <filter id="labelGlow">
            <feGaussianBlur stdDeviation="1.5" result="blur"/>
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>

        {/* Grid */}
        {[25, 50, 75, 100].map(v => {
          const y = PY + (1 - v / 100) * cH;
          return (
            <g key={v}>
              <line x1={PX} y1={y} x2={W - PX} y2={y}
                stroke="#e8edf5" strokeWidth="1" strokeDasharray="4 4"/>
              <text x={PX - 8} y={y + 4} textAnchor="end" fontSize="10"
                fill="#b0b8cc" fontFamily="Inter,sans-serif">{v}%</text>
            </g>
          );
        })}
        <line x1={PX} y1={PY + cH} x2={W - PX} y2={PY + cH} stroke="#d8dfe8" strokeWidth="1"/>

        {/* Area */}
        <path d={areaD} fill="url(#goldGrad)"
          style={{ opacity:0, animation:'areaFadeIn 0.7s ease 1.1s forwards' }}/>

        {/* Animated line — bold */}
        <path d={lineD} fill="none" stroke="#c8a84b" strokeWidth="2.4"
          strokeLinecap="round" strokeLinejoin="round"
          pathLength="1000" filter="url(#goldGlow)"
          style={{
            strokeDasharray:'1000',
            strokeDashoffset:'1000',
            animation:'drawTrend 1.4s cubic-bezier(0.4,0,0.2,1) forwards',
          }}/>

        {/* Points */}
        {pts.map((p, i) => {
          const isLast = i === pts.length - 1;
          const delay = `${0.85 + i * 0.09}s`;
          const ds = hovered === i ? DS + 2.5 : DS;

          return (
            <g key={i}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              style={{ cursor:'default' }}>

              {/* Hit zone */}
              <circle cx={p.x} cy={p.y} r="20" fill="transparent"/>

              {/* Pulse ring on last point */}
              {isLast && (
                <circle cx={p.x} cy={p.y} r="11" fill="none"
                  stroke="#c8a84b" strokeWidth="1.5"
                  style={{ opacity:0, animation:`ptPop 0.3s ease ${delay} forwards, liveRing 2.2s ease-out 1.6s infinite` }}/>
              )}

              {/* Diamond */}
              <polygon
                points={diamond(p.x, p.y, ds)}
                fill="#c8a84b"
                stroke="#fff"
                strokeWidth="2.5"
                style={{
                  opacity:0,
                  transition:'all 0.14s ease',
                  animation:`ptPop 0.35s cubic-bezier(0.34,1.56,0.64,1) ${delay} forwards`,
                  filter: hovered === i ? 'drop-shadow(0 0 6px #c8a84b)' : 'none',
                }}/>

              {/* Always-visible % label above diamond */}
              <text x={p.x} y={p.y - DS - 11} textAnchor="middle"
                fontSize="12.5" fill="#c8a84b" fontFamily="Inter,sans-serif" fontWeight="800"
                filter="url(#labelGlow)"
                style={{ opacity:0, animation:`ptPop 0.3s ease ${delay} forwards` }}>
                {p.value}%
              </text>

              {/* X-axis label */}
              <text x={p.x} y={PY + cH + 20} textAnchor="middle"
                fontSize="11" fill="#9ca3b0" fontFamily="Inter,sans-serif"
                style={{ opacity:0, animation:`ptPop 0.3s ease ${delay} forwards` }}>
                {p.name}
              </text>
            </g>
          );
        })}
      </svg>

      <style>{`
        @keyframes drawTrend  { from{stroke-dashoffset:1000} to{stroke-dashoffset:0} }
        @keyframes areaFadeIn { from{opacity:0} to{opacity:1} }
        @keyframes ptPop      { from{opacity:0;transform:scale(0.3)} to{opacity:1;transform:scale(1)} }
        @keyframes liveRing   { 0%{r:11;stroke-opacity:.7} 100%{r:24;stroke-opacity:0} }
      `}</style>
    </div>
  );
}

// ── Area Bar Chart ──
function AreaBars({ areas, getAreaPct }) {
  return (
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', gap:8, height:130, padding:'0 4px' }}>
      {areas.map(area => {
        const pct = getAreaPct(area.id);
        const color = colorPct(pct);
        const h = pct !== null ? pct : 0;
        const shortName = area.nombre.length > 10 ? area.nombre.substring(0,9)+'…' : area.nombre;
        return (
          <div key={area.id} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', height:'100%' }}>
            <div style={{ flex:1, display:'flex', alignItems:'flex-end', width:'100%', justifyContent:'center' }}>
              <div style={{ width:36, background:'#f1f5f9', borderRadius:'5px 5px 0 0', position:'relative', height:'100%', display:'flex', alignItems:'flex-end' }}>
                <div style={{
                  width:'100%', background:color, borderRadius:'5px 5px 0 0',
                  height:`${h}%`, minHeight: h > 0 ? 4 : 0,
                  transition:'height 0.8s cubic-bezier(0.34,1.56,0.64,1)',
                  position:'relative', overflow:'hidden',
                }}>
                  {h > 0 && <div style={{
                    position:'absolute', top:0, left:0, right:0, height:'100%',
                    background:'linear-gradient(180deg, rgba(255,255,255,0.2) 0%, transparent 50%)',
                  }}/>}
                </div>
              </div>
            </div>
            <div style={{ textAlign:'center', marginTop:6 }}>
              <div style={{ fontSize:13, fontWeight:700, color }}>{pct !== null ? `${pct}%` : '—'}</div>
              <div style={{ fontSize:10, color:'#64748b', marginTop:2, maxWidth:60, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', textAlign:'center' }}>{shortName}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Comparativo Mes Actual vs Anterior ──
function ComparativoMes({ semanas, areasData, deletedItems, seleccion }) {
  const [hoveredArea, setHoveredArea] = useState(null);
  const MESES_ES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  const now = new Date();
  const curM = now.getMonth(), curY = now.getFullYear();
  const preM = curM === 0 ? 11 : curM - 1;
  const preY = curM === 0 ? curY - 1 : curY;

  const semsActual   = semanas.filter(s => { if (!s.fechaInicio) return false; const d = new Date(s.fechaInicio); return d.getMonth()===curM && d.getFullYear()===curY; });
  const semsAnterior = semanas.filter(s => { if (!s.fechaInicio) return false; const d = new Date(s.fechaInicio); return d.getMonth()===preM && d.getFullYear()===preY; });
  const isD = (aId, ii) => deletedItems.has(`${aId}-${ii}`);

  const calcPct = (semIds, areaId) => {
    const areas = areaId ? areasData.filter(a => a.id === areaId) : areasData;
    const entries = [];
    areas.forEach(area => {
      area.items.forEach((_, ii) => {
        if (isD(area.id, ii)) return;
        semIds.forEach(sId => {
          const v = seleccion[`${area.id}-${sId}-${ii+1}`];
          if (v === 'cumple' || v === 'no-cumple') entries.push(v);
        });
      });
    });
    if (!entries.length) return null;
    return Math.round(entries.filter(v => v==='cumple').length / entries.length * 100);
  };

  const pctActual   = calcPct(semsActual.map(s=>s.id));
  const pctAnterior = calcPct(semsAnterior.map(s=>s.id));
  const delta = pctActual !== null && pctAnterior !== null ? pctActual - pctAnterior : null;

  const PeriodCard = ({ label, mes, pct, dim }) => (
    <div style={{
      flex:1, background: dim
        ? 'linear-gradient(135deg,#1a2a3e 0%,#243447 100%)'
        : 'linear-gradient(135deg,#112447 0%,#1b3a6b 100%)',
      borderRadius:16, padding:'26px 28px', position:'relative', overflow:'hidden',
      opacity: dim ? 0.75 : 1, boxShadow:'0 4px 24px rgba(0,0,0,0.18)',
    }}>
      <div style={{ position:'absolute', top:0, right:0, width:130, height:130, borderRadius:'0 0 0 130px', background:'rgba(200,168,75,0.07)', pointerEvents:'none' }}/>
      <div style={{ fontSize:10.5, fontWeight:700, letterSpacing:'0.14em', textTransform:'uppercase', color:'rgba(200,168,75,0.85)', marginBottom:4 }}>{label}</div>
      <div style={{ fontSize:13, fontWeight:600, color:'rgba(255,255,255,0.45)', marginBottom:18 }}>{mes}</div>
      <div style={{ fontSize:60, fontWeight:900, color: pct!==null ? '#c8a84b' : 'rgba(255,255,255,0.18)', lineHeight:1, letterSpacing:'-0.04em', marginBottom:18 }}>
        {pct !== null ? `${pct}%` : '—'}
      </div>
      {pct !== null ? (
        <>
          <div style={{ height:8, background:'rgba(255,255,255,0.1)', borderRadius:99, overflow:'hidden' }}>
            <div style={{ height:'100%', width:`${pct}%`, borderRadius:99, background:'linear-gradient(90deg,#c8a84b,#e8c86d)', boxShadow:'0 0 14px rgba(200,168,75,0.55)', transition:'width 1.1s ease' }}/>
          </div>
          <div style={{ fontSize:11, color:'rgba(255,255,255,0.3)', marginTop:8 }}>{semsActual.length || semsAnterior.length} semana(s) analizadas</div>
        </>
      ) : (
        <div style={{ fontSize:12, color:'rgba(255,255,255,0.28)', fontStyle:'italic' }}>Sin datos en este período</div>
      )}
    </div>
  );

  return (
    <div>
      <div style={{ display:'flex', gap:16, alignItems:'stretch', marginBottom:22 }}>
        <PeriodCard label="Mes Actual"   mes={`${MESES_ES[curM]} ${curY}`} pct={pctActual}   dim={false}/>
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:6, padding:'0 6px', flexShrink:0 }}>
          {delta !== null ? (
            <>
              <div style={{ fontSize:26, fontWeight:900, color: delta>0?'#22c55e':delta<0?'#ef4444':'#94a3b8', lineHeight:1 }}>
                {delta>0?`↑+${delta}%`:delta<0?`↓${delta}%`:'='}
              </div>
              <div style={{ fontSize:9.5, color:'#64748b', fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', textAlign:'center', lineHeight:1.4 }}>vs<br/>anterior</div>
            </>
          ) : <div style={{ fontSize:18, color:'#475569' }}>—</div>}
        </div>
        <PeriodCard label="Mes Anterior" mes={`${MESES_ES[preM]} ${preY}`} pct={pctAnterior} dim={true}/>
      </div>

      <div style={{ fontSize:11, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'#94a3b8', marginBottom:8 }}>Desglose por Área</div>
      <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
        {areasData.map(area => {
          const pA = calcPct(semsActual.map(s=>s.id),   area.id);
          const pB = calcPct(semsAnterior.map(s=>s.id), area.id);
          const d  = pA!==null && pB!==null ? pA-pB : null;
          const clr = pA!==null ? colorPct(pA) : '#94a3b8';
          return (
            <div key={area.id}
              style={{ display:'flex', alignItems:'center', gap:12, padding:'8px 12px', borderRadius:8, background: hoveredArea===area.id?'#f0f4f8':'transparent', transition:'background 0.12s', cursor:'default' }}
              onMouseEnter={() => setHoveredArea(area.id)} onMouseLeave={() => setHoveredArea(null)}>
              <div style={{ width:190, fontSize:12, fontWeight:600, color:'var(--tx-heading)', flexShrink:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{area.nombre}</div>
              <div style={{ flex:1, height:6, background:'#e2e8f0', borderRadius:99, overflow:'hidden' }}>
                {pA!==null && <div style={{ height:'100%', width:`${pA}%`, background:clr, borderRadius:99, transition:'width 0.9s ease' }}/>}
              </div>
              <div style={{ width:42, fontSize:13, fontWeight:700, color:clr, textAlign:'right', flexShrink:0 }}>{pA!==null?`${pA}%`:'—'}</div>
              <div style={{ width:58, fontSize:11.5, fontWeight:700, textAlign:'center', flexShrink:0, color: d===null?'#94a3b8':d>0?'#16a34a':d<0?'#dc2626':'#64748b' }}>
                {d===null?'—':d>0?`↑ +${d}%`:d<0?`↓ ${d}%`:'='}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Heatmap Historial ──
function HeatmapHistorial({ semanas, areasData, deletedItems, seleccion }) {
  const [hovered, setHovered] = useState(null);
  const isD = (aId, ii) => deletedItems.has(`${aId}-${ii}`);

  const getCellPct = (areaId, semId) => {
    const area = areasData.find(a => a.id === areaId);
    if (!area) return null;
    const entries = area.items
      .map((_, ii) => isD(areaId, ii) ? null : seleccion[`${areaId}-${semId}-${ii+1}`])
      .filter(v => v==='cumple'||v==='no-cumple');
    if (!entries.length) return null;
    return Math.round(entries.filter(v=>v==='cumple').length/entries.length*100);
  };

  const getAreaAvg = (areaId) => {
    const vals = semanas.map(s=>getCellPct(areaId,s.id)).filter(v=>v!==null);
    if (!vals.length) return null;
    return Math.round(vals.reduce((a,b)=>a+b,0)/vals.length);
  };

  const getSemTotal = (semId) => {
    const entries = [];
    areasData.forEach(area => {
      area.items.forEach((_,ii) => {
        if (isD(area.id,ii)) return;
        const v = seleccion[`${area.id}-${semId}-${ii+1}`];
        if (v==='cumple'||v==='no-cumple') entries.push(v);
      });
    });
    if (!entries.length) return null;
    return Math.round(entries.filter(v=>v==='cumple').length/entries.length*100);
  };

  const grandTotal = (() => {
    const entries = [];
    areasData.forEach(area => {
      area.items.forEach((_,ii) => {
        if (isD(area.id,ii)) return;
        semanas.forEach(s => {
          const v = seleccion[`${area.id}-${s.id}-${ii+1}`];
          if (v==='cumple'||v==='no-cumple') entries.push(v);
        });
      });
    });
    if (!entries.length) return null;
    return Math.round(entries.filter(v=>v==='cumple').length/entries.length*100);
  })();

  const cellStyle = (pct, isTotal) => {
    if (isTotal) return { bg:'linear-gradient(135deg,#112447 0%,#1b3a6b 100%)', text:'#c8a84b', border:'transparent' };
    if (pct===null) return { bg:'#f8fafc', text:'#cbd5e1', border:'#e2e8f0' };
    if (pct>=80) return { bg:'#f0fdf4', text:'#15803d', border:'#86efac' };
    if (pct>=50) return { bg:'#fffbeb', text:'#b45309', border:'#fde68a' };
    return { bg:'#fef2f2', text:'#b91c1c', border:'#fca5a5' };
  };

  const Cell = ({ pct, isTotal, hk }) => {
    const c = cellStyle(pct, isTotal);
    const isHov = hovered===hk && !isTotal;
    return (
      <div
        onMouseEnter={() => hk && setHovered(hk)}
        onMouseLeave={() => setHovered(null)}
        style={{
          display:'flex', alignItems:'center', justifyContent:'center',
          height:46, borderRadius:9,
          background: c.bg, border:`1.5px solid ${c.border}`,
          fontSize:13, fontWeight:isTotal?900:700, color:c.text,
          transition:'all 0.13s',
          transform: isHov ? 'scale(1.07)' : 'scale(1)',
          boxShadow: isHov ? `0 4px 14px ${c.border}` : 'none',
          cursor:'default',
        }}>
        {pct!==null ? `${pct}%` : '—'}
      </div>
    );
  };

  return (
    <div>
      <div style={{ overflowX:'auto' }}>
        <table style={{ width:'100%', borderCollapse:'separate', borderSpacing:'5px', minWidth:520 }}>
          <thead>
            <tr>
              <th style={{ textAlign:'left', padding:'4px 8px', fontSize:10.5, fontWeight:700, color:'#94a3b8', letterSpacing:'0.1em', textTransform:'uppercase', width:160 }}>Área</th>
              {semanas.map(s => (
                <th key={s.id} style={{ textAlign:'center', padding:'4px 4px', fontSize:10.5, fontWeight:700, color:'#94a3b8', letterSpacing:'0.08em', textTransform:'uppercase', minWidth:74 }}>
                  {s.label}
                  {s.fechaInicio && <div style={{ fontSize:9.5, fontWeight:400, color:'#b0b8cc', marginTop:2 }}>{new Date(s.fechaInicio+'T12:00:00').toLocaleDateString('es-ES',{day:'2-digit',month:'short'})}</div>}
                </th>
              ))}
              <th style={{ textAlign:'center', padding:'4px 4px', fontSize:10.5, fontWeight:700, color:'#112447', letterSpacing:'0.08em', textTransform:'uppercase', minWidth:74 }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {areasData.map((area, ri) => {
              const avg = getAreaAvg(area.id);
              return (
                <tr key={area.id}>
                  <td style={{ padding:'0 8px 0 0', fontSize:12, fontWeight:600, color:'var(--tx-heading)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', maxWidth:160, verticalAlign:'middle' }}>
                    {area.nombre}
                  </td>
                  {semanas.map((s, ci) => {
                    const pct = getCellPct(area.id, s.id);
                    return <td key={s.id} style={{ padding:0, verticalAlign:'middle' }}><Cell pct={pct} isTotal={false} hk={`${ri}-${ci}`}/></td>;
                  })}
                  <td style={{ padding:'0 0 0 2px', verticalAlign:'middle' }}><Cell pct={avg} isTotal={true} hk={null}/></td>
                </tr>
              );
            })}
            <tr>
              <td style={{ padding:'4px 8px 0 0', fontSize:11, fontWeight:700, color:'#112447', letterSpacing:'0.06em', textTransform:'uppercase', verticalAlign:'middle' }}>TOTAL</td>
              {semanas.map(s => {
                const pct = getSemTotal(s.id);
                return <td key={s.id} style={{ padding:'4px 0 0', verticalAlign:'middle' }}><Cell pct={pct} isTotal={true} hk={null}/></td>;
              })}
              <td style={{ padding:'4px 0 0 2px', verticalAlign:'middle' }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:46, borderRadius:9, background:'linear-gradient(135deg,#c8a84b 0%,#e8c86d 100%)', fontSize:14, fontWeight:900, color:'#112447', boxShadow:'0 4px 16px rgba(200,168,75,0.4)' }}>
                  {grandTotal!==null?`${grandTotal}%`:'—'}
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div style={{ display:'flex', gap:16, marginTop:14, justifyContent:'flex-end', flexWrap:'wrap' }}>
        {[['#f0fdf4','#15803d','#86efac','≥ 80%'],['#fffbeb','#b45309','#fde68a','50–79%'],['#fef2f2','#b91c1c','#fca5a5','< 50%'],['#f8fafc','#cbd5e1','#e2e8f0','Sin datos']].map(([bg,text,border,label])=>(
          <div key={label} style={{ display:'flex', alignItems:'center', gap:5, fontSize:11, color:'#64748b' }}>
            <div style={{ width:16, height:16, borderRadius:4, background:bg, border:`1.5px solid ${border}`, flexShrink:0 }}/>
            <span style={{ fontWeight:500 }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main Dashboard ──
function Dashboard() {
  const [seleccion, setSeleccion]           = useState({});
  const [filtroArea, setFiltroArea]         = useState('todas');
  const [filtroSemana, setFiltroSemana]     = useState('todas');
  const [areaExpandida, setAreaExpandida]   = useState(null);
  const [resumenOpen, setResumenOpen]       = useState(true);
  const [graficasOpen, setGraficasOpen]     = useState(true);
  const [comparativoOpen, setComparativoOpen] = useState(true);
  const [heatmapOpen, setHeatmapOpen]         = useState(true);
  const [guardando, setGuardando]           = useState(false);
  const [mensaje, setMensaje]               = useState(null);
  const guardadoRef = useRef(new Set());

  const [areasData, setAreasData]           = useState(AREAS_DATA);
  const [deletedItems, setDeletedItems]     = useState(new Set()); // "areaId-itemIdx"
  const [editingItem, setEditingItem]       = useState(null); // { areaId, itemIdx }
  const [editText, setEditText]             = useState('');
  const [addingToArea, setAddingToArea]     = useState(null); // areaId
  const [newItemText, setNewItemText]       = useState('');
  const [confirmingDelete, setConfirmingDelete] = useState(null); // { areaId, itemIdx }
  const [toast, setToast]                   = useState(false);

  const showToast = () => { setToast(true); setTimeout(() => setToast(false), 1000); };

  const [semanas, setSemanas] = useState(SEMANAS);

  // ── Cargar fechas de semanas guardadas ──
  useEffect(() => {
    supabaseSeguridad.from('config_semanas').select('semana_id, fecha_inicio')
      .then(({ data, error }) => {
        if (error || !data) return;
        setSemanas(prev => prev.map(s => {
          const fila = data.find(f => f.semana_id === s.id);
          return fila ? { ...s, fechaInicio: fila.fecha_inicio } : s;
        }));
      });
  }, []);

  // ── Cargar items personalizados y eliminados ──
  useEffect(() => {
    supabaseSeguridad.from('config_items').select('area_id, item_id, descripcion, deleted')
      .then(({ data, error }) => {
        if (error || !data || !data.length) return;
        setAreasData(prev => prev.map(area => {
          const overrides = data.filter(r => r.area_id === area.id && !r.deleted);
          if (!overrides.length) return area;
          const items = [...area.items];
          overrides.forEach(r => { items[r.item_id - 1] = r.descripcion; });
          return { ...area, items };
        }));
        const deleted = new Set(
          data.filter(r => r.deleted).map(r => `${r.area_id}-${r.item_id - 1}`)
        );
        if (deleted.size) setDeletedItems(deleted);
      });
  }, []);

  const handleGuardarItem = async (areaId, itemIdx, texto) => {
    if (!texto.trim()) return;
    const { error } = await supabaseSeguridad.from('config_items')
      .upsert({ area_id: areaId, item_id: itemIdx + 1, descripcion: texto.trim() }, { onConflict: 'area_id,item_id' });
    if (error) {
      setMensaje({ tipo:'error', texto:'Error al guardar ítem: ' + error.message });
      setTimeout(() => setMensaje(null), 5000);
      return;
    }
    setAreasData(prev => prev.map(area =>
      area.id !== areaId ? area : {
        ...area,
        items: area.items.map((it, i) => i === itemIdx ? texto.trim() : it),
      }
    ));
    setEditingItem(null);
  };

  const handleDeleteItem = async (areaId, itemIdx) => {
    setConfirmingDelete(null);
    const key = `${areaId}-${itemIdx}`;
    setDeletedItems(prev => new Set([...prev, key]));
    showToast();

    const area = areasData.find(a => a.id === areaId);
    const desc = area?.items[itemIdx] || '';
    const { error } = await supabaseSeguridad.from('config_items')
      .upsert({ area_id: areaId, item_id: itemIdx + 1, descripcion: desc, deleted: true }, { onConflict: 'area_id,item_id' });

    if (error) {
      setDeletedItems(prev => { const s = new Set(prev); s.delete(key); return s; });
      setMensaje({ tipo:'error', texto:'Error al eliminar: ' + error.message });
      setTimeout(() => setMensaje(null), 6000);
    }
  };

  const handleAddItem = async (areaId) => {
    const texto = newItemText.trim();
    if (!texto) return;
    const area = areasData.find(a => a.id === areaId);
    const newItemId = area.items.length + 1; // 1-based, siempre al final

    // Optimista: agregar inmediatamente a la UI
    setAreasData(prev => prev.map(a =>
      a.id !== areaId ? a : { ...a, items: [...a.items, texto] }
    ));
    // Auto-marcar como Cumple en todas las semanas
    setSeleccion(prev => {
      const next = { ...prev };
      semanas.forEach(s => { next[`${areaId}-${s.id}-${newItemId}`] = 'cumple'; });
      return next;
    });
    setAddingToArea(null);
    setNewItemText('');
    showToast();

    const { error } = await supabaseSeguridad.from('config_items')
      .upsert({ area_id: areaId, item_id: newItemId, descripcion: texto, deleted: false }, { onConflict: 'area_id,item_id' });

    if (error) {
      // Rollback
      setAreasData(prev => prev.map(a =>
        a.id !== areaId ? a : { ...a, items: a.items.slice(0, -1) }
      ));
      setMensaje({ tipo:'error', texto:'Error al agregar ítem: ' + error.message });
      setTimeout(() => setMensaje(null), 5000);
    }
  };

  const handleFechaChange = (semId, fechaInicio) => {
    setSemanas(prev => prev.map(s => s.id === semId ? { ...s, fechaInicio } : s));
    supabaseSeguridad.from('config_semanas')
      .upsert({ semana_id: semId, fecha_inicio: fechaInicio }, { onConflict: 'semana_id' })
      .then(({ error }) => {
        if (error) {
          setMensaje({ tipo:'error', texto:'Error al guardar la fecha: ' + error.message });
          setTimeout(() => setMensaje(null), 5000);
        }
      });
  };

  // ── Cargar inspecciones guardadas ──
  useEffect(() => {
    supabaseSeguridad.from('inspecciones').select('area, semana_id, item_id, valor')
      .then(({ data, error }) => {
        if (error || !data) return;
        const sel = {};
        data.forEach(r => {
          const key = `${r.area}-${r.semana_id}-${r.item_id}`;
          sel[key] = r.valor;
          guardadoRef.current.add(`${key}::${r.valor}`);
        });
        setSeleccion(sel);
      });
  }, []);

  // ── Live chart state ──
  const [chartData, setChartData] = useState([
    { name:'S1', value:88 },
    { name:'S2', value:76 },
    { name:'S3', value:91 },
    { name:'S4', value:83 },
    { name:'S5', value:94 },
  ]);
  const [lastUpdate, setLastUpdate] = useState(0);
  const [isLive, setIsLive]         = useState(true);

  useEffect(() => {
    const updateInt = setInterval(() => {
      setChartData(prev => prev.map((d, i) => {
        if (i < 2) return d;
        const delta = (Math.random() - 0.46) * 6;
        return { ...d, value: Math.round(Math.min(100, Math.max(55, d.value + delta))) };
      }));
      setLastUpdate(0);
    }, 3800);
    const tickInt = setInterval(() => setLastUpdate(p => p + 1), 1000);
    return () => { clearInterval(updateInt); clearInterval(tickInt); };
  }, []);

  // ── Helpers ──
  const getValor = (areaId, semId, itemIdx) => seleccion[`${areaId}-${semId}-${itemIdx+1}`] || '';

  const isDeleted = (areaId, ii) => deletedItems.has(`${areaId}-${ii}`);

  // NA no cuenta en el cálculo (solo C y NC entran al denominador)
  const validVal = v => v === 'cumple' || v === 'no-cumple';

  const getAreaPct = (areaId) => {
    const area = areasData.find(a => a.id === areaId);
    if (!area) return null;
    let semFilter = filtroSemana !== 'todas' ? [parseInt(filtroSemana)] : semanas.map(s => s.id);
    const entries = [];
    area.items.forEach((_, ii) => {
      if (isDeleted(areaId, ii)) return;
      semFilter.forEach(sId => {
        const v = seleccion[`${areaId}-${sId}-${ii+1}`];
        if (validVal(v)) entries.push(v);
      });
    });
    if (!entries.length) return null;
    return Math.round((entries.filter(v => v === 'cumple').length / entries.length) * 100);
  };

  const getAreaSemPct = (areaId, semId) => {
    const area = areasData.find(a => a.id === areaId);
    if (!area) return null;
    const entries = area.items
      .map((_, ii) => isDeleted(areaId, ii) ? null : seleccion[`${areaId}-${semId}-${ii+1}`])
      .filter(validVal);
    if (!entries.length) return null;
    return Math.round((entries.filter(v => v === 'cumple').length / entries.length) * 100);
  };

  const getCumplimientoTotal = () => {
    const semFilter = filtroSemana !== 'todas' ? [parseInt(filtroSemana)] : semanas.map(s => s.id);
    const entries = [];
    areasData.forEach(area => {
      area.items.forEach((_, ii) => {
        if (isDeleted(area.id, ii)) return;
        semFilter.forEach(sId => {
          const v = seleccion[`${area.id}-${sId}-${ii+1}`];
          if (validVal(v)) entries.push(v);
        });
      });
    });
    if (!entries.length) return null;
    return Math.round((entries.filter(v => v === 'cumple').length / entries.length) * 100);
  };

  const handleToggle = (areaId, semId, itemIdx, valor) => {
    const key = `${areaId}-${semId}-${itemIdx+1}`;
    setSeleccion(prev => ({ ...prev, [key]: prev[key] === valor ? '' : valor }));
  };

  const handleGuardar = async () => {
    const filas = [];
    areasData.forEach(area => {
      area.items.forEach((desc, ii) => {
        if (isDeleted(area.id, ii)) return;
        semanas.forEach(sem => {
          const key = `${area.id}-${sem.id}-${ii+1}`;
          const valor = seleccion[key];
          if (valor && !guardadoRef.current.has(`${key}::${valor}`)) {
            filas.push({ area: area.id, semana_id: sem.id, item_id: ii + 1, item_descripcion: desc, valor });
          }
        });
      });
    });

    if (!filas.length) {
      setMensaje({ tipo:'error', texto:'No hay cambios nuevos para guardar.' });
      setTimeout(() => setMensaje(null), 4000);
      return;
    }

    setGuardando(true);
    const { error } = await supabaseSeguridad.from('inspecciones').insert(filas);
    setGuardando(false);

    if (error) {
      setMensaje({ tipo:'error', texto:'Error al guardar: ' + error.message });
      setTimeout(() => setMensaje(null), 5000);
      return;
    }

    filas.forEach(f => guardadoRef.current.add(`${f.area}-${f.semana_id}-${f.item_id}::${f.valor}`));
    setMensaje({ tipo:'success', texto:'Inspección guardada correctamente.' });
    setTimeout(() => setMensaje(null), 4000);
  };

  const areasFiltradas = filtroArea !== 'todas'
    ? areasData.filter(a => a.id === filtroArea)
    : areasData;

  const totalItems = areasData.reduce((s, a) => s + a.items.length, 0);
  const cumTotal   = getCumplimientoTotal();

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:12 }}>

      {/* ── Toast HECHO ── */}
      {toast && (
        <div style={{
          position:'fixed', top:28, left:'50%', transform:'translateX(-50%)',
          zIndex:9999, background:'linear-gradient(135deg,#112447 0%,#1b3a6b 100%)',
          color:'#fff', padding:'14px 36px', borderRadius:16,
          fontSize:18, fontWeight:900, letterSpacing:'0.06em',
          display:'flex', alignItems:'center', gap:10,
          boxShadow:'0 8px 32px rgba(0,0,0,0.28)',
          animation:'toastPop 0.18s cubic-bezier(0.34,1.56,0.64,1)',
          pointerEvents:'none',
        }}>
          HECHO 🎉
        </div>
      )}

      {/* ── Toolbar ── */}
      <div style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap' }}>
        <button className="btn btn-primary" onClick={handleGuardar} disabled={guardando}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
            <polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>
          </svg>
          {guardando ? 'Guardando…' : 'Guardar Inspección'}
        </button>

        <select className="btn btn-outline" value={filtroArea} onChange={e => setFiltroArea(e.target.value)}
          style={{ fontFamily:'Inter', cursor:'pointer' }}>
          <option value="todas">Todas las Áreas</option>
          {areasData.map(a => <option key={a.id} value={a.id}>{a.nombre}</option>)}
        </select>

        <select className="btn btn-outline" value={filtroSemana} onChange={e => setFiltroSemana(e.target.value)}
          style={{ fontFamily:'Inter', cursor:'pointer' }}>
          <option value="todas">Todas las Semanas</option>
          {semanas.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
        </select>

        {mensaje && <div className={`msg msg-${mensaje.tipo}`} style={{ marginLeft:'auto' }}>{mensaje.texto}</div>}
      </div>

      {/* ── Stats ── */}
      <div className="stats-grid">
        {[
          { label:'Áreas',       value: areasData.length,        bg:'#112447' },
          { label:'Total Ítems', value: totalItems,               bg:'#a88830' },
          { label:'Semanas',     value: semanas.length,           bg:'#1b5e8a' },
          { label:'Cumplimiento', value: cumTotal !== null ? `${cumTotal}%` : '—', bg: cumTotal !== null ? colorPct(cumTotal) : '#64748b' },
        ].map((s, i) => (
          <div key={i} className="stat-card">
            <div className="stat-icon" style={{ background: s.bg }}>
              {i===0 && <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" width="20" height="20"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>}
              {i===1 && <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" width="20" height="20"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>}
              {i===2 && <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" width="20" height="20"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>}
              {i===3 && <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" width="20" height="20"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>}
            </div>
            <div className="stat-info">
              <span className="stat-value">{s.value}</span>
              <span className="stat-label">{s.label}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ── Live Trend Chart ── */}
      <div className="section-block">
        <div className={`section-toggle ${resumenOpen ? 'open' : ''}`} onClick={() => setResumenOpen(p => !p)}>
          <div className="section-toggle-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><path d="M3 3v18h18"/><path d="m7 16 4-4 4 4 4-4"/></svg>
            Tendencia de Cumplimiento Semanal
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={dashSt.liveBadge}>
              <span style={dashSt.liveDot}></span> LIVE
            </div>
            <span style={{ fontSize:11, color:'#94a3b8' }}>
              Act. hace {lastUpdate}s
            </span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"
              className={`chevron ${resumenOpen ? 'open' : ''}`}
              style={{ color:'#94a3b8' }}><polyline points="6 9 12 15 18 9"/></svg>
          </div>
        </div>
        {resumenOpen && (
          <div style={{ padding:'4px 20px 20px' }}>
            <TrendChart data={chartData} />
          </div>
        )}
      </div>

      {/* ── Comparativo Mes ── */}
      <div className="section-block">
        <div className={`section-toggle ${comparativoOpen ? 'open' : ''}`} onClick={() => setComparativoOpen(p => !p)}>
          <div className="section-toggle-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><path d="M18 20V10"/><path d="M12 20V4"/><path d="M6 20v-6"/><path d="m22 10-4-4-4 4"/></svg>
            Comparativo Mes Actual vs Anterior
          </div>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"
            className={`chevron ${comparativoOpen ? 'open' : ''}`}
            style={{ color:'#94a3b8' }}><polyline points="6 9 12 15 18 9"/></svg>
        </div>
        {comparativoOpen && (
          <div style={{ padding:'16px 20px 24px' }}>
            <ComparativoMes semanas={semanas} areasData={areasData} deletedItems={deletedItems} seleccion={seleccion}/>
          </div>
        )}
      </div>

      {/* ── Area Bars ── */}
      <div className="section-block">
        <div className={`section-toggle ${graficasOpen ? 'open' : ''}`} onClick={() => setGraficasOpen(p => !p)}>
          <div className="section-toggle-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
            Cumplimiento por Área
          </div>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"
            className={`chevron ${graficasOpen ? 'open' : ''}`}
            style={{ color:'#94a3b8' }}><polyline points="6 9 12 15 18 9"/></svg>
        </div>
        {graficasOpen && (
          <div style={{ padding:'12px 20px 20px' }}>
            <AreaBars areas={areasData} getAreaPct={getAreaPct} />
          </div>
        )}
      </div>

      {/* ── Heatmap Historial ── */}
      <div className="section-block">
        <div className={`section-toggle ${heatmapOpen ? 'open' : ''}`} onClick={() => setHeatmapOpen(p => !p)}>
          <div className="section-toggle-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
            Historial de Resultados por Semana
          </div>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"
            className={`chevron ${heatmapOpen ? 'open' : ''}`}
            style={{ color:'#94a3b8' }}><polyline points="6 9 12 15 18 9"/></svg>
        </div>
        {heatmapOpen && (
          <div style={{ padding:'16px 20px 24px' }}>
            <HeatmapHistorial semanas={semanas} areasData={areasData} deletedItems={deletedItems} seleccion={seleccion}/>
          </div>
        )}
      </div>

      {/* ── Inspection Tables ── */}
      {areasFiltradas.map(area => {
        const isOpen = areaExpandida === area.id;
        const pctTotal = getAreaPct(area.id);
        return (
          <div key={area.id} className="section-block">
            {/* Area header */}
            <div className={`section-toggle ${isOpen ? 'open' : ''}`} style={{ cursor:'pointer' }} onClick={() => setAreaExpandida(isOpen ? null : area.id)}>
              <div style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap' }}>
                <span className="section-toggle-title">{area.nombre}</span>
                {area.fecha && <span style={dashSt.chip}>{area.fecha}</span>}
                {area.inspector && <span style={dashSt.chip}>Insp: {area.inspector}</span>}
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                {pctTotal !== null && (
                  <span style={{ fontSize:13, fontWeight:700, color: colorPct(pctTotal) }}>{pctTotal}%</span>
                )}
                <button
                  onClick={e => { e.stopPropagation(); setAreaExpandida(area.id); setAddingToArea(area.id); setNewItemText(''); }}
                  title="Agregar ítem"
                  style={{ display:'flex', alignItems:'center', gap:4, padding:'3px 9px', fontSize:11, fontWeight:700, color:'#16a34a', background:'rgba(22,163,74,0.08)', border:'1px solid rgba(22,163,74,0.25)', borderRadius:6, cursor:'pointer', fontFamily:'Inter' }}
                  onMouseEnter={e => e.currentTarget.style.background='rgba(22,163,74,0.18)'}
                  onMouseLeave={e => e.currentTarget.style.background='rgba(22,163,74,0.08)'}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="12" height="12">
                    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                  Agregar
                </button>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"
                  className={`chevron ${isOpen ? 'open' : ''}`}
                  style={{ color:'#94a3b8' }}><polyline points="6 9 12 15 18 9"/></svg>
              </div>
            </div>

            {/* Subtotal row */}
            <div style={{ padding:'10px 20px', background:'#f8fafc', borderBottom:'1px solid var(--card-bd)', overflowX:'auto' }}>
              <table className="tbl" style={{ fontSize:12 }}>
                <thead>
                  <tr>
                    <th style={{ width:100 }}>Semana</th>
                    {semanas.map(s => <th key={s.id} style={{ textAlign:'center' }}>{s.label}</th>)}
                    <th style={{ textAlign:'center' }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ fontWeight:600, color:'var(--tx-heading)' }}>% Cumpl.</td>
                    {semanas.map(s => {
                      const p = getAreaSemPct(area.id, s.id);
                      return <td key={s.id} style={{ textAlign:'center', fontWeight:700, color: colorPct(p) }}>{p !== null ? `${p}%` : '—'}</td>;
                    })}
                    <td style={{ textAlign:'center', fontWeight:700, color: colorPct(pctTotal) }}>{pctTotal !== null ? `${pctTotal}%` : '—'}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Items table */}
            {isOpen && (
              <div style={{ overflowX:'auto' }}>
                <table className="tbl" style={{ minWidth:860 }}>
                  <thead>
                    <tr>
                      <th style={{ width:36, textAlign:'center' }}>#</th>
                      <th>Ítem de Inspección</th>
                      {semanas.map(s => (
                        <th key={s.id} style={{ textAlign:'center', minWidth:90 }}>
                          {s.label}<br/>
                          <input
                            type="date"
                            value={s.fechaInicio}
                            onChange={e => handleFechaChange(s.id, e.target.value)}
                            title="Seleccionar fecha de inicio de la semana"
                            style={{
                              display:'block', fontWeight:400, fontSize:9, textTransform:'none', letterSpacing:0,
                              textAlign:'center', width:'100%', marginTop:2,
                              border:'1px solid #e2e8f0', borderRadius:4,
                              background:'#fff', color:'inherit', padding:'1px 2px',
                              fontFamily:'inherit', cursor:'pointer',
                            }}
                          />
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      let rowNum = 0;
                      return area.items.map((desc, ii) => {
                      if (isDeleted(area.id, ii)) return null;
                      rowNum++;
                      const isEditing = editingItem?.areaId === area.id && editingItem?.itemIdx === ii;
                      return (
                      <tr key={ii}>
                        <td style={{ textAlign:'center', color:'var(--tx-muted)', fontSize:12 }}>{rowNum}</td>
                        <td style={{ fontSize:13 }}>
                          {isEditing ? (
                            <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                              <input
                                autoFocus
                                value={editText}
                                onChange={e => setEditText(e.target.value)}
                                onKeyDown={e => {
                                  if (e.key === 'Enter') handleGuardarItem(area.id, ii, editText);
                                  if (e.key === 'Escape') setEditingItem(null);
                                }}
                                style={{ flex:1, fontSize:13, padding:'3px 7px', border:'1.5px solid #c8a84b', borderRadius:5, fontFamily:'Inter', outline:'none' }}
                              />
                              <button onClick={() => handleGuardarItem(area.id, ii, editText)}
                                style={{ padding:'3px 10px', fontSize:11, fontWeight:700, background:'#c8a84b', color:'#fff', border:'none', borderRadius:5, cursor:'pointer', fontFamily:'Inter' }}>
                                OK
                              </button>
                              <button onClick={() => setEditingItem(null)}
                                style={{ padding:'3px 7px', fontSize:11, background:'#f1f5f9', color:'#64748b', border:'1px solid #e2e8f0', borderRadius:5, cursor:'pointer', fontFamily:'Inter' }}>
                                ✕
                              </button>
                            </div>
                          ) : (
                            <div style={{ display:'flex', alignItems:'center', gap:4, minHeight:24 }}>
                              <span style={{ flex:1 }}>{desc}</span>
                              {confirmingDelete?.areaId === area.id && confirmingDelete?.itemIdx === ii ? (
                                <>
                                  <span style={{ fontSize:11, color:'#dc2626', fontWeight:600, whiteSpace:'nowrap' }}>¿Eliminar?</span>
                                  <button
                                    onClick={e => { e.stopPropagation(); handleDeleteItem(area.id, ii); }}
                                    style={{ padding:'2px 8px', fontSize:11, fontWeight:700, background:'#dc2626', color:'#fff', border:'none', borderRadius:4, cursor:'pointer', fontFamily:'Inter' }}>
                                    Sí
                                  </button>
                                  <button
                                    onClick={e => { e.stopPropagation(); setConfirmingDelete(null); }}
                                    style={{ padding:'2px 8px', fontSize:11, background:'#f1f5f9', color:'#64748b', border:'1px solid #e2e8f0', borderRadius:4, cursor:'pointer', fontFamily:'Inter' }}>
                                    No
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    onClick={e => { e.stopPropagation(); setEditingItem({ areaId: area.id, itemIdx: ii }); setEditText(desc); }}
                                    title="Editar ítem"
                                    style={{ flexShrink:0, width:20, height:20, display:'grid', placeItems:'center', background:'transparent', border:'none', cursor:'pointer', color:'#94a3b8', borderRadius:4, padding:0, opacity:0.5 }}
                                    onMouseEnter={e => { e.currentTarget.style.opacity='1'; e.currentTarget.style.color='#c8a84b'; }}
                                    onMouseLeave={e => { e.currentTarget.style.opacity='0.5'; e.currentTarget.style.color='#94a3b8'; }}
                                  >
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13">
                                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                    </svg>
                                  </button>
                                  <button
                                    onClick={e => { e.stopPropagation(); setConfirmingDelete({ areaId: area.id, itemIdx: ii }); }}
                                    title="Eliminar ítem"
                                    style={{ flexShrink:0, width:20, height:20, display:'grid', placeItems:'center', background:'transparent', border:'none', cursor:'pointer', color:'#94a3b8', borderRadius:4, padding:0, opacity:0.5 }}
                                    onMouseEnter={e => { e.currentTarget.style.opacity='1'; e.currentTarget.style.color='#dc2626'; }}
                                    onMouseLeave={e => { e.currentTarget.style.opacity='0.5'; e.currentTarget.style.color='#94a3b8'; }}
                                  >
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13">
                                      <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                                      <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
                                    </svg>
                                  </button>
                                </>
                              )}
                            </div>
                          )}
                        </td>
                        {semanas.map(s => {
                          const val = getValor(area.id, s.id, ii);
                          return (
                            <td key={s.id} style={{ textAlign:'center' }}>
                              <div style={{ display:'flex', gap:3, justifyContent:'center' }}>
                                {[['cumple','C','#16a34a'],['no-cumple','NC','#dc2626'],['no-aplica','NA','#94a3b8']].map(([v,lbl,clr]) => (
                                  <button key={v} onClick={() => handleToggle(area.id, s.id, ii, v)}
                                    style={{
                                      width:28, height:28, borderRadius:5, border:`1.5px solid ${val===v ? clr : '#e2e8f0'}`,
                                      background: val===v ? clr : '#fff', color: val===v ? '#fff' : clr,
                                      fontSize:10, fontWeight:700, cursor:'pointer', transition:'all 0.12s',
                                      fontFamily:'Inter',
                                    }}>
                                    {lbl}
                                  </button>
                                ))}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                      );
                    });
                    })()}
                    {/* ── Fila agregar nuevo ítem ── */}
                    {addingToArea === area.id && (
                      <tr>
                        <td colSpan={semanas.length + 2} style={{ padding:'8px 12px', borderTop:'1px dashed #e2e8f0', background:'#f0fdf4' }}>
                          <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                            <input
                              autoFocus
                              value={newItemText}
                              onChange={e => setNewItemText(e.target.value)}
                              placeholder="Nombre del nuevo ítem…"
                              onKeyDown={e => {
                                if (e.key === 'Enter') handleAddItem(area.id);
                                if (e.key === 'Escape') { setAddingToArea(null); setNewItemText(''); }
                              }}
                              style={{ flex:1, fontSize:13, padding:'4px 8px', border:'1.5px solid #16a34a', borderRadius:5, fontFamily:'Inter', outline:'none' }}
                            />
                            <button onClick={() => handleAddItem(area.id)}
                              style={{ padding:'4px 12px', fontSize:11, fontWeight:700, background:'#16a34a', color:'#fff', border:'none', borderRadius:5, cursor:'pointer', fontFamily:'Inter' }}>
                              OK
                            </button>
                            <button onClick={() => { setAddingToArea(null); setNewItemText(''); }}
                              style={{ padding:'4px 8px', fontSize:11, background:'#f1f5f9', color:'#64748b', border:'1px solid #e2e8f0', borderRadius:5, cursor:'pointer', fontFamily:'Inter' }}>
                              ✕
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      })}

      <style>{`
        @keyframes pulse-live { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(0.85)} }
        @keyframes ping { 0%{transform:scale(1);opacity:0.8} 100%{transform:scale(2.5);opacity:0} }
        @keyframes toastPop { from{opacity:0;transform:translateX(-50%) scale(0.7)} to{opacity:1;transform:translateX(-50%) scale(1)} }
      `}</style>
    </div>
  );
}

const dashSt = {
  liveBadge: {
    display:'inline-flex', alignItems:'center', gap:6,
    padding:'3px 9px', borderRadius:999,
    background:'rgba(200,168,75,0.10)', border:'1px solid rgba(200,168,75,0.25)',
    fontSize:10.5, fontWeight:700, color:'var(--gold)',
    letterSpacing:'0.06em',
  },
  liveDot: {
    display:'inline-block', width:6, height:6, borderRadius:'50%',
    background:'var(--gold)', animation:'pulse-live 1.5s ease-in-out infinite',
  },
  chip: {
    padding:'2px 8px', background:'#f1f5f9', border:'1px solid #e2e8f0',
    borderRadius:999, fontSize:11, color:'#64748b',
  },
};

export default Dashboard;
