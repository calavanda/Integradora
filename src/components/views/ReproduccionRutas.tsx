"use client";

import React, { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import {
  Column,
  Row,
  Grid,
  Heading,
  Text,
  Button,
  Card,
  Badge,
  Tag,
} from "@once-ui-system/core";
import {
  FaPlay,
  FaPause,
  FaRotateLeft,
  FaCalendarDays,
  FaTriangleExclamation,
  FaGaugeHigh,
  FaClockRotateLeft,
} from "react-icons/fa6";
import { DatosMarcadorCamion } from "@/componentes/mapa/MapaLeaflet";

const MapaLeaflet = dynamic(() => import("@/componentes/mapa/MapaLeaflet"), {
  ssr: false,
  loading: () => (
    <div
      style={{
        width: "100%",
        height: "520px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0a0f0d",
        borderRadius: "16px",
      }}
    >
      <Text>Cargando cartografía histórica de Gutiérrez Zamora...</Text>
    </div>
  ),
});

interface PuntoPlayback {
  latitud: number;
  longitud: number;
  velocidad: number;
  orientacion: number;
  exceso_velocidad: boolean;
  hora: string;
  hora_legible: string;
}

interface CamionOpcion {
  id: string;
  nombre: string;
}

export function VistaReproduccionRutas() {
  const [camionesDisponibles, setCamionesDisponibles] = useState<CamionOpcion[]>([]);
  const [camionSeleccionado, setCamionSeleccionado] = useState<string>("");
  const [fechaSeleccionada, setFechaSeleccionada] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [puntos, setPuntos] = useState<PuntoPlayback[]>([]);
  const [indiceActual, setIndiceActual] = useState<number>(0);
  const [reproduciendo, setReproduciendo] = useState<boolean>(false);
  const [velocidadReproduccion, setVelocidadReproduccion] = useState<number>(1);
  const [cargando, setCargando] = useState<boolean>(false);
  const [estadisticas, setEstadisticas] = useState<{
    totalPuntos: number;
    velocidadMaxima: number;
    velocidadPromedio: number;
    infracciones: number;
  }>({
    totalPuntos: 0,
    velocidadMaxima: 0,
    velocidadPromedio: 0,
    infracciones: 0,
  });

  const intervaloRef = useRef<NodeJS.Timeout | null>(null);

  // Cargar lista de camiones desde la API (sin hardcodear)
  useEffect(() => {
    const cargarCamiones = async () => {
      try {
        const res = await fetch("/api/v1/camiones", { cache: "no-store" });
        const data = await res.json();
        if (data.exito && Array.isArray(data.camiones) && data.camiones.length > 0) {
          const opciones: CamionOpcion[] = data.camiones.map((c: any) => ({
            id: c.numero_economico || c.id,
            nombre: `${c.numero_economico} — ${c.placas}`,
          }));
          setCamionesDisponibles(opciones);
          setCamionSeleccionado(opciones[0].id);
        } else {
          setCamionesDisponibles([]);
        }
      } catch {
        setCamionesDisponibles([]);
      }
    };
    cargarCamiones();
  }, []);

  // Cargar datos históricos reales desde la API (solo si hay camión seleccionado)
  useEffect(() => {
    if (!camionSeleccionado) return;
    const cargarHistorial = async () => {
      setCargando(true);
      setReproduciendo(false);
      setIndiceActual(0);
      setPuntos([]);
      setEstadisticas({ totalPuntos: 0, velocidadMaxima: 0, velocidadPromedio: 0, infracciones: 0 });
      try {
        const respuesta = await fetch(
          `/api/v1/historial/recorrido/${camionSeleccionado}?fecha=${fechaSeleccionada}`
        );
        const datos = await respuesta.json();

        if (datos.exito && datos.puntos && datos.puntos.length > 0) {
          setPuntos(datos.puntos);
          setEstadisticas({
            totalPuntos: datos.auditoria?.total_puntos_gps || datos.puntos.length,
            velocidadMaxima: datos.auditoria?.velocidad_maxima_kmh || 0,
            velocidadPromedio: datos.auditoria?.velocidad_promedio_kmh || 0,
            infracciones: datos.auditoria?.infracciones_exceso_velocidad || 0,
          });
        }
        // Sin datos de muestra: si no hay historial real, se queda vacío
      } catch (err) {
        console.warn("Error cargando historial de recorrido:", err);
      } finally {
        setCargando(false);
      }
    };

    cargarHistorial();
  }, [camionSeleccionado, fechaSeleccionada]);

  // Manejo del bucle de animación de reproducción
  useEffect(() => {
    if (reproduciendo) {
      const tiempoPaso = Math.max(300, 1200 / velocidadReproduccion);
      intervaloRef.current = setInterval(() => {
        setIndiceActual((prev) => {
          if (prev >= puntos.length - 1) {
            setReproduciendo(false);
            return prev;
          }
          return prev + 1;
        });
      }, tiempoPaso);
    } else if (intervaloRef.current) {
      clearInterval(intervaloRef.current);
    }

    return () => {
      if (intervaloRef.current) clearInterval(intervaloRef.current);
    };
  }, [reproduciendo, velocidadReproduccion, puntos.length]);

  const puntoActual = puntos[indiceActual] || puntos[0];

  // Construir polilínea del camino recorrido hasta el momento
  const polilineaRecorrida: [number, number][] = puntos
    .slice(0, indiceActual + 1)
    .map((p) => [p.latitud, p.longitud]);

  // Marcador del camión en su posición del playback
  const marcadorPlayback: DatosMarcadorCamion[] = puntoActual
    ? [
        {
          id: camionSeleccionado,
          numeroEconomico: camionSeleccionado,
          placas: "XZ-4821-A",
          conductor: "Auditoría Municipal",
          latitud: puntoActual.latitud,
          longitud: puntoActual.longitud,
          velocidad: puntoActual.velocidad,
          orientacion: puntoActual.orientacion,
          estado: puntoActual.exceso_velocidad ? "INCIDENTE" : "EN_RUTA",
          ruta: `Playback: ${puntoActual.hora_legible}`,
        },
      ]
    : [];

  return (
    <Column gap="24" fillWidth>
      {/* Cabecera de Auditoría */}
      <Row fillWidth horizontal="between" vertical="center" gap="16" wrap>
        <Column gap="4">
          <Row gap="8" vertical="center">
            <FaClockRotateLeft size={22} color="#30D158" />
            <Heading variant="display-strong-s" onBackground="neutral-strong">
              Reproducción y Auditoría de Recorridos (Playback)
            </Heading>
            <Badge textVariant="code-default-s" border="neutral-alpha-medium">
              Historial GPS Certificado
            </Badge>
          </Row>
          <Text variant="body-default-m" onBackground="neutral-medium">
            Audita el trayecto exacto recorrido por cada vehículo municipal en Gutiérrez Zamora con telemetría en tiempo real.
          </Text>
        </Column>

        {/* Controles de Selección */}
        <Row gap="12" vertical="center" wrap>
          <select
            value={camionSeleccionado}
            onChange={(e) => setCamionSeleccionado(e.target.value)}
            style={{
              padding: "8px 14px",
              borderRadius: "10px",
              background: "var(--neutral-surface-medium, #181c19)",
              color: "inherit",
              border: "1px solid var(--neutral-alpha-medium, #333)",
              fontSize: "14px",
              cursor: "pointer",
            }}
          >
            {camionesDisponibles.length === 0 ? (
              <option value="">Sin camiones registrados</option>
            ) : (
              camionesDisponibles.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))
            )}
          </select>

          <input
            type="date"
            value={fechaSeleccionada}
            onChange={(e) => setFechaSeleccionada(e.target.value)}
            style={{
              padding: "8px 12px",
              borderRadius: "10px",
              background: "var(--neutral-surface-medium, #181c19)",
              color: "inherit",
              border: "1px solid var(--neutral-alpha-medium, #333)",
              fontSize: "14px",
              cursor: "pointer",
            }}
          />
        </Row>
      </Row>

      {/* Métricas de Auditoría */}
      <Grid columns="4" gap="16" fillWidth s={{ columns: 1 }} m={{ columns: 2 }}>
        <Card padding="m" radius="l" border="neutral-alpha-weak">
          <Column gap="4">
            <Text variant="label-default-s" onBackground="neutral-weak">
              Puntos GPS Registrados
            </Text>
            <Heading variant="heading-strong-l" onBackground="neutral-strong">
              {estadisticas.totalPuntos}
            </Heading>
          </Column>
        </Card>

        <Card padding="m" radius="l" border="neutral-alpha-weak">
          <Column gap="4">
            <Text variant="label-default-s" onBackground="neutral-weak">
              Velocidad Promedio
            </Text>
            <Heading variant="heading-strong-l" onBackground="neutral-strong">
              {estadisticas.velocidadPromedio} km/h
            </Heading>
          </Column>
        </Card>

        <Card padding="m" radius="l" border="neutral-alpha-weak">
          <Column gap="4">
            <Text variant="label-default-s" onBackground="neutral-weak">
              Velocidad Máxima Alcanzada
            </Text>
            <Row gap="8" vertical="center">
              <Heading
                variant="heading-strong-l"
                style={{
                  color:
                    estadisticas.velocidadMaxima > 40
                      ? "#FF453A"
                      : "var(--neutral-on-background-strong)",
                }}
              >
                {estadisticas.velocidadMaxima} km/h
              </Heading>
              {estadisticas.velocidadMaxima > 40 && (
                <Tag scheme="danger" size="s">
                  Límite Superado
                </Tag>
              )}
            </Row>
          </Column>
        </Card>

        <Card padding="m" radius="l" border="neutral-alpha-weak">
          <Column gap="4">
            <Text variant="label-default-s" onBackground="neutral-weak">
              Infracciones de Velocidad (&gt;40 km/h)
            </Text>
            <Row gap="8" vertical="center">
              <Heading
                variant="heading-strong-l"
                style={{
                  color:
                    estadisticas.infracciones > 0
                      ? "#FF453A"
                      : "#30D158",
                }}
              >
                {estadisticas.infracciones}
              </Heading>
              {estadisticas.infracciones > 0 && (
                <FaTriangleExclamation color="#FF453A" size={18} />
              )}
            </Row>
          </Column>
        </Card>
      </Grid>

      {/* Controles del Reproductor (Playback Bar) */}
      <Card padding="m" radius="l" border="neutral-alpha-medium" fillWidth>
        <Column gap="12" fillWidth>
          <Row fillWidth horizontal="between" vertical="center" wrap gap="12">
            {/* Botones de Acción */}
            <Row gap="8" vertical="center">
              <Button
                variant={reproduciendo ? "secondary" : "primary"}
                size="m"
                onClick={() => setReproduciendo(!reproduciendo)}
                disabled={puntos.length === 0 || cargando}
              >
                <Row gap="8" vertical="center">
                  {reproduciendo ? <FaPause size={13} /> : <FaPlay size={13} />}
                  <Text>{reproduciendo ? "Pausar" : "Reproducir Recorrido"}</Text>
                </Row>
              </Button>

              <Button
                variant="ghost"
                size="m"
                onClick={() => {
                  setReproduciendo(false);
                  setIndiceActual(0);
                }}
              >
                <Row gap="8" vertical="center">
                  <FaRotateLeft size={13} />
                  <Text>Reiniciar</Text>
                </Row>
              </Button>
            </Row>

            {/* Velocidad de Reproducción */}
            <Row gap="8" vertical="center">
              <Text variant="label-default-s" onBackground="neutral-weak">
                Velocidad:
              </Text>
              {[1, 2, 4].map((v) => (
                <Button
                  key={v}
                  variant={velocidadReproduccion === v ? "secondary" : "ghost"}
                  size="s"
                  onClick={() => setVelocidadReproduccion(v)}
                >
                  {v}x
                </Button>
              ))}
            </Row>

            {/* Indicador Temporal */}
            {puntoActual && (
              <Row gap="12" vertical="center">
                <Badge textVariant="code-default-s" border="neutral-alpha-medium">
                  Hora: {puntoActual.hora_legible}
                </Badge>
                <Badge
                  textVariant="code-default-s"
                  style={{
                    color: puntoActual.exceso_velocidad ? "#FF453A" : "#30D158",
                    borderColor: puntoActual.exceso_velocidad ? "#FF453A" : "#30D158",
                  }}
                >
                  Velocidad: {puntoActual.velocidad} km/h
                </Badge>
              </Row>
            )}
          </Row>

          {/* Barra de Progreso Scrubber */}
          <input
            type="range"
            min={0}
            max={Math.max(0, puntos.length - 1)}
            value={indiceActual}
            onChange={(e) => {
              setIndiceActual(Number(e.target.value));
              setReproduciendo(false);
            }}
            style={{ width: "100%", accentColor: "#30D158", cursor: "pointer" }}
          />
        </Column>
      </Card>

      {/* Cartografía con el Recorrido Animado */}
      <Card padding="s" radius="l" border="neutral-alpha-weak" fillWidth>
        <MapaLeaflet
          camiones={marcadorPlayback}
          puntosRutaTrazada={polilineaRecorrida}
        />
      </Card>
    </Column>
  );
}

export default VistaReproduccionRutas;
