import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import './RegistroAccidentes.css';

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

function RegistroAccidentes({ lista }) {
  const [registros, setRegistros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [accidenteSeleccionado, setAccidenteSeleccionado] = useState(null);
  const [modalEditarAbierto, setModalEditarAbierto] = useState(false);
  const [datosEdicion, setDatosEdicion] = useState(null);
  const [subiendoFoto, setSubiendoFoto] = useState(false);
  const [nuevaFotoPreview, setNuevaFotoPreview] = useState(null);
  const [archivoFotoNueva, setArchivoFotoNueva] = useState(null);

  useEffect(() => {
    obtenerRegistros();
  }, []);

  const obtenerRegistros = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('accidentes')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) {
      console.log('Datos traidos de Supabase:', data);
      setRegistros(data);
    }
    if (error) {
      console.error('Error al cargar accidentes:', error);
    }
    setLoading(false);
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

  const handleInputEdicionChange = (e) => {
    const { name, value } = e.target;
    setDatosEdicion(prev => ({ ...prev, [name]: value }));
  };

  const handleFotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setArchivoFotoNueva(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setNuevaFotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const eliminarFoto = () => {
    setDatosEdicion(prev => ({ ...prev, foto_url: null }));
    setNuevaFotoPreview(null);
    setArchivoFotoNueva(null);
  };

  const handleActualizarAccidente = async () => {
    let fotoUrl = datosEdicion.foto_url;

    if (archivoFotoNueva) {
      fotoUrl = await subirFoto(archivoFotoNueva);
    }

    const registroActualizado = {
      ...datosEdicion,
      foto_url: fotoUrl
    };

    const { error } = await supabase
      .from('accidentes')
      .update(registroActualizado)
      .eq('id', datosEdicion.id);

    if (error) {
      alert(`Error al actualizar: ${error.message}`);
      console.error('Error al actualizar:', error);
    } else {
      setModalEditarAbierto(false);
      setArchivoFotoNueva(null);
      setNuevaFotoPreview(null);
      obtenerRegistros();
    }
  };

  if (loading) {
    return (
      <div className="registro-container">
        <div className="registro-header">
          <h1>Registro de Accidentes</h1>
          <p>Historico de accidentes - Industrias Sanchia</p>
        </div>
        <div className="registro-content">
          <p className="mensaje-vacio">Cargando registros...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="registro-container">
      <div className="registro-header">
        <h1>Registro de Accidentes</h1>
        <p>Historico de accidentes - Industrias Sanchia</p>
      </div>
      <div className="registro-content">
        {registros.length === 0 ? (
          <p className="mensaje-vacio">No hay accidentes registrados aun.</p>
        ) : (
          <table className="tabla-registros">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Gravedad</th>
                <th>Nombre</th>
                <th>Area</th>
                <th>Descripcion</th>
                <th>Accion</th>
              </tr>
            </thead>
            <tbody>
              {registros.map((registro, index) => (
                <tr key={index}>
                  <td>{registro.fecha_accidente}</td>
                  <td>{registro.gravedad}</td>
                  <td>{registro.empleado_nombre}</td>
                  <td>{registro.area}</td>
                  <td>{registro.descripcion_lesion}</td>
                  <td>
                    <button className="btn-ver" onClick={() => { setAccidenteSeleccionado(registro); setModalAbierto(true); }}>Ver Detalle</button>
                    <button className="btn-editar" onClick={() => { setDatosEdicion(registro); setModalEditarAbierto(true); setArchivoFotoNueva(null); setNuevaFotoPreview(null); }}>Editar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modalAbierto && (
        <div className="modal-overlay" onClick={() => setModalAbierto(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>Detalles del Accidente</h2>

            <div className="detalle-grid">
              <div className="detalle-item">
                <span className="detalle-label">Fecha:</span>
                <span className="detalle-valor">{accidenteSeleccionado.fecha_accidente}</span>
              </div>
              <div className="detalle-item">
                <span className="detalle-label">Nombre:</span>
                <span className="detalle-valor">{accidenteSeleccionado.empleado_nombre}</span>
              </div>
              <div className="detalle-item">
                <span className="detalle-label">Area:</span>
                <span className="detalle-valor">{accidenteSeleccionado.area}</span>
              </div>
              <div className="detalle-item">
                <span className="detalle-label">Gravedad:</span>
                <span className="detalle-valor">{accidenteSeleccionado.gravedad}</span>
              </div>
              <div className="detalle-item">
                <span className="detalle-label">Causa Raiz:</span>
                <span className="detalle-valor">{accidenteSeleccionado.causa_raiz || '-'}</span>
              </div>
              <div className="detalle-item">
                <span className="detalle-label">Dias Perdidos:</span>
                <span className="detalle-valor">{accidenteSeleccionado.dias_perdidos || '0'}</span>
              </div>
            </div>

            <div className="detalle-descripcion">
              <span className="detalle-label">Descripcion:</span>
              <p className="detalle-valor-descripcion">{accidenteSeleccionado.descripcion_lesion}</p>
            </div>

            {accidenteSeleccionado.foto_url ? (
              <img src={accidenteSeleccionado.foto_url} alt="Evidencia" className="modal-foto" />
            ) : (
              <p className="sin-foto">Sin evidencia fotografica</p>
            )}

            <button className="btn-cerrar" onClick={() => setModalAbierto(false)}>Cerrar</button>
          </div>
        </div>
      )}

      {modalEditarAbierto && datosEdicion && (
        <div className="modal-overlay" onClick={() => setModalEditarAbierto(false)}>
          <div className="modal-content modal-editar" onClick={e => e.stopPropagation()}>
            <h2>Editar Accidente</h2>

            <div className="form-grid-edicion">
              <div className="form-group">
                <label>Fecha</label>
                <input type="date" name="fecha_accidente" value={datosEdicion.fecha_accidente || ''} onChange={handleInputEdicionChange} />
              </div>

              <div className="form-group">
                <label>Nombre del Accidentado</label>
                <input type="text" name="empleado_nombre" value={datosEdicion.empleado_nombre || ''} onChange={handleInputEdicionChange} />
              </div>

              <div className="form-group">
                <label>Area</label>
                <select name="area" value={datosEdicion.area || ''} onChange={handleInputEdicionChange}>
                  <option value="">Seleccione un area</option>
                  {areas.map(area => (
                    <option key={area} value={area}>{area}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Gravedad</label>
                <select name="gravedad" value={datosEdicion.gravedad || ''} onChange={handleInputEdicionChange}>
                  <option value="">Seleccione gravedad</option>
                  <option value="Leve">Leve</option>
                  <option value="Moderado">Moderado</option>
                  <option value="Grave">Grave</option>
                </select>
              </div>

              <div className="form-group">
                <label>Dias Perdidos</label>
                <input type="number" name="dias_perdidos" value={datosEdicion.dias_perdidos || 0} onChange={handleInputEdicionChange} min="0" />
              </div>

              <div className="form-group full-width">
                <label>Descripcion de la Lesion</label>
                <textarea name="descripcion_lesion" value={datosEdicion.descripcion_lesion || ''} onChange={handleInputEdicionChange} rows="3" />
              </div>

              <div className="form-group full-width">
                <label>Causa Raiz</label>
                <textarea name="causa_raiz" value={datosEdicion.causa_raiz || ''} onChange={handleInputEdicionChange} rows="3" />
              </div>

              <div className="form-group full-width">
                <label>Evidencia Fotografica</label>
                <div className="foto-edicion-container">
                  {(nuevaFotoPreview || datosEdicion.foto_url) ? (
                    <div className="foto-preview-container">
                      <img
                        src={nuevaFotoPreview || datosEdicion.foto_url}
                        alt="Preview"
                        className="foto-miniatura"
                      />
                      <button
                        type="button"
                        className="btn-eliminar-foto"
                        onClick={eliminarFoto}
                        title="Eliminar foto"
                      >
                        X
                      </button>
                    </div>
                  ) : null}
                  <label className="file-upload-label">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="17 8 12 3 7 8"></polyline>
                      <line x1="12" y1="3" x2="12" y2="15"></line>
                    </svg>
                    <span>Cambiar foto</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFotoChange}
                      className="input-foto"
                    />
                  </label>
                  {subiendoFoto && <span className="subiendo-texto">Subiendo foto...</span>}
                </div>
              </div>
            </div>

            <button className="btn-guardar" onClick={handleActualizarAccidente} disabled={subiendoFoto}>
              {subiendoFoto ? 'Guardando...' : 'Guardar Cambios'}
            </button>
            <button className="btn-cerrar" onClick={() => { setModalEditarAbierto(false); setArchivoFotoNueva(null); setNuevaFotoPreview(null); }}>Cancelar</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default RegistroAccidentes;