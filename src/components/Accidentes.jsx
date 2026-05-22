import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import * as XLSX from 'xlsx';
import './Accidentes.css';

const areas = [
  'MANTENIMIENTO',
  'MAQUINAS',
  'SEMITERMINADO',
  'RECICLADO_PELETIZADO',
  'ENSAMBLE',
  'MEZCLAS',
  'BODEGA ELECTRICA',
  'BODEGA DE INSUMOS',
  'BODEGA DE EMPAQUES Y SUMINISTROS',
  'BODEGA CD',
  'BODEGA MATERIA PRIMA',
  'CARPINTERIA',
  'OFICINAS ADMINISTRATIVAS',
  'TRANSPORTE',
  'RECURSOS HUMANOS',
  'AREA DE VIGILANCIA'
];

function Accidentes({ onGuardar }) {
  const [formData, setFormData] = useState({
    fecha_accidente: '',
    empleado_nombre: '',
    area: '',
    descripcion_lesion: '',
    causa_raiz: '',
    dias_perdidos: '',
    gravedad: 'Leve'
  });
  const [accidentes, setAccidentes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState(null);
  const [fotoPreview, setFotoPreview] = useState(null);
  const [subiendoFoto, setSubiendoFoto] = useState(false);

  useEffect(() => {
    cargarAccidentes();
  }, []);

  const cargarAccidentes = async () => {
    setCargando(true);
    try {
      const { data, error } = await supabase
        .from('accidentes')
        .select('*')
        .order('fecha_accidente', { ascending: false });

      if (error) {
        console.error('Error al cargar accidentes:', error);
      } else {
        setAccidentes(data || []);
      }
    } catch (e) {
      console.error('Error:', e.message);
    }
    setCargando(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFotoChange = async (e) => {
    const archivo = e.target.files[0];
    if (!archivo) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setFotoPreview(event.target.result);
    };
    reader.readAsDataURL(archivo);
  };

  const subirFoto = async (file) => {
    if (!file) return null;

    setSubiendoFoto(true);
    try {
      const fileName = `accidentes/${Date.now()}_${file.name}`;
      const { data, error } = await supabase.storage
        .from('accidentes_fotos')
        .upload(fileName, file);

      if (error) {
        console.error('Error al subir foto:', error);
        setSubiendoFoto(false);
        return null;
      }

      const { data: urlData } = supabase.storage
        .from('accidentes_fotos')
        .getPublicUrl(fileName);

      setSubiendoFoto(false);
      return urlData.publicUrl;
    } catch (e) {
      console.error('Error:', e.message);
      setSubiendoFoto(false);
      return null;
    }
  };

  const guardarAccidente = async (e) => {
    e.preventDefault();
    setGuardando(true);
    setMensaje(null);

    if (!formData.fecha_accidente || !formData.empleado_nombre || !formData.area || !formData.descripcion_lesion) {
      setMensaje({ tipo: 'error', texto: 'Por favor completa todos los campos requeridos' });
      setGuardando(false);
      return;
    }

    try {
      const fotoInput = document.getElementById('foto_accidente');
      const file = fotoInput?.files[0];
      let fotoUrl = null;

      if (file) {
        fotoUrl = await subirFoto(file);
      }

      const gravedadAlta = ['Grave', 'Muy Grave'];
      const esGrave = gravedadAlta.includes(formData.gravedad);

      const { data, error } = await supabase
        .from('accidentes')
        .insert([{
          fecha_accidente: formData.fecha_accidente,
          empleado_nombre: formData.empleado_nombre,
          area: formData.area,
          descripcion_lesion: formData.descripcion_lesion,
          causa_raiz: formData.causa_raiz || '',
          dias_perdidos: formData.dias_perdidos ? parseInt(formData.dias_perdidos) : 0,
          gravedad: formData.gravedad,
          foto_url: fotoUrl
        }]);

      if (error) {
        console.error('Error al guardar:', error);
        setMensaje({ tipo: 'error', texto: 'Error al guardar: ' + error.message });
      } else {
        const mensajeExito = esGrave 
          ? 'Accidente registrado. El contador se ha reiniciado.' 
          : 'Accidente registrado correctamente (Leve - sin afectar contador)';
        setMensaje({ tipo: 'success', texto: mensajeExito });

        if (onGuardar) {
          onGuardar({
            fecha_accidente: formData.fecha_accidente,
            empleado_nombre: formData.empleado_nombre,
            area: formData.area,
            descripcion_lesion: formData.descripcion_lesion,
            causa_raiz: formData.causa_raiz || '',
            dias_perdidos: formData.dias_perdidos ? parseInt(formData.dias_perdidos) : 0,
            gravedad: formData.gravedad,
            foto_url: fotoUrl
          });
        }

        setFormData({
          fecha_accidente: '',
          empleado_nombre: '',
          area: '',
          descripcion_lesion: '',
          causa_raiz: '',
          dias_perdidos: '',
          gravedad: 'Leve'
        });
        setFotoPreview(null);
        const fotoInput = document.getElementById('foto_accidente');
        if (fotoInput) fotoInput.value = '';
        cargarAccidentes();
      }
    } catch (e) {
      setMensaje({ tipo: 'error', texto: 'Error: ' + e.message });
    }

    setGuardando(false);
    setTimeout(() => setMensaje(null), 5000);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES');
  };

  const getEstadisticas = () => {
    const total = accidentes.length;
    const areaCounts = {};
    let areaMasIncidentes = '-';
    let maxCount = 0;

    accidentes.forEach(acc => {
      if (acc.area) {
        areaCounts[acc.area] = (areaCounts[acc.area] || 0) + 1;
        if (areaCounts[acc.area] > maxCount) {
          maxCount = areaCounts[acc.area];
          areaMasIncidentes = acc.area.replace('_', ' ');
        }
      }
    });

    return { total, areaMasIncidentes };
  };

  const esAccidenteGrave = (acc) => {
    const gravedad = acc.gravedad?.trim() || '';
    return gravedad === 'Grave' || gravedad === 'Muy Grave';
  };

  const FECHA_INICIO_PROYECTO = new Date('2026-05-14T00:00:00');

  const getDiasSinAccidentes = () => {
    const accidentesGraves = accidentes.filter(acc => esAccidenteGrave(acc));

    if (accidentesGraves.length === 0) {
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      const fechaInicio = new Date(FECHA_INICIO_PROYECTO);
      fechaInicio.setHours(0, 0, 0, 0);
      return Math.floor((hoy - fechaInicio) / (1000 * 60 * 60 * 24));
    }

    const ultimoAccidenteGrave = accidentesGraves[0];
    const fechaAccidente = new Date(ultimoAccidenteGrave.fecha_accidente + 'T00:00:00');
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    fechaAccidente.setHours(0, 0, 0, 0);

    return Math.floor((hoy - fechaAccidente) / (1000 * 60 * 60 * 24));
  };

  const getRecordAnual = () => {
    const accidentesGraves = [...accidentes].filter(acc => esAccidenteGrave(acc));

    if (accidentesGraves.length === 0) {
      const hoy = new Date();
      return Math.floor((hoy - FECHA_INICIO_PROYECTO) / (1000 * 60 * 60 * 24));
    }

    let maxDias = 0;

    const accidentesOrdenados = [...accidentesGraves].sort(
      (a, b) => new Date(a.fecha_accidente) - new Date(b.fecha_accidente)
    );

    const inicioProyecto = new Date(FECHA_INICIO_PROYECTO);
    inicioProyecto.setHours(0, 0, 0, 0);

    for (let i = 0; i <= accidentesOrdenados.length; i++) {
      const inicioPeriodo = i === 0 
        ? inicioProyecto
        : new Date(accidentesOrdenados[i - 1].fecha_accidente);
      inicioPeriodo.setHours(0, 0, 0, 0);

      const finPeriodo = i === accidentesOrdenados.length 
        ? new Date() 
        : new Date(accidentesOrdenados[i].fecha_accidente);
      finPeriodo.setHours(0, 0, 0, 0);

      const dias = Math.floor((finPeriodo - inicioPeriodo) / (1000 * 60 * 60 * 24));
      if (dias > maxDias) {
        maxDias = dias;
      }
    }

    return maxDias;
  };

  const diasSinAccidentes = getDiasSinAccidentes();
  const recordAnualTemp = getRecordAnual();
  const recordAnual = Math.max(diasSinAccidentes, recordAnualTemp);

  const exportarExcel = () => {
    const datosExcel = accidentes.map(acc => ({
      'Fecha': formatDate(acc.fecha_accidente),
      'Empleado': acc.empleado_nombre,
      'Área': acc.area?.replace('_', ' '),
      'Descripción de Lesión': acc.descripcion_lesion,
      'Causa Raíz': acc.causa_raiz || '',
      'Días Perdidos': acc.dias_perdidos || 0,
      'Foto': acc.foto_url || 'Sin foto'
    }));

    const ws = XLSX.utils.json_to_sheet(datosExcel);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Accidentes');

    const colWidths = [
      { wch: 12 },
      { wch: 25 },
      { wch: 20 },
      { wch: 40 },
      { wch: 30 },
      { wch: 10 },
      { wch: 50 }
    ];
    ws['!cols'] = colWidths;

    XLSX.writeFile(wb, `Registro_Accidentes_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const stats = getEstadisticas();

  return (
    <div className="accidentes-container">
      <header className="accidentes-header">
        <div className="header-info">
          <h1>Registro de Accidentes</h1>
          <p className="fecha-actual">
            {new Date().toLocaleDateString('es-ES', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>
      </header>

      <div className="accidentes-content">
        <div className="form-section">
          <div className="form-card">
            <h2>Nuevo Reporte de Accidente</h2>
            <form onSubmit={guardarAccidente}>
              <div className="form-grid">
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
                  <label>Nombre del Empleado *</label>
                  <input
                    type="text"
                    name="empleado_nombre"
                    value={formData.empleado_nombre}
                    onChange={handleChange}
                    placeholder="Nombre completo del empleado"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Área *</label>
                  <select
                    name="area"
                    value={formData.area}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Seleccionar área</option>
                    {areas.map(area => (
                      <option key={area} value={area}>{area.replace('_', ' ')}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Días Perdidos</label>
                  <input
                    type="number"
                    name="dias_perdidos"
                    value={formData.dias_perdidos}
                    onChange={handleChange}
                    placeholder="0"
                    min="0"
                  />
                </div>

                <div className="form-group">
                  <label>Gravedad *</label>
                  <select
                    name="gravedad"
                    value={formData.gravedad}
                    onChange={handleChange}
                    required
                  >
                    <option value="Leve">Leve</option>
                    <option value="Grave">Grave</option>
                    <option value="Muy Grave">Muy Grave</option>
                  </select>
                </div>

                <div className="form-group full-width">
                  <label>Descripción de la Lesión *</label>
                  <textarea
                    name="descripcion_lesion"
                    value={formData.descripcion_lesion}
                    onChange={handleChange}
                    placeholder="Describe detalladamente la lesión o incidente..."
                    rows="4"
                    required
                  />
                </div>

                <div className="form-group full-width">
                  <label>Causa Raíz</label>
                  <textarea
                    name="causa_raiz"
                    value={formData.causa_raiz}
                    onChange={handleChange}
                    placeholder="Describe la causa raíz del incidente..."
                    rows="3"
                  />
                </div>

                <div className="form-group full-width">
                  <label>Foto del Incidente</label>
                  <div className="file-upload-container">
                    <input
                      type="file"
                      id="foto_accidente"
                      accept="image/*"
                      onChange={handleFotoChange}
                      className="file-input"
                    />
                    <label htmlFor="foto_accidente" className="file-label">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
                          document.getElementById('foto_accidente').value = '';
                        }}>
                          ×
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="btn-guardar"
                disabled={guardando || subiendoFoto}
              >
                {guardando || subiendoFoto ? 'Guardando...' : 'Guardar Reporte'}
              </button>

              {mensaje && (
                <div className={`mensaje mensaje-${mensaje.tipo}`}>
                  {mensaje.texto}
                </div>
              )}
            </form>
          </div>
        </div>

        <div className="historial-section">
          <div className={`dias-sin-accidentes-card ${diasSinAccidentes >= 30 ? 'verde' : diasSinAccidentes < 5 ? 'rojo' : 'amarillo'}`}>
            <div className="dias-contador">
              <span className="dias-numero">{diasSinAccidentes}</span>
              <span className="dias-label">Días sin Accidentes</span>
            </div>
            <div className="dias-icono">
              {diasSinAccidentes >= 30 ? (
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              ) : diasSinAccidentes < 5 ? (
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                  <line x1="12" y1="9" x2="12" y2="13"></line>
                  <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
              ) : (
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
              )}
            </div>
            <div className="dias-record">
              <span>Récord del año: {recordAnual} días</span>
            </div>
          </div>

          <div className="stats-container-accidentes">
            <div className="stat-card-accidentes" style={{ borderTopColor: '#e74c3c' }}>
              <div className="stat-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#e74c3c" strokeWidth="2">
                  <path d="M12 2L2 22H22L12 2Z"></path>
                  <line x1="12" y1="9" x2="12" y2="13"></line>
                  <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
              </div>
              <div className="stat-info">
                <span className="stat-value">{stats.total}</span>
                <span className="stat-label">Total Accidentes</span>
              </div>
            </div>

            <div className="stat-card-accidentes" style={{ borderTopColor: '#f39c12' }}>
              <div className="stat-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#f39c12" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
              </div>
              <div className="stat-info">
                <span className="stat-value">{stats.areaMasIncidentes}</span>
                <span className="stat-label">Área con Más Incidentes</span>
              </div>
            </div>
          </div>

          <div className="historial-card">
            <div className="historial-header">
              <h2>Historial de Accidentes</h2>
              <button className="btn-exportar" onClick={exportarExcel}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                Exportar Excel
              </button>
            </div>
            {cargando ? (
              <div className="cargando">Cargando...</div>
            ) : accidentes.length === 0 ? (
              <div className="sin-datos">No hay accidentes registrados</div>
            ) : (
              <div className="table-container">
                <table className="accidentes-table">
                  <thead>
                    <tr>
                      <th>Foto</th>
                      <th>Fecha</th>
                      <th>Empleado</th>
                      <th>Área</th>
                      <th>Descripción</th>
                      <th>Gravedad</th>
                      <th>Causa Raíz</th>
                      <th>Días</th>
                    </tr>
                  </thead>
                  <tbody>
                    {accidentes.map((acc) => (
                      <tr key={acc.id}>
                        <td className="foto-cell">
                          {acc.foto_url ? (
                            <a href={acc.foto_url} target="_blank" rel="noopener noreferrer">
                              <img src={acc.foto_url} alt="Foto" className="thumbnail" />
                            </a>
                          ) : (
                            <span className="no-foto">-</span>
                          )}
                        </td>
                        <td>{formatDate(acc.fecha_accidente)}</td>
                        <td>{acc.empleado_nombre}</td>
                        <td>{acc.area?.replace('_', ' ')}</td>
                        <td className="descripcion-cell">{acc.descripcion_lesion}</td>
                        <td>
                          <span className={`gravedad-badge ${acc.gravedad?.replace(' ', '-').toLowerCase() || 'leve'}`}>
                            {acc.gravedad || 'Leve'}
                          </span>
                        </td>
                        <td className="causa-cell">{acc.causa_raiz || '-'}</td>
                        <td className="dias-cell">{acc.dias_perdidos || 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Accidentes;