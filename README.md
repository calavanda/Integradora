# EcoRuta (Zamora Limpia) 🚛🌱
### Plataforma Municipal de Gestión de Recolección, Telemetría Satelital y Atención Ciudadana
**H. Ayuntamiento de Gutiérrez Zamora, Veracruz, México**

---

## 🎯 Visión del Proyecto
**EcoRuta** es la plataforma gubernamental integral para la supervisión y optimización del servicio de limpia pública municipal en Gutiérrez Zamora. Diseñada bajo una arquitectura moderna, escalable y con infraestructura en la nube 100% gratuita.

### Principios Fundamentales
* **Estrictamente en Español**: Todo el código, nombres de variables, funciones, modelos y endpoints están estandarizados en español (`actualizarUbicacionConductor`, `esquemaCamion`, `controladorIncidentes`, `calcularDistanciaEta`, etc.).
* **Cero Simulaciones**: Las coordenadas provienen de la geolocalización satelital en tiempo real emitida por el smartphone del conductor (o dispositivo GPS) enviada a la API propia.
* **Anti-Slop Frontend (Taste Skill)**: Diseño intencional, tipografía cuidada con Once UI tokens, tema dual claro/oscuro armónico (esmeralda/pizarra), cero gradientes morados genéricos y estructura limpia sin elementos de relleno.
* **Compatibilidad Móvil**: APIs REST y canal de WebSockets optimizados tanto para la app móvil en React Native (Conductor/Ciudadano) como para el Dashboard Web (Administrador/Despacho).

---

## 🛠️ Stack Tecnológico e Infraestructura Cloud (100% Gratuita)

| Capa | Tecnología | Plataforma Cloud |
| :--- | :--- | :--- |
| **Frontend Web** | Next.js (App Router), Once UI Design System, Taste Skill v2 | **Vercel** |
| **Backend & WebSockets** | Node.js, Express, `ws` (WebSockets nativo) | **Render / Railway** |
| **Base de Datos** | MongoDB Atlas (Cluster M0 Gratuito) con esquemas GeoJSON (`Point` y `LineString`) | **MongoDB Atlas** |
| **Autenticación & Roles** | Clerk Authentication con roles en `publicMetadata` | **Clerk** |
| **Cartografía** | OpenStreetMap + Leaflet con teselas limpias de **CartoDB Voyager** (`https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png`) con fallback local | **CARTO / OSM** |
| **Ruteo Vial** | Integración con **OSRM API** (Snap to Roads) para trazado fiel a las calles de Gutiérrez Zamora | **Project OSRM** |

---

## 🗄️ Esquemas de Base de Datos en Mongoose (`src/modelos/`)

1. **`Usuario`** (`src/modelos/Usuario.ts`):
   - `clerk_id`: Identificador único de Clerk.
   - `nombre`, `correo`, `telefono`, `departamento`.
   - `rol`: `SUPER_ADMIN`, `DIRECTOR_OBRAS`, `OPERADOR_DESPACHADOR`, `CONDUCTOR`, `CIUDADANO`.
   - `placas_vehiculo`: Asignación vehicular para choferes.

2. **`Camion`** (`src/modelos/Camion.ts`):
   - `numero_economico`: Identificador municipal (ej. `EcoZamora-01`).
   - `placas`, `modelo`, `conductor_asignado`.
   - `estado`: `EN_RUTA`, `EN_PAUSA`, `MANTENIMIENTO`, `FUERA_DE_SERVICIO`.
   - `ubicacion_actual`: GeoJSON `Point` con índice `2dsphere`.
   - `velocidad_actual`, `orientacion` (rumbo 0-360°), `ultima_actualizacion`.

3. **`Ruta`** (`src/modelos/Ruta.ts`):
   - `nombre_ruta`, `colonia_zona`.
   - `geometria`: GeoJSON `LineString` con índice `2dsphere`.
   - `dias_recoleccion`: Array de días (ej. `["Lunes", "Miércoles", "Viernes"]`).
   - `horario_inicio`, `horario_fin`, `distancia_km`.

4. **`Incidente`** (`src/modelos/Incidente.ts`):
   - `camion_id`, `conductor_id`.
   - `tipo_incidente`: `TRAFICO_CALLE_CERRADA`, `FALLA_MECANICA`, `TIEMPO_DESCANSO`, `IMPREVISTO_OTRO`, `EXCESO_VELOCIDAD`.
   - `descripcion`, `velocidad_registrada`.
   - `ubicacion`: GeoJSON `Point`.
   - `estado`: `ACTIVO`, `RESUELTO`.

5. **`Reclamo`** (`src/modelos/Reclamo.ts`):
   - `ciudadano_id`, `ciudadano_nombre`.
   - `tipo_reclamo`: `CAMION_NO_PASO`, `BASURA_TIRADA`, `CONTENEDOR_DANADO`.
   - `descripcion`, `fotografia_url`.
   - `ubicacion`: GeoJSON `Point`.
   - `estado`: `PENDIENTE`, `EN_REVISION`, `RESUELTO`.

6. **`HistorialUbicacion`** (`src/modelos/HistorialUbicacion.ts`):
   - `camion_id`, `velocidad`, `orientacion`, `exceso_velocidad`.
   - `ubicacion`: GeoJSON `Point`.
   - `fecha_registro`: Marca temporal cronológica indexada para playback.

---

## 🚀 Nuevas Funcionalidades y Endpoints Propios

### 1. Ingesta de Telemetría Real y WebSockets
* **REST**: `POST /api/v1/telemetria/actualizar-ubicacion`
  - Ingesta directa de coordenadas desde smartphones de conductores.
  - Actualiza el estado del camión y almacena en el historial.
* **WebSockets**: `WS /ws/v1/rastreo-en-vivo` (puerto 4000 en `servidor/servidor.js`)
  - Difusión instantánea de cambios de posición a todos los dashboards conectados.

### 2. Detección Automática de Exceso de Velocidad (> 40 km/h)
* Si un camión reporta una velocidad superior a 40 km/h en zona urbana de Gutiérrez Zamora:
  - Se genera automáticamente un `Incidente` de tipo `EXCESO_VELOCIDAD`.
  - Se marca la telemetría histórica con `exceso_velocidad: true`.
  - Se emite una alerta visual en el mapa y en el panel de auditoría.

### 3. Estimación de Tiempo de Llegada (ETA)
* **REST**: `GET /api/v1/telemetria/eta?latitud=...&longitud=...`
  - Calcula la distancia terrestre (Haversine) entre la ubicación del ciudadano y el camión más próximo en ruta.
  - Proyecta los minutos estimados de llegada tomando en cuenta la velocidad del vehículo.

### 4. Reproducción de Rutas (Playback de Recorrido)
* **REST**: `GET /api/v1/historial/recorrido/:camion_id?fecha=YYYY-MM-DD`
  - Permite auditar el camino recorrido por un vehículo en una fecha determinada.
  - Proporciona velocímetro, scrubber temporal interactivo, puntos de exceso de velocidad y métricas de promedio.
  - Vista integrada en el dashboard: **"Reproducción GPS"**.

### 5. Editor Intuitivo de Rutas (Snap to Roads vía OSRM)
* **REST**: `GET /api/v1/rutas` y `POST /api/v1/rutas`
  - Permite a la Dirección de Obras Públicas trazar rutas haciendo clics en el mapa.
  - Ajusta los trazos automáticamente a las calles reales mediante la API de OSRM.

---

## 💻 Ejecución Local

### 1. Variables de Entorno (`.env`)
Asegúrate de contar con tus claves de MongoDB Atlas y Clerk en el archivo `.env`:
```bash
MONGODB_URI=mongodb+srv://<usuario>:<password>@<cluster>.mongodb.net/ecoruta?retryWrites=true&w=majority
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

### 2. Iniciar Plataforma Web (Next.js)
```bash
npm run dev
```
Accede en tu navegador a: [http://localhost:3000](http://localhost:3000)

### 3. Iniciar Servidor Independiente de WebSockets (Opcional para telemetría directa)
```bash
cd servidor
npm install
npm start
```
Canal de WebSockets escuchando en: `ws://localhost:4000/ws/v1/rastreo-en-vivo`

---

## 🎨 Guía de Estilo Anti-Slop (Taste Skill)
* **Diseño cívico de alta utilidad**: Enfoque en claridad, contraste y ergonomía para operadores municipales.
* **Paleta**: Tonos neutrales pizarra (`slate`) y acentos esmeralda (`emerald`) de identidad ecológica.
* **Cartografía**: Teselas CartoDB Voyager de alta legibilidad, evitando ruido visual innecesario en el mapa.
