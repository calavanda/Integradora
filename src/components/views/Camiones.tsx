"use client";

import React, { useState } from "react";
import {
  Column,
  Row,
  Grid,
  Heading,
  Text,
  Button,
  Card,
  Tag,
  ProgressBar,
  StatusIndicator,
  Badge,
} from "@once-ui-system/core";
import { GiMineTruck } from "react-icons/gi";

export interface ElementoCamion {
  id: string;
  numeroEconomico: string;
  placas: string;
  modelo: string;
  conductor: string;
  porcentajeCarga: number;
  cargaActual: string;
  capacidadMaxima: string;
  estado: "EN_RUTA" | "EN_PAUSA" | "FUERA_DE_SERVICIO";
  nivelCombustible: number;
  odometro: string;
  ultimoMantenimiento: string;
}

const camionesFlotaZamora: ElementoCamion[] = [
  {
    id: "TRK-001",
    numeroEconomico: "EcoZamora-01",
    placas: "XZ-4821-A",
    modelo: "Freightliner M2 106 (Compactador de 20 yd³)",
    conductor: "Manuel Ramos Silva",
    porcentajeCarga: 82,
    cargaActual: "7.4 Ton",
    capacidadMaxima: "9.0 Ton",
    estado: "EN_RUTA",
    nivelCombustible: 68,
    odometro: "48,210 km",
    ultimoMantenimiento: "02 Ene 2025",
  },
  {
    id: "TRK-002",
    numeroEconomico: "EcoZamora-02",
    placas: "XZ-7731-B",
    modelo: "International MV Series (Carga Lateral)",
    conductor: "José Luis García",
    porcentajeCarga: 45,
    cargaActual: "3.6 Ton",
    capacidadMaxima: "8.0 Ton",
    estado: "EN_RUTA",
    nivelCombustible: 85,
    odometro: "32,150 km",
    ultimoMantenimiento: "15 Dic 2024",
  },
  {
    id: "TRK-003",
    numeroEconomico: "EcoZamora-03",
    placas: "XZ-9142-C",
    modelo: "Kenworth T370 (Recolección Orgánica)",
    conductor: "Roberto Pérez Meza",
    porcentajeCarga: 92,
    cargaActual: "7.8 Ton",
    capacidadMaxima: "8.5 Ton",
    estado: "EN_PAUSA",
    nivelCombustible: 42,
    odometro: "61,400 km",
    ultimoMantenimiento: "28 Dic 2024",
  },
  {
    id: "TRK-004",
    numeroEconomico: "EcoZamora-04",
    placas: "XZ-1049-D",
    modelo: "Mercedes-Benz Atego (GNC Ecológico)",
    conductor: "Sin asignar",
    porcentajeCarga: 0,
    cargaActual: "0.0 Ton",
    capacidadMaxima: "10.0 Ton",
    estado: "FUERA_DE_SERVICIO",
    nivelCombustible: 30,
    odometro: "89,120 km",
    ultimoMantenimiento: "En revisión de frenos (Taller)",
  },
];

export function VistaCamiones() {
  const [filtroEstado, setFiltroEstado] = useState<string>("Todos");

  const camionesFiltrados = filtroEstado === "Todos"
    ? camionesFlotaZamora
    : camionesFlotaZamora.filter((c) => c.estado === filtroEstado);

  return (
    <Column gap="24" fillWidth>
      {/* Encabezado */}
      <Row fillWidth horizontal="between" vertical="center" gap="16" wrap>
        <Column gap="4">
          <Heading variant="display-strong-s" onBackground="neutral-strong">
            Control de Flota de Camiones Recolectores
          </Heading>
          <Text variant="body-default-m" onBackground="neutral-medium">
            Supervisión telemática de las unidades EcoZamora, estado mecánico y niveles de carga de tolva.
          </Text>
        </Column>
        <Button variant="primary" size="s" prefixIcon="plus">
          Registrar Unidad
        </Button>
      </Row>

      {/* Métricas de la flota */}
      <Grid columns="4" gap="16" fillWidth s={{ columns: 1 }} m={{ columns: 2 }}>
        <Card padding="20" radius="l" border="neutral-medium" direction="row" vertical="center" gap="16">
          <GiMineTruck size={32} color="#30D158" />
          <Column gap="2">
            <Text variant="label-default-s" onBackground="neutral-medium">Total de Unidades</Text>
            <Heading variant="heading-strong-l">4 Camiones</Heading>
          </Column>
        </Card>

        <Card padding="20" radius="l" border="neutral-medium" direction="column" gap="4">
          <Row horizontal="between" vertical="center">
            <Text variant="label-default-s" onBackground="neutral-medium">En Operación Activa</Text>
            <Tag scheme="brand" size="s">75%</Tag>
          </Row>
          <Heading variant="heading-strong-l">3 Operando</Heading>
        </Card>

        <Card padding="20" radius="l" border="neutral-medium" direction="column" gap="4">
          <Row horizontal="between" vertical="center">
            <Text variant="label-default-s" onBackground="neutral-medium">En Taller Preventivo</Text>
            <Tag scheme="warning" size="s">1 Unidad</Tag>
          </Row>
          <Heading variant="heading-strong-l">EcoZamora-04</Heading>
        </Card>

        <Card padding="20" radius="l" border="neutral-medium" direction="column" gap="4">
          <Row horizontal="between" vertical="center">
            <Text variant="label-default-s" onBackground="neutral-medium">Carga Promedio</Text>
            <Tag scheme="neutral" size="s">Tolva</Tag>
          </Row>
          <Heading variant="heading-strong-l">73% Flota</Heading>
        </Card>
      </Grid>

      {/* Filtros */}
      <Row gap="8" fillWidth vertical="center" wrap>
        {["Todos", "EN_RUTA", "EN_PAUSA", "FUERA_DE_SERVICIO"].map((estado) => (
          <Button
            key={estado}
            variant={filtroEstado === estado ? "secondary" : "ghost"}
            size="s"
            onClick={() => setFiltroEstado(estado)}
          >
            {estado}
          </Button>
        ))}
      </Row>

      {/* Catálogo de Unidades */}
      <Grid columns="2" gap="16" fillWidth s={{ columns: 1 }}>
        {camionesFiltrados.map((camion) => (
          <Card key={camion.id} radius="l" padding="20" border="neutral-medium" direction="column" gap="16">
            <Row horizontal="between" vertical="start" fillWidth wrap gap="8">
              <Column gap="2">
                <Row gap="8" vertical="center">
                  <Heading variant="heading-default-m">{camion.numeroEconomico}</Heading>
                  <Badge textVariant="code-default-s" border="neutral-alpha-medium">
                    {camion.placas}
                  </Badge>
                </Row>
                <Text variant="body-default-xs" onBackground="neutral-weak">
                  {camion.modelo}
                </Text>
              </Column>

              <Row gap="8" vertical="center">
                <StatusIndicator
                  size="m"
                  color={
                    camion.estado === "EN_RUTA"
                      ? "green"
                      : camion.estado === "EN_PAUSA"
                      ? "yellow"
                      : "gray"
                  }
                />
                <Text variant="label-default-s" onBackground="neutral-strong">
                  {camion.estado}
                </Text>
              </Row>
            </Row>

            {/* Capacidad y carga de tolva */}
            <Column gap="8" fillWidth>
              <Row horizontal="between" vertical="center">
                <Text variant="label-default-xs" onBackground="neutral-medium">
                  Capacidad de tolva ({camion.cargaActual} / {camion.capacidadMaxima})
                </Text>
                <Text variant="label-default-s" onBackground="neutral-strong">
                  {camion.porcentajeCarga}%
                </Text>
              </Row>
              <ProgressBar value={camion.porcentajeCarga} max={100} />
            </Column>

            {/* Detalles adicionales */}
            <Row horizontal="between" vertical="center" borderTop="neutral-alpha-weak" paddingTop="12" fillWidth wrap gap="8">
              <Column gap="2">
                <Text variant="label-default-xs" onBackground="neutral-weak">Conductor</Text>
                <Text variant="body-default-s">{camion.conductor}</Text>
              </Column>
              <Column gap="2">
                <Text variant="label-default-xs" onBackground="neutral-weak">Nivel Diésel</Text>
                <Text variant="body-default-s">{camion.nivelCombustible}%</Text>
              </Column>
              <Column gap="2">
                <Text variant="label-default-xs" onBackground="neutral-weak">Odómetro</Text>
                <Text variant="body-default-s">{camion.odometro}</Text>
              </Column>
            </Row>

            <Row horizontal="between" vertical="center" gap="8" fillWidth wrap>
              <Text variant="label-default-xs" onBackground="neutral-weak">
                Mantenimiento: {camion.ultimoMantenimiento}
              </Text>
              <Row gap="8">
                <Button variant="ghost" size="s">Historial</Button>
                <Button variant="secondary" size="s">Telemetría GPS</Button>
              </Row>
            </Row>
          </Card>
        ))}
      </Grid>
    </Column>
  );
}
