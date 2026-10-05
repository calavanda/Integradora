/**
 * ECO RUTA (ZAMORA LIMPIA) — SERVIDOR BACKEND Y WEBSOCKETS
 * Gutiérrez Zamora, Veracruz, México
 * Diseñado para despliegue 100% gratuito en Render / Railway
 */

const http = require("http");
const express = require("express");
const cors = require("cors");
const { WebSocketServer, WebSocket } = require("ws");
const mongoose = require("mongoose");

const PUERTO = process.env.PORT || 4000;
const MONGODB_URI = process.env.MONGODB_URI;
const LIMITE_VELOCIDAD_URBANA_KMH = 40;

const app = express();
app.use(cors());
app.use(express.json());

// ─────────────────────────────────────────────────────────────────────────────
// Conexión a MongoDB Atlas
// ─────────────────────────────────────────────────────────────────────────────
if (MONGODB_URI) {
  mongoose
    .connect(MONGODB_URI)
    .then(() => console.log("[MongoDB Atlas] Conexión establecida desde servidor Node.js"))
    .catch((err) => console.error("[MongoDB Atlas] Error de conexión:", err));
} else {
  console.warn("[Aviso] MONGODB_URI no definida. El servidor funcionará en modo difusión en memoria.");
}

// ─────────────────────────────────────────────────────────────────────────────
// Servidor HTTP y WebSockets nativo
// ─────────────────────────────────────────────────────────────────────────────
const servidorHttp = http.createServer(app);
const wss = new WebSocketServer({ server: servidorHttp, path: "/ws/v1/rastreo-en-vivo" });

// Memoria volátil de camiones conectados en vivo
const camionesEnVivo = new Map();

/**
 * Difunde un mensaje JSON a todos los clientes conectados al WebSocket
 */
function difundirATodos(mensaje) {
  const carga = JSON.stringify(mensaje);
  wss.clients.forEach((cliente) => {
    if (cliente.readyState === WebSocket.OPEN) {
      cliente.send(carga);
    }
  });
}

wss.on("connection", (ws, req) => {
  const ip = req.socket.remoteAddress;
  console.log(`[WebSocket] Cliente conectado desde: ${ip}`);

  // Enviar estado actual de todos los camiones activos al nuevo cliente
  const listaActual = Array.from(camionesEnVivo.values());
  ws.send(
    JSON.stringify({
      tipo: "ESTADO_INICIAL",
      total_camiones: listaActual.length,
      camiones: listaActual,
      servidor_tiempo: new Date().toISOString(),
    })
  );

  ws.on("message", (datosCrudos) => {
    try {
      const datos = JSON.parse(datosCrudos.toString());

      // Ingesta directa desde smartphone de conductor (React Native)
      if (datos.tipo === "TELEMETRIA_CONDUCTOR") {
        procesarTelemetria(datos);
      }
    } catch (e) {
      console.warn("[WebSocket] Error al procesar mensaje entrante:", e);
    }
  });

  ws.on("close", () => {
    console.log(`[WebSocket] Cliente desconectado (${ip})`);
  });
});

/**
 * Procesa la telemetría real y la difunde en vivo
 */
function procesarTelemetria(datos) {
  const {
    numero_economico,
    camion_id,
    latitud,
    longitud,
    velocidad = 0,
    orientacion = 0,
    conductor = "Conductor en Turno",
  } = datos;

  const id = numero_economico || camion_id;
  if (!id || latitud === undefined || longitud === undefined) return null;

  const vel = Number(velocidad);
  const lat = Number(latitud);
  const lng = Number(longitud);
  const orient = Number(orientacion);
  const excesoVelocidad = vel > LIMITE_VELOCIDAD_URBANA_KMH;

  const registroCamion = {
    numero_economico: id,
    latitud: lat,
    longitud: lng,
    velocidad: vel,
    orientacion: orient,
    conductor,
    estado: vel > 0 ? "EN_RUTA" : "EN_PAUSA",
    exceso_velocidad: excesoVelocidad,
    ultima_actualizacion: new Date().toISOString(),
  };

  camionesEnVivo.set(id, registroCamion);

  // Notificar en vivo a todos los clientes del Dashboard y App Móvil
  difundirATodos({
    tipo: "ACTUALIZACION_UBICACION",
    camion: registroCamion,
    alerta_velocidad: excesoVelocidad
      ? {
          numero_economico: id,
          velocidad_detectada: vel,
          limite: LIMITE_VELOCIDAD_URBANA_KMH,
          mensaje: `¡Alerta! Camión ${id} superó los 40 km/h en Gutiérrez Zamora.`,
        }
      : null,
  });

  return registroCamion;
}

// ─────────────────────────────────────────────────────────────────────────────
// Rutas REST
// ─────────────────────────────────────────────────────────────────────────────

app.get("/salud", (req, res) => {
  res.json({
    estado: "OPERATIVO",
    servicio: "EcoRuta (Zamora Limpia) — Telemetría y WebSockets",
    municipio: "Gutiérrez Zamora, Veracruz",
    clientes_ws_conectados: wss.clients.size,
    camiones_activos: camionesEnVivo.size,
    hora_servidor: new Date().toISOString(),
  });
});

// Endpoint REST para recibir telemetría (compatible con Next.js y React Native)
app.post("/api/v1/telemetria/actualizar-ubicacion", (req, res) => {
  const resultado = procesarTelemetria(req.body);
  if (!resultado) {
    return res.status(400).json({
      exito: false,
      error: "Datos de telemetría incompletos (requiere numero_economico, latitud, longitud).",
    });
  }

  res.json({
    exito: true,
    mensaje: "Telemetría procesada y transmitida vía WebSockets a clientes activos.",
    camion: resultado,
  });
});

app.get("/api/v1/telemetria/en-vivo", (req, res) => {
  res.json({
    exito: true,
    total: camionesEnVivo.size,
    camiones: Array.from(camionesEnVivo.values()),
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Inicio del Servidor
// ─────────────────────────────────────────────────────────────────────────────
servidorHttp.listen(PUERTO, () => {
  console.log(`[EcoRuta Backend] Servidor ejecutándose en el puerto ${PUERTO}`);
  console.log(`[EcoRuta Backend] Canal WebSocket activo en: ws://localhost:${PUERTO}/ws/v1/rastreo-en-vivo`);
});
