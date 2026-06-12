export const dataIAT = {
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
