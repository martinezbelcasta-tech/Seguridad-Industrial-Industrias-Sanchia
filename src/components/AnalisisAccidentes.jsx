import { useState, Fragment } from 'react';
import { supabaseSeguridad, subirEvidenciaFoto } from '../lib/supabaseSeguridadClient';
import { dataIAT } from '../data/iatData';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import './AnalisisAccidentes.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const PASOS = [
  { id: 1, titulo: 'Fenómeno', icon: <><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></> },
  { id: 2, titulo: 'PP - TC - CI - CB', icon: <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></> },
  { id: 3, titulo: 'Gráfico', icon: <><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></> },
  { id: 4, titulo: 'Plan de Acción', icon: <><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></> },
];

const MOCK_IAT = [
  { id: 1, fecha_accidente: '2026-05-20', nombre_completo: 'Luis Peralta', cargo: 'Operador de Ensamble', lugar_exacto: 'Área de ensamble, línea 3', reconstruccion_hechos: 'El operador estaba moviendo una tarima cuando esta cayó sobre su rodilla izquierda.', estado: 'Completado' },
  { id: 2, fecha_accidente: '2026-05-28', nombre_completo: 'Carlos Méndez', cargo: 'Operador de Máquinas', lugar_exacto: 'Área de máquinas, máquina #7', reconstruccion_hechos: 'El operador sufrió un corte al retirar rebaba sin usar guantes de protección.', estado: 'En proceso' },
];

const statusColors = {
  'CONCLUIDA': '#d4edda',
  'EN PROCESO': '#fff3cd',
  'ATRASADA': '#f8d7da',
  'INICIO FUTURO': '#cce5ff',
  'CANCELADA': '#e2e3e5'
};

const columnasTabla = [
  { key: 'causa', label: 'Causa Raizal' },
  { key: 'que', label: 'Qué (Acción)' },
  { key: 'porQue', label: 'Por Qué' },
  { key: 'quien', label: 'Quién' },
  { key: 'como', label: 'Cómo' },
  { key: 'cuando', label: 'Cuándo' },
  { key: 'donde', label: 'Dónde' },
  { key: 'control', label: 'Control' },
  { key: 'status', label: 'Status' }
];

function AnalisisAccidentes({ onGuardarAnalisis }) {
  // Estados de diseño y navegación
  const [showForm, setShowForm] = useState(false);
  const [paso, setPaso] = useState(1);
  const [lista, setLista] = useState(MOCK_IAT);

  // Estados de datos
  const [formData, setFormData] = useState({
    fecha_accidente: '', hora_accidente: '', nombre_completo: '', fecha_nacimiento: '',
    numero_dui: '', telefono: '', cargo: '', antiguedad_empresa: '', experiencia_cargo: '',
    jefe_inmediato: '', lugar_exacto: '', actividad_desempenaba: '', horario_trabajo: '',
    materia_equipo_herramienta: '', parte_cuerpo_afectada: '', detalle_incapacidad: '',
    evidencias_fotos: '', herramientas_trabajo: '', sujeccion: '', reconstruccion_hechos: '',
    version_accidentado: '', nombre_testigo: '', version_testigo: ''
  });
  const [seleccione, setSeleccione] = useState({ PP: [], TC: [], CI: [], CB: [] });
  const [planAccion, setPlanAccion] = useState([]);
  
  // Estados de control
  const [fotoPreview, setFotoPreview] = useState(null);
  const [fotoArchivo, setFotoArchivo] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState(null);
  const [planGuardado, setPlanGuardado] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheck = (categoria, valor) => {
    setSeleccione(prev => {
      const actuales = prev[categoria] || [];
      if (actuales.includes(valor)) {
        return { ...prev, [categoria]: actuales.filter(item => item !== valor) };
      } else {
        return { ...prev, [categoria]: [...actuales, valor] };
      }
    });
  };

  const renderCheckbox = (valor, categoria) => {
    const checked = seleccione[categoria]?.includes(valor) || false;
    const checkboxId = `${categoria}-${valor}`.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_-]/g, '');
    return (
      <label key={valor} className="checkbox-item" htmlFor={checkboxId}>
        <input type="checkbox" id={checkboxId} checked={checked} onChange={() => handleCheck(categoria, valor)} />
        <span className="checkbox-label">{valor}</span>
      </label>
    );
  };

  const agregarFila = () => {
    setPlanAccion(prev => [...prev, { causa: '', que: '', porQue: '', quien: '', como: '', cuando: '', donde: '', control: '', status: 'EN PROCESO' }]);
  };

  const actualizarFila = (idx, campo, valor) => {
    setPlanAccion(prev => {
      const nuevo = [...prev];
      nuevo[idx] = { ...nuevo[idx], [campo]: valor };
      return nuevo;
    });
  };

  const handleGuardarTodo = async (e) => {
    e.preventDefault();
    setGuardando(true);
    setMensaje(null);

    let evidenciasUrl = formData.evidencias_fotos;
    if (fotoArchivo) {
      try {
        evidenciasUrl = await subirEvidenciaFoto(fotoArchivo);
      } catch (e) {
        setMensaje({ tipo: 'error', texto: 'Error al subir la foto: ' + e.message });
        setGuardando(false);
        return;
      }
    }

    const registroCompleto = {
      fecha_accidente: formData.fecha_accidente,
      hora_accidente: formData.hora_accidente,
      nombre_completo: formData.nombre_completo,
      fecha_nacimiento: formData.fecha_nacimiento,
      numero_dui: formData.numero_dui,
      telefono: formData.telefono,
      cargo_desempena: formData.cargo,
      antiguedad_empresa: formData.antiguedad_empresa,
      experiencia_cargo: formData.experiencia_cargo,
      jefe_inmediato: formData.jefe_inmediato,
      lugar_exacto: formData.lugar_exacto,
      actividad_desempenaba: formData.actividad_desempenaba,
      horario_trabajo: formData.horario_trabajo,
      materia_equipo_herramienta: formData.materia_equipo_herramienta,
      parte_cuerpo_afectada: formData.parte_cuerpo_afectada,
      detalle_incapacidad: formData.detalle_incapacidad,
      evidencias_fotograficas: evidenciasUrl,
      herramientas_trabajo: formData.herramientas_trabajo,
      sujecion: formData.sujeccion,
      reconstruccion_hechos: formData.reconstruccion_hechos,
      version_accidentado: formData.version_accidentado,
      nombre_testigo: formData.nombre_testigo,
      version_testigo: formData.version_testigo,
      selections: seleccione,
      plan_accion: planAccion,
      fecha_registro: new Date().toISOString()
    };

    try {
      const { data, error } = await supabaseSeguridad.from('analisis_iat').insert([registroCompleto]).select();

      if (error) {
        setMensaje({ tipo: 'error', texto: 'Error al guardar en Supabase: ' + error.message });
        setGuardando(false);
        return;
      }

      const nuevoRegistro = { id: Date.now(), ...formData, estado: 'Completado' };
      setLista(p => [nuevoRegistro, ...p]);

      if (onGuardarAnalisis) onGuardarAnalisis(data?.[0] || registroCompleto);

      setFormData({
        fecha_accidente: '', hora_accidente: '', nombre_completo: '', fecha_nacimiento: '',
        numero_dui: '', telefono: '', cargo: '', antiguedad_empresa: '', experiencia_cargo: '',
        jefe_inmediato: '', lugar_exacto: '', actividad_desempenaba: '', horario_trabajo: '',
        materia_equipo_herramienta: '', parte_cuerpo_afectada: '', detalle_incapacidad: '',
        evidencias_fotos: '', herramientas_trabajo: '', sujeccion: '', reconstruccion_hechos: '',
        version_accidentado: '', nombre_testigo: '', version_testigo: ''
      });
      setSeleccione({ PP: [], TC: [], CI: [], CB: [] });
      setPlanAccion([]);
      setFotoPreview(null);
      setFotoArchivo(null);
      setPlanGuardado(false);
      setPaso(1);
      setShowForm(false);
      
      alert('¡Análisis IAT guardado con éxito!');

    } catch (e) {
      setMensaje({ tipo: 'error', texto: 'Error: ' + e.message });
    }
    
    setGuardando(false);
    setTimeout(() => setMensaje(null), 5000);
  };

  const renderContenidoPaso1 = () => (
    <div className="analisis-form">
      <div className="card-grid">
        <div className="form-card datos-accidente">
          <h2>Datos del Accidente</h2>
          <div className="form-grid-2">
            <div className="form-group"><label>Fecha del Accidente *</label><input type="date" name="fecha_accidente" value={formData.fecha_accidente} onChange={handleChange} required /></div>
            <div className="form-group"><label>Hora del Accidente</label><input type="time" name="hora_accidente" value={formData.hora_accidente} onChange={handleChange} /></div>
          </div>
        </div>

        <div className="form-card datos-personal">
          <h2>Datos del Personal</h2>
          <div className="form-grid-3">
            <div className="form-group full-width"><label>Nombre Completo *</label><input type="text" name="nombre_completo" value={formData.nombre_completo} onChange={handleChange} placeholder="Nombre y apellidos" required /></div>
            <div className="form-group"><label>Fecha de Nacimiento</label><input type="date" name="fecha_nacimiento" value={formData.fecha_nacimiento} onChange={handleChange} /></div>
            <div className="form-group"><label>Número de DUI</label><input type="text" name="numero_dui" value={formData.numero_dui} onChange={handleChange} placeholder="00000000-0" /></div>
            <div className="form-group"><label>Teléfono</label><input type="tel" name="telefono" value={formData.telefono} onChange={handleChange} placeholder="0000-0000" /></div>
            <div className="form-group"><label>Cargo que Desempeña</label><input type="text" name="cargo" value={formData.cargo} onChange={handleChange} /></div>
            <div className="form-group"><label>Antigüedad en la Empresa</label><input type="text" name="antiguedad_empresa" value={formData.antiguedad_empresa} onChange={handleChange} placeholder="Años/Meses" /></div>
            <div className="form-group"><label>Experiencia en el Cargo</label><input type="text" name="experiencia_cargo" value={formData.experiencia_cargo} onChange={handleChange} placeholder="Años/Meses" /></div>
            <div className="form-group"><label>Jefe Inmediato del Área</label><input type="text" name="jefe_inmediato" value={formData.jefe_inmediato} onChange={handleChange} /></div>
          </div>
        </div>

        <div className="form-card sitio-accidente">
          <h2>Sitio del Accidente</h2>
          <div className="form-grid-3">
            <div className="form-group full-width"><label>Lugar Exacto (Área/ Sección)</label><input type="text" name="lugar_exacto" value={formData.lugar_exacto} onChange={handleChange} placeholder="Descripción detallada del lugar" /></div>
            <div className="form-group full-width"><label>Actividad que Desempeñaba en el Momento</label><textarea name="actividad_desempenaba" value={formData.actividad_desempenaba} onChange={handleChange} placeholder="Describe qué estaba haciendo el trabajador" rows="2" /></div>
            <div className="form-group">
              <label>Horario de Trabajo</label>
              <select name="horario_trabajo" value={formData.horario_trabajo} onChange={handleChange}>
                <option value="">Seleccionar</option>
                <option value="7am a 4pm">de 7am a 4pm</option>
                <option value="6am a 5pm">de 6am a 5pm</option>
                <option value="5pm a 6am">de 5pm a 6am</option>
              </select>
            </div>
          </div>
        </div>

        <div className="form-card tipo-lesion">
          <h2>Tipo de Lesión</h2>
          <div className="form-grid-3">
            <div className="form-group full-width"><label>Materia, Equipo o Herramienta que Causó la Lesión</label><textarea name="materia_equipo_herramienta" value={formData.materia_equipo_herramienta} onChange={handleChange} placeholder="Describe el objeto o sustancia involucrada" rows="2" /></div>
            <div className="form-group full-width"><label>Parte del Cuerpo Afectada</label><textarea name="parte_cuerpo_afectada" value={formData.parte_cuerpo_afectada} onChange={handleChange} placeholder="Ej: Mano derecha, Pie izquierdo, etc." rows="2" /></div>
            <div className="form-group full-width"><label>Detalle de la Incapacidad (Días o Tipo)</label><textarea name="detalle_incapacidad" value={formData.detalle_incapacidad} onChange={handleChange} placeholder="Número de días de incapacidad o tipo de limitación" rows="2" /></div>
          </div>
        </div>

        <div className="form-card evidencias-herramientas">
          <h2>Evidencias y Herramientas</h2>
          <div className="form-grid-3">
            <div className="form-group full-width">
              <label>Evidencias Fotográficas</label>
              <div className="file-upload-container">
                <input type="file" id="evidencias_fotos" accept="image/*" onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    setFotoPreview(URL.createObjectURL(file));
                    setFotoArchivo(file);
                    setFormData(prev => ({ ...prev, evidencias_fotos: file.name }));
                  }
                }} className="file-input" />
                <label htmlFor="evidencias_fotos" className="file-label">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                  <span>Subir foto</span>
                </label>
                {fotoPreview && (
                  <div className="preview-container">
                    <img src={fotoPreview} alt="Preview" className="preview-image" />
                    <button type="button" className="preview-remove" onClick={() => { setFotoPreview(null); setFotoArchivo(null); setFormData(prev => ({ ...prev, evidencias_fotos: '' })); }}>×</button>
                  </div>
                )}
              </div>
            </div>
            <div className="form-group full-width"><label>Herramientas de Trabajo</label><textarea name="herramientas_trabajo" value={formData.herramientas_trabajo} onChange={handleChange} placeholder="Detalle las herramientas o equipo usado en la actividad" rows="3" /></div>
            <div className="form-group full-width"><label>Sujeción</label><textarea name="sujeccion" value={formData.sujeccion} onChange={handleChange} placeholder="Detalle la forma en que se realizó la sujeción" rows="3" /></div>
          </div>
        </div>

        <div className="form-card relato-hechos">
          <h2>Relato de los Hechos</h2>
          <div className="form-grid-2-cols">
            <div className="form-group full-width"><label>Reconstrucción de los Hechos</label><textarea name="reconstruccion_hechos" value={formData.reconstruccion_hechos} onChange={handleChange} placeholder="Describa la secuencia de eventos que condujeron al accidente" rows="5" /></div>
            <div className="form-group full-width"><label>Versión del Accidentado</label><textarea name="version_accidentado" value={formData.version_accidentado} onChange={handleChange} placeholder="Versión detallada de la persona afectada sobre lo ocurrido" rows="5" /></div>
          </div>
        </div>

        <div className="form-card testigos">
          <h2>Testigos</h2>
          <div className="form-grid-2-cols">
            <div className="form-group full-width"><label>Nombre del Testigo</label><input type="text" name="nombre_testigo" value={formData.nombre_testigo} onChange={handleChange} placeholder="Nombre completo del testigo" /></div>
            <div className="form-group full-width"><label>Versión del Testigo</label><textarea name="version_testigo" value={formData.version_testigo} onChange={handleChange} placeholder="Relato de lo que presenció el testigo" rows="5" /></div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContenidoPaso2 = () => (
    <div className="paso2-grid">
      <div className="form-card pp-card">
        <h2>Evaluacion del Potencial de Perdida (PP)</h2>
        <div className="pp-subsections">
          <div className="pp-subsection"><h3>Tipo</h3><div className="checkbox-grid">{dataIAT.PP.tipo.map(v => renderCheckbox(v, 'PP'))}</div></div>
          <div className="pp-subsection"><h3>Severidad</h3><div className="checkbox-grid">{dataIAT.PP.severidad.map(v => renderCheckbox(v, 'PP'))}</div></div>
          <div className="pp-subsection"><h3>Probabilidad</h3><div className="checkbox-grid">{dataIAT.PP.probabilidad.map(v => renderCheckbox(v, 'PP'))}</div></div>
          <div className="pp-subsection"><h3>Frecuencia</h3><div className="checkbox-grid">{dataIAT.PP.frecuencia.map(v => renderCheckbox(v, 'PP'))}</div></div>
        </div>
      </div>

      <div className="form-card tc-card">
        <h2>Tipo de Contacto (TC)</h2>
        <div className="checkbox-grid tc-grid">{dataIAT.TC.map(v => renderCheckbox(v, 'TC'))}</div>
      </div>

      <div className="form-card ci-card">
        <h2>Causas Inmediatas (CI)</h2>
        <div className="ci-columns">
          <div className="ci-column"><h3>Actos Estandar</h3><div className="checkbox-list">{dataIAT.CI.actosSubestandar.map(v => renderCheckbox(v, 'CI'))}</div></div>
          <div className="ci-column"><h3>Condiciones Estandar</h3><div className="checkbox-list">{dataIAT.CI.condicionesSubestandar.map(v => renderCheckbox(v, 'CI'))}</div></div>
        </div>
      </div>

      <div className="form-card cb-card">
        <h2>Causas Basicas (CB)</h2>
        <div className="cb-main-columns">
          <div className="cb-column">
            <h3>Factores Personales</h3>
            {Object.entries(dataIAT.CB.factoresPersonales).map(([cat, items]) => (
              <div key={cat} className="cb-categoria"><h4>{cat}</h4><div className="checkbox-grid cb-grid">{items.map(v => renderCheckbox(v, 'CB'))}</div></div>
            ))}
          </div>
          <div className="cb-column">
            <h3>Factores del Trabajo</h3>
            {Object.entries(dataIAT.CB.factoresTrabajo).map(([cat, items]) => (
              <div key={cat} className="cb-categoria"><h4>{cat}</h4><div className="checkbox-grid cb-grid">{items.map(v => renderCheckbox(v, 'CB'))}</div></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderContenidoPaso3 = () => {
    const ppCount = Array.isArray(seleccione.PP) ? seleccione.PP.length : 0;
    const tcCount = Array.isArray(seleccione.TC) ? seleccione.TC.length : 0;
    const ciCount = Array.isArray(seleccione.CI) ? seleccione.CI.length : 0;
    const cbCount = Array.isArray(seleccione.CB) ? seleccione.CB.length : 0;

    const perfilRiesgo = ppCount > 0 ? seleccione.PP[0].split(' ')[0] : 'Sin datos';
    const colorPerfil = perfilRiesgo === 'Grave' ? '#e74c3c' : perfilRiesgo === 'Moderada' ? '#f39c12' : perfilRiesgo === 'Leve' ? '#27ae60' : '#7f8c8d';

    const chartData = {
      labels: ['PP (Potencial)', 'TC (Contacto)', 'CI (Inmediatas)', 'CB (Basicas)'],
      datasets: [{
        label: 'Selecciones',
        data: [ppCount, tcCount, ciCount, cbCount],
        backgroundColor: ['#e74c3c', '#f39c12', '#9b59b6', '#1abc9c'],
        borderWidth: 2,
        borderRadius: 6
      }]
    };

    const chartOptions = {
      indexAxis: 'y', responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false }, title: { display: true, text: 'RESUMEN DE IMPACTO', font: { size: 16, weight: 'bold' }, color: '#1a1a1a' } },
      scales: { x: { beginAtZero: true, ticks: { font: { size: 13, weight: '600' }, color: '#34495e' }, grid: { color: '#ecf0f1' } }, y: { ticks: { font: { size: 14, weight: 'bold' }, color: '#1a1a1a' }, grid: { display: false } } }
    };

    return (
      <div className="paso3-grid">
        <div className="paso3-izquierda">
          <div className="indicador-card indicador-ci"><h3>Total Causas Inmediatas (CI)</h3><div className="indicador-numero">{ciCount}</div></div>
          <div className="indicador-card indicador-cb"><h3>Total Causas Basicas (CB)</h3><div className="indicador-numero">{cbCount}</div></div>
          <div className="indicador-card indicador-pp" style={{ borderLeftColor: colorPerfil }}><h3>Perfil de Riesgo (PP)</h3><div className="indicador-numero indicador-texto" style={{ color: colorPerfil }}>{perfilRiesgo}</div></div>
        </div>
        <div className="paso3-derecha">
          <div className="grafico-card"><Bar data={chartData} options={chartOptions} /></div>
          <div style={{ marginTop: '2rem' }}>
            <h3 style={{ fontSize: '1.4rem', marginBottom: '1rem' }}>Causas y Factores Detectados</h3>
            <div style={{ marginBottom: '1.5rem' }}><h4>PP (Potencial)</h4>{seleccione.PP?.length > 0 ? seleccione.PP.map((txt, i) => <div key={i} style={{ fontSize: '1.2rem', marginBottom: '0.3rem' }}>- {txt}</div>) : <p style={{ color: '#7f8c8d' }}>Ninguno seleccionado</p>}</div>
            <div style={{ marginBottom: '1.5rem' }}><h4>TC (Contacto)</h4>{seleccione.TC?.length > 0 ? seleccione.TC.map((txt, i) => <div key={i} style={{ fontSize: '1.2rem', marginBottom: '0.3rem' }}>- {txt}</div>) : <p style={{ color: '#7f8c8d' }}>Ninguno seleccionado</p>}</div>
            <div style={{ marginBottom: '1.5rem' }}><h4>CI (Inmediatas)</h4>{seleccione.CI?.length > 0 ? seleccione.CI.map((txt, i) => <div key={i} style={{ fontSize: '1.2rem', marginBottom: '0.3rem' }}>- {txt}</div>) : <p style={{ color: '#7f8c8d' }}>Ninguno seleccionado</p>}</div>
            <div style={{ marginBottom: '1.5rem' }}><h4>CB (Basicas)</h4>{seleccione.CB?.length > 0 ? seleccione.CB.map((txt, i) => <div key={i} style={{ fontSize: '1.2rem', marginBottom: '0.3rem' }}>- {txt}</div>) : <p style={{ color: '#7f8c8d' }}>Ninguno seleccionado</p>}</div>
          </div>
        </div>
      </div>
    );
  };

  const renderContenidoPaso4 = () => (
    <div style={{ padding: '1rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '2rem', color: '#1a1a1a' }}>Paso 4: PLAN DE ACCIÓN</h2>
        <p style={{ color: '#666', fontSize: '1.1rem' }}>Complete el siguiente plan de acción para las causas detectadas</p>
      </div>
      <button type="button" onClick={agregarFila} disabled={planGuardado} style={{ padding: '14px 28px', fontSize: '1.2rem', fontWeight: '700', backgroundColor: planGuardado ? '#ccc' : '#27ae60', color: 'white', border: 'none', borderRadius: '8px', cursor: planGuardado ? 'not-allowed' : 'pointer', marginBottom: '1.5rem' }}>
        {planGuardado ? 'Plan Bloqueado' : '+ Agregar Acción'}
      </button>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '1rem', backgroundColor: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', borderRadius: '8px' }}>
          <thead>
            <tr style={{ backgroundColor: '#34495e', color: 'white' }}>
              {columnasTabla.map(col => <th key={col.key} style={{ padding: '12px 8px', textAlign: 'left', fontSize: '0.9rem', borderBottom: '2px solid #2c3e50' }}>{col.label}</th>)}
            </tr>
          </thead>
          <tbody>
            {planAccion.map((fila, idx) => (
              <tr key={idx} style={{ backgroundColor: statusColors[fila.status] || '#ffffff' }}>
                {columnasTabla.map(col => (
                  <td key={col.key} style={{ padding: '8px', borderBottom: '1px solid #ecf0f1' }}>
                    {col.key === 'status' ? (
                      <select value={fila.status} onChange={e => actualizarFila(idx, 'status', e.target.value)} disabled={planGuardado} style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '0.95rem', backgroundColor: 'white' }}>
                        <option value="EN PROCESO">EN PROCESO</option>
                        <option value="CONCLUIDA">CONCLUIDA</option>
                        <option value="ATRASADA">ATRASADA</option>
                        <option value="INICIO FUTURO">INICIO FUTURO</option>
                        <option value="CANCELADA">CANCELADA</option>
                      </select>
                    ) : col.key === 'cuando' ? (
                      <input type="date" value={fila[col.key]} onChange={e => actualizarFila(idx, col.key, e.target.value)} disabled={planGuardado} style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '0.95rem' }} />
                    ) : (
                      <textarea value={fila[col.key]} onChange={e => actualizarFila(idx, col.key, e.target.value)} rows={2} disabled={planGuardado} style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '0.95rem', resize: 'vertical' }} />
                    )}
                  </td>
                ))}
              </tr>
            ))}
            {planAccion.length === 0 && <tr><td colSpan={9} style={{ textAlign: 'center', padding: '2rem', color: '#7f8c8d' }}>Presione "+ Agregar Acción" para crear una fila</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <button className="btn btn-primary" onClick={() => setShowForm(p => !p)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15">
            {showForm ? <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>
              : <><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></>}
          </svg>
          {showForm ? 'Cancelar' : 'Nuevo Análisis IAT'}
        </button>
        {mensaje && <div className={`msg msg-${mensaje.tipo}`}>{mensaje.texto}</div>}
      </div>

      {showForm && (
        <div className="card">
          <div className="card-header">
            <h2>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><path d="M3 3v18h18" /><path d="m7 16 4-4 4 4 4-4" /></svg>
              Análisis de Accidente (IAT)
            </h2>
            <span style={{ fontSize: 12, color: 'var(--tx-muted)' }}>Paso {paso} de {PASOS.length}</span>
          </div>

          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--card-bd)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 0, position: 'relative' }}>
              {PASOS.map((p, i) => {
                const done = paso > p.id;
                const active = paso === p.id;
                return (
                  <Fragment key={p.id}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flex: i < PASOS.length - 1 ? 0 : 'none', zIndex: 1 }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: '50%',
                        background: done ? 'var(--green)' : active ? 'var(--navy-800)' : '#e2e8f0',
                        border: `2px solid ${done ? 'var(--green)' : active ? 'var(--navy-800)' : '#e2e8f0'}`,
                        display: 'grid', placeItems: 'center',
                        color: done || active ? '#fff' : '#94a3b8',
                        transition: 'all 0.2s',
                      }}>
                        {done
                          ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="14" height="14"><polyline points="20 6 9 17 4 12" /></svg>
                          : <span style={{ fontSize: 12, fontWeight: 700 }}>{p.id}</span>
                        }
                      </div>
                      <span style={{ fontSize: 10.5, fontWeight: active ? 700 : 400, color: active ? 'var(--tx-heading)' : 'var(--tx-muted)', whiteSpace: 'nowrap', maxWidth: 90, textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {p.titulo}
                      </span>
                    </div>
                    {i < PASOS.length - 1 && (
                      <div style={{ flex: 1, height: 2, background: done ? 'var(--green)' : '#e2e8f0', margin: '0 4px', marginBottom: 22, transition: 'background 0.3s' }} />
                    )}
                  </Fragment>
                );
              })}
            </div>
          </div>

          <form onSubmit={handleGuardarTodo}>
            <div className="card-body">
              {paso === 1 && renderContenidoPaso1()}
              {paso === 2 && renderContenidoPaso2()}
              {paso === 3 && renderContenidoPaso3()}
              {paso === 4 && renderContenidoPaso4()}
            </div>

            <div style={{ padding: '0 20px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button type="button" className="btn btn-outline" onClick={() => setPaso(p => Math.max(1, p - 1))} disabled={paso === 1}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><path d="M19 12H5M12 5l-7 7 7 7" /></svg>
                Anterior
              </button>
              
              {paso < PASOS.length ? (
                <button type="button" className="btn btn-primary" onClick={() => setPaso(p => Math.min(PASOS.length, p + 1))}>
                  Siguiente
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><path d="M5 12h14M12 19l7-7-7-7" /></svg>
                </button>
              ) : (
                <div style={{ display: 'flex', gap: 10 }}>
                  {planGuardado && (
                    <button type="button" onClick={() => setPlanGuardado(false)} className="btn btn-outline" style={{ borderColor: '#ffc107', color: '#ffc107' }}>
                      Editar Plan
                    </button>
                  )}
                  <button type="submit" className="btn btn-gold btn-lg" disabled={guardando}>
                    {guardando ? 'Guardando…' : 'Guardar Análisis Completo'}
                  </button>
                </div>
              )}
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <h2>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><path d="M3 3v18h18" /><path d="m7 16 4-4 4 4 4-4" /></svg>
            Registros de Análisis IAT
          </h2>
          <span style={{ fontSize: 12, color: 'var(--tx-muted)' }}>{lista.length} análisis</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="tbl">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Empleado</th>
                <th>Cargo</th>
                <th>Lugar</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {lista.map(r => (
                <tr key={r.id}>
                  <td style={{ whiteSpace: 'nowrap', fontSize: 12.5 }}>
                    {r.fecha_accidente ? new Date(r.fecha_accidente + 'T12:00:00').toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                  </td>
                  <td style={{ fontWeight: 600 }}>{r.nombre_completo || '—'}</td>
                  <td style={{ fontSize: 12.5, color: 'var(--tx-muted)' }}>{r.cargo || '—'}</td>
                  <td style={{ fontSize: 12.5, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.lugar_exacto || '—'}</td>
                  <td>
                    <span className={`badge ${r.estado === 'Completado' ? 'badge-green' : 'badge-amber'}`}>
                      {r.estado || 'En proceso'}
                    </span>
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

export default AnalisisAccidentes;
