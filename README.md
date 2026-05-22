# Seguridad Industrial - Industrias Sanchia

Sistema modular para la gestion, control y registro de seguridad industrial avanzada.

## Stack Tecnologico

- **Frontend**: React 19.2.6 + Vite 8.0.12
- **Backend**: Supabase (Auth + Database + Storage)
- **Graficos**: Chart.js 4.5.1 + react-chartjs-2
- **Exportacion**: xlsx (Excel)

## Requisitos

- Node.js 18+
- Cuenta de Supabase
- NPM o Yarn

## Instalacion

```bash
# Clonar o acceder al directorio del proyecto
cd "C:\Users\Planificador02\Desktop\Mis proyectos\Seguridad Industrial\Seguridad-Industrial-Industrias-Sanchia"

# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev

# Build para produccion
npm run build
```

## Variables de Entorno

Crear archivo `.env` con las credenciales de Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=tu-key-aqui
```

## Estructura del Proyecto

```
src/
├── components/
│   ├── Login.jsx           # Pantalla de inicio de sesion
│   ├── Dashboard.jsx        # Panel principal con estadisticas
│   ├── Accidentes.jsx      # Formulario de registro de accidentes
│   ├── AnalisisAccidentes.jsx  # Analisis IAT (4 pasos)
│   ├── RegistroAccidentes.jsx  # Lista de accidentes con-edicion
│   ├── RegistroAnalisisIAT.jsx  # Lista de analisis IAT editable
│   └── ...
├── lib/
│   └── supabase.js         # Cliente de Supabase
├── App.jsx                 # Componente principal con rutas
└── App.css                 # Estilos globales
```

## Base de Datos (Supabase)

### Tabla: `accidentes`

| Columna | Tipo | Descripcion |
|---------|------|-------------|
| id | UUID | ID unico |
| created_at | TIMESTAMPTZ | Fecha de creacion |
| fecha_accidente | DATE | Fecha del accidente |
| empleado_nombre | TEXT | Nombre del accidentado |
| area | TEXT | Area de trabajo |
| gravedad | TEXT | Leve/Moderado/Grave |
| descripcion_lesion | TEXT | Descripcion de la lesion |
| causa_raiz | TEXT | Causa raiz del accidente |
| dias_perdidos | INTEGER | Dias perdidos |
| foto_url | TEXT | URL de evidencia fotografica |

### Tabla: `analisis_iat`

| Columna | Tipo | Descripcion |
|---------|------|-------------|
| id | UUID | ID unico |
| created_at | TIMESTAMPTZ | Fecha de creacion |
| fecha_accidente | DATE | Fecha del accidente |
| hora_accidente | TIME | Hora del accidente |
| nombre_completo | TEXT | Nombre del accidentado |
| fecha_nacimiento | DATE | Fecha de nacimiento |
| numero_dui | TEXT | Numero de DUI |
| telefono | TEXT | Telefono |
| cargo | TEXT | Cargo del empleado |
| lugar_exacto | TEXT | Lugar exacto del accidente |
| selections | JSONB | Causas PP, TC, CI, CB |
| plan_accion | JSONB | Plan 5W2H |
| fecha_registro | TIMESTAMPTZ | Fecha de registro |

### Storage Bucket: `accidentes_fotos`

Bucket publico para almacenar evidencias fotograficas de accidentes.

## Modulos de la Aplicacion

### 1. Login
- Autenticacion con Supabase Auth
- Credenciales: email + contrasena
- Diseño: Split screen con panel identitario y formulario

### 2. Dashboard
- Estadisticas generales
- Filtro de gravedad (Leve/Moderado/Grave)
- Grafico de evolucion de accidentes
- Contador de dias sin accidentes graves
- Record anual

### 3. Registro de Accidentes
- Formulario completo con campos:
  - Fecha, Hora, Nombre, DUI, Telefono
  - Area (selector con 16 opciones)
  - Cargo, Antiguedad, Jefe Inmediato
  - Descripcion de la lesion
  - Causa raiz, Dias perdidos
- Subida de foto a Supabase Storage
- Validacion de campos obligatorios
- Exportacion a Excel

### 4. Analisis de Accidentes (IAT)
Formulario de 4 pasos:

**Paso 1**: Datos del accidentado
- Informacion personal y laboral

**Paso 2**: Grafico de analisis
- Visualizacion en tiempo real de las causas

**Paso 3**: Seleccion de causas
- PP (Proximidad Potencial): Tipo, Severidad, Probabilidad, Frecuencia
- TC (Tipo de Causa): 11 categorias
- CI (Condiciones Inseguras): Actos y condiciones subestandar
- CB (Creacion de Barreras): Factores personales y del trabajo

**Paso 4**: Plan de Accion 5W2H
- Tabla interactiva con 9 columnas
- Status: CONCLUIDA/EN PROCESO/ATRASADA/INICIO FUTURO/CANCELADA
- Agregar/eliminar filas
- Guardar todo al finalizar

### 5. Registro de Accidentes (Lista)
- Tabla con todos los accidentes
- Vista modal con detalles
- Edicion completa de registros
- Subida/eliminacion de fotos
- Recarga automatica desde Supabase

### 6. Registros Analisis IAT (Lista)
- Tabla con analisis IAT
- Vista editable de expedientes
- Edicion decheckboxes y plan 5W2H
- Grafico dinamico segun selecciones
- Actualizacion en Supabase

## Areas Disponibles

```
MANTENIMIENTO
MAQUINAS
SEMITERMINADO
RECICLADO_PELETIZADO
ENSAMBLE
MEZCLAS
BODEGA ELECTRICA
BODEGA DE INSUMOS
BODEGA DE EMPAQUES Y SUMINISTROS
BODEGA CD
BODEGA MATERIA PRIMA
CARPINTERIA
OFICINAS ADMINISTRATIVAS
TRANSPORTE
RECURSOS HUMANOS
AREA DE VIGILANCIA
```

## Gravedad de Accidentes

- **Leve**: Lesion menor sin perdida de tiempo
- **Moderado**: Perdida de tiempo, no incapacidad
- **Grave**: Perdida de vida, incapacidad permanente

## Autor

Desarrollado por Allan Martinez

## Version

v1.0.0 - 2026