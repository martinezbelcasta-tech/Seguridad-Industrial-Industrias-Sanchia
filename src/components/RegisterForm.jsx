import { useState } from 'react';
import './Dashboard.css';

function RegisterForm({ zonas, tipos, onSubmit, onClose }) {
  const [formData, setFormData] = useState({
    zona: '',
    tipo: '',
    inspector: '',
    estado: 'aprobado',
    observaciones: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.zona && formData.tipo && formData.inspector) {
      onSubmit(formData);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Nueva Inspección</h2>
          <button className="btn-cerrar" onClick={onClose}>
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Zona:</label>
            <select
              name="zona"
              value={formData.zona}
              onChange={handleChange}
              required
            >
              <option value="">Seleccionar zona...</option>
              {zonas.map((zona) => (
                <option key={zona.id} value={zona.nombre}>
                  {zona.nombre}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Tipo de Inspección:</label>
            <select
              name="tipo"
              value={formData.tipo}
              onChange={handleChange}
              required
            >
              <option value="">Seleccionar tipo...</option>
              {tipos.map((tipo) => (
                <option key={tipo.id} value={tipo.nombre}>
                  {tipo.icono} {tipo.nombre}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Inspector:</label>
            <input
              type="text"
              name="inspector"
              value={formData.inspector}
              onChange={handleChange}
              placeholder="Nombre del inspector"
              required
            />
          </div>
          <div className="form-group">
            <label>Estado:</label>
            <select
              name="estado"
              value={formData.estado}
              onChange={handleChange}
            >
              <option value="aprobado">Aprobado</option>
              <option value="pendiente">Pendiente</option>
              <option value="rechazado">Rechazado</option>
            </select>
          </div>
          <div className="form-group">
            <label>Observaciones:</label>
            <textarea
              name="observaciones"
              value={formData.observaciones}
              onChange={handleChange}
              placeholder="Agregar observaciones..."
              rows="3"
            />
          </div>
          <div className="form-actions">
            <button type="button" className="btn-cancelar" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn-guardar">
              Guardar Inspección
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RegisterForm;