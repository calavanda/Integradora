"use client";

import React, { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
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
} from "@once-ui-system/core";
import { FaCloudShowersWater, FaTruckFast, FaTriangleExclamation, FaPlus, FaArrowsRotate } from "react-icons/fa6";
import { DatosMarcadorCamion } from "@/componentes/mapa/MapaLeaflet";

const MapaLeaflet = dynamic(() => import("@/componentes/mapa/MapaLeaflet"), {
  ssr: false,
  loading: () => (
    <div
      style={{
        width: "100%",
        height: "540px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--surface)",
        borderRadius: "16px",
      }}
    >
      <Text>Cargando cartografía libre de Gutiérrez Zamora (100% Gratis y Local)...</Text>
    </div>
  ),
});

export function VistaMapaEnVivo() {
  const router = useRouter();
  const [listaCamiones, setListaCamiones] = useState<DatosMarcadorCamion[]>([]);
  const [camionSeleccionado, setCamionSeleccionado] = useState<DatosMarcadorCamion | null>(null);
  const [contingenciaClimatica, setContingenciaClimatica] = useState(false);
  const [cargando, setCargando] = useState(true);

  const consultarCamiones = useCallback(async () => {
    try {
      const res = await fetch("/api/v1/camiones", { cache: "no-store" });
      const data = await res.json();
      if (data.exito && Array.isArray(data.camiones)) {
        const mapeados: DatosMarcadorCamion[] = data.camiones.map((c: any) => ({
          id: c.id,
          numeroEconomico: c.numero_economico,
          placas: c.placas,
          conductor: c.conductor || "Sin asignar",
          latitud: Number(c.latitud) || 20.4527,
          longitud: Number(c.longitud) || -97.0896,
          velocidad: Number(c.velocidad_actual) || 0,
          estado: c.estado || "EN_PAUSA",
          ruta: c.modelo || "Camión Municipal",
          orientacion: Number(c.orientacion) || 0,
        }));
        setListaCamiones(mapeados);
        setCamionSeleccionado((prev) => prev || (mapeados.length > 0 ? mapeados[0] : null));
      } else {
        setListaCamiones([]);
      }
    } catch (err) {
      console.error("Error al consultar camiones:", err);
      setListaCamiones([]);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    consultarCamiones();
    const temporizador = setInterval(consultarCamiones, 5000);
    return () => clearInterval(temporizador);
  }, [consultarCamiones]);

  return (
    <Column gap="24" fillWidth>
      {/* Encabezado Operador */}
      <Row fillWidth horizontal="between" vertical="center" gap="16" wrap>
        <Column gap="4">
          <Row gap="8" vertical="center">
            <Heading variant="display-strong-s" onBackground="neutral-strong">
              Centro de Despacho y Monitoreo en Vivo
            </Heading>
            <Badge textVariant="code-default-s" border="neutral-alpha-medium">
              Gutiérrez Zamora, Ver.
            </Badge>
          </Row>
          <Text variant="body-default-m" onBackground="neutral-medium">
            Seguimiento de flota en tiempo real con cartografía OpenStreetMap 100% gratuita y sin restricciones de API Key.
          </Text>
        </Column>

        <Row gap="8" vertical="center" wrap>
          <Button variant="ghost" size="s" onClick={consultarCamiones}>
            <Row gap="8" vertical="center">
              <FaArrowsRotate size={13} />
              <Text>Actualizar</Text>
            </Row>
          </Button>

          <Button
            variant={contingenciaClimatica ? "danger" : "secondary"}
            size="s"
            onClick={() => setContingenciaClimatica(!contingenciaClimatica)}
          >
            <Row gap="8" vertical="center">
              <FaCloudShowersWater size={15} />
              <Text>
                {contingenciaClimatica ? "🚨 Protocolo Río Tecolutla ACTIVO" : "🌧️ Contingencia Climática"}
              </Text>
            </Row>
          </Button>
        </Row>
      </Row>

      {/* Alerta de Contingencia Climática si está activa */}
      {contingenciaClimatica && (
        <Card padding="m" radius="l" border="danger-medium" background="danger-alpha-weak" fillWidth direction="row" vertical="center" gap="16">
          <FaTriangleExclamation size={28} style={{ color: "var(--eco-rose-400)" }} />
          <Column gap="4">
            <Text variant="heading-strong-xs" style={{ color: "var(--eco-rose-400)" }}>
              ALERTA HIDROMETEOROLÓGICA MUNICIPAL: PREVENCIÓN RÍO TECOLUTLA
            </Text>
            <Text variant="body-default-xs" onBackground="neutral-medium">
              Las unidades suspenden temporalmente el barrido en la ribera baja y se repliegan a zonas seguras.
            </Text>
          </Column>
        </Card>
      )}

      {/* Barra de Filtros y Badges de Estado */}
      <Row horizontal="between" vertical="center" fillWidth wrap gap="16">
        <Row gap="16" vertical="center" wrap>
          <Text variant="label-default-xs" onBackground="neutral-weak">Flota:</Text>
          <Row gap="xs" vertical="center">
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--eco-cyan-400)" }} />
            <Text variant="label-default-xs">En Ruta ({listaCamiones.filter((c) => c.estado === "EN_RUTA").length})</Text>
          </Row>
          <Row gap="xs" vertical="center">
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--eco-amber-400)" }} />
            <Text variant="label-default-xs">En Pausa ({listaCamiones.filter((c) => c.estado === "EN_PAUSA").length})</Text>
          </Row>
          <Row gap="xs" vertical="center">
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--eco-rose-400)" }} />
            <Text variant="label-default-xs">Incidente ({listaCamiones.filter((c) => c.estado === "INCIDENTE").length})</Text>
          </Row>
          <Row gap="xs" vertical="center">
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--eco-text-secondary)" }} />
            <Text variant="label-default-xs">Inactivo ({listaCamiones.filter((c) => c.estado === "FUERA_DE_SERVICIO").length})</Text>
          </Row>
        </Row>

        <Badge textVariant="code-default-xs" border="neutral-alpha-weak">
          {listaCamiones.length} Unidades en Sistema
        </Badge>
      </Row>

      {/* Si no hay camiones registrados, mostrar banner claro de ayuda */}
      {!cargando && listaCamiones.length === 0 && (
        <Card padding="l" radius="m" border="neutral-alpha-weak" background="surface">
          <Row fillWidth horizontal="between" vertical="center" wrap gap="12">
            <Column gap="4">
              <Text variant="heading-strong-xs">No hay camiones registrados en la base de datos</Text>
              <Text variant="body-default-xs" onBackground="neutral-weak">
                Agrega unidades desde el módulo de Flota Municipal o envía coordenadas desde el móvil del chofer para verlas en el mapa.
              </Text>
            </Column>
            <Button variant="primary" size="s" onClick={() => router.push("/dashboard/flota")}>
              <FaPlus style={{ marginRight: 6 }} /> Registrar Camión en Flota
            </Button>
          </Row>
        </Card>
      )}

      {/* Contenedor del Mapa e Info de Unidad */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: listaCamiones.length > 0 ? "1fr 340px" : "1fr",
          gap: "20px",
          width: "100%",
          alignItems: "start",
        }}
      >
        {/* Mapa Leaflet Local */}
        <Card
          radius="l"
          border="neutral-alpha-weak"
          background="surface"
          style={{ minHeight: "680px", padding: 0, overflow: "hidden", position: "relative" }}
        >
          <MapaLeaflet
            camiones={listaCamiones}
            idCamionSeleccionado={camionSeleccionado?.id}
            alSeleccionarCamion={(c) => setCamionSeleccionado(c)}
            contingenciaClimatica={contingenciaClimatica}
          />
        </Card>

        {/* Panel lateral con detalle de la unidad seleccionada */}
        {camionSeleccionado && (
          <Card padding="l" radius="l" border="neutral-alpha-weak" background="surface">
            <Column gap="16">
              <Row horizontal="between" vertical="center">
                <Heading variant="heading-strong-m">{camionSeleccionado.numeroEconomico}</Heading>
                <Badge textVariant="code-default-xs">{camionSeleccionado.placas}</Badge>
              </Row>

              <Column gap="8" padding="s" radius="m" background="page">
                <Text variant="label-default-xs" onBackground="neutral-weak">Conductor:</Text>
                <Text variant="body-strong-s">{camionSeleccionado.conductor}</Text>
              </Column>

              <Grid columns="2" gap="8">
                <Column gap="2" padding="s" radius="m" background="page">
                  <Text variant="label-default-xs" onBackground="neutral-weak">Velocidad:</Text>
                  <Text variant="code-default-s">{camionSeleccionado.velocidad} km/h</Text>
                </Column>
                <Column gap="2" padding="s" radius="m" background="page">
                  <Text variant="label-default-xs" onBackground="neutral-weak">Estado:</Text>
                  <Tag size="s" border="neutral-alpha-weak">
                    {camionSeleccionado.estado}
                  </Tag>
                </Column>
              </Grid>

              <Column gap="4">
                <Text variant="label-default-xs" onBackground="neutral-weak">Coordenadas Actuales:</Text>
                <Text variant="code-default-xs">
                  {camionSeleccionado.latitud.toFixed(4)}, {camionSeleccionado.longitud.toFixed(4)}
                </Text>
              </Column>
            </Column>
          </Card>
        )}
      </div>
    </Column>
  );
}
