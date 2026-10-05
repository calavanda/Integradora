"use client";

import React, { useState } from "react";
import {
  Column,
  Row,
  Text,
  Badge,
  Card,
  Button,
  IconButton,
} from "@once-ui-system/core";
import {
  HiOutlineCodeBracket,
  HiOutlineCommandLine,
  HiOutlineDocumentText,
  HiOutlineServer,
  HiOutlineCheck,
  HiOutlineClipboardDocument,
  HiOutlineBolt,
  HiOutlineChevronDown,
  HiOutlineChevronRight,
  HiOutlineDevicePhoneMobile,
  HiOutlineShieldCheck,
} from "react-icons/hi2";

interface EndpointDoc {
  id: string;
  metodo: "GET" | "POST" | "WS";
  ruta: string;
  titulo: string;
  descripcion: string;
  seguridad: "Pública" | "Token Chófer" | "Admin Bearer" | "Pública / Autenticada";
  encabezados: Record<string, string>;
  cuerpoJson?: any;
  respuestaJson: any;
  codigoEjemplos: {
    fetch: string;
    axios: string;
    reactNative: string;
  };
}

const ENDPOINTS_REALES: EndpointDoc[] = [
  {
    id: "telemetria-actualizar",
    metodo: "POST",
    ruta: "/api/v1/telemetria/actualizar-ubicacion",
    titulo: "Ingesta de Coordenadas GPS del Conductor",
    descripcion:
      "Ingesta continua de telemetría proveniente del smartphone del chofer cada 4 segundos. Registra el historial geográfico y valida en tiempo real si el camión excede el límite de velocidad urbana (40 km/h en Gutiérrez Zamora).",
    seguridad: "Token Chófer",
    encabezados: {
      "Content-Type": "application/json",
      "X-Dispositivo-Origen": "App-Conductor-EcoRuta",
    },
    cuerpoJson: {
      numero_economico: "ECO-01",
      latitud: 20.4527,
      longitud: -97.0896,
      velocidad: 28.5,
      orientacion: 180,
      conductor_id: "COND-04",
      estado: "EN_RUTA",
    },
    respuestaJson: {
      exito: true,
      mensaje: "Ubicación y telemetría registradas satisfactoriamente.",
      camion: {
        id: "66fc...a1",
        numero_economico: "ECO-01",
        estado: "EN_RUTA",
        ultima_actualizacion: "2026-10-04T22:30:00.000Z",
      },
      alerta_velocidad: false,
    },
    codigoEjemplos: {
      fetch: `// Ingesta de coordenadas vía fetch nativo
const respuesta = await fetch("https://zamoralimpia.gob.mx/api/v1/telemetria/actualizar-ubicacion", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "X-Dispositivo-Origen": "App-Conductor-EcoRuta",
  },
  body: JSON.stringify({
    numero_economico: "ECO-01",
    latitud: 20.4527,
    longitud: -97.0896,
    velocidad: 28.5,
    orientacion: 180,
    conductor_id: "COND-04",
    estado: "EN_RUTA",
  }),
});
const datos = await respuesta.json();
console.log("Resultado telemetría:", datos);`,
      axios: `// Ingesta de coordenadas vía axios
import axios from "axios";

const { data } = await axios.post(
  "https://zamoralimpia.gob.mx/api/v1/telemetria/actualizar-ubicacion",
  {
    numero_economico: "ECO-01",
    latitud: 20.4527,
    longitud: -97.0896,
    velocidad: 28.5,
    orientacion: 180,
    conductor_id: "COND-04",
    estado: "EN_RUTA",
  },
  {
    headers: {
      "Content-Type": "application/json",
    },
  }
);
console.log("Servidor respondió:", data);`,
      reactNative: `// React Native con Expo Location (Tarea en segundo plano)
import * as TaskManager from "expo-task-manager";
import * as Location from "expo-location";

const TAREA_RASTREO_GPS = "TAREA_TELEMETRIA_ECORUTA";

TaskManager.defineTask(TAREA_RASTREO_GPS, async ({ data, error }) => {
  if (error || !data) return;
  const { locations } = data as { locations: Location.LocationObject[] };
  const ubicacion = locations[0];

  await fetch("https://zamoralimpia.gob.mx/api/v1/telemetria/actualizar-ubicacion", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      numero_economico: "ECO-01",
      latitud: ubicacion.coords.latitude,
      longitud: ubicacion.coords.longitude,
      velocidad: Math.max(0, (ubicacion.coords.speed || 0) * 3.6), // m/s a km/h
      orientacion: ubicacion.coords.heading || 0,
      conductor_id: "COND-04",
      estado: "EN_RUTA",
    }),
  });
});`,
    },
  },
  {
    id: "camiones-activos",
    metodo: "GET",
    ruta: "/api/v1/publico/camiones-activos",
    titulo: "Flota Activa en Tiempo Real (Público)",
    descripcion:
      "Consulta ligera de todos los camiones compactadores que se encuentran operando actualmente en el municipio. Endpoint público sin API Key diseñado para portales de consulta vecinal.",
    seguridad: "Pública",
    encabezados: {
      Accept: "application/json",
    },
    respuestaJson: {
      exito: true,
      total: 2,
      camiones: [
        {
          id: "66fc...a1",
          numero_economico: "ECO-01",
          placas: "XJ-4821-A",
          estado: "EN_RUTA",
          latitud: 20.4527,
          longitud: -97.0896,
          velocidad_actual: 28.5,
          orientacion: 180,
          conductor: "Carlos Vega Ortiz",
          ultima_actualizacion: "2026-10-04T22:30:00.000Z",
        },
        {
          id: "66fc...b2",
          numero_economico: "ECO-02",
          placas: "XJ-9932-B",
          estado: "EN_SERVICIO",
          latitud: 20.4485,
          longitud: -97.0815,
          velocidad_actual: 15.0,
          orientacion: 90,
          conductor: "Manuel Reyes Castillo",
          ultima_actualizacion: "2026-10-04T22:29:55.000Z",
        },
      ],
    },
    codigoEjemplos: {
      fetch: `// Consulta de camiones activos vía fetch
const respuesta = await fetch("https://zamoralimpia.gob.mx/api/v1/publico/camiones-activos");
const { camiones } = await respuesta.json();
console.log("Camiones en ruta:", camiones);`,
      axios: `// Consulta de camiones activos vía axios
import axios from "axios";

const { data } = await axios.get("https://zamoralimpia.gob.mx/api/v1/publico/camiones-activos");
console.log("Total unidades activas:", data.total);`,
      reactNative: `// Hook de React Native con actualización automática cada 5s
import { useEffect, useState } from "react";

export function useCamionesActivos() {
  const [flota, setFlota] = useState([]);

  useEffect(() => {
    const consultar = async () => {
      try {
        const res = await fetch("https://zamoralimpia.gob.mx/api/v1/publico/camiones-activos");
        const json = await res.json();
        if (json.exito) setFlota(json.camiones);
      } catch (err) {
        console.error("Error al sincronizar flota:", err);
      }
    };

    consultar();
    const intervalo = setInterval(consultar, 5000);
    return () => clearInterval(intervalo);
  }, []);

  return flota;
}`,
    },
  },
  {
    id: "rutas-crear",
    metodo: "POST",
    ruta: "/api/v1/rutas/crear",
    titulo: "Creación y Guardado de Rutas GeoJSON",
    descripcion:
      "Almacena las geometrías de recolección trazadas en el Editor OSRM con coordenadas GeoJSON LineString [longitud, latitud], asignación de turnos, días de operación y colonias de cobertura.",
    seguridad: "Admin Bearer",
    encabezados: {
      "Content-Type": "application/json",
      Authorization: "Bearer <token_admin>",
    },
    cuerpoJson: {
      nombre_ruta: "Ruta Ribera y Centro Histórico",
      dias_recoleccion: "Lunes, Miércoles, Viernes",
      horario_inicio: "07:00",
      horario_fin: "14:30",
      colonia_zona: "Centro y Ribereña",
      distancia_km: 5.4,
      coordenadas: [
        [20.4527, -97.0896],
        [20.451, -97.085],
        [20.4495, -97.0812],
      ],
    },
    respuestaJson: {
      exito: true,
      mensaje: "Ruta oficial de recolección registrada exitosamente.",
      ruta: {
        id: "6701...c8",
        nombre_ruta: "Ruta Ribera y Centro Histórico",
        distancia_km: 5.4,
        activa: true,
      },
    },
    codigoEjemplos: {
      fetch: `// Guardar ruta oficial mediante fetch
const respuesta = await fetch("https://zamoralimpia.gob.mx/api/v1/rutas/crear", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: "Bearer eyJhbGciOi...",
  },
  body: JSON.stringify({
    nombre_ruta: "Ruta Centro - Ribera",
    dias_recoleccion: "Lunes, Miércoles, Viernes",
    horario_inicio: "07:00",
    horario_fin: "14:30",
    colonia_zona: "Centro",
    distancia_km: 4.8,
    coordenadas: [
      [20.4527, -97.0896],
      [20.4510, -97.0850],
      [20.4495, -97.0812],
    ],
  }),
});
const resultado = await respuesta.json();`,
      axios: `// Guardar ruta oficial mediante axios
import axios from "axios";

const { data } = await axios.post(
  "https://zamoralimpia.gob.mx/api/v1/rutas/crear",
  {
    nombre_ruta: "Ruta Centro - Ribera",
    dias_recoleccion: "Lunes, Miércoles, Viernes",
    horario_inicio: "07:00",
    horario_fin: "14:30",
    colonia_zona: "Centro",
    distancia_km: 4.8,
    coordenadas: [[20.4527, -97.0896], [20.4510, -97.0850]],
  },
  {
    headers: { Authorization: "Bearer eyJhbGciOi..." }
  }
);`,
      reactNative: `// Envío de geometría desde cliente móvil administrativo
const guardarRuta = async (datosRuta, tokenAdmin) => {
  const res = await fetch("https://zamoralimpia.gob.mx/api/v1/rutas/crear", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: \`Bearer \${tokenAdmin}\`,
    },
    body: JSON.stringify(datosRuta),
  });
  return await res.json();
};`,
    },
  },
  {
    id: "incidentes-reportar",
    metodo: "POST",
    ruta: "/api/v1/incidentes/reportar",
    titulo: "Reporte de Imprevistos por el Conductor",
    descripcion:
      "Emisión inmediata de incidencias en ruta (fallas mecánicas, cortes de calle, contingencias climáticas o desvíos forzosos). Altera el estado del camión y alerta a la mesa de supervisión.",
    seguridad: "Token Chófer",
    encabezados: {
      "Content-Type": "application/json",
    },
    cuerpoJson: {
      camion_id: "ECO-02",
      tipo: "FALLA_MECANICA",
      descripcion: "Pinchadura de neumático trasero en Av. Hermenegildo Galeana",
      latitud: 20.4495,
      longitud: -97.0812,
      gravedad: "MEDIA",
    },
    respuestaJson: {
      exito: true,
      mensaje: "Incidente reportado exitosamente. Se ha alertado al supervisor.",
      incidente_id: "6702...f3",
    },
    codigoEjemplos: {
      fetch: `// Reporte de incidente vía fetch
const respuesta = await fetch("https://zamoralimpia.gob.mx/api/v1/incidentes/reportar", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    camion_id: "ECO-02",
    tipo: "FALLA_MECANICA",
    descripcion: "Neumático pinchado en calle Hidalgo",
    latitud: 20.4495,
    longitud: -97.0812,
    gravedad: "MEDIA",
  }),
});
const resultado = await respuesta.json();`,
      axios: `// Reporte de incidente vía axios
import axios from "axios";

const res = await axios.post("https://zamoralimpia.gob.mx/api/v1/incidentes/reportar", {
  camion_id: "ECO-02",
  tipo: "BLOQUEO_VIAL",
  descripcion: "Obras públicas cerraron acceso a la ribera",
  latitud: 20.4512,
  longitud: -97.0874,
  gravedad: "ALTA",
});`,
      reactNative: `// Función de reporte directo para botón de pánico en la App del Chofer
export async function reportarIncidenteInmediato(camionId, tipo, coords, desc) {
  const respuesta = await fetch("https://zamoralimpia.gob.mx/api/v1/incidentes/reportar", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      camion_id: camionId,
      tipo,
      descripcion: desc,
      latitud: coords.latitude,
      longitud: coords.longitude,
      gravedad: "ALTA",
    }),
  });
  return await respuesta.json();
}`,
    },
  },
  {
    id: "reclamos-crear",
    metodo: "POST",
    ruta: "/api/v1/reclamos/crear",
    titulo: "Registro de Reclamo Ciudadano con Foto y GPS",
    descripcion:
      "Ventanilla de quejas ciudadanas con geolocalización precisa de la vivienda, evidencia fotográfica y folio único para seguimiento vecinal.",
    seguridad: "Pública",
    encabezados: {
      "Content-Type": "application/json",
    },
    cuerpoJson: {
      ciudadano_nombre: "Rosa Elena Méndez",
      colonia: "Barrio de la Marina",
      direccion: "Calle Ignacio Zaragoza #45",
      tipo_reclamo: "BASURA_NO_RECOGIDA",
      descripcion: "El camión no pasó en el horario habitual de las 08:00 AM",
      latitud: 20.4532,
      longitud: -97.0881,
      evidencia_foto_url: "https://storage.zamoralimpia.gob.mx/evidencias/rec-45.jpg",
    },
    respuestaJson: {
      exito: true,
      mensaje: "Reclamo registrado exitosamente.",
      folio: "REC-2026-089",
      estado: "RECIBIDO",
      fecha: "2026-10-04T22:30:00.000Z",
    },
    codigoEjemplos: {
      fetch: `// Registro de queja ciudadana vía fetch
const respuesta = await fetch("https://zamoralimpia.gob.mx/api/v1/reclamos/crear", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    ciudadano_nombre: "María Morales",
    colonia: "Centro",
    direccion: "Calle Hidalgo #104",
    tipo_reclamo: "BASURA_NO_RECOGIDA",
    descripcion: "Bolsas acumuladas frente al parque central",
    latitud: 20.4532,
    longitud: -97.0881,
    evidencia_foto_url: "https://storage.zamoralimpia.gob.mx/reclamos/rec-089.jpg",
  }),
});
const { folio } = await respuesta.json();
console.log("Folio asignado:", folio);`,
      axios: `// Registro de queja ciudadana vía axios
import axios from "axios";

const { data } = await axios.post("https://zamoralimpia.gob.mx/api/v1/reclamos/crear", {
  ciudadano_nombre: "Juan Domínguez",
  colonia: "Renacimiento",
  direccion: "Av. 5 de Mayo #12",
  tipo_reclamo: "CONTENEDOR_DESBORDADO",
  descripcion: "Contenedor roto desparramando residuos",
  latitud: 20.4491,
  longitud: -97.0844,
});`,
      reactNative: `// Envío de reporte vecinal con cámara y geolocalización en React Native
import * as Location from "expo-location";

export async function enviarReclamoVecinal(datos, fotoUrl) {
  const { coords } = await Location.getCurrentPositionAsync({});
  const respuesta = await fetch("https://zamoralimpia.gob.mx/api/v1/reclamos/crear", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...datos,
      latitud: coords.latitude,
      longitud: coords.longitude,
      evidencia_foto_url: fotoUrl,
    }),
  });
  return await respuesta.json();
}`,
    },
  },
  {
    id: "ws-rastreo",
    metodo: "WS",
    ruta: "/ws/v1/rastreo-en-vivo",
    titulo: "Transmisión WebSocket en Tiempo Real",
    descripcion:
      "Canal bidireccional streaming de baja latencia (RFC 6455). Emite eventos instantáneos cada vez que cualquier camión transmite un nuevo punto de telemetría satelital.",
    seguridad: "Pública / Autenticada",
    encabezados: {
      Upgrade: "websocket",
      Connection: "Upgrade",
    },
    respuestaJson: {
      evento: "POSICION_ACTUALIZADA",
      timestamp: "2026-10-04T22:30:15.000Z",
      camion: {
        numero_economico: "ECO-01",
        latitud: 20.4531,
        longitud: -97.0891,
        velocidad: 22.0,
        orientacion: 175,
        estado: "EN_RUTA",
      },
    },
    codigoEjemplos: {
      fetch: `// Conexión nativa WebSocket de navegador
const wsProtocolo = window.location.protocol === "https:" ? "wss:" : "ws:";
const socket = new WebSocket(\`\${wsProtocolo}//\${window.location.host}/ws/v1/rastreo-en-vivo\`);

socket.onopen = () => {
  console.log("Canal de telemetría en vivo conectado");
};

socket.onmessage = (evento) => {
  const paquete = JSON.parse(evento.data);
  if (paquete.evento === "POSICION_ACTUALIZADA") {
    console.log("Camión actualizado:", paquete.camion);
  }
};

socket.onerror = (err) => console.error("Error WebSocket:", err);`,
      axios: `// Suscripción WebSocket con reconexión automática en Node.js
const WebSocket = require("ws");

function conectarTelemetria() {
  const ws = new WebSocket("wss://zamoralimpia.gob.mx/ws/v1/rastreo-en-vivo");

  ws.on("open", () => console.log("Streaming conectado"));
  ws.on("message", (datos) => {
    const json = JSON.parse(datos);
    console.log("Telemetría:", json);
  });
  ws.on("close", () => {
    console.warn("Conexión cerrada, reconectando en 3s...");
    setTimeout(conectarTelemetria, 3000);
  });
}

conectarTelemetria();`,
      reactNative: `// Hook de React Native para escuchar la posición en tiempo real
import { useEffect, useState } from "react";

export function useRastreoWebSocket() {
  const [ultimaTelemetria, setUltimaTelemetria] = useState(null);

  useEffect(() => {
    const ws = new WebSocket("wss://zamoralimpia.gob.mx/ws/v1/rastreo-en-vivo");

    ws.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.evento === "POSICION_ACTUALIZADA") {
          setUltimaTelemetria(payload.camion);
        }
      } catch (e) {
        console.error("Payload corrupto:", e);
      }
    };

    return () => ws.close();
  }, []);

  return ultimaTelemetria;
}`,
    },
  },
];

export function VistaDocumentacionApis() {
  const [endpointAbierto, setEndpointAbierto] = useState<string>("telemetria-actualizar");
  const [lenguajeActivo, setLenguajeActivo] = useState<"fetch" | "axios" | "reactNative">("fetch");
  const [copiadoId, setCopiadoId] = useState<string | null>(null);

  const copiarAlPortapapeles = (texto: string, id: string) => {
    navigator.clipboard.writeText(texto);
    setCopiadoId(id);
    setTimeout(() => setCopiadoId(null), 2000);
  };

  const getBadgeColor = (metodo: string) => {
    switch (metodo) {
      case "GET":
        return "var(--eco-cyan-400)";
      case "POST":
        return "var(--eco-emerald-400)";
      case "WS":
        return "var(--eco-purple-400)";
      default:
        return "var(--eco-text-secondary)";
    }
  };

  return (
    <Column fillWidth gap="l" style={{ maxWidth: "1200px", margin: "0 auto" }}>
      {/* Encabezado Principal de Documentación */}
      <Column gap="s">
        <Row vertical="center" gap="s">
          <Badge textVariant="code-default-s" border="neutral-alpha-medium">
            ESPACIO TÉCNICO · DESARROLLADORES
          </Badge>
          <Badge textVariant="code-default-s" border="neutral-alpha-weak">
            v1.0.0 OpenAPI
          </Badge>
          <Badge textVariant="code-default-s" border="neutral-alpha-weak">
            100% CÓDIGO EN ESPAÑOL
          </Badge>
        </Row>
        <Text variant="heading-strong-xl">Documentación de APIs y Telemetría Backend</Text>
        <Text variant="body-default-m" onBackground="neutral-weak">
          Especificación técnica formal de los servicios RESTful y WebSockets nativos de EcoRuta Zamora Limpia. Todos los endpoints consumen y emiten payloads estrictamente tipados en español, diseñados para apps móviles de conductores y portales públicos de transparencia municipal.
        </Text>
      </Column>

      {/* Tarjeta de Servidores y Parámetros Globales */}
      <Card padding="m" radius="m" border="neutral-alpha-weak" background="surface">
        <Row fillWidth horizontal="between" vertical="center" style={{ flexWrap: "wrap", gap: "16px" }}>
          <Row vertical="center" gap="m">
            <HiOutlineServer size={22} style={{ color: "var(--eco-cyan-400)" }} />
            <Column gap="2">
              <Text variant="body-strong-s">Servidor Base API (Producción / Local)</Text>
              <Text variant="code-default-s" onBackground="neutral-weak">
                <code>https://zamoralimpia.gob.mx/api/v1</code> · <code>http://localhost:3000/api/v1</code>
              </Text>
            </Column>
          </Row>
          <Row vertical="center" gap="m">
            <HiOutlineBolt size={22} style={{ color: "var(--eco-purple-400)" }} />
            <Column gap="2">
              <Text variant="body-strong-s">Servidor WebSocket</Text>
              <Text variant="code-default-s" onBackground="neutral-weak">
                <code>wss://zamoralimpia.gob.mx/ws/v1/rastreo-en-vivo</code>
              </Text>
            </Column>
          </Row>
          <Row vertical="center" gap="m">
            <HiOutlineShieldCheck size={22} style={{ color: "var(--eco-emerald-400)" }} />
            <Column gap="2">
              <Text variant="body-strong-s">Autenticación</Text>
              <Text variant="body-default-xs" onBackground="neutral-weak">
                Bearer Token JWT / Headers Móviles
              </Text>
            </Column>
          </Row>
        </Row>
      </Card>

      {/* Selector de Lenguaje de Ejemplos */}
      <Row fillWidth horizontal="between" vertical="center" style={{ flexWrap: "wrap", gap: "12px" }}>
        <Text variant="heading-strong-s">Catálogo de Endpoints Operativos</Text>
        <Row gap="xs" background="page" padding="xs" radius="m" border="neutral-alpha-weak">
          <Button
            size="s"
            variant={lenguajeActivo === "fetch" ? "primary" : "tertiary"}
            onClick={() => setLenguajeActivo("fetch")}
          >
            <HiOutlineCommandLine style={{ marginRight: "6px" }} /> Fetch (Nativo)
          </Button>
          <Button
            size="s"
            variant={lenguajeActivo === "axios" ? "primary" : "tertiary"}
            onClick={() => setLenguajeActivo("axios")}
          >
            <HiOutlineCodeBracket style={{ marginRight: "6px" }} /> Axios
          </Button>
          <Button
            size="s"
            variant={lenguajeActivo === "reactNative" ? "primary" : "tertiary"}
            onClick={() => setLenguajeActivo("reactNative")}
          >
            <HiOutlineDevicePhoneMobile style={{ marginRight: "6px" }} /> React Native
          </Button>
        </Row>
      </Row>

      {/* Lista de Endpoints Estilo Swagger */}
      <Column fillWidth gap="m">
        {ENDPOINTS_REALES.map((ep) => {
          const estaAbierto = endpointAbierto === ep.id;
          const badgeColor = getBadgeColor(ep.metodo);

          return (
            <Card
              key={ep.id}
              radius="m"
              border="neutral-alpha-weak"
              background="surface"
              style={{
                overflow: "hidden",
                transition: "border-color 0.2s ease, box-shadow 0.2s ease",
              }}
            >
              {/* Barra Cabecera del Endpoint */}
              <Row
                fillWidth
                vertical="center"
                horizontal="between"
                padding="m"
                onClick={() => setEndpointAbierto(estaAbierto ? "" : ep.id)}
                style={{
                  cursor: "pointer",
                  background: estaAbierto ? "var(--neutral-alpha-weak)" : "transparent",
                  transition: "background 0.15s ease",
                }}
              >
                <Row vertical="center" gap="m" style={{ flexWrap: "wrap" }}>
                  <span
                    style={{
                      fontWeight: 700,
                      fontFamily: "var(--font-family-code)",
                      fontSize: "12px",
                      padding: "4px 10px",
                      borderRadius: "6px",
                      backgroundColor: "var(--surface)",
                      color: badgeColor,
                      border: `1px solid ${badgeColor}`,
                    }}
                  >
                    {ep.metodo}
                  </span>
                  <Text variant="code-default-m" style={{ fontWeight: 600 }}>
                    {ep.ruta}
                  </Text>
                  <Text variant="body-default-s" onBackground="neutral-weak">
                    — {ep.titulo}
                  </Text>
                </Row>

                <Row vertical="center" gap="s">
                  <Badge textVariant="code-default-xs" border="neutral-alpha-weak">
                    {ep.seguridad}
                  </Badge>
                  {estaAbierto ? (
                    <HiOutlineChevronDown size={18} />
                  ) : (
                    <HiOutlineChevronRight size={18} />
                  )}
                </Row>
              </Row>

              {/* Contenido Expandible del Endpoint */}
              {estaAbierto && (
                <Column fillWidth padding="l" gap="l" borderTop="neutral-alpha-weak">
                  <Text variant="body-default-m">{ep.descripcion}</Text>

                  {/* Encabezados */}
                  <Column gap="xs">
                    <Text variant="heading-strong-xs" onBackground="neutral-weak">
                      ENCABEZADOS REQUERIDOS
                    </Text>
                    <div
                      style={{
                        backgroundColor: "var(--page)",
                        borderRadius: "8px",
                        padding: "12px",
                        border: "1px solid var(--neutral-alpha-weak)",
                        fontFamily: "var(--font-family-code)",
                        fontSize: "13px",
                      }}
                    >
                      {Object.entries(ep.encabezados).map(([clave, valor]) => (
                        <div key={clave} style={{ padding: "2px 0" }}>
                          <span style={{ color: "var(--eco-cyan-400)" }}>{clave}</span>:{" "}
                          <span style={{ color: "var(--eco-text-secondary)" }}>{valor}</span>
                        </div>
                      ))}
                    </div>
                  </Column>

                  {/* Payload de Solicitud (Si aplica) */}
                  {ep.cuerpoJson && (
                    <Column gap="xs">
                      <Row horizontal="between" vertical="center">
                        <Text variant="heading-strong-xs" onBackground="neutral-weak">
                          CUERPO DE SOLICITUD (JSON)
                        </Text>
                        <IconButton
                          icon={copiadoId === `${ep.id}-req` ? "check" : "copy"}
                          size="s"
                          variant="tertiary"
                          aria-label="Copiar JSON de solicitud"
                          onClick={() =>
                            copiarAlPortapapeles(JSON.stringify(ep.cuerpoJson, null, 2), `${ep.id}-req`)
                          }
                        />
                      </Row>
                      <pre
                        style={{
                          backgroundColor: "var(--page)",
                          borderRadius: "8px",
                          padding: "14px",
                          margin: 0,
                          border: "1px solid var(--neutral-alpha-weak)",
                          fontFamily: "var(--font-family-code)",
                          fontSize: "13px",
                          overflowX: "auto",
                          color: "var(--foreground)",
                        }}
                      >
                        {JSON.stringify(ep.cuerpoJson, null, 2)}
                      </pre>
                    </Column>
                  )}

                  {/* Respuesta del Servidor */}
                  <Column gap="xs">
                    <Row horizontal="between" vertical="center">
                      <Text variant="heading-strong-xs" onBackground="neutral-weak">
                        RESPUESTA DEL SERVIDOR (200 OK / EVENTO WS)
                      </Text>
                      <IconButton
                        icon={copiadoId === `${ep.id}-res` ? "check" : "copy"}
                        size="s"
                        variant="tertiary"
                        aria-label="Copiar JSON de respuesta"
                        onClick={() =>
                          copiarAlPortapapeles(JSON.stringify(ep.respuestaJson, null, 2), `${ep.id}-res`)
                        }
                      />
                    </Row>
                    <pre
                      style={{
                        backgroundColor: "var(--page)",
                        borderRadius: "8px",
                        padding: "14px",
                        margin: 0,
                        border: "1px solid var(--neutral-alpha-weak)",
                        fontFamily: "var(--font-family-code)",
                        fontSize: "13px",
                        overflowX: "auto",
                        color: "var(--eco-emerald-400)",
                      }}
                    >
                      {JSON.stringify(ep.respuestaJson, null, 2)}
                    </pre>
                  </Column>

                  {/* Ejemplo de Código en el Lenguaje Seleccionado */}
                  <Column gap="xs">
                    <Row horizontal="between" vertical="center">
                      <Row vertical="center" gap="s">
                        <Text variant="heading-strong-xs" onBackground="neutral-weak">
                          EJEMPLO DE CONSUMO ({lenguajeActivo.toUpperCase()})
                        </Text>
                      </Row>
                      <IconButton
                        icon={copiadoId === `${ep.id}-code` ? "check" : "copy"}
                        size="s"
                        variant="tertiary"
                        aria-label="Copiar código de ejemplo"
                        onClick={() =>
                          copiarAlPortapapeles(ep.codigoEjemplos[lenguajeActivo], `${ep.id}-code`)
                        }
                      />
                    </Row>
                    <pre
                      style={{
                        backgroundColor: "var(--page)",
                        borderRadius: "8px",
                        padding: "14px",
                        margin: 0,
                        border: "1px solid var(--neutral-alpha-weak)",
                        fontFamily: "var(--font-family-code)",
                        fontSize: "12px",
                        lineHeight: "1.5",
                        overflowX: "auto",
                        color: "var(--eco-cyan-400)",
                      }}
                    >
                      {ep.codigoEjemplos[lenguajeActivo]}
                    </pre>
                  </Column>
                </Column>
              )}
            </Card>
          );
        })}
      </Column>
    </Column>
  );
}
