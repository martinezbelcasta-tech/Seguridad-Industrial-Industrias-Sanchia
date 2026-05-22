import { useState, useEffect } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { supabase } from '../lib/supabase';
import './RegistroAnalisisIAT.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function RegistroAnalisisIAT({ lista = [], onActualizar }) {
  const [expediente, setExpediente] = useState(null);
  const [registros, setRegistros] = useState(lista);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setRegistros(lista);
  }, [lista]);

  useEffect(() => {
    const obtenerRegistros = async () => {
      const { data, error } = await supabase
        .from('analisis_iat')
        .select('*')
        .order('fecha_registro', { ascending: false });

      if (data) {
        setRegistros(data);
      }
      if (error) {
        console.error('Error al cargar registros:', error);
      }
    };

    obtenerRegistros();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setExpediente(prev => ({ ...prev, [name]: value }));
  };

const handleSeleccioneChange = (categoria, valor) => {
    setExpediente(prev => {
      if (!prev) return prev;
      const actuales = prev.selections?.[categoria] || [];
      const nuevas = actuales.includes(valor)
        ? actuales.filter(item => item !== valor)
        : [...actuales, valor];

      return {
        ...prev,
        selections: {
          ...(prev.selections || {}),
          [categoria]: nuevas
        }
      };
    });
  };

const handlePlanAccionChange = (index, field, value) => {
    setExpediente(prev => {
      const newPlan = [...(prev.plan_accion || [])];
      newPlan[index] = { ...newPlan[index], [field]: value };
      return { ...prev, plan_accion: newPlan };
    });
  };

  const handleAgregarFilaPlan = () => {
    setExpediente(prev => ({
      ...prev,
      plan_accion: [...(prev.plan_accion || []), { causa: '', que: '', porQue: '', donde: '', quien: '', cuando: '', como: '', costo: '', status: 'INICIO FUTURO' }]
    }));
  };

  const handleEliminarFilaPlan = (index) => {
    setExpediente(prev => ({
      ...prev,
      plan_accion: (prev.plan_accion || []).filter((_, i) => i !== index)
    }));
  };

const handleActualizarRegistro = async () => {
    const { error } = await supabase
      .from('analisis_iat')
      .update({
        ...expediente,
        selections: expediente.selections,
        plan_accion: expediente.plan_accion
      })
      .eq('fecha_registro', expediente.fecha_registro);

    if (error) {
      console.error('Error al actualizar en Supabase:', error);
      return;
    }

    setRegistros(prev => prev.map(r => r.fecha_registro === expediente.fecha_registro ? expediente : r));
    alert('Expediente actualizado con exito!');
    setExpediente(null);
  };

  const dataIAT = {
    PP: {
      tipo: ["Personas", "Medio Ambiente", "Propiedad"],
      severidad: ["Grave (Pérdida de vida, Incapacidad permanente...)", "Moderada (Pérdida de tiempo, No incapacidad...)", "Leve (Lesión menor sin pérdida de tiempo...)"],
      probabilidad: ["Alta (A diario)", "Media (En la semana)", "Baja (En el mes)"],
      frecuencia: ["Alta", "Media", "Baja"]
    },
    TC: [
      "Golpeado contra", "Golpeado por", "Caída a un nivel bajo", "Caída al mismo nivel",
      "Atrapado por puntos filosos", "Atrapado en", "Atrapado entre o debajo",
      "Contacto con (electricidad, calor, sustancias)", "Sobretension", "Falla del equipo", "Derrame / escape"
    ],
    CI: {
      actosSubestandar: ["Manejo de equipo sin autorización", "Falta de advertencias", "Falta de asegurar", "Manejo a velocidad inadecuada", "Hacer inoperables los instrumentos", "Uso de equipo defectuoso", "Uso inapropiado de EPP", "Carga inadecuada", "Almacenamiento inadecuado", "Levantamiento inadecuado", "Posición de tarea inadecuada", "Mantenimiento de equipo en operación", "Bromas", "Bajo influencia alcohol/drogas", "Uso inapropiado del equipo", "No seguir procedimiento"],
      condicionesSubestandar: ["Protecciones y barreras inadecuadas", "EPP inadecuado o impropio", "Herramienta equipo o material defectuoso", "Congestion o accion restringida", "Sistema de advertencia inadecuada", "Peligro de explosion o incendio", "Desorden/Aseo deficiente", "Exposiciones a ruido", "Exposiciones a Radiacion", "Exposicion a temperaturas extremas", "Iluminacion inadecuada", "Ventilacion inadecuada", "Condiciones ambientales peligrosas"]
    },
    CB: {
      factoresPersonales: ["Capacitacion deficiente", "Falta de experiencia", "Falla en la planificacion", "Falta de autorizacion", "Falla en la supervision", "Falla en el control", "Falla en la comunicacion", "Falla en la coordinacion", "Falla en la inspeccion", "Falla en el mantenimiento", "Falla en la investigacion", "Falla en el analisis"],
      factoresTrabajo: ["EPP inadecuado", "Herramientas inadecuadas", "Equipo inadecuado", "Proceso inadecuado", "Procedimiento inadecuado", "Materiales inadecuados", "Herramientas defectuosas", "Equipo defectuoso", "Falta de supervision", "Falta de mantenimiento", "Falta de inspeccion", "Falta de investigacion"]
    }
  };

  const statusColors = {
    'CONCLUIDA': '#d4edda',
    'EN PROCESO': '#fff3cd',
    'ATRASADA': '#f8d7da',
    'INICIO FUTURO': '#cce5ff',
    'CANCELADA': '#e2e3e5'
  };

  const columnsPlan = [
    { key: 'causa', label: 'Causa Raizal' },
    { key: 'que', label: 'Que (Accion)' },
    { key: 'porQue', label: 'Por Que' },
    { key: 'donde', label: 'Donde' },
    { key: 'quien', label: 'Quien' },
    { key: 'cuando', label: 'Cuando' },
    { key: 'como', label: 'Como' },
    { key: 'costo', label: 'Costo' },
    { key: 'status', label: 'Status' }
  ];

const calcularGrafico = () => {
    if (!expediente) return null;
    const PP = expediente.selections?.PP || [];
    const TC = expediente.selections?.TC || [];
    const CI = expediente.selections?.CI || [];
    const CB = expediente.selections?.CB || [];
    const datos = [
      (PP.filter(s => dataIAT.PP.tipo.includes(s)).length * 10) +
      (PP.filter(s => dataIAT.PP.severidad.includes(s)).length * 8) +
      (PP.filter(s => dataIAT.PP.probabilidad.includes(s)).length * 6) +
      (PP.filter(s => dataIAT.PP.frecuencia.includes(s)).length * 4),
      (TC.filter(s => dataIAT.TC.includes(s)).length * 12),
      (CI.filter(s => (dataIAT.CI.actosSubestandar || []).includes(s)).length * 10) +
      (CI.filter(s => (dataIAT.CI.condicionesSubestandar || []).includes(s)).length * 10),
      (CB.filter(s => (dataIAT.CB.factoresPersonales || []).includes(s)).length * 8) +
      (CB.filter(s => (dataIAT.CB.factoresTrabajo || []).includes(s)).length * 8)
    ];
    return {
      labels: ['PP', 'TC', 'CI', 'CB'],
      datasets: [{
        label: 'Niveles de Riesgo',
        data: datos,
        backgroundColor: ['#e74c3c', '#f39c12', '#9b59b6', '#3498db']
      }]
    };
  };

  if (expediente) {
    return (
      <div className="registro-container">
        <div className="registro-header">
          <h1>Editar Expediente</h1>
          <p>Modificando analisis de: {expediente.nombre_completo || 'Sin nombre'}</p>
        </div>
        <div className="registro-content">
          <button onClick={() => setExpediente(null)} className="btn-volver">
            Volver a la lista
          </button>

          <div className="expediente-form">
            <div className="form-section">
              <h2>Paso 1: Datos del Accidentado</h2>
              <div className="form-grid-2">
                <div className="form-group">
                  <label>Fecha del Accidente</label>
                  <input type="date" name="fecha_accidente" value={expediente.fecha_accidente || ''} onChange={handleInputChange} />
                </div>
                <div className="form-group">
                  <label>Hora del Accidente</label>
                  <input type="time" name="hora_accidente" value={expediente.hora_accidente || ''} onChange={handleInputChange} />
                </div>
                <div className="form-group">
                  <label>Nombre Completo</label>
                  <input type="text" name="nombre_completo" value={expediente.nombre_completo || ''} onChange={handleInputChange} />
                </div>
                <div className="form-group">
                  <label>Fecha de Nacimiento</label>
                  <input type="date" name="fecha_nacimiento" value={expediente.fecha_nacimiento || ''} onChange={handleInputChange} />
                </div>
                <div className="form-group">
                  <label>Numero DUI</label>
                  <input type="text" name="numero_dui" value={expediente.numero_dui || ''} onChange={handleInputChange} />
                </div>
                <div className="form-group">
                  <label>Telefono</label>
                  <input type="text" name="telefono" value={expediente.telefono || ''} onChange={handleInputChange} />
                </div>
                <div className="form-group">
                  <label>Cargo</label>
                  <input type="text" name="cargo" value={expediente.cargo || ''} onChange={handleInputChange} />
                </div>
                <div className="form-group">
                  <label>Antiguedad en la Empresa</label>
                  <input type="text" name="antiguedad_empresa" value={expediente.antiguedad_empresa || ''} onChange={handleInputChange} />
                </div>
                <div className="form-group">
                  <label>Experiencia en el Cargo</label>
                  <input type="text" name="experiencia_cargo" value={expediente.experiencia_cargo || ''} onChange={handleInputChange} />
                </div>
                <div className="form-group">
                  <label>Jefe Inmediato</label>
                  <input type="text" name="jefe_inmediato" value={expediente.jefe_inmediato || ''} onChange={handleInputChange} />
                </div>
                <div className="form-group full-width">
                  <label>Lugar Exacto</label>
                  <input type="text" name="lugar_exacto" value={expediente.lugar_exacto || ''} onChange={handleInputChange} />
                </div>
                <div className="form-group full-width">
                  <label>Actividad que Desempenaba</label>
                  <textarea name="actividad_desempenaba" value={expediente.actividad_desempenaba || ''} onChange={handleInputChange} rows="3" />
                </div>
                <div className="form-group full-width">
                  <label>Herramientas de Trabajo</label>
                  <textarea name="herramientas_trabajo" value={expediente.herramientas_trabajo || ''} onChange={handleInputChange} rows="2" />
                </div>
                <div className="form-group full-width">
                  <label>Reconstruccion de los Hechos</label>
                  <textarea name="reconstruccion_hechos" value={expediente.reconstruccion_hechos || ''} onChange={handleInputChange} rows="4" />
                </div>
                <div className="form-group full-width">
                  <label>Nombre del Testigo</label>
                  <input type="text" name="nombre_testigo" value={expediente.nombre_testigo || ''} onChange={handleInputChange} />
                </div>
                <div className="form-group full-width">
                  <label>Version del Testigo</label>
                  <textarea name="version_testigo" value={expediente.version_testigo || ''} onChange={handleInputChange} rows="3" />
                </div>
              </div>
            </div>

            <div className="form-section">
              <h2>Paso 2: Analisis de Causas (IAT)</h2>
              <div className="chart-container">
                <Bar data={calcularGrafico() || { labels: [], datasets: [] }} options={{ responsive: true, maintainAspectRatio: true }} />
              </div>
            </div>

            <div className="form-section">
              <h2>Paso 3: Seleccion de Causas</h2>
              <div className="seleccion-grid">
                <div className="seleccion-card">
                  <h3>Proximidad Potencial (PP)</h3>
                  <div className="seleccion-group">
                    <h4>Tipo</h4>
                    {dataIAT.PP.tipo.map(t => (
                      <label key={t} className="checkbox-label">
                        <input type="checkbox" checked={(expediente.selections?.PP || []).includes(t)} onChange={() => handleSeleccioneChange('PP', t)} />
                        {t}
                      </label>
                    ))}
                    <h4>Severidad</h4>
                    {dataIAT.PP.severidad.map(s => (
                      <label key={s} className="checkbox-label">
                        <input type="checkbox" checked={(expediente.selections?.PP || []).includes(s)} onChange={() => handleSeleccioneChange('PP', s)} />
                        {s}
                      </label>
                    ))}
                    <h4>Probabilidad</h4>
                    {dataIAT.PP.probabilidad.map(p => (
                      <label key={p} className="checkbox-label">
                        <input type="checkbox" checked={(expediente.selections?.PP || []).includes(p)} onChange={() => handleSeleccioneChange('PP', p)} />
                        {p}
                      </label>
                    ))}
                    <h4>Frecuencia</h4>
                    {dataIAT.PP.frecuencia.map(f => (
                      <label key={f} className="checkbox-label">
                        <input type="checkbox" checked={(expediente.selections?.PP || []).includes(f)} onChange={() => handleSeleccioneChange('PP', f)} />
                        {f}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="seleccion-card">
                  <h3>Tipo de Causa (TC)</h3>
                  <div className="seleccion-group">
                    {dataIAT.TC.map(t => (
                      <label key={t} className="checkbox-label">
                        <input type="checkbox" checked={(expediente.selections?.TC || []).includes(t)} onChange={() => handleSeleccioneChange('TC', t)} />
                        {t}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="seleccion-card">
                  <h3>Condiciones Inseguras (CI)</h3>
                  <div className="seleccion-group">
                    <h4>Actos Subestandar</h4>
                    {(dataIAT.CI.actosSubestandar || []).map(a => (
                      <label key={a} className="checkbox-label">
                        <input type="checkbox" checked={(expediente.selections?.CI || []).includes(a)} onChange={() => handleSeleccioneChange('CI', a)} />
                        {a}
                      </label>
                    ))}
                    <h4>Condiciones Subestandar</h4>
                    {(dataIAT.CI.condicionesSubestandar || []).map(c => (
                      <label key={c} className="checkbox-label">
                        <input type="checkbox" checked={(expediente.selections?.CI || []).includes(c)} onChange={() => handleSeleccioneChange('CI', c)} />
                        {c}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="seleccion-card">
                  <h3>Creacion de Barreras (CB)</h3>
                  <div className="seleccion-group">
                    <h4>Factores Personales</h4>
                    {(dataIAT.CB.factoresPersonales || []).map(fp => (
                      <label key={fp} className="checkbox-label">
                        <input type="checkbox" checked={(expediente.selections?.CB || []).includes(fp)} onChange={() => handleSeleccioneChange('CB', fp)} />
                        {fp}
                      </label>
                    ))}
                    <h4>Factores del Trabajo</h4>
                    {(dataIAT.CB.factoresTrabajo || []).map(ft => (
                      <label key={ft} className="checkbox-label">
                        <input type="checkbox" checked={(expediente.selections?.CB || []).includes(ft)} onChange={() => handleSeleccioneChange('CB', ft)} />
                        {ft}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="form-section">
              <h2>Paso 4: Plan de Accion 5W2H</h2>
              <button onClick={handleAgregarFilaPlan} className="btn-agregar-fila">+ Agregar Fila</button>
              <div className="table-container">
                <table className="tabla-plan">
                  <thead>
                    <tr>
                      {columnsPlan.map(col => <th key={col.key}>{col.label}</th>)}
                      <th>Accion</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(expediente.plan_accion || []).map((fila, index) => (
                      <tr key={index}>
                        {columnsPlan.map(col => (
                          <td key={col.key}>
                            {col.key === 'status' ? (
                              <select value={fila.status || 'INICIO FUTURO'} onChange={e => handlePlanAccionChange(index, col.key, e.target.value)} style={{ backgroundColor: statusColors[fila.status] || '#fff' }}>
                                <option value="CONCLUIDA">CONCLUIDA</option>
                                <option value="EN PROCESO">EN PROCESO</option>
                                <option value="ATRASADA">ATRASADA</option>
                                <option value="INICIO FUTURO">INICIO FUTURO</option>
                                <option value="CANCELADA">CANCELADA</option>
                              </select>
                            ) : (
                              <input type="text" value={fila[col.key] || ''} onChange={e => handlePlanAccionChange(index, col.key, e.target.value)} />
                            )}
                          </td>
                        ))}
                        <td>
                          <button onClick={() => handleEliminarFilaPlan(index)} className="btn-eliminar-fila">X</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <button onClick={handleActualizarRegistro} className="btn-actualizar">
              Actualizar Cambios del Expediente
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="registro-container">
      <div className="registro-header">
        <h1>Registros de Analisis IAT</h1>
        <p>Historico de analisis de accidentes - Industrias Sanchia</p>
      </div>
      <div className="registro-content">
        <div className="search-container">
          <input
            type="text"
            placeholder="Buscar por nombre, DUI, area o cualquier dato..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          {searchTerm && (
            <button className="btn-clear-search" onClick={() => setSearchTerm('')}>X</button>
          )}
        </div>
        {registros.length === 0 ? (
          <p className="mensaje-vacio">No hay analisis registrados aun.</p>
        ) : (
          <table className="tabla-registros">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Nombre del Afectado</th>
                <th>Area</th>
                <th>Accion</th>
              </tr>
            </thead>
            <tbody>
              {registros.filter(r =>
                !searchTerm ||
                (r.nombre_completo || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (r.numero_dui || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (r.lugar_exacto || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (r.cargo || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (r.jefe_inmediato || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (r.fecha_accidente || '').includes(searchTerm)
              ).map((registro, index) => (
                <tr key={index}>
                  <td>{registro.fecha_accidente || '-'}</td>
                  <td>{registro.nombre_completo || '-'}</td>
                  <td>{registro.lugar_exacto || '-'}</td>
                  <td>
                    <button className="btn-ver" onClick={() => setExpediente(registro)}>Ver Expediente</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default RegistroAnalisisIAT;
