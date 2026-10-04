"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// ──────────────────────────────────────────────────────────────────────
// Constantes geográficas de Gutiérrez Zamora, Veracruz
// ──────────────────────────────────────────────────────────────────────
export const CENTRO_GUTIERREZ_ZAMORA: [number, number] = [20.4527, -97.0896];
const ZOOM_INICIAL = 14;

// ──────────────────────────────────────────────────────────────────────
// Tipos públicos exportados
// ──────────────────────────────────────────────────────────────────────
export type EstadoCamion =
  | "EN_RUTA"
  | "EN_PAUSA"
  | "INCIDENTE"
  | "FUERA_DE_SERVICIO";

export interface DatosMarcadorCamion {
  id: string;
  numeroEconomico: string;
  placas: string;
  conductor: string;
  latitud: number;
  longitud: number;
  velocidad: number;
  estado: EstadoCamion;
  ruta: string;
}

// ──────────────────────────────────────────────────────────────────────
// Props del componente
// ──────────────────────────────────────────────────────────────────────
interface MapaLeafletProps {
  camiones?: DatosMarcadorCamion[];
  idCamionSeleccionado?: string;
  alSeleccionarCamion?: (camion: DatosMarcadorCamion) => void;
  contingenciaClimatica?: boolean;
  puntosRutaTrazada?: [number, number][];
  puntosClickeados?: [number, number][];
  alHacerClicEnMapa?: (lat: number, lng: number) => void;
  modoInteractivo?: boolean;
}

// ──────────────────────────────────────────────────────────────────────
// Helpers de iconos SVG inline
// ──────────────────────────────────────────────────────────────────────
function crearIconoCamion(estado: EstadoCamion, seleccionado: boolean): L.DivIcon {
  const colores: Record<EstadoCamion, string> = {
    EN_RUTA: "#30D158",
    EN_PAUSA: "#FFD60A",
    INCIDENTE: "#FF453A",
    FUERA_DE_SERVICIO: "#8E8E93",
  };
  const color = colores[estado];
  const escala = seleccionado ? 1.3 : 1;
  const sombra = seleccionado ? `drop-shadow(0 0 8px ${color})` : "none";
  const size = Math.round(36 * escala);
  const anchor = Math.round(18 * escala);

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 36 36" style="filter:${sombra}"><circle cx="18" cy="18" r="16" fill="${color}" fill-opacity="0.18" stroke="${color}" stroke-width="2"/><text x="18" y="23" text-anchor="middle" font-size="16" fill="${color}">🚛</text></svg>`;

  return L.divIcon({
    html: svg,
    className: "",
    iconSize: [size, size],
    iconAnchor: [anchor, anchor],
    popupAnchor: [0, -anchor],
  });
}

function crearIconoWaypoint(indice: number, total: number): L.DivIcon {
  const esInicio = indice === 0;
  const esFin = indice === total - 1;
  const color = esInicio ? "#30D158" : esFin ? "#FF453A" : "#0A84FF";
  const numero = indice + 1;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="36" viewBox="0 0 28 36"><path d="M14 0 C6.268 0 0 6.268 0 14 C0 24.5 14 36 14 36 C14 36 28 24.5 28 14 C28 6.268 21.732 0 14 0Z" fill="${color}"/><circle cx="14" cy="14" r="9" fill="white"/><text x="14" y="19" text-anchor="middle" font-size="11" font-weight="700" fill="${color}">${numero}</text></svg>`;

  return L.divIcon({
    html: svg,
    className: "",
    iconSize: [28, 36],
    iconAnchor: [14, 36],
    popupAnchor: [0, -36],
  });
}

// ──────────────────────────────────────────────────────────────────────
// Componente principal
// ──────────────────────────────────────────────────────────────────────
export default function MapaLeaflet({
  camiones = [],
  idCamionSeleccionado,
  alSeleccionarCamion,
  contingenciaClimatica = false,
  puntosRutaTrazada = [],
  puntosClickeados = [],
  alHacerClicEnMapa,
  modoInteractivo = false,
}: MapaLeafletProps) {
  const contenedorRef = useRef<HTMLDivElement>(null);
  const mapaRef = useRef<L.Map | null>(null);
  const marcadoresCamionesRef = useRef<Map<string, L.Marker>>(new Map());
  const marcadoresWaypointsRef = useRef<L.Marker[]>([]);
  const polilineaRef = useRef<L.Polyline | null>(null);
  const zonaAlertaRef = useRef<L.Rectangle | null>(null);

  // Inicialización del mapa (solo una vez)
  useEffect(() => {
    if (!contenedorRef.current || mapaRef.current) return;

    const mapa = L.map(contenedorRef.current, {
      center: CENTRO_GUTIERREZ_ZAMORA,
      zoom: ZOOM_INICIAL,
      zoomControl: true,
      attributionControl: true,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(mapa);

    mapaRef.current = mapa;

    return () => {
      mapa.remove();
      mapaRef.current = null;
    };
  }, []);

  // Cursor de precisión
  useEffect(() => {
    const mapa = mapaRef.current;
    if (!mapa) return;
    mapa.getContainer().style.cursor = modoInteractivo ? "crosshair" : "";
  }, [modoInteractivo]);

  // Listener de clic en el mapa
  useEffect(() => {
    const mapa = mapaRef.current;
    if (!mapa || !alHacerClicEnMapa) return;

    const manejador = (e: L.LeafletMouseEvent) => {
      alHacerClicEnMapa(e.latlng.lat, e.latlng.lng);
    };

    mapa.on("click", manejador);
    return () => { mapa.off("click", manejador); };
  }, [alHacerClicEnMapa]);

  // Marcadores de camiones
  useEffect(() => {
    const mapa = mapaRef.current;
    if (!mapa) return;

    const idsActuales = new Set(camiones.map((c) => c.id));
    marcadoresCamionesRef.current.forEach((marcador, id) => {
      if (!idsActuales.has(id)) {
        marcador.remove();
        marcadoresCamionesRef.current.delete(id);
      }
    });

    camiones.forEach((camion) => {
      const seleccionado = camion.id === idCamionSeleccionado;
      const icono = crearIconoCamion(camion.estado, seleccionado);

      if (marcadoresCamionesRef.current.has(camion.id)) {
        const marcador = marcadoresCamionesRef.current.get(camion.id)!;
        marcador.setLatLng([camion.latitud, camion.longitud]);
        marcador.setIcon(icono);
      } else {
        const colorEstado = camion.estado === "EN_RUTA" ? "#30D158" : camion.estado === "INCIDENTE" ? "#FF453A" : "#FFD60A";
        const marcador = L.marker([camion.latitud, camion.longitud], { icon: icono })
          .addTo(mapa)
          .bindPopup(
            `<div style="font-family:system-ui;min-width:180px"><b style="color:#30D158">${camion.numeroEconomico}</b><br/><span style="color:#8E8E93;font-size:12px">${camion.placas}</span><hr style="border-color:#333;margin:6px 0"/><b>Conductor:</b> ${camion.conductor}<br/><b>Ruta:</b> ${camion.ruta}<br/><b>Velocidad:</b> ${camion.velocidad} km/h<br/><b>Estado:</b> <span style="color:${colorEstado}">${camion.estado}</span></div>`
          );

        marcador.on("click", () => { alSeleccionarCamion?.(camion); });
        marcadoresCamionesRef.current.set(camion.id, marcador);
      }
    });
  }, [camiones, idCamionSeleccionado, alSeleccionarCamion]);

  // Waypoints del editor de rutas
  useEffect(() => {
    const mapa = mapaRef.current;
    if (!mapa) return;

    marcadoresWaypointsRef.current.forEach((m) => m.remove());
    marcadoresWaypointsRef.current = [];

    puntosClickeados.forEach(([lat, lng], indice) => {
      const icono = crearIconoWaypoint(indice, puntosClickeados.length);
      const marcador = L.marker([lat, lng], { icon: icono })
        .addTo(mapa)
        .bindTooltip(`P${indice + 1}: ${lat.toFixed(4)}, ${lng.toFixed(4)}`, { permanent: false, direction: "top" });
      marcadoresWaypointsRef.current.push(marcador);
    });
  }, [puntosClickeados]);

  // Polilínea de ruta trazada
  useEffect(() => {
    const mapa = mapaRef.current;
    if (!mapa) return;

    if (polilineaRef.current) {
      polilineaRef.current.remove();
      polilineaRef.current = null;
    }

    if (puntosRutaTrazada.length >= 2) {
      polilineaRef.current = L.polyline(puntosRutaTrazada, {
        color: "#0A84FF",
        weight: 5,
        opacity: 0.85,
      }).addTo(mapa);
    }
  }, [puntosRutaTrazada]);

  // Zona de alerta climática
  useEffect(() => {
    const mapa = mapaRef.current;
    if (!mapa) return;

    if (zonaAlertaRef.current) {
      zonaAlertaRef.current.remove();
      zonaAlertaRef.current = null;
    }

    if (contingenciaClimatica) {
      zonaAlertaRef.current = L.rectangle(
        [[20.448, -97.095], [20.456, -97.082]],
        { color: "#FF453A", weight: 2, fillColor: "#FF453A", fillOpacity: 0.15, dashArray: "8 4" }
      )
        .addTo(mapa)
        .bindTooltip("⚠️ Zona inundable — Malecón del Río Tecolutla", { permanent: true, direction: "center" });
    }
  }, [contingenciaClimatica]);

  return (
    <div
      ref={contenedorRef}
      style={{
        width: "100%",
        height: "100%",
        minHeight: "400px",
        borderRadius: "inherit",
        outline: contingenciaClimatica ? "2px solid rgba(255,69,58,0.5)" : "none",
        transition: "outline 0.3s ease",
      }}
    />
  );
}
