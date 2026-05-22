import { useState, useEffect } from 'react';
import './Dashboard.css';
import { supabase } from '../lib/supabase';

const areasData = [
  {
    id: 'MANTENIMIENTO',
    nombre: 'MANTENIMIENTO',
    fecha: '6/5/2026',
    items: [
      { id: 1, descripcion: 'Corregir fuga de aceite' },
      { id: 2, descripcion: 'Corregir fuga de agua' },
      { id: 3, descripcion: 'Limpieza de succionadoras' },
      { id: 4, descripcion: 'Ordenamiento de herramientas' },
      { id: 5, descripcion: 'Recoleccion de cajas de aceite tirada en el piso' },
      { id: 6, descripcion: 'Recoger mangueras de agua y aceite' },
      { id: 7, descripcion: 'Colocar tapones en moldes con fuga de aceite' },
      { id: 8, descripcion: 'Ordenamiento de mangueras (no wiper)' },
      { id: 9, descripcion: 'Presentacion personal' },
      { id: 10, descripcion: 'Orden y limpieza de estantes' },
      { id: 11, descripcion: 'Clasificacion correcta de desechos' },
      { id: 12, descripcion: 'No tener implementos personales (mochilas)' },
      { id: 13, descripcion: 'Cajas de lubricacion esta limpia' },
      { id: 14, descripcion: 'Uso de equipo de proteccion personal' },
      { id: 15, descripcion: 'Maquina torno limpias' },
      { id: 16, descripcion: 'Extintores en su posicion' },
    ],
    subtotalInicial: 75,
  },
  {
    id: 'MAQUINAS',
    nombre: 'MAQUINAS',
    fecha: '9/5/2026',
    inspector: 'OMAR',
    items: [
      { id: 1, descripcion: 'Recoger rebaba de piso' },
      { id: 2, descripcion: 'Limpieza de maquinas' },
      { id: 3, descripcion: 'Limpieza de materia prima en canon' },
      { id: 4, descripcion: 'Retirar melcocha en canon' },
      { id: 5, descripcion: 'Ordenar sacos vacios' },
      { id: 6, descripcion: 'Retirar cajas con agua' },
      { id: 7, descripcion: 'Reprocesar piezas rechazadas por calidad' },
      { id: 8, descripcion: 'Recoger implemento que utilizan para retirar la melcocha' },
      { id: 9, descripcion: 'Limpieza de pasillos' },
      { id: 10, descripcion: 'Clasificacion correcta de desechos' },
      { id: 11, descripcion: 'No tener implementos personales (mochilas)' },
      { id: 12, descripcion: 'Mesas limpias' },
      { id: 13, descripcion: 'Extintores en su posicion' },
      { id: 14, descripcion: 'Uso de EPP' },
      { id: 15, descripcion: 'Presentacion personal' },
    ],
    subtotalInicial: 80,
  },
  {
    id: 'SEMITERMINADO',
    nombre: 'SEMITERMINADO',
    fecha: '2/5/2026',
    items: [
      { id: 1, descripcion: 'Retirar tarimas con semiterminado del area de maquina' },
      { id: 2, descripcion: 'No colocar tarimas verticalmente' },
      { id: 3, descripcion: 'Ordenar tarimas mal estibadas' },
      { id: 4, descripcion: 'Retirar piezas malas del area maquina' },
      { id: 5, descripcion: 'Retirar javas con rebaba' },
      { id: 6, descripcion: 'Tarimas en los pasillos' },
      { id: 7, descripcion: 'Presentacion personal' },
      { id: 8, descripcion: 'Mezanines ordenados y limpios' },
      { id: 9, descripcion: 'Areas frontales limpia y ordenada' },
      { id: 10, descripcion: 'Areas frente a maquinas limpia y ordenada' },
      { id: 11, descripcion: 'Area de chasis gavetero limpia y ordenada' },
      { id: 12, descripcion: 'Area de vin ordenada y limpia' },
      { id: 13, descripcion: 'Area de chasis terecita ordenada y limpia' },
      { id: 14, descripcion: 'Area a un costado de despacho local ordenada y limpia' },
      { id: 15, descripcion: 'Contenedores ordenados y limpios' },
      { id: 16, descripcion: 'Equipos limpios (montacargas y yales)' },
      { id: 17, descripcion: 'Extintores en su posicion' },
    ],
    subtotalInicial: 75,
  },
  {
    id: 'RECICLADO_PELETIZADO',
    nombre: 'RECICLADO Y PELETIZADO',
    items: [
      { id: 1, descripcion: 'Maquinas limpias' },
      { id: 2, descripcion: 'Javas con rebaba ordenadas' },
      { id: 3, descripcion: 'Recoger derrames de material reciclado en el piso' },
      { id: 4, descripcion: 'Orden y limpieza de area de reciclado' },
      { id: 5, descripcion: 'Javas ordenadas' },
      { id: 6, descripcion: 'Uso de EPP' },
      { id: 7, descripcion: 'Jumbos con stretchfilm ordenados' },
      { id: 8, descripcion: 'Jumbos con materia reciclada ordenados' },
      { id: 9, descripcion: 'Herramientas ordenadas' },
      { id: 10, descripcion: 'Extintores en su posicion' },
      { id: 11, descripcion: 'No tener implementos personales (mochilas)' },
      { id: 12, descripcion: 'Material Reciclado Identificado' },
      { id: 13, descripcion: 'Presentacion personal' },
    ],
    subtotalInicial: 0,
  },
  {
    id: 'ENSAMBLE',
    nombre: 'ENSAMBLE',
    items: [
      { id: 1, descripcion: 'Recoger rebaba de piso' },
      { id: 2, descripcion: 'Limpieza de mesas' },
      { id: 3, descripcion: 'Limpieza de estantes' },
      { id: 4, descripcion: 'Ordenar piezas para reciclado' },
      { id: 5, descripcion: 'Ordenar sacos vacios' },
      { id: 6, descripcion: 'Orden de tarimas vacias' },
      { id: 7, descripcion: 'Orden de tarimas con semiterminado' },
      { id: 8, descripcion: 'Orden de herramientas y limpias' },
      { id: 9, descripcion: 'Limpieza de pasillos' },
      { id: 10, descripcion: 'Pasillos despejados sin tarimas' },
      { id: 11, descripcion: 'Clasificacion correcta de desechos' },
      { id: 12, descripcion: 'No tener implementos personales (mochilas)' },
      { id: 13, descripcion: 'Extintores en su posicion' },
      { id: 14, descripcion: 'Flejadoras apagadas' },
      { id: 15, descripcion: 'Ventiladores limpios y apagados' },
      { id: 16, descripcion: 'Presentacion personal' },
    ],
    subtotalInicial: 0,
  },
  {
    id: 'MEZCLAS',
    nombre: 'MEZCLAS',
    items: [
      { id: 1, descripcion: 'Retirar barriles y jumbos vacios maquinas' },
      { id: 2, descripcion: 'Retirar bolsas vacias de materia prima de maquinas' },
      { id: 3, descripcion: 'Recoger derrames de materia prima en el piso' },
      { id: 4, descripcion: 'Orden y limpieza de area de Mezcladoras' },
      { id: 5, descripcion: 'Mezclas contaminadas ordenadas e identificadas' },
      { id: 6, descripcion: 'Barriles ordenados' },
      { id: 7, descripcion: 'Tarimas ordenadas' },
      { id: 8, descripcion: 'Mezclas sobrantes ordenadas e identificadas' },
      { id: 9, descripcion: 'Jumbos con materia prima ordenados e identificados' },
      { id: 10, descripcion: 'Maquinas mezcladoras limpias' },
      { id: 11, descripcion: 'No tener implementos personales en el area (mochilas)' },
      { id: 12, descripcion: 'Uso de equipo de proteccion personal' },
      { id: 13, descripcion: 'Presentacion personal' },
    ],
    subtotalInicial: 0,
  },
];

const semanas = [
  { id: 1, label: 'Semana 1', fecha: '1-may-26' },
  { id: 2, label: 'Semana 2', fecha: '16-sept-25' },
  { id: 3, label: 'Semana 3', fecha: '16-sept-25' },
  { id: 4, label: 'Semana 4', fecha: '16-sept-25' },
  { id: 5, label: 'Semana 5', fecha: '16-sept-25' },
];

function Dashboard() {
  const [areaExpandida, setAreaExpandida] = useState(null);
  const [seleccionGlobal, setSeleccionGlobal] = useState({});
  const [filtroEstado, setFiltroEstado] = useState('todas');
  const [filtroSemana, setFiltroSemana] = useState('todas');
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState(null);
  const [datosSupabase, setDatosSupabase] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarDatosSupabase();
  }, []);

  const cargarDatosSupabase = async () => {
    setCargando(true);
    try {
      const { data, error } = await supabase
        .from('inspecciones')
        .select('*');

      if (error) {
        console.error('Error al cargar datos:', error);
      } else {
        setDatosSupabase(data || []);
        const seleccionInicial = {};
        data.forEach((row) => {
          const key = `${row.area}-${row.semana_id}-${row.item_id}`;
          seleccionInicial[key] = row.valor;
        });
        setSeleccionGlobal(seleccionInicial);
      }
    } catch (e) {
      console.error('Error:', e.message);
    }
    setCargando(false);
  };

  const getDatosUnificados = () => {
    const datosMap = new Map();

    datosSupabase.forEach((row) => {
      const key = `${row.area}-${row.semana_id}-${row.item_id}`;
      datosMap.set(key, { ...row });
    });

    Object.entries(seleccionGlobal).forEach(([key, valor]) => {
      if (valor && valor !== '') {
        const [area, semanaId, itemId] = key.split('-');
        datosMap.set(key, {
          area,
          semana_id: parseInt(semanaId),
          item_id: parseInt(itemId),
          valor,
          item_descripcion: datosMap.get(key)?.item_descripcion || ''
        });
      } else {
        datosMap.delete(key);
      }
    });

    return Array.from(datosMap.values());
  };

  const calcularCumplimientoAreaSemana = (areaId, semanaId) => {
    const datos = getDatosUnificados();
    let datosArea = datos.filter(
      (d) => d.area === areaId && d.semana_id === semanaId
    );

    if (filtroEstado !== 'todas') {
      datosArea = datosArea.filter((d) => d.area === filtroEstado);
    }

    if (datosArea.length === 0) {
      return null;
    }

    const cumple = datosArea.filter((d) => d.valor === 'cumple').length;
    const total = datosArea.length;

    return Math.round((cumple / total) * 100);
  };

  const calcularPorcentajeArea = (areaId) => {
    const datos = getDatosUnificados();
    const datosArea = datos.filter((d) => d.area === areaId);

    if (datosArea.length === 0) {
      return null;
    }

    const cumple = datosArea.filter((d) => d.valor === 'cumple').length;
    const total = datosArea.length;

    return Math.round((cumple / total) * 100);
  };

  const getDatosFiltrados = () => {
    const datos = getDatosUnificados();

    if (filtroEstado !== 'todas') {
      return datos.filter((d) => d.area === filtroEstado);
    }

    if (filtroSemana !== 'todas') {
      return datos.filter((d) => d.semana_id === parseInt(filtroSemana));
    }

    return datos;
  };

  const getCumplimientoTotal = () => {
    const datos = getDatosUnificados();
    const datosFiltrados = filtroEstado !== 'todas' || filtroSemana !== 'todas'
      ? getDatosFiltrados()
      : datos;

    if (datosFiltrados.length === 0) return null;
    const cumple = datosFiltrados.filter((d) => d.valor === 'cumple').length;
    return Math.round((cumple / datosFiltrados.length) * 100);
  };

  const getEstadisticasSemana = (semanaId) => {
    const datos = getDatosUnificados();
    let datosSemana = datos.filter((d) => d.semana_id === semanaId);

    if (filtroEstado !== 'todas') {
      datosSemana = datosSemana.filter((d) => d.area === filtroEstado);
    }

    if (datosSemana.length === 0) return { cumple: 0, total: 0, porcentaje: null };

    const cumple = datosSemana.filter((d) => d.valor === 'cumple').length;
    const total = datosSemana.length;
    const porcentaje = Math.round((cumple / total) * 100);

    return { cumple, total, porcentaje };
  };

  const getPorcentajeAreaFiltrado = (areaId) => {
    const datos = getDatosUnificados();
    let datosArea = datos.filter((d) => d.area === areaId);

    if (filtroSemana !== 'todas') {
      datosArea = datosArea.filter((d) => d.semana_id === parseInt(filtroSemana));
    }

    if (datosArea.length === 0) return null;

    const cumple = datosArea.filter((d) => d.valor === 'cumple').length;
    const total = datosArea.length;

    return Math.round((cumple / total) * 100);
  };

  const guardarInspeccion = async () => {
    setGuardando(true);
    setMensaje(null);

    const registros = [];

    areasData.forEach((area) => {
      area.items.forEach((item) => {
        semanas.forEach((semana) => {
          const key = `${area.id}-${semana.id}-${item.id}`;
          const valor = seleccionGlobal[key];
          if (valor) {
            registros.push({
              area: area.id,
              semana_id: semana.id,
              item_id: item.id,
              item_descripcion: item.descripcion,
              valor: valor,
            });
          }
        });
      });
    });

    if (registros.length === 0) {
      setMensaje({ tipo: 'error', texto: 'No hay datos para guardar. Marca al menos una opcion.' });
      setGuardando(false);
      return;
    }

    const { data, error } = await supabase
      .from('inspecciones')
      .insert(registros);

    if (error) {
      console.error('Error al guardar:', error);
      setMensaje({ tipo: 'error', texto: 'Error: ' + error.message });
    } else {
      setMensaje({ tipo: 'success', texto: `Se guardaron ${registros.length} registros correctamente` });
      cargarDatosSupabase();
    }

    setGuardando(false);
    setTimeout(() => setMensaje(null), 5000);
  };

  const toggleArea = (areaId) => {
    setAreaExpandida(areaExpandida === areaId ? null : areaId);
  };

  const handleOpcionChange = (areaId, semanaId, itemId, valor) => {
    const key = `${areaId}-${semanaId}-${itemId}`;
    setSeleccionGlobal((prev) => ({
      ...prev,
      [key]: prev[key] === valor ? '' : valor,
    }));
  };

  const getColorPorcentaje = (porcentaje) => {
    if (porcentaje === null || porcentaje === undefined) return '#95a5a6';
    if (porcentaje >= 80) return '#27ae60';
    if (porcentaje >= 50) return '#f39c12';
    return '#e74c3c';
  };

  const areasFiltradas = areasData.filter((area) => {
    if (filtroEstado !== 'todas' && filtroEstado !== area.id) return false;

    const datos = getDatosUnificados();

    if (filtroSemana !== 'todas') {
      return datos.some(
        (d) => d.area === area.id && d.semana_id === parseInt(filtroSemana)
      );
    }

    return true;
  });

  const fechaActual = new Date().toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="dashboard">
      <div className="guardar-inspeccion-container">
        <button 
          className="btn-guardar-inspeccion" 
          onClick={guardarInspeccion}
          disabled={guardando}
        >
          {guardando ? 'Guardando...' : 'Guardar Inspeccion Actual'}
        </button>
        {mensaje && (
          <div className={`mensaje mensaje-${mensaje.tipo}`}>
            {mensaje.texto}
          </div>
        )}
      </div>

      <div className="filtros">
        <div className="filtro-group">
          <label>Filtrar por Area:</label>
          <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
            <option value="todas">Todas las Areas</option>
            {areasData.map((area) => (
              <option key={area.id} value={area.id}>{area.nombre}</option>
            ))}
          </select>
        </div>
        <div className="filtro-group">
          <label>Filtrar por Semana:</label>
          <select value={filtroSemana} onChange={(e) => setFiltroSemana(e.target.value)}>
            <option value="todas">Todas las Semanas</option>
            {semanas.map((s) => (
              <option key={s.id} value={s.id}>{s.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="stats-container">
        <div className="stats-card" style={{ borderTopColor: '#3498db' }}>
          <div className="stats-info">
            <span className="stats-valor">{areasData.length}</span>
            <span className="stats-titulo">Areas</span>
          </div>
        </div>
        <div className="stats-card" style={{ borderTopColor: '#27ae60' }}>
          <div className="stats-info">
            <span className="stats-valor">
              {areasData.reduce((acc, a) => acc + a.items.length, 0)}
            </span>
            <span className="stats-titulo">Total Items</span>
          </div>
        </div>
        <div className="stats-card" style={{ borderTopColor: '#f39c12' }}>
          <div className="stats-info">
            <span className="stats-valor">{semanas.length}</span>
            <span className="stats-titulo">Semanas</span>
          </div>
        </div>
        <div className="stats-card" style={{ borderTopColor: '#9b59b6' }}>
          <div className="stats-info">
            <span className="stats-valor">
              {getCumplimientoTotal() !== null ? `${getCumplimientoTotal()}%` : '-'}
            </span>
            <span className="stats-titulo">Cumplimiento</span>
          </div>
        </div>
      </div>

      <div className="resumen-semanal-container">
        <h3>Cumplimiento por Semana</h3>
        <div className="resumen-semanal-grid">
          {semanas.map((s) => {
            const stats = getEstadisticasSemana(s.id);
            return (
              <div key={s.id} className="resumen-semanal-item">
                <span className="semana-label">{s.label}</span>
                <span className="semana-valor" style={{ color: getColorPorcentaje(stats.porcentaje) }}>
                  {stats.porcentaje !== null ? `${stats.porcentaje}%` : '-'}
                </span>
                <span className="semana-detalle">
                  {stats.total > 0 ? `${stats.cumple}/${stats.total}` : 'Sin datos'}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="graficas-container">
        <div className="graficas-header">
          <h2>Cumplimiento por Area</h2>
        </div>
        <div className="graficas-grid">
          {areasData.map((area) => {
            const porcentaje = getPorcentajeAreaFiltrado(area.id);
            const color = getColorPorcentaje(porcentaje);
            const datosFiltrados = getDatosFiltrados().filter((d) => d.area === area.id);
            const stats = {
              cumple: datosFiltrados.filter((d) => d.valor === 'cumple').length,
              total: datosFiltrados.length,
            };
            return (
              <div key={area.id} className="grafica-item">
                <div className="grafica-barra-container">
                  <div
                    className="grafica-barra"
                    style={{ height: `${porcentaje !== null ? porcentaje : 0}%`, backgroundColor: color }}
                  />
                </div>
                <div className="grafica-info">
                  <span className="grafica-nombre">{area.nombre}</span>
                  <span className="grafica-porcentaje" style={{ color }}>
                    {porcentaje !== null ? `${porcentaje}%` : '-'}
                  </span>
                  <span className="grafica-detalle">
                    {stats.total > 0 ? `${stats.cumple}/${stats.total}` : 'Sin datos'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="areas-container">
        {areasFiltradas.map((area) => (
          <div key={area.id} className="area-card">
            <div className="area-header" onClick={() => toggleArea(area.id)}>
              <div className="area-info">
                <h3>{area.nombre}</h3>
                {area.fecha && <span className="area-fecha">{area.fecha}</span>}
                {area.inspector && <span className="area-inspector">{area.inspector}</span>}
              </div>
              <div className="area-toggle">{areaExpandida === area.id ? '-' : '+'}</div>
            </div>

            <div className="area-subtotales">
              <table className="subtotales-table">
                <thead>
                  <tr>
                    <th>Semana</th>
                    {semanas.map((s) => (
                      <th key={s.id}>{s.label}</th>
                    ))}
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>%</td>
                    {semanas.map((s) => {
                      const sub = calcularCumplimientoAreaSemana(area.id, s.id);
                      return (
                        <td key={s.id} style={{ color: getColorPorcentaje(sub) }}>
                          {sub !== null ? `${sub}%` : '-'}
                        </td>
                      );
                    })}
                    <td style={{ color: getColorPorcentaje(calcularPorcentajeArea(area.id)) }}>
                      {calcularPorcentajeArea(area.id) !== null ? `${calcularPorcentajeArea(area.id)}%` : '-'}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {areaExpandida === area.id && (
              <div className="area-items">
                <table className="items-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Item de Inspeccion</th>
                      {semanas.map((s) => (
                        <th key={s.id}>
                          {s.label}
                          <br />
                          <span className="semana-fecha">{s.fecha}</span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {area.items.map((item) => (
                      <tr key={item.id}>
                        <td>{item.id}</td>
                        <td className="item-descripcion">{item.descripcion}</td>
                        {semanas.map((s) => {
                          const key = `${area.id}-${s.id}-${item.id}`;
                          const valor = seleccionGlobal[key];
                          const desdeSupabase = datosSupabase.find(
                            (d) => d.area === area.id && d.semana_id === s.id && d.item_id === item.id
                          );
                          const valorMostrar = valor || (desdeSupabase ? desdeSupabase.valor : '');
                          return (
                            <td key={s.id} className="opciones-cell">
                              <div className="opciones">
                                <button
                                  className={`opcion-btn cumple ${valorMostrar === 'cumple' ? 'selected' : ''}`}
                                  onClick={() => handleOpcionChange(area.id, s.id, item.id, 'cumple')}
                                  title="Cumple"
                                >
                                  C
                                </button>
                                <button
                                  className={`opcion-btn no-cumple ${valorMostrar === 'no-cumple' ? 'selected' : ''}`}
                                  onClick={() => handleOpcionChange(area.id, s.id, item.id, 'no-cumple')}
                                  title="No Cumple"
                                >
                                  NC
                                </button>
                                <button
                                  className={`opcion-btn no-aplica ${valorMostrar === 'no-aplica' ? 'selected' : ''}`}
                                  onClick={() => handleOpcionChange(area.id, s.id, item.id, 'no-aplica')}
                                  title="No Aplica"
                                >
                                  NA
                                </button>
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
        ))}
      </div>
    </div>
  );
}

export default Dashboard;