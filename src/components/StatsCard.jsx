import './Dashboard.css';

function StatsCard({ titulo, valor, color, icono }) {
  return (
    <div className="stats-card" style={{ borderTopColor: color }}>
      <div className="stats-icono">{icono}</div>
      <div className="stats-info">
        <span className="stats-valor">{valor}</span>
        <span className="stats-titulo">{titulo}</span>
      </div>
    </div>
  );
}

export default StatsCard;