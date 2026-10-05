"use client";

import React, { useState, useCallback, useEffect } from "react";
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
  IconButton,
} from "@once-ui-system/core";
import {
  FaRoute,
  FaCheck,
  FaTrash,
  FaRoad,
  FaCircleInfo,
  FaRotateLeft,
  FaArrowsRotate,
  FaEye,
  FaEyeSlash,
  FaSliders,
} from "react-icons/fa6";

const MapaLeaflet = dynamic(() => import("@/componentes/mapa/MapaLeaflet"), {
  ssr: false,
  loading: () => (
    <div
      style={{
        width: "100%",
        height: "560px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--surface)",
        borderRadius: "16px",
      }}
    >
      <Text>Cargando editor de rutas libre para Gutiérrez Zamora...</Text>
    </div>
  ),
});

function calcularDistanciaHaversine(puntos: [number, number][]): string {
  if (puntos.length < 2) return "0.00";
  let totalKm = 0;
  for (let i = 0; i < puntos.length - 1; i++) {
    const [lat1, lon1] = puntos[i];
    const [lat2, lon2] = puntos[i + 1];
    const R = 6371;
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

interface RutaGuardada {
  id: string;
  nombre_ruta: string;
  dias_recoleccion: string[];
  horario_inicio: string;
  horario_fin: string;
  colonia_zona?: string;
  distancia_km: number;
  coordenadasLeaflet: [number, number][];
}

export function VistaEditorRutas() {
  const [puntosClickeados, setPuntosClickeados] = useState<[number, number][]>([]);
  const [polilineaAjustada, setPolilineaAjustada] = useState<[number, number][]>([]);
  const [nombreRuta, setNombreRuta] = useState("Nueva Ruta de Recolección");
  const [diasRecoleccion, setDiasRecoleccion] = useState("Lunes, Miércoles, Viernes");
  const [horaInicio, setHoraInicio] = useState("07:00");
  const [horaFin, setHoraFin] = useState("14:30");
  const [mostrarParametros, setMostrarParametros] = useState(true);
  const [ajustandoConOSRM, setAjustandoConOSRM] = useState(false);
  const [distanciaTotalKm, setDistanciaTotalKm] = useState<string>("0.00");
  const [guardadoExitoso, setGuardadoExitoso] = useState(false);
  const [guardandoEnBD, setGuardandoEnBD] = useState(false);

  // Lista de rutas guardadas en MongoDB
  const [rutasGuardadas, setRutasGuardadas] = useState<RutaGuardada[]>([]);
  const [cargandoRutas, setCargandoRutas] = useState(true);

  const cargarRutasBD = useCallback(async () => {
    setCargandoRutas(true);
    try {
      const res = await fetch("/api/v1/rutas", { cache: "no-store" });
      const data = await res.json();
      if (data.exito && Array.isArray(data.rutas)) {
        setRutasGuardadas(data.rutas);
      } else {
        setRutasGuardadas([]);
      }
    } catch {
      setRutasGuardadas([]);
    } finally {
      setCargandoRutas(false);
    }
  }, []);

  useEffect(() => {
    cargarRutasBD();
  }, [cargarRutasBD]);

  const calcularRutaOSRM = useCallback(async (puntos: [number, number][]) => {
    if (puntos.length < 2) {
      setPolilineaAjustada([]);
      setDistanciaTotalKm("0.00");
      return;
    }

    setAjustandoConOSRM(true);
    try {
      const cadenaCoordenadas = puntos.map(([lat, lng]) => `${lng},${lat}`).join(";");
      const urlOsrm = `https://router.project-osrm.org/route/v1/driving/${cadenaCoordenadas}?overview=full&geometries=geojson`;

      const respuesta = await fetch(urlOsrm);
      const datos = await respuesta.json();

      if (datos.code === "Ok" && datos.routes && datos.routes.length > 0) {
        const coordenadasGeoJson = datos.routes[0].geometry.coordinates;
        const coordenadasLeaflet: [number, number][] = coordenadasGeoJson.map(
          ([lng, lat]: [number, number]) => [lat, lng]
        );
        setPolilineaAjustada(coordenadasLeaflet);
        const distancia = (datos.routes[0].distance / 1000).toFixed(2);
        setDistanciaTotalKm(distancia);
      } else {
        setPolilineaAjustada(puntos);
        setDistanciaTotalKm(calcularDistanciaHaversine(puntos));
      }
    } catch {
      setPolilineaAjustada(puntos);
      setDistanciaTotalKm(calcularDistanciaHaversine(puntos));
    } finally {
      setAjustandoConOSRM(false);
    }
  }, []);

  const manejarClicMapa = useCallback(
    (latitud: number, longitud: number) => {
      setPuntosClickeados((puntosPrevios) => {
        const nuevosPuntos: [number, number][] = [...puntosPrevios, [latitud, longitud]];
        calcularRutaOSRM(nuevosPuntos);
        return nuevosPuntos;
      });
    },
    [calcularRutaOSRM]
  );

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
          distancia_km: distanciaTotalKm,
        }),
      });
      const resultado = await respuesta.json();
      if (resultado.exito || resultado.success) {
        setGuardadoExitoso(true);
        setTimeout(() => setGuardadoExitoso(false), 4000);
        await cargarRutasBD();
      } else {
        alert(resultado.error || "No se pudo guardar la ruta.");
      }
    } catch (error: any) {
      alert(`Error al guardar: ${error.message}`);
    } finally {
      setGuardandoEnBD(false);
    }
  };

  const cargarRutaEnEditor = (ruta: RutaGuardada) => {
    setNombreRuta(ruta.nombre_ruta);
    setDiasRecoleccion(Array.isArray(ruta.dias_recoleccion) ? ruta.dias_recoleccion.join(", ") : "");
    setHoraInicio(ruta.horario_inicio || "07:00");
    setHoraFin(ruta.horario_fin || "14:30");
    setDistanciaTotalKm(String(ruta.distancia_km || "0.00"));
    if (ruta.coordenadasLeaflet && ruta.coordenadasLeaflet.length > 0) {
      setPolilineaAjustada(ruta.coordenadasLeaflet);
      setPuntosClickeados(ruta.coordenadasLeaflet);
    }
  };

  const eliminarRutaBD = async (id: string, nombre: string) => {
    if (!confirm(`¿Eliminar la ruta "${nombre}" permanentemente?`)) return;
    try {
      const res = await fetch(`/api/v1/rutas?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.exito) {
        await cargarRutasBD();
        reiniciarTrazo();
      } else {
        alert(data.error || "Error al eliminar la ruta.");
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  return (
    <Column gap="24" fillWidth>
      {/* Encabezado */}
      <Row fillWidth horizontal="between" vertical="center" gap="16" wrap>
        <Column gap="4">
          <Row gap="8" vertical="center">
            <FaRoute size={24} style={{ color: "var(--eco-cyan-400)" }} />
            <Heading variant="display-strong-s" onBackground="neutral-strong">
              Editor de Rutas: Snap to Roads (Libre y Sin API Keys)
            </Heading>
            <Badge textVariant="code-default-s" border="neutral-alpha-medium">
              Obras Públicas Gutiérrez Zamora
            </Badge>
          </Row>
          <Text variant="body-default-m" onBackground="neutral-medium">
            Haz clic en el mapa sobre las calles de Gutiérrez Zamora para agregar waypoints. El sistema ajustará la ruta automáticamente a las vías transitables.
          </Text>
        </Column>

        <Row gap="8" wrap vertical="center">
          <Button
            variant="ghost"
            size="s"
            onClick={deshacerUltimoPunto}
            disabled={puntosClickeados.length === 0}
          >
            <Row gap="8" vertical="center">
              <FaRotateLeft size={13} />
              <Text>Deshacer</Text>
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
              <Text>Limpiar Trazo</Text>
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
              <Text>
                {guardandoEnBD
                  ? "Guardando..."
                  : guardadoExitoso
                  ? "✓ ¡Ruta Guardada!"
                  : "Guardar Ruta en BD"}
              </Text>
            </Row>
          </Button>
        </Row>
      </Row>

      {/* Barra de Estado */}
      <Row horizontal="between" vertical="center" fillWidth wrap gap="12">
        <Row gap="12" vertical="center" wrap>
          <Tag size="s" border="neutral-alpha-weak">
            📍 {puntosClickeados.length} puntos marcados
          </Tag>
          <Tag size="s" border="neutral-alpha-weak">
            🛣️ Distancia calculada: {distanciaTotalKm} km
          </Tag>
          {ajustandoConOSRM && (
            <Tag size="s" border="neutral-alpha-weak">
              ⚡ Calculando Snap to Roads con OSRM...
            </Tag>
          )}
        </Row>

        <Row gap="8" vertical="center">
          <FaCircleInfo size={14} style={{ color: "var(--eco-text-secondary)" }} />
          <Text variant="label-default-xs" onBackground="neutral-weak">
            Haz clic en las intersecciones para trazar el recorrido.
          </Text>
        </Row>
      </Row>

      {/* Mapa Interactivo Full Width con Panel Flotante de Parámetros */}
      <Card
        radius="l"
        border="neutral-alpha-weak"
        background="surface"
        style={{
          width: "100%",
          height: "680px",
          padding: 0,
          overflow: "hidden",
          position: "relative",
        }}
      >
        {/* Mapa Leaflet Interactivo */}
        <MapaLeaflet
          camiones={[]}
          contingenciaClimatica={false}
          puntosRutaTrazada={polilineaAjustada}
          puntosClickeados={puntosClickeados}
          alHacerClicEnMapa={manejarClicMapa}
          modoInteractivo={true}
        />

        {/* Botón Flotante para mostrar parámetros cuando está colapsado */}
        {!mostrarParametros && (
          <Button
            variant="secondary"
            size="s"
            onClick={() => setMostrarParametros(true)}
            style={{
              position: "absolute",
              top: "16px",
              left: "16px",
              zIndex: 1000,
              backdropFilter: "blur(12px)",
              background: "rgba(18, 18, 22, 0.88)",
              boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
              border: "1px solid var(--neutral-alpha-medium)",
            }}
          >
            <FaSliders style={{ marginRight: 6 }} /> Parámetros de la Ruta
          </Button>
        )}

        {/* Panel Flotante Superpuesto de Parámetros */}
        {mostrarParametros && (
          <div
            style={{
              position: "absolute",
              top: "16px",
              left: "16px",
              zIndex: 1000,
              width: "360px",
              maxWidth: "calc(100% - 32px)",
              maxHeight: "calc(100% - 32px)",
              overflowY: "auto",
              backdropFilter: "blur(16px)",
              background: "rgba(18, 18, 22, 0.92)",
              border: "1px solid var(--neutral-alpha-medium)",
              borderRadius: "16px",
              padding: "20px",
              boxShadow: "0 12px 36px rgba(0,0,0,0.6)",
            }}
          >
            <Column gap="16">
              <Row horizontal="between" vertical="center">
                <Row gap="8" vertical="center">
                  <FaRoad size={18} style={{ color: "var(--eco-cyan-400)" }} />
                  <Heading variant="heading-strong-xs">Parámetros del Cuadrante</Heading>
                </Row>
                <Button
                  variant="ghost"
                  size="s"
                  onClick={() => setMostrarParametros(false)}
                  style={{ padding: "4px 8px" }}
                >
                  <FaEyeSlash size={14} />
                </Button>
              </Row>

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

              {/* Puntos Marcados */}
              <Column gap="8" borderTop="neutral-alpha-weak" paddingTop="12">
                <Text variant="label-default-xs" onBackground="neutral-medium">
                  Puntos de Control Marcados ({puntosClickeados.length}):
                </Text>
                {puntosClickeados.length === 0 ? (
                  <Text variant="body-default-xs" onBackground="neutral-weak">
                    Haz clic sobre el mapa para fijar el primer punto de inicio.
                  </Text>
                ) : (
                  <div
                    style={{
                      maxHeight: "130px",
                      overflowY: "auto",
                      display: "flex",
                      flexDirection: "column",
                      gap: "6px",
                    }}
                  >
                    {puntosClickeados.map(([lat, lng], idx) => (
                      <Row
                        key={idx}
                        horizontal="between"
                        vertical="center"
                        paddingX="s"
                        paddingY="xs"
                        radius="s"
                        background="page"
                      >
                        <Badge textVariant="code-default-xs">P{idx + 1}</Badge>
                        <Text variant="code-default-xs">
                          {lat.toFixed(4)}, {lng.toFixed(4)}
                        </Text>
                      </Row>
                    ))}
                  </div>
                )}
              </Column>
            </Column>
          </div>
        )}
      </Card>

      {/* Sección de Rutas Guardadas en la Base de Datos */}
      <Column gap="16" fillWidth borderTop="neutral-alpha-weak" paddingTop="24">
        <Row horizontal="between" vertical="center">
          <Heading variant="heading-strong-m">
            Rutas Oficiales Guardadas en el Sistema ({rutasGuardadas.length})
          </Heading>
          <Button variant="ghost" size="s" onClick={cargarRutasBD}>
            <FaArrowsRotate style={{ marginRight: 6 }} /> Actualizar Lista
          </Button>
        </Row>

        {!cargandoRutas && rutasGuardadas.length === 0 && (
          <Card padding="l" radius="m" border="neutral-alpha-weak" background="surface">
            <Text variant="body-default-m" onBackground="neutral-weak">
              No hay rutas oficiales guardadas en la base de datos municipal. Traza una ruta en el mapa y presiona "Guardar Ruta en BD".
            </Text>
          </Card>
        )}

        <Grid columns="3" gap="16" fillWidth s={{ columns: 1 }} m={{ columns: 2 }}>
          {rutasGuardadas.map((r) => (
            <Card key={r.id} padding="m" radius="m" border="neutral-alpha-weak" background="surface">
              <Column gap="12">
                <Row horizontal="between" vertical="center">
                  <Heading variant="heading-strong-xs">{r.nombre_ruta}</Heading>
                  <Row gap="xs">
                    <Button
                      size="s"
                      variant="tertiary"
                      onClick={() => cargarRutaEnEditor(r)}
                    >
                      <FaEye size={12} />
                    </Button>
                    <Button
                      size="s"
                      variant="danger"
                      onClick={() => eliminarRutaBD(r.id, r.nombre_ruta)}
                    >
                      <FaTrash size={12} />
                    </Button>
                  </Row>
                </Row>

                <Text variant="body-default-xs" onBackground="neutral-weak">
                  Días: {Array.isArray(r.dias_recoleccion) ? r.dias_recoleccion.join(", ") : r.dias_recoleccion}
                </Text>

                <Row horizontal="between" vertical="center" borderTop="neutral-alpha-weak" paddingTop="8">
                  <Text variant="code-default-xs">
                    {r.horario_inicio} - {r.horario_fin}
                  </Text>
                  <Badge textVariant="code-default-xs">{r.distancia_km || 0} km</Badge>
                </Row>
              </Column>
            </Card>
          ))}
        </Grid>
      </Column>
    </Column>
  );
}
