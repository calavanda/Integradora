"use client";

import React, { useState, useEffect } from "react";
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
} from "@once-ui-system/core";
import { FaCloudShowersWater, FaTruckFast, FaTriangleExclamation, FaRoute } from "react-icons/fa6";
import { DatosMarcadorCamion } from "@/componentes/mapa/MapaLeaflet";

const MapaLeaflet = dynamic(() => import("@/componentes/mapa/MapaLeaflet"), {
  ssr: false,
  loading: () => (
    <div style={{ width: "100%", height: "540px", display: "flex", alignItems: "center", justifyContent: "center", background: "#0a0f0d", borderRadius: "16px" }}>
      <Text>Cargando cartografía municipal de Gutiérrez Zamora (OpenStreetMap)...</Text>
    </div>
  ),
});

const camionesInicialesZamora: DatosMarcadorCamion[] = [
  {
    id: "TRK-01",
    numeroEconomico: "EcoZamora-01",
    placas: "XZ-4821-A",
    conductor: "Manuel Ramos Silva",
    latitud: 20.4542,
    longitud: -97.0874,
    velocidad: 24,
    estado: "EN_RUTA",
    ruta: "Ruta 1 - Malecón y Centro",
  },
  {
    id: "TRK-02",
    numeroEconomico: "EcoZamora-02",
    placas: "XZ-7731-B",
    conductor: "José Luis García",
    latitud: 20.4518,
    longitud: -97.0915,
    velocidad: 18,
    estado: "EN_RUTA",
    ruta: "Ruta 2 - Col. Renacimiento",
  },
  {
    id: "TRK-03",
    numeroEconomico: "EcoZamora-03",
    placas: "XZ-9142-C",
    conductor: "Roberto Pérez Meza",
    latitud: 20.4571,
    longitud: -97.0832,
    velocidad: 0,
    estado: "INCIDENTE",
    ruta: "Ruta 3 - Col. El Carmen",
  },
  {
    id: "TRK-04",
    numeroEconomico: "EcoZamora-04",
    placas: "XZ-1049-D",
    conductor: "Sin asignar",
    latitud: 20.4491,
    longitud: -97.0952,
    velocidad: 0,
    estado: "FUERA_DE_SERVICIO",
    ruta: "Taller Municipal / Base",
  },
];

export function VistaMapaEnVivo() {
  const [listaCamiones, setListaCamiones] = useState<DatosMarcadorCamion[]>(camionesInicialesZamora);
  const [camionSeleccionado, setCamionSeleccionado] = useState<DatosMarcadorCamion>(camionesInicialesZamora[0]);
  const [contingenciaClimatica, setContingenciaClimatica] = useState(false);
  const [filtroRuta, setFiltroRuta] = useState<string>("Todas");

  // Consulta de telemetría periódica a la API de choferes
  useEffect(() => {
    const consultarTelemetria = async () => {
      try {
        const respuesta = await fetch("/api/v1/telemetry/driver-location");
        const datos = await respuesta.json();
        if (datos.success && datos.trucks && datos.trucks.length > 0) {
          setListaCamiones((camionesActuales) => {
            const copia = [...camionesActuales];
            datos.trucks.forEach((camionApi: any) => {
              const indice = copia.findIndex((c) => c.numeroEconomico === camionApi.numero_economico);
              if (indice !== -1) {
                copia[indice] = {
                  ...copia[indice],
                  latitud: camionApi.latitude,
                  longitud: camionApi.longitude,
                  velocidad: camionApi.speed,
                  estado: camionApi.status,
                };
              }
            });
            return copia;
          });
        }
      } catch (error) {
        // Modo silencioso / simulación
      }
    };

    const temporizador = setInterval(consultarTelemetria, 4000);
    return () => clearInterval(temporizador);
  }, []);

  const camionesFiltrados = filtroRuta === "Todas"
    ? listaCamiones
    : listaCamiones.filter((c) => c.ruta.includes(filtroRuta));

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
            Seguimiento de flota en tiempo real con cartografía OpenStreetMap de alta precisión sin restricciones de API Key.
          </Text>
        </Column>

        {/* Botón de Contingencia Climática */}
        <Row gap="8" vertical="center">
          <Button
            variant={contingenciaClimatica ? "danger" : "secondary"}
            size="m"
            onClick={() => setContingenciaClimatica(!contingenciaClimatica)}
          >
            <Row gap="8" vertical="center">
              <FaCloudShowersWater size={18} />
              <Text style={{ fontWeight: 700 }}>
                {contingenciaClimatica ? "🚨 Protocolo Río Tecolutla ACTIVO" : "🌧️ Contingencia Climática"}
              </Text>
            </Row>
          </Button>
        </Row>
      </Row>

      {/* Alerta de Contingencia Climática si está activa */}
      {contingenciaClimatica && (
        <Card padding="20" radius="l" border="danger-medium" background="danger-alpha-weak" fillWidth direction="row" vertical="center" gap="16">
          <FaTriangleExclamation size={32} color="#FF453A" />
          <Column gap="4">
            <Text variant="heading-default-xs" style={{ color: "#FF453A", fontWeight: 800 }}>
              ALERTA HIDROMETEOROLÓGICA MUNICIPAL: CRECIDA DEL RÍO TECOLUTLA
            </Text>
            <Text variant="body-default-xs" onBackground="neutral-medium">
              Rutas del Malecón y zonas bajas pausadas de forma preventiva. Las unidades se replegaron a las colonias altas.
            </Text>
          </Column>
        </Card>
      )}

      {/* Barra de Filtros y Badges de Estado */}
      <Row horizontal="between" vertical="center" fillWidth wrap gap="16">
        <Row gap="16" vertical="center" wrap>
          <Text variant="label-default-xs" onBackground="neutral-weak">Estados:</Text>
          <Row gap="8" vertical="center">
            <span style={{ display: "inline-block", width: 10, height: 10, borderRadius: "50%", background: "#30D158" }} />
            <Text variant="label-default-xs">🟢 En Ruta ({listaCamiones.filter(c => c.estado === "EN_RUTA").length})</Text>
          </Row>
          <Row gap="8" vertical="center">
            <span style={{ display: "inline-block", width: 10, height: 10, borderRadius: "50%", background: "#FFD60A" }} />
            <Text variant="label-default-xs">🟡 En Pausa ({listaCamiones.filter(c => c.estado === "EN_PAUSA").length})</Text>
          </Row>
          <Row gap="8" vertical="center">
            <span style={{ display: "inline-block", width: 10, height: 10, borderRadius: "50%", background: "#FF453A" }} />
            <Text variant="label-default-xs">🔴 Incidente ({listaCamiones.filter(c => c.estado === "INCIDENTE").length})</Text>
          </Row>
          <Row gap="8" vertical="center">
            <span style={{ display: "inline-block", width: 10, height: 10, borderRadius: "50%", background: "#8E8E93" }} />
            <Text variant="label-default-xs">⚪ Inactivo ({listaCamiones.filter(c => c.estado === "FUERA_DE_SERVICIO").length})</Text>
          </Row>
        </Row>

        {/* Filtro por rutas municipales */}
        <Row gap="8" vertical="center" wrap>
          <Text variant="label-default-xs" onBackground="neutral-weak">Filtrar:</Text>
          {["Todas", "Ruta 1", "Ruta 2", "Ruta 3"].map((rutaNombre) => (
            <Button
              key={rutaNombre}
              variant={filtroRuta === rutaNombre ? "secondary" : "ghost"}
              size="s"
              onClick={() => setFiltroRuta(rutaNombre)}
            >
              {rutaNombre}
            </Button>
          ))}
        </Row>
      </Row>

      {/* Contenedor del Mapa Leaflet a Pantalla Completa con Tarjeta Flotante */}
      <Card
        radius="l"
        border="neutral-medium"
        fillWidth
        position="relative"
        style={{ height: "540px", padding: 0, overflow: "hidden" }}
      >
        <MapaLeaflet
          camiones={camionesFiltrados}
          idCamionSeleccionado={camionSeleccionado.id}
          alSeleccionarCamion={(camion) => setCamionSeleccionado(camion)}
          contingenciaClimatica={contingenciaClimatica}
        />

        {/* Tarjeta Flotante de Unidad Seleccionada */}
        <div
          style={{
            position: "absolute",
            bottom: "20px",
            right: "20px",
            width: "320px",
            maxWidth: "calc(100% - 40px)",
            zIndex: 1000,
          }}
        >
          <Card padding="16" radius="m" border="neutral-medium" direction="column" gap="12" background="surface">
            <Row horizontal="between" vertical="center">
              <Row gap="8" vertical="center">
                <FaTruckFast size={20} color="#30D158" />
                <Heading variant="heading-default-xs">{camionSeleccionado.numeroEconomico}</Heading>
              </Row>
              <Badge textVariant="code-default-s" border="neutral-alpha-medium">
                {camionSeleccionado.placas}
              </Badge>
            </Row>

            <Column gap="4">
              <Row horizontal="between" vertical="center">
                <Text variant="label-default-xs" onBackground="neutral-weak">Conductor:</Text>
                <Text variant="body-default-xs" style={{ fontWeight: 600 }}>{camionSeleccionado.conductor}</Text>
              </Row>
              <Row horizontal="between" vertical="center">
                <Text variant="label-default-xs" onBackground="neutral-weak">Ruta Asignada:</Text>
                <Text variant="body-default-xs">{camionSeleccionado.ruta}</Text>
              </Row>
              <Row horizontal="between" vertical="center">
                <Text variant="label-default-xs" onBackground="neutral-weak">Velocidad Actual:</Text>
                <Text variant="body-default-xs" style={{ color: "#30D158", fontWeight: 700 }}>
                  {camionSeleccionado.velocidad} km/h
                </Text>
              </Row>
              <Row horizontal="between" vertical="center">
                <Text variant="label-default-xs" onBackground="neutral-weak">Estado:</Text>
                <Tag
                  scheme={
                    camionSeleccionado.estado === "EN_RUTA"
                      ? "brand"
                      : camionSeleccionado.estado === "INCIDENTE"
                      ? "danger"
                      : camionSeleccionado.estado === "EN_PAUSA"
                      ? "warning"
                      : "neutral"
                  }
                  size="s"
                >
                  {camionSeleccionado.estado}
                </Tag>
              </Row>
            </Column>

            <Button variant="secondary" size="s" fillWidth>
              Abrir Canal de Radio de Cabina
            </Button>
          </Card>
        </div>
      </Card>
    </Column>
  );
}
