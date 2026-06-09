/* vite-src/components/Dashboard.jsx — convertido para Vite */
import { useState, useEffect } from 'react';

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
    'Reprocesar piezas rechazadas','Recoger implementos','Limpieza de pasillos',
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
  { id:1, label:'Semana 1', fecha:'1-may-26' },
  { id:2, label:'Semana 2', fecha:'8-may-26' },
  { id:3, label:'Semana 3', fecha:'15-may-26' },
  { id:4, label:'Semana 4', fecha:'22-may-26' },
  { id:5, label:'Semana 5', fecha:'29-may-26' },
];

// ── Seed mock data ──
function seedMockData() {
  const data = {};
  const vals = ['cumple','no-cumple','no-aplica'];
  AREAS_DATA.forEach((area, ai) => {
    SEMANAS.forEach((sem, si) => {
      if (ai * SEMANAS.length + si > 8) return; // Only first areas have data
      area.items.forEach((_, ii) => {
        const key = `${area.id}-${sem.id}-${ii+1}`;
        const r = Math.random();
        data[key] = r < 0.72 ? 'cumple' : r < 0.90 ? 'no-cumple' : 'no-aplica';
      });
    });
  });
  return data;
}

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
  const W = 560, H = 210, PX = 52, PY = 24;
  const cW = W - PX * 2, cH = H - PY * 2 - 30;

  const pts = data.map((d, i) => ({
    x: PX + (i / (data.length - 1)) * cW,
    y: PY + (1 - d.value / 100) * cH,
    ...d,
  }));

  const lineD = smoothCurve(pts);
  const areaD = lineD + ` L ${pts[pts.length - 1].x} ${PY + cH} L ${pts[0].x} ${PY + cH} Z`;

  return (
    <div style={{ position:'relative', width:'100%' }}>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ overflow:'visible', display:'block' }}>
        <defs>
          <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#c8a84b" stopOpacity="0.20"/>
            <stop offset="100%" stopColor="#c8a84b" stopOpacity="0.01"/>
          </linearGradient>
          <filter id="goldGlow">
            <feGaussianBlur stdDeviation="2.5" result="blur"/>
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

        {/* Area — fades in after line draws */}
        <path d={areaD} fill="url(#goldGrad)"
          style={{ opacity:0, animation:'areaFadeIn 0.7s ease 1.1s forwards' }}/>

        {/* Animated line — draws left to right on mount */}
        <path d={lineD} fill="none" stroke="#c8a84b" strokeWidth="2.8"
          strokeLinecap="round" strokeLinejoin="round"
          pathLength="1000" filter="url(#goldGlow)"
          style={{
            strokeDasharray:'1000',
            strokeDashoffset:'1000',
            animation:'drawTrend 1.4s cubic-bezier(0.4,0,0.2,1) forwards',
          }}/>

        {/* Points + tooltips */}
        {pts.map((p, i) => {
          const isLast = i === pts.length - 1;
          const delay = `${0.85 + i * 0.09}s`;
          return (
            <g key={i}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              style={{ cursor:'default' }}>
              {/* Invisible hit zone */}
              <circle cx={p.x} cy={p.y} r="18" fill="transparent"/>

              {/* Pulse ring on last point */}
              {isLast && (
                <circle cx={p.x} cy={p.y} r="9" fill="none"
                  stroke="#c8a84b" strokeWidth="1.5"
                  style={{ opacity:0, animation:`ptPop 0.3s ease ${delay} forwards, liveRing 2.2s ease-out 1.6s infinite` }}/>
              )}

              {/* Dot */}
              <circle cx={p.x} cy={p.y}
                r={hovered === i ? 7 : 5}
                fill={isLast ? '#c8a84b' : '#fff'}
                stroke={isLast ? '#fff' : '#c8a84b'}
                strokeWidth="2.5"
                style={{
                  opacity:0,
                  transition:'r 0.12s',
                  animation:`ptPop 0.35s cubic-bezier(0.34,1.56,0.64,1) ${delay} forwards`,
                }}/>

              {/* X-axis label */}
              <text x={p.x} y={PY + cH + 20} textAnchor="middle"
                fontSize="11" fill="#9ca3b0" fontFamily="Inter,sans-serif"
                style={{ opacity:0, animation:`ptPop 0.3s ease ${delay} forwards` }}>
                {p.name}
              </text>

              {/* Hover tooltip */}
              {hovered === i && (
                <g>
                  <line x1={p.x} y1={PY + cH} x2={p.x} y2={p.y + 7}
                    stroke="#c8a84b" strokeWidth="1" strokeDasharray="3 3" strokeOpacity="0.45"/>
                  <rect x={p.x - 38} y={p.y - 52} width="76" height="40" rx="8"
                    fill="white" style={{ filter:'drop-shadow(0 4px 14px rgba(0,0,0,0.13))' }}/>
                  <rect x={p.x - 38} y={p.y - 52} width="76" height="40" rx="8"
                    fill="none" stroke="#e2e8f0" strokeWidth="1"/>
                  <text x={p.x} y={p.y - 34} textAnchor="middle"
                    fontSize="10" fill="#9ca3af" fontFamily="Inter,sans-serif" fontWeight="500">
                    {p.name}
                  </text>
                  <text x={p.x} y={p.y - 18} textAnchor="middle"
                    fontSize="14" fill="#c8a84b" fontFamily="Inter,sans-serif" fontWeight="800">
                    {p.value}%
                  </text>
                </g>
              )}

              {/* Always-on label for last point */}
              {isLast && hovered !== i && (
                <g style={{ opacity:0, animation:`ptPop 0.3s ease ${delay} forwards` }}>
                  <rect x={p.x - 22} y={p.y - 32} width="44" height="22" rx="6" fill="#c8a84b"/>
                  <text x={p.x} y={p.y - 17} textAnchor="middle"
                    fontSize="12" fill="white" fontFamily="Inter,sans-serif" fontWeight="800">
                    {p.value}%
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </svg>

      <style>{`
        @keyframes drawTrend  { from{stroke-dashoffset:1000} to{stroke-dashoffset:0} }
        @keyframes areaFadeIn { from{opacity:0} to{opacity:1} }
        @keyframes ptPop      { from{opacity:0;transform:scale(0.3)} to{opacity:1;transform:scale(1)} }
        @keyframes liveRing   { 0%{r:9;stroke-opacity:.7} 100%{r:22;stroke-opacity:0} }
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

// ── Main Dashboard ──
function Dashboard() {
  const [seleccion, setSeleccion]           = useState(() => seedMockData());
  const [filtroArea, setFiltroArea]         = useState('todas');
  const [filtroSemana, setFiltroSemana]     = useState('todas');
  const [areaExpandida, setAreaExpandida]   = useState(null);
  const [resumenOpen, setResumenOpen]       = useState(true);
  const [graficasOpen, setGraficasOpen]     = useState(true);
  const [guardando, setGuardando]           = useState(false);
  const [mensaje, setMensaje]               = useState(null);

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

  const getAreaPct = (areaId) => {
    const area = AREAS_DATA.find(a => a.id === areaId);
    if (!area) return null;
    let semFilter = filtroSemana !== 'todas' ? [parseInt(filtroSemana)] : SEMANAS.map(s => s.id);
    const entries = [];
    area.items.forEach((_, ii) => {
      semFilter.forEach(sId => {
        const v = seleccion[`${areaId}-${sId}-${ii+1}`];
        if (v) entries.push(v);
      });
    });
    if (!entries.length) return null;
    const cumple = entries.filter(v => v === 'cumple').length;
    return Math.round((cumple / entries.length) * 100);
  };

  const getAreaSemPct = (areaId, semId) => {
    const area = AREAS_DATA.find(a => a.id === areaId);
    if (!area) return null;
    const entries = area.items.map((_, ii) => seleccion[`${areaId}-${semId}-${ii+1}`]).filter(Boolean);
    if (!entries.length) return null;
    return Math.round((entries.filter(v => v === 'cumple').length / entries.length) * 100);
  };

  const getCumplimientoTotal = () => {
    const all = Object.values(seleccion).filter(Boolean);
    if (!all.length) return null;
    return Math.round((all.filter(v => v === 'cumple').length / all.length) * 100);
  };

  const handleToggle = (areaId, semId, itemIdx, valor) => {
    const key = `${areaId}-${semId}-${itemIdx+1}`;
    setSeleccion(prev => ({ ...prev, [key]: prev[key] === valor ? '' : valor }));
  };

  const handleGuardar = async () => {
    setGuardando(true);
    await new Promise(r => setTimeout(r, 900));
    setMensaje({ tipo:'success', texto:'Inspección guardada correctamente.' });
    setGuardando(false);
    setTimeout(() => setMensaje(null), 4000);
  };

  const areasFiltradas = filtroArea !== 'todas'
    ? AREAS_DATA.filter(a => a.id === filtroArea)
    : AREAS_DATA;

  const totalItems = AREAS_DATA.reduce((s, a) => s + a.items.length, 0);
  const cumTotal   = getCumplimientoTotal();

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:12 }}>

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
          {AREAS_DATA.map(a => <option key={a.id} value={a.id}>{a.nombre}</option>)}
        </select>

        <select className="btn btn-outline" value={filtroSemana} onChange={e => setFiltroSemana(e.target.value)}
          style={{ fontFamily:'Inter', cursor:'pointer' }}>
          <option value="todas">Todas las Semanas</option>
          {SEMANAS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
        </select>

        {mensaje && <div className={`msg msg-${mensaje.tipo}`} style={{ marginLeft:'auto' }}>{mensaje.texto}</div>}
      </div>

      {/* ── Stats ── */}
      <div className="stats-grid">
        {[
          { label:'Áreas',       value: AREAS_DATA.length,        bg:'#112447' },
          { label:'Total Ítems', value: totalItems,               bg:'#a88830' },
          { label:'Semanas',     value: SEMANAS.length,           bg:'#1b5e8a' },
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
            <AreaBars areas={AREAS_DATA} getAreaPct={getAreaPct} />
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
            <div className={`section-toggle ${isOpen ? 'open' : ''}`} onClick={() => setAreaExpandida(isOpen ? null : area.id)}>
              <div style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap' }}>
                <span className="section-toggle-title">{area.nombre}</span>
                {area.fecha && <span style={dashSt.chip}>{area.fecha}</span>}
                {area.inspector && <span style={dashSt.chip}>Insp: {area.inspector}</span>}
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                {pctTotal !== null && (
                  <span style={{ fontSize:13, fontWeight:700, color: colorPct(pctTotal) }}>{pctTotal}%</span>
                )}
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
                    {SEMANAS.map(s => <th key={s.id} style={{ textAlign:'center' }}>{s.label}</th>)}
                    <th style={{ textAlign:'center' }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ fontWeight:600, color:'var(--tx-heading)' }}>% Cumpl.</td>
                    {SEMANAS.map(s => {
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
                      {SEMANAS.map(s => (
                        <th key={s.id} style={{ textAlign:'center', minWidth:90 }}>
                          {s.label}<br/>
                          <span style={{ fontWeight:400, fontSize:9, textTransform:'none', letterSpacing:0 }}>{s.fecha}</span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {area.items.map((desc, ii) => (
                      <tr key={ii}>
                        <td style={{ textAlign:'center', color:'var(--tx-muted)', fontSize:12 }}>{ii+1}</td>
                        <td style={{ fontSize:13 }}>{desc}</td>
                        {SEMANAS.map(s => {
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
                    ))}
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
