import './Dashboard.css';

function InspectionList({ inspecciones }) {
  const getEstadoClass = (estado) => {
    return `estado estado-${estado}`;
  };

  const getEstadoLabel = (estado) => {
    const labels = {
      aprobado: 'Aprobado',
      pendiente: 'Pendiente',
      rechazado: 'Rechazado',
    };
    return labels[estado] || estado;
  };

  if (inspecciones.length === 0) {
    return (
      <div className="card inspection-list-container">
        <h3>Inspecciones Recientes</h3>
        <p className="no-data">No hay inspecciones que coincidan con los filtros seleccionados.</p>
      </div>
    );
  }

  return (
    <div className="card inspection-list-container">
      <h3>Inspecciones Recientes ({inspecciones.length})</h3>
      <div className="inspection-table">
        <table>
          <thead>
            <tr>
              <th>Zona</th>
              <th>Tipo</th>
              <th>Inspector</th>
              <th>Fecha/Hora</th>
              <th>Estado</th>
              <th>Observaciones</th>
            </tr>
          </thead>
          <tbody>
            {inspecciones.map((inspeccion) => (
              <tr key={inspeccion.id}>
                <td className="zona-cell">{inspeccion.zona}</td>
                <td>{inspeccion.tipo}</td>
                <td>{inspeccion.inspector}</td>
                <td>
                  {inspeccion.fecha} {inspeccion.hora}
                </td>
                <td>
                  <span className={getEstadoClass(inspeccion.estado)}>
                    {getEstadoLabel(inspeccion.estado)}
                  </span>
                </td>
                <td className="observaciones-cell">
                  {inspeccion.observaciones || '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default InspectionList;