"use client";

import React, { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import {
  Column,
  Row,
  Grid,
  Heading,
  Text,
  Button,
  Card,
  Tag,
  Badge,
  Input,
} from "@once-ui-system/core";
import { FaRoute, FaCheck, FaTrash, FaRoad, FaCircleInfo, FaRotateLeft, FaLocationCrosshairs } from "react-icons/fa6";
import { CENTRO_GUTIERREZ_ZAMORA } from "@/componentes/mapa/MapaLeaflet";

const MapaLeaflet = dynamic(() => import("@/componentes/mapa/MapaLeaflet"), {
  ssr: false,
  loading: () => (
    <div style={{ width: "100%", height: "560px", display: "flex", alignItems: "center", justifyContent: "center", background: "#0a0f0d", borderRadius: "16px" }}>
      <Text>Cargando editor de rutas con OSRM para Gutiérrez Zamora...</Text>
    </div>
  ),
});

// Función de respaldo matemático para calcular distancia terrestre (Fórmula de Haversine)
function calcularDistanciaHaversine(puntos: [number, number][]): string {
  if (puntos.length < 2) return "0.00";
  let totalKm = 0;
  for (let i = 0; i < puntos.length - 1; i++) {
    const [lat1, lon1] = puntos[i];
    const [lat2, lon2] = puntos[i + 1];
    const R = 6371; // Radio medio de la Tierra en km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    totalKm += R * c;
  }
  return totalKm.toFixed(2);
}

export function VistaEditorRutas() {
  const [puntosClickeados, setPuntosClickeados] = useState<[number, number][]>([]);
  const [polilineaAjustada, setPolilineaAjustada] = useState<[number, number][]>([]);
  const [nombreRuta, setNombreRuta] = useState("Ruta Ribereña y Centro Histórico");
  const [diasRecoleccion, setDiasRecoleccion] = useState("Lunes, Miércoles, Viernes");
  const [horaInicio, setHoraInicio] = useState("07:00");
  const [horaFin, setHoraFin] = useState("14:30");
  const [ajustandoConOSRM, setAjustandoConOSRM] = useState(false);
  const [distanciaTotalKm, setDistanciaTotalKm] = useState<string>("0.00");
  const [guardadoExitoso, setGuardadoExitoso] = useState(false);

  // Cálculo de Snap to Roads mediante OSRM con fallback de alta disponibilidad
  const calcularRutaOSRM = useCallback(async (puntos: [number, number][]) => {
    if (puntos.length < 2) {
      setPolilineaAjustada([]);
      setDistanciaTotalKm("0.00");
      return;
    }

    setAjustandoConOSRM(true);
    try {
      // La API pública de OSRM requiere longitud,latitud separados por punto y coma
      const cadenaCoordenadas = puntos.map(([lat, lng]) => `${lng},${lat}`).join(";");
      const urlOsrm = `https://router.project-osrm.org/route/v1/driving/${cadenaCoordenadas}?overview=full&geometries=geojson`;

      const respuesta = await fetch(urlOsrm);
      const datos = await respuesta.json();

      if (datos.code === "Ok" && datos.routes && datos.routes.length > 0) {
        const coordenadasGeoJson = datos.routes[0].geometry.coordinates; // [[longitud, latitud], ...]
        const coordenadasLeaflet: [number, number][] = coordenadasGeoJson.map(
          ([lng, lat]: [number, number]) => [lat, lng]
        );
        setPolilineaAjustada(coordenadasLeaflet);
        const distancia = (datos.routes[0].distance / 1000).toFixed(2);
        setDistanciaTotalKm(distancia);
      } else {
        // Fallback: trazado de polilínea directa y cálculo Haversine
        setPolilineaAjustada(puntos);
        setDistanciaTotalKm(calcularDistanciaHaversine(puntos));
      }
    } catch (error) {
      console.warn("Servidor OSRM ocupado o sin conexión, conectando puntos directamente:", error);
      setPolilineaAjustada(puntos);
      setDistanciaTotalKm(calcularDistanciaHaversine(puntos));
    } finally {
      setAjustandoConOSRM(false);
    }
  }, []);

  // Manejador estable de clics en el mapa para registrar waypoints
  const manejarClicMapa = useCallback((latitud: number, longitud: number) => {
    setPuntosClickeados((puntosPrevios) => {
      const nuevosPuntos: [number, number][] = [...puntosPrevios, [latitud, longitud]];
      calcularRutaOSRM(nuevosPuntos);
      return nuevosPuntos;
    });
  }, [calcularRutaOSRM]);

  // Deshacer el último punto marcado sin recargar el mapa
  const deshacerUltimoPunto = useCallback(() => {
    setPuntosClickeados((puntosPrevios) => {
      if (puntosPrevios.length === 0) return puntosPrevios;
      const puntosActualizados = puntosPrevios.slice(0, -1);
      calcularRutaOSRM(puntosActualizados);
      return puntosActualizados;
    });
  }, [calcularRutaOSRM]);

  const reiniciarTrazo = useCallback(() => {
    setPuntosClickeados([]);
    setPolilineaAjustada([]);
    setDistanciaTotalKm("0.00");
    setGuardadoExitoso(false);
  }, []);

  const [guardandoEnBD, setGuardandoEnBD] = useState(false);

  const guardarRutaEnBD = async () => {
    if (puntosClickeados.length < 2) return;
    setGuardandoEnBD(true);
    try {
      const respuesta = await fetch("/api/v1/rutas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre_ruta: nombreRuta,
          puntos: polilineaAjustada.length > 0 ? polilineaAjustada : puntosClickeados,
          dias_recoleccion: diasRecoleccion,
          horario_inicio: horaInicio,
          horario_fin: horaFin,
        }),
      });
      const resultado = await respuesta.json();
      if (resultado.success) {
        setGuardadoExitoso(true);
        setTimeout(() => setGuardadoExitoso(false), 4000);
      }
    } catch (error) {
      console.warn("Error al guardar la ruta:", error);
    } finally {
      setGuardandoEnBD(false);
    }
  };

  return (
    <Column gap="24" fillWidth>
      {/* Encabezado Obras Públicas */}
      <Row fillWidth horizontal="between" vertical="center" gap="16" wrap>
        <Column gap="4">
          <Row gap="8" vertical="center">
            <FaRoute size={24} color="#30D158" />
            <Heading variant="display-strong-s" onBackground="neutral-strong">
              Editor de Rutas: Snap to Roads (OSRM)
            </Heading>
            <Badge textVariant="code-default-s" border="neutral-alpha-medium">
              Dirección de Obras Públicas
            </Badge>
          </Row>
          <Text variant="body-default-m" onBackground="neutral-medium">
            Haz clic directamente en el mapa sobre las calles de Gutiérrez Zamora para agregar puntos de recolección.
          </Text>
        </Column>

        <Row gap="8" wrap>
          <Button
            variant="ghost"
            size="s"
            onClick={deshacerUltimoPunto}
            disabled={puntosClickeados.length === 0}
          >
            <Row gap="8" vertical="center">
              <FaRotateLeft size={13} />
              <Text>Deshacer Punto</Text>
            </Row>
          </Button>

          <Button
            variant="ghost"
            size="s"
            onClick={reiniciarTrazo}
            disabled={puntosClickeados.length === 0}
          >
            <Row gap="8" vertical="center">
              <FaTrash size={13} />
              <Text>Limpiar Todo</Text>
            </Row>
          </Button>

          <Button
            variant="primary"
            size="s"
            onClick={guardarRutaEnBD}
            disabled={puntosClickeados.length < 2 || guardandoEnBD}
          >
            <Row gap="8" vertical="center">
              <FaCheck size={14} />
              <Text>{guardandoEnBD ? "Guardando en BD..." : guardadoExitoso ? "✓ ¡Ruta Guardada!" : "Guardar Ruta en BD"}</Text>
            </Row>
          </Button>
        </Row>
      </Row>

      {/* Barra de Estado del Trazo y Distancia */}
      <Row horizontal="between" vertical="center" fillWidth wrap gap="12">
        <Row gap="12" vertical="center" wrap>
          <Tag scheme="neutral" size="s">
            📍 {puntosClickeados.length} puntos seleccionados
          </Tag>
          <Tag scheme="brand" size="s">
            🛣️ Distancia total: {distanciaTotalKm} km
          </Tag>
          {ajustandoConOSRM && (
            <Tag scheme="brand" size="s">
              ⚡ Calculando Snap to Roads con OSRM...
            </Tag>
          )}
          {polilineaAjustada.length > 0 && !ajustandoConOSRM && (
            <Tag scheme="brand" size="s">
              ✓ Ruta ajustada automáticamente al sentido vial
            </Tag>
          )}
        </Row>

        <Row gap="8" vertical="center">
          <FaCircleInfo size={14} color="#8E8E93" />
          <Text variant="label-default-xs" onBackground="neutral-weak">
            Cursor de precisión activo (+). Haz clic en cada esquina de recolección.
          </Text>
        </Row>
      </Row>

      {/* Distribución Responsiva: Panel Lateral Izquierdo Fijo (380px) + Mapa Expandible */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
          gap: "24px",
          width: "100%",
          alignItems: "start",
        }}
      >
        {/* Formulario de Parámetros del Cuadrante */}
        <Card
          padding="24"
          radius="l"
          border="neutral-medium"
          direction="column"
          gap="16"
          style={{ width: "100%", maxWidth: "440px" }}
        >
          <Row gap="8" vertical="center">
            <FaRoad size={18} color="#30D158" />
            <Heading variant="heading-default-xs">Parámetros del Cuadrante</Heading>
          </Row>

          <Column gap="12">
            <Input
              id="nombre-ruta"
              label="Nombre de la Ruta"
              value={nombreRuta}
              onChange={(e) => setNombreRuta(e.target.value)}
            />

            <Input
              id="dias-ruta"
              label="Días de Recolección"
              value={diasRecoleccion}
              onChange={(e) => setDiasRecoleccion(e.target.value)}
            />

            <Grid columns="2" gap="12" fillWidth>
              <Input
                id="hora-inicio"
                label="Hora Inicio"
                value={horaInicio}
                onChange={(e) => setHoraInicio(e.target.value)}
              />
              <Input
                id="hora-fin"
                label="Hora Fin"
                value={horaFin}
                onChange={(e) => setHoraFin(e.target.value)}
              />
            </Grid>
          </Column>

          {/* Lista de Puntos de Control Marcados */}
          <Column gap="8" borderTop="neutral-alpha-weak" paddingTop="12">
            <Text variant="label-default-xs" onBackground="neutral-medium">
              Puntos de Control Marcados ({puntosClickeados.length}):
            </Text>
            {puntosClickeados.length === 0 ? (
              <Text variant="body-default-xs" onBackground="neutral-weak">
                Haz clic en el mapa para añadir el Punto 1 (Punto de partida de la recolección).
              </Text>
            ) : (
              <div style={{ maxHeight: "160px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "6px" }}>
                {puntosClickeados.map(([lat, lng], indice) => (
                  <Row key={indice} horizontal="between" vertical="center" paddingX="8" paddingY="4" radius="s" background="neutral-alpha-weak">
                    <Row gap="8" vertical="center">
                      <Badge textVariant="code-default-s">P{indice + 1}</Badge>
                      <Text variant="label-default-xs">
                        {lat.toFixed(4)}, {lng.toFixed(4)}
                      </Text>
                    </Row>
                    <Tag size="s" scheme={indice === 0 ? "brand" : indice === puntosClickeados.length - 1 ? "danger" : "neutral"}>
                      {indice === 0 ? "Inicio" : indice === puntosClickeados.length - 1 ? "Destino" : "Intermedio"}
                    </Tag>
                  </Row>
                ))}
              </div>
            )}
          </Column>

          {/* Calles Principales de Gutiérrez Zamora */}
          <Column gap="8" borderTop="neutral-alpha-weak" paddingTop="12">
            <Text variant="label-default-xs" onBackground="neutral-weak">Calles Clave de Gutiérrez Zamora:</Text>
            <Row gap="8" wrap>
              <Badge textVariant="code-default-s" border="neutral-alpha-medium">Av. Hidalgo</Badge>
              <Badge textVariant="code-default-s" border="neutral-alpha-medium">Malecón del Río</Badge>
              <Badge textVariant="code-default-s" border="neutral-alpha-medium">Av. Ávila Camacho</Badge>
              <Badge textVariant="code-default-s" border="neutral-alpha-medium">Col. Renacimiento</Badge>
            </Row>
          </Column>
        </Card>

        {/* Mapa Interactivo con Modo de Precisión (+) y Pines Numerados */}
        <Card
          radius="l"
          border="neutral-medium"
          style={{ height: "640px", minWidth: "320px", padding: 0, overflow: "hidden", position: "relative" }}
        >
          <MapaLeaflet
            camiones={[]}
            contingenciaClimatica={false}
            puntosRutaTrazada={polilineaAjustada}
            puntosClickeados={puntosClickeados}
            alHacerClicEnMapa={manejarClicMapa}
            modoInteractivo={true}
          />
        </Card>
      </div>
    </Column>
  );
}
