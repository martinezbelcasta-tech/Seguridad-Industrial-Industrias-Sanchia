import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import './AnalisisAccidentes.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function AnalisisAccidentes({ onGuardarAnalisis }) {
  const [pasoActual, setPasoActual] = useState(1);
  const [formData, setFormData] = useState({
    fecha_accidente: '',
    hora_accidente: '',
    nombre_completo: '',
    fecha_nacimiento: '',
    numero_dui: '',
    telefono: '',
    cargo: '',
    antiguedad_empresa: '',
    experiencia_cargo: '',
    jefe_inmediato: '',
    lugar_exacto: '',
    actividad_desempenaba: '',
    horario_trabajo: '',
    materia_equipo_herramienta: '',
    parte_cuerpo_afectada: '',
    detalle_incapacidad: '',
    evidencias_fotos: '',
    herramientas_trabajo: '',
    sujeccion: '',
    reconstruccion_hechos: '',
    version_accidentado: '',
    nombre_testigo: '',
    version_testigo: ''
  });
  const [fotoPreview, setFotoPreview] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const guardarAnalisis = async (e) => {
    e.preventDefault();
    setGuardando(true);
    setMensaje(null);

    try {
      const { data, error } = await supabase
        .from('analisis_accidentes')
        .insert([formData]);

      if (error) {
        console.error('Error al guardar:', error);
        setMensaje({ tipo: 'error', texto: 'Error al guardar: ' + error.message });
      } else {
        setMensaje({ tipo: 'success', texto: 'Análisis de accidente guardado correctamente' });
        setFormData({
          fecha_accidente: '',
          hora_accidente: '',
          nombre_completo: '',
          fecha_nacimiento: '',
          numero_dui: '',
          telefono: '',
          cargo: '',
          antiguedad_empresa: '',
          experiencia_cargo: '',
          jefe_inmediato: '',
          evidencias_fotos: '',
          herramientas_trabajo: '',
          sujeccion: '',
          reconstruccion_hechos: '',
          version_accidentado: '',
          nombre_testigo: '',
          version_testigo: '',
          lugar_exacto: '',
          actividad_desempenaba: '',
          horario_trabajo: '',
          materia_equipo_herramienta: '',
          parte_cuerpo_afectada: '',
          detalle_incapacidad: ''
        });
      }
    } catch (e) {
      setMensaje({ tipo: 'error', texto: 'Error: ' + e.message });
    }

    setGuardando(false);
    setTimeout(() => setMensaje(null), 5000);
  };

  const irAnterior = () => {
    if (pasoActual > 1) {
      setPasoActual(pasoActual - 1);
    }
  };

  const irSiguiente = () => {
    if (pasoActual < 4) {
      setPasoActual(pasoActual + 1);
    }
  };

  const tabs = [
    { num: 1, label: 'Paso 1: Fenomeno' },
    { num: 2, label: 'Paso 2: PP - TC - CI - CB' },
    { num: 3, label: 'Paso 3: Gráfico' },
    { num: 4, label: 'Paso 4: PLAN DE ACCIÓN' }
  ];

  const renderContenidoPaso1 = () => (
    <form className="analisis-form">
      <div className="card-grid">
        <div className="form-card datos-accidente">
          <h2>Datos del Accidente</h2>
          <div className="form-grid-2">
            <div className="form-group">
              <label>Fecha del Accidente *</label>
              <input
                type="date"
                name="fecha_accidente"
                value={formData.fecha_accidente}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Hora del Accidente</label>
              <input
                type="time"
                name="hora_accidente"
                value={formData.hora_accidente}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        <div className="form-card datos-personal">
          <h2>Datos del Personal</h2>
          <div className="form-grid-3">
            <div className="form-group full-width">
              <label>Nombre Completo *</label>
              <input
                type="text"
                name="nombre_completo"
                value={formData.nombre_completo}
                onChange={handleChange}
                placeholder="Nombre y apellidos"
                required
              />
            </div>
            <div className="form-group">
              <label>Fecha de Nacimiento</label>
              <input
                type="date"
                name="fecha_nacimiento"
                value={formData.fecha_nacimiento}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Número de DUI</label>
              <input
                type="text"
                name="numero_dui"
                value={formData.numero_dui}
                onChange={handleChange}
                placeholder="00000000-0"
              />
            </div>
            <div className="form-group">
              <label>Teléfono</label>
              <input
                type="tel"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                placeholder="0000-0000"
              />
            </div>
            <div className="form-group">
              <label>Cargo que Desempeña</label>
              <input
                type="text"
                name="cargo"
                value={formData.cargo}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Antigüedad en la Empresa</label>
              <input
                type="text"
                name="antiguedad_empresa"
                value={formData.antiguedad_empresa}
                onChange={handleChange}
                placeholder="Años/Meses"
              />
            </div>
            <div className="form-group">
              <label>Experiencia en el Cargo</label>
              <input
                type="text"
                name="experiencia_cargo"
                value={formData.experiencia_cargo}
                onChange={handleChange}
                placeholder="Años/Meses"
              />
            </div>
            <div className="form-group">
              <label>Jefe Inmediato del Área</label>
              <input
                type="text"
                name="jefe_inmediato"
                value={formData.jefe_inmediato}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        <div className="form-card sitio-accidente">
          <h2>Sitio del Accidente</h2>
          <div className="form-grid-3">
            <div className="form-group full-width">
              <label>Lugar Exacto (Área/ Sección)</label>
              <input
                type="text"
                name="lugar_exacto"
                value={formData.lugar_exacto}
                onChange={handleChange}
                placeholder="Descripción detallada del lugar"
              />
            </div>
            <div className="form-group full-width">
              <label>Actividad que Desempeñaba en el Momento</label>
              <textarea
                name="actividad_desempenaba"
                value={formData.actividad_desempenaba}
                onChange={handleChange}
                placeholder="Describe qué estaba haciendo el trabajador"
                rows="2"
              />
            </div>
            <div className="form-group">
              <label>Horario de Trabajo</label>
              <select
                name="horario_trabajo"
                value={formData.horario_trabajo}
                onChange={handleChange}
              >
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
            <div className="form-group full-width">
              <label>Materia, Equipo o Herramienta que Causó la Lesión</label>
              <textarea
                name="materia_equipo_herramienta"
                value={formData.materia_equipo_herramienta}
                onChange={handleChange}
                placeholder="Describe el objeto o sustancia involucrada"
                rows="2"
              />
            </div>
            <div className="form-group full-width">
              <label>Parte del Cuerpo Afectada</label>
              <textarea
                name="parte_cuerpo_afectada"
                value={formData.parte_cuerpo_afectada}
                onChange={handleChange}
                placeholder="Ej: Mano derecha, Pie izquierdo, etc."
                rows="2"
              />
            </div>
            <div className="form-group full-width">
              <label>Detalle de la Incapacidad (Días o Tipo)</label>
              <textarea
                name="detalle_incapacidad"
                value={formData.detalle_incapacidad}
                onChange={handleChange}
                placeholder="Número de días de incapacidad o tipo de limitación"
                rows="2"
              />
            </div>
          </div>
        </div>

        <div className="form-card evidencias-herramientas">
          <h2>Evidencias y Herramientas</h2>
          <div className="form-grid-3">
            <div className="form-group full-width">
              <label>Evidencias Fotográficas</label>
              <div className="file-upload-container">
                <input
                  type="file"
                  id="evidencias_fotos"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      setFotoPreview(URL.createObjectURL(file));
                      setFormData(prev => ({ ...prev, evidencias_fotos: file.name }));
                    }
                  }}
                  className="file-input"
                />
                <label htmlFor="evidencias_fotos" className="file-label">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <circle cx="8.5" cy="8.5" r="1.5"></circle>
                    <polyline points="21 15 16 10 5 21"></polyline>
                  </svg>
                  <span>Subir foto</span>
                </label>
                {fotoPreview && (
                  <div className="preview-container">
                    <img src={fotoPreview} alt="Preview" className="preview-image" />
                    <button type="button" className="preview-remove" onClick={() => {
                      setFotoPreview(null);
                      setFormData(prev => ({ ...prev, evidencias_fotos: '' }));
                    }}>×</button>
                  </div>
                )}
              </div>
            </div>
            <div className="form-group full-width">
              <label>Herramientas de Trabajo</label>
              <textarea
                name="herramientas_trabajo"
                value={formData.herramientas_trabajo}
                onChange={handleChange}
                placeholder="Detalle las herramientas o equipo usado en la actividad"
                rows="3"
              />
            </div>
            <div className="form-group full-width">
              <label>Sujeción</label>
              <textarea
                name="sujeccion"
                value={formData.sujeccion}
                onChange={handleChange}
                placeholder="Detalle la forma en que se realizó la sujeción"
                rows="3"
              />
            </div>
          </div>
        </div>

        <div className="form-card relato-hechos">
          <h2>Relato de los Hechos</h2>
          <div className="form-grid-2-cols">
            <div className="form-group full-width">
              <label>Reconstrucción de los Hechos</label>
              <textarea
                name="reconstruccion_hechos"
                value={formData.reconstruccion_hechos}
                onChange={handleChange}
                placeholder="Describa la secuencia de eventos que condujeron al accidente"
                rows="5"
              />
            </div>
            <div className="form-group full-width">
              <label>Versión del Accidentado</label>
              <textarea
                name="version_accidentado"
                value={formData.version_accidentado}
                onChange={handleChange}
                placeholder="Versión detallada de la persona afectada sobre lo ocurrido"
                rows="5"
              />
            </div>
          </div>
        </div>

        <div className="form-card testigos">
          <h2>Testigos</h2>
          <div className="form-grid-2-cols">
            <div className="form-group full-width">
              <label>Nombre del Testigo</label>
              <input
                type="text"
                name="nombre_testigo"
                value={formData.nombre_testigo}
                onChange={handleChange}
                placeholder="Nombre completo del testigo"
              />
            </div>
            <div className="form-group full-width">
              <label>Versión del Testigo</label>
              <textarea
                name="version_testigo"
                value={formData.version_testigo}
                onChange={handleChange}
                placeholder="Relato de lo que presenció el testigo"
                rows="5"
              />
            </div>
          </div>
        </div>
      </div>
    </form>
  );

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
      "Contacto con (electricidad, calor, sustancias)", "Sobretensión", "Falla del equipo", "Derrame / escape"
    ],
    CI: {
      actosSubestandar: ["Manejo de equipo sin autorización", "Falta de advertencias", "Falta de asegurar", "Manejo a velocidad inadecuada", "Hacer inoperables los instrumentos", "Uso de equipo defectuoso", "Uso inapropiado de EPP", "Carga inadecuada", "Almacenamiento inadecuado", "Levantamiento inadecuado", "Posición de tarea inadecuada", "Mantenimiento de equipo en operación", "Bromas", "Bajo influencia alcohol/drogas", "Uso inapropiado del equipo", "No seguir procedimiento"],
      condicionesSubestandar: ["Protecciones y barreras inadecuadas", "EPP inadecuado o impropio", "Herramienta equipo o material defectuoso", "Congestión o acción restringida", "Sistema de advertencia inadecuada", "Peligro de explosión o incendio", "Desorden/Aseo deficiente", "Exposiciones a ruido", "Exposiciones a Radiación", "Exposición a temperaturas extremas", "Iluminación inadecuada", "Ventilación inadecuada", "Condiciones ambientales peligrosas"]
    },
    CB: {
      factoresPersonales: {
        "1 Capacidad Física/Fisiológica": ["Altura, peso, talla, fuerza, alcance inapropiados", "Movimiento corporal limitado", "Capacidad limitada sostener posiciones", "Sensibilidad a sustancias o alergias", "Sensibilidad a extremos sensoriales", "Deficiencia visual", "Deficiencia auditiva", "Otras deficiencias", "Incapacidad respiratoria", "Incapacidades físicas permanentes", "Incapacidades temporales"],
        "2 Capacidad Mental/Sicológica": ["Temores y fobias", "Disturbios emocionales", "Enfermedad mental", "Nivel de inteligencia", "Incapacidad para comprender", "Mal Juicio", "Mala coordinación", "Reacción lenta", "Poca actitud mecánica", "Poca actitud de apréndizaje", "Falla de memoria"],
        "3 Tensión Física o Fisiológica": ["Lesión o enfermedad", "Fatiga por carga o duración", "Fatiga por falta de descanso", "Fatiga por sobrecarga sensitiva", "Exposición a riesgos contra la salud", "Exposición a temperatura extrema", "Insuficiencia de oxígeno", "Variación de presión atmósferica", "Movimiento restringido", "Insuficiencia de azúcar en la sangre"],
        "4 Tensión Mental o Sicológica": ["Sobrecarga emocional", "Fátiga por carga o velocidad mental", "Demandas extremada de opinión/decisión", "Rutina, monotonía", "Demandas extremadas de concentración", "Actividades sin sentido", "Direcciones y demandas confusas", "Peticiones conflictivas", "Preocupación por problemas", "Frustración", "Enfermedad mental"],
        "5 Falta de Conocimiento": ["Falta de experiencia", "Orientación deficiente", "Adiestramiento inicial inadecuado", "Adiestramiento actualizado deficiente", "Direcciones malentendidas"],
        "6 Falta de Habilidad": ["Instrucción inicial deficiente", "Práctica insuficiente", "Ejecución poco frecuente", "Falta de preparación o asesoramiento", "Revisión inadecuada de instrucciones"],
        "7 Motivación Inadecuada": ["Premiación de desempeño inadecuado", "Castigo del desempeño adecuado", "Falta de incentivos", "Frustración excesiva", "Agresión inapropiada", "Intento inapropiado de ahorrar tiempo", "Intento inapropiado de evitar incomodidad", "Intento inapropiado de captar atención", "Disciplina inadecuada", "Presión inapropiada de compañeros", "Ejemplo inapropiado de supervisión", "Retroalimentación deficiente", "Refuerzo deficiente de comportamiento", "Incentivos de producción inapropiados"]
      },
      factoresTrabajo: {
        "8 Liderazgo y Supervisión": ["Relaciones jerárgicas poco claras/conflictivas", "Asignación de responsabilidad poco clara", "Delegación insuficiente", "Políticas o procedimientos inadecuados", "Objetivos o metas contradictorias", "Programación inadecuada de trabajos", "Instrucción deficiente", "Evaluación deficiente de exposiciones", "Conocimiento inadecuado del trabajo", "Asignación inadecuada del trabajador", "Medición deficiente del desempeño", "Retroalimentación incorrecta"],
        "9 Ingeniería Inadecuada": ["Evaluación inadecuada de exposiciones", "Consideración deficiente factores humanos", "Estándares/criterios deficientes", "Control inadecuado de construcción", "Evaluación inadecuada de condiciones", "Controles inadecuados", "Monitoreo u operación inicial inadecuada", "Evaluación inadecuada de cambio"],
        "Adquisiciones": ["Especificaciones deficientes de pedidos", "Especificaciones inadecuadas a vendedores", "Modalidad de embarque inadecuada", "Inspección de recepción deficiente", "Comunicación inadecuada de salud/seguridad", "Manejo inadecuado de materiales", "Almacenamiento inadecuado", "Transporte inadecuado", "Identificación deficiente materiales peligrosos", "Disposición inadecuada de residuos", "Selección inadecuada de contratistas"],
        "Mantenimiento": ["Prevención inadecuada", "Reparación inadecuada"],
        "Herramientas y Equipos": ["Evaluación deficiente de necesidades", "Consideración inadecuada factores humanos", "Estándares o especificaciones inadecuadas", "Disponibilidad inadecuada", "Ajuste/reparación/mantenimiento deficiente", "Salvamento y reclamación inadecuada", "Inadecuada remoción y reemplazo"],
        "Estándares de Trabajo": ["Desarrollo inadecuado de estándares", "Comunicación inadecuada de estándares", "Manutención inadecuada de estándares"],
        "Uso y Desgaste": ["Planificación inadecuada de uso", "Extensión inadecuada de vida util", "Inspección o control deficiente", "Carga o proporción de uso deficiente", "Mantenimiento deficiente", "Uso por personas no calificadas", "Uso para propósitos indebidos"],
        "Abuso o Mal Uso": ["Conducta inapropiada censurada", "Conducta inapropiada permitida"]
      }
    }
  };

const [seleccione, setSeleccione] = useState({
    PP: [],
    TC: [],
    CI: [],
    CB: []
  });

  const [planAccion, setPlanAccion] = useState([]);
  const [planGuardado, setPlanGuardado] = useState(false);

  const handleGuardarTodo = async () => {
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
      evidencias_fotograficas: formData.evidencias_fotos,
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

    if (onGuardarAnalisis) {
      onGuardarAnalisis(registroCompleto);
    }

    const { error } = await supabase
      .from('analisis_iat')
      .insert([registroCompleto]);

    if (error) {
      alert(`Error al guardar en Supabase: ${error.message}\nDetalles: ${error.details || error.hint}`);
      console.error('Error completo de Supabase:', error);
      return;
    }

    setFormData({
      fecha_accidente: '',
      hora_accidente: '',
      nombre_completo: '',
      fecha_nacimiento: '',
      numero_dui: '',
      telefono: '',
      cargo: '',
      antiguedad_empresa: '',
      experiencia_cargo: '',
      jefe_inmediato: '',
      lugar_exacto: '',
      actividad_desempenaba: '',
      horario_trabajo: '',
      materia_equipo_herramienta: '',
      parte_cuerpo_afectada: '',
      detalle_incapacidad: '',
      evidencias_fotos: '',
      herramientas_trabajo: '',
      sujeccion: '',
      reconstruccion_hechos: '',
      version_accidentado: '',
      nombre_testigo: '',
      version_testigo: ''
    });
    setSeleccione({ PP: [], TC: [], CI: [], CB: [] });
    setPlanAccion([]);
    setPlanGuardado(false);
    setPasoActual(1);
    alert('Analisis IAT guardado con exito!');
  };

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

  const agregarFila = () => {
    setPlanAccion(prev => [...prev, {
      causa: '',
      que: '',
      porQue: '',
      quien: '',
      como: '',
      cuando: '',
      donde: '',
      control: '',
      status: 'EN PROCESO'
    }]);
  };

  const actualizarFila = (idx, campo, valor) => {
    setPlanAccion(prev => {
      const nuevo = [...prev];
      nuevo[idx] = { ...nuevo[idx], [campo]: valor };
      return nuevo;
    });
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
        <input
          type="checkbox"
          id={checkboxId}
          checked={checked}
          onChange={() => handleCheck(categoria, valor)}
        />
        <span className="checkbox-label">{valor}</span>
      </label>
    );
  };

  const renderCausasCategoria = (key, label, className) => {
    const items = Array.isArray(selccione[key]) ? seleccione[key] : [];
    return (
      <div className="causa-categoria">
        <h4 className={className}>{label}</h4>
        {items.length > 0 ? (
          <ul className="causa-lista">
            {items.map((item, i) => <li key={`${key}-${i}`}>{item}</li>)}
          </ul>
        ) : (
          <p className="sin-seleccion">Ninguno seleccionado</p>
        )}
      </div>
    );
  };

  const renderContenidoPaso2 = () => (
    <div className="paso2-grid">
      <div className="form-card pp-card">
        <h2>Evaluacion del Potencial de Perdida (PP)</h2>
        <div className="pp-subsections">
          <div className="pp-subsection">
            <h3>Tipo</h3>
            <div className="checkbox-grid">
              {dataIAT.PP.tipo.map(v => renderCheckbox(v, 'PP'))}
            </div>
          </div>
          <div className="pp-subsection">
            <h3>Severidad</h3>
            <div className="checkbox-grid">
              {dataIAT.PP.severidad.map(v => renderCheckbox(v, 'PP'))}
            </div>
          </div>
          <div className="pp-subsection">
            <h3>Probabilidad</h3>
            <div className="checkbox-grid">
              {dataIAT.PP.probabilidad.map(v => renderCheckbox(v, 'PP'))}
            </div>
          </div>
          <div className="pp-subsection">
            <h3>Frecuencia</h3>
            <div className="checkbox-grid">
              {dataIAT.PP.frecuencia.map(v => renderCheckbox(v, 'PP'))}
            </div>
          </div>
        </div>
      </div>

      <div className="form-card tc-card">
        <h2>Tipo de Contacto (TC)</h2>
        <div className="checkbox-grid tc-grid">
          {dataIAT.TC.map(v => renderCheckbox(v, 'TC'))}
        </div>
      </div>

      <div className="form-card ci-card">
        <h2>Causas Inmediatas (CI)</h2>
        <div className="ci-columns">
          <div className="ci-column">
            <h3>Actos Estandar</h3>
            <div className="checkbox-list">
              {dataIAT.CI.actosSubestandar.map(v => renderCheckbox(v, 'CI'))}
            </div>
          </div>
          <div className="ci-column">
            <h3>Condiciones Estandar</h3>
            <div className="checkbox-list">
              {dataIAT.CI.condicionesSubestandar.map(v => renderCheckbox(v, 'CI'))}
            </div>
          </div>
        </div>
      </div>

      <div className="form-card cb-card">
        <h2>Causas Basicas (CB)</h2>
        <div className="cb-main-columns">
          <div className="cb-column">
            <h3>Factores Personales</h3>
            {Object.entries(dataIAT.CB.factoresPersonales).map(([cat, items]) => (
              <div key={cat} className="cb-categoria">
                <h4>{cat}</h4>
                <div className="checkbox-grid cb-grid">
                  {items.map(v => renderCheckbox(v, 'CB'))}
                </div>
              </div>
            ))}
          </div>
          <div className="cb-column">
            <h3>Factores del Trabajo</h3>
            {Object.entries(dataIAT.CB.factoresTrabajo).map(([cat, items]) => (
              <div key={cat} className="cb-categoria">
                <h4>{cat}</h4>
                <div className="checkbox-grid cb-grid">
                  {items.map(v => renderCheckbox(v, 'CB'))}
                </div>
              </div>
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

    const totalCI = ciCount;
    const totalCB = cbCount;
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
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        title: {
          display: true,
          text: 'RESUMEN DE IMPACTO',
          font: { size: 16, weight: 'bold' },
          color: '#1a1a1a'
        }
      },
      scales: {
        x: {
          beginAtZero: true,
          ticks: { font: { size: 13, weight: '600' }, color: '#34495e' },
          grid: { color: '#ecf0f1' }
        },
        y: {
          ticks: { font: { size: 14, weight: 'bold' }, color: '#1a1a1a' },
          grid: { display: false }
        }
      }
    };

return (
      <div className="paso3-grid">
        <div className="paso3-izquierda">
          <div className="indicador-card indicador-ci">
            <h3>Total Causas Inmediatas (CI)</h3>
            <div className="indicador-numero">{totalCI}</div>
          </div>
          <div className="indicador-card indicador-cb">
            <h3>Total Causas Basicas (CB)</h3>
            <div className="indicador-numero">{totalCB}</div>
          </div>
          <div className="indicador-card indicador-pp" style={{ borderLeftColor: colorPerfil }}>
            <h3>Perfil de Riesgo (PP)</h3>
            <div className="indicador-numero indicador-texto" style={{ color: colorPerfil }}>{perfilRiesgo}</div>
          </div>
        </div>
        <div className="paso3-derecha">
          <div className="grafico-card">
            <Bar data={chartData} options={chartOptions} />
          </div>
          <div style={{ marginTop: '2rem' }}>
            <h3 style={{ fontSize: '1.4rem', marginBottom: '1rem' }}>Causas y Factores Detectados</h3>
            <div style={{ marginBottom: '1.5rem' }}>
              <h4>PP (Potencial)</h4>
              {seleccione.PP?.length > 0 ? seleccione.PP.map((txt, i) => <div key={i} style={{ fontSize: '1.2rem', marginBottom: '0.3rem' }}>- {txt}</div>) : <p style={{ color: '#7f8c8d' }}>Ninguno seleccionado</p>}
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <h4>TC (Contacto)</h4>
              {seleccione.TC?.length > 0 ? seleccione.TC.map((txt, i) => <div key={i} style={{ fontSize: '1.2rem', marginBottom: '0.3rem' }}>- {txt}</div>) : <p style={{ color: '#7f8c8d' }}>Ninguno seleccionado</p>}
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <h4>CI (Inmediatas)</h4>
              {seleccione.CI?.length > 0 ? seleccione.CI.map((txt, i) => <div key={i} style={{ fontSize: '1.2rem', marginBottom: '0.3rem' }}>- {txt}</div>) : <p style={{ color: '#7f8c8d' }}>Ninguno seleccionado</p>}
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <h4>CB (Basicas)</h4>
              {seleccione.CB?.length > 0 ? seleccione.CB.map((txt, i) => <div key={i} style={{ fontSize: '1.2rem', marginBottom: '0.3rem' }}>- {txt}</div>) : <p style={{ color: '#7f8c8d' }}>Ninguno seleccionado</p>}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderContenidoPaso = () => {
    switch (pasoActual) {
      case 1:
        return renderContenidoPaso1();
      case 2:
        return renderContenidoPaso2();
      case 3:
        return renderContenidoPaso3();
      case 4:
        return (
          <div style={{ padding: '1rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '2rem', color: '#1a1a1a' }}>Paso 4: PLAN DE ACCION</h2>
              <p style={{ color: '#666', fontSize: '1.1rem' }}>Complete el siguiente plan de accion para las causas detectadas</p>
            </div>

            <button
              type="button"
              onClick={agregarFila}
              disabled={planGuardado}
              style={{
                padding: '14px 28px',
                fontSize: '1.2rem',
                fontWeight: '700',
                backgroundColor: planGuardado ? '#ccc' : '#27ae60',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: planGuardado ? 'not-allowed' : 'pointer',
                marginBottom: '1.5rem'
              }}
            >
              {planGuardado ? 'Plan Bloqueado' : '+ Agregar Accion'}
            </button>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '1rem', backgroundColor: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', borderRadius: '8px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#34495e', color: 'white' }}>
                    {columnasTabla.map(col => (
                      <th key={col.key} style={{ padding: '12px 8px', textAlign: 'left', fontSize: '0.9rem', borderBottom: '2px solid #2c3e50' }}>{col.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {planAccion.map((fila, idx) => (
                    <tr key={idx} style={{ backgroundColor: statusColors[fila.status] || '#ffffff' }}>
                      {columnasTabla.map(col => (
                        <td key={col.key} style={{ padding: '8px', borderBottom: '1px solid #ecf0f1' }}>
                          {col.key === 'status' ? (
                            <select
                              value={fila.status}
                              onChange={e => actualizarFila(idx, 'status', e.target.value)}
                              disabled={planGuardado}
                              style={{
                                width: '100%',
                                padding: '8px',
                                border: '1px solid #ddd',
                                borderRadius: '4px',
                                fontSize: '0.95rem',
                                backgroundColor: 'white'
                              }}
                            >
                              <option value="EN PROCESO">EN PROCESO</option>
                              <option value="CONCLUIDA">CONCLUIDA</option>
                              <option value="ATRASADA">ATRASADA</option>
                              <option value="INICIO FUTURO">INICIO FUTURO</option>
                              <option value="CANCELADA">CANCELADA</option>
                            </select>
                          ) : col.key === 'cuando' ? (
                            <input
                              type="date"
                              value={fila[col.key]}
                              onChange={e => actualizarFila(idx, col.key, e.target.value)}
                              disabled={planGuardado}
                              style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '0.95rem' }}
                            />
                          ) : (
                            <textarea
                              value={fila[col.key]}
                              onChange={e => actualizarFila(idx, col.key, e.target.value)}
                              rows={2}
                              disabled={planGuardado}
                              style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '0.95rem', resize: 'vertical' }}
                            />
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                  {planAccion.length === 0 && (
                    <tr>
                      <td colSpan={9} style={{ textAlign: 'center', padding: '2rem', color: '#7f8c8d' }}>
                        Presione "+ Agregar Accion" para crear una fila
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="analisis-container">
      <div className="analisis-header">
        <h1>Análisis de Accidentes (IAT)</h1>
        <p>Formulario para el Comité de Seguridad - Industrias Sanchía</p>
      </div>

      <div className="wizard-tabs">
        {tabs.map(tab => (
          <button
            key={tab.num}
            className={`wizard-tab ${pasoActual === tab.num ? 'active' : ''}`}
            onClick={() => setPasoActual(tab.num)}
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </div>

      <p className="step-indicator">Paso {pasoActual} de 4</p>

      <div className="wizard-content">
        {renderContenidoPaso()}
      </div>

      <div className="wizard-navigation">
        <button
          type="button"
          className="btn-wizard-nav btn-anterior"
          onClick={irAnterior}
          disabled={pasoActual === 1}
        >
          &lt; Anterior
        </button>
        <button
          type="button"
          className="btn-wizard-nav btn-siguiente"
          onClick={irSiguiente}
          disabled={pasoActual === 4}
        >
          Siguiente -&gt;
        </button>
        {pasoActual === 4 && (
          planGuardado ? (
            <button
              type="button"
              onClick={() => setPlanGuardado(false)}
              style={{ backgroundColor: '#ffc107', color: '#000', padding: '18px 40px', fontSize: '1.3rem', fontWeight: '700', border: 'none', borderRadius: '10px', cursor: 'pointer' }}
            >
              Editar Plan
            </button>
          ) : (
<button
              type="button"
              onClick={handleGuardarTodo}
              style={{ backgroundColor: '#28a745', color: 'white', padding: '18px 40px', fontSize: '1.3rem', fontWeight: '700', border: 'none', borderRadius: '10px', cursor: 'pointer' }}
            >
              Guardar todo el plan
            </button>
          )
        )}
      </div>
    </div>
  );
}

export default AnalisisAccidentes;
