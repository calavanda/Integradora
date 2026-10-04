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
  Avatar,
  StatusIndicator,
  Badge,
} from "@once-ui-system/core";
import { PiSteeringWheelFill } from "react-icons/pi";

export interface ElementoConductor {
  id: string;
  nombre: string;
  licencia: string;
  turno: "Matutino" | "Vespertino" | "Nocturno";
  camionAsignado: string;
  rutaActual: string;
  puntuacionEcologica: number;
  telefono: string;
  estado: "En Servicio" | "Disponible" | "Descanso";
}

const conductoresZamora: ElementoConductor[] = [
  {
    id: "DRV-GZ-01",
    nombre: "Manuel Ramos Silva",
    licencia: "LIC-FED-8842",
    turno: "Matutino",
    camionAsignado: "EcoZamora-01",
    rutaActual: "Ruta 1 - Malecón y Centro",
    puntuacionEcologica: 96,
    telefono: "+52 (784) 114-8821",
    estado: "En Servicio",
  },
  {
    id: "DRV-GZ-02",
    nombre: "José Luis García",
    licencia: "LIC-FED-4129",
    turno: "Matutino",
    camionAsignado: "EcoZamora-02",
    rutaActual: "Ruta 2 - Col. Renacimiento",
    puntuacionEcologica: 92,
    telefono: "+52 (784) 120-2041",
    estado: "En Servicio",
  },
  {
    id: "DRV-GZ-03",
    nombre: "Roberto Pérez Meza",
    licencia: "LIC-FED-5573",
    turno: "Vespertino",
    camionAsignado: "EcoZamora-03",
    rutaActual: "Ruta 3 - Col. El Carmen",
    puntuacionEcologica: 98,
    telefono: "+52 (784) 105-9903",
    estado: "En Servicio",
  },
  {
    id: "DRV-GZ-04",
    nombre: "Esteban Domínguez Cruz",
    licencia: "LIC-FED-1934",
    turno: "Vespertino",
    camionAsignado: "Unidad de Relevo",
    rutaActual: "En espera de despacho",
    puntuacionEcologica: 89,
    telefono: "+52 (784) 118-1194",
    estado: "Disponible",
  },
];

export function VistaConductores() {
  const [filtroTurno, setFiltroTurno] = useState<string>("Todos");

  const conductoresFiltrados = filtroTurno === "Todos"
    ? conductoresZamora
    : conductoresZamora.filter((d) => d.turno === filtroTurno);

  return (
    <Column gap="24" fillWidth>
      {/* Encabezado */}
      <Row fillWidth horizontal="between" vertical="center" gap="16" wrap>
        <Column gap="4">
          <Heading variant="display-strong-s" onBackground="neutral-strong">
            Directorio de Conductores y Chóferes
          </Heading>
          <Text variant="body-default-m" onBackground="neutral-medium">
            Control de operadores certificados, turnos asignados y enlace con la app móvil en Flutter.
          </Text>
        </Column>
        <Button variant="primary" size="s" prefixIcon="plus">
          Nuevo Conductor
        </Button>
      </Row>

      {/* Métricas de choferes */}
      <Grid columns="4" gap="16" fillWidth s={{ columns: 1 }} m={{ columns: 2 }}>
        <Card padding="20" radius="l" border="neutral-medium" direction="row" vertical="center" gap="16">
          <PiSteeringWheelFill size={32} color="#30D158" />
          <Column gap="2">
            <Text variant="label-default-s" onBackground="neutral-medium">Plantilla de Chóferes</Text>
            <Heading variant="heading-strong-l">8 Operadores</Heading>
          </Column>
        </Card>

        <Card padding="20" radius="l" border="neutral-medium" direction="column" gap="4">
          <Row horizontal="between" vertical="center">
            <Text variant="label-default-s" onBackground="neutral-medium">En Turno Activo</Text>
            <Tag scheme="brand" size="s">75%</Tag>
          </Row>
          <Heading variant="heading-strong-l">3 en Ruta</Heading>
        </Card>

        <Card padding="20" radius="l" border="neutral-medium" direction="column" gap="4">
          <Row horizontal="between" vertical="center">
            <Text variant="label-default-s" onBackground="neutral-medium">Eco-Conducción Prom.</Text>
            <Tag scheme="brand" size="s">Excelente</Tag>
          </Row>
          <Heading variant="heading-strong-l">94 / 100</Heading>
        </Card>

        <Card padding="20" radius="l" border="neutral-medium" direction="column" gap="4">
          <Row horizontal="between" vertical="center">
            <Text variant="label-default-s" onBackground="neutral-medium">En Reserva</Text>
            <Tag scheme="neutral" size="s">Guardia</Tag>
          </Row>
          <Heading variant="heading-strong-l">1 Conductor</Heading>
        </Card>
      </Grid>

      {/* Filtros por turno */}
      <Row gap="8" fillWidth vertical="center" wrap>
        {["Todos", "Matutino", "Vespertino"].map((turno) => (
          <Button
            key={turno}
            variant={filtroTurno === turno ? "secondary" : "ghost"}
            size="s"
            onClick={() => setFiltroTurno(turno)}
          >
            {turno}
          </Button>
        ))}
      </Row>

      {/* Tarjetas de Conductores */}
      <Grid columns="2" gap="16" fillWidth s={{ columns: 1 }}>
        {conductoresFiltrados.map((conductor) => (
          <Card key={conductor.id} radius="l" padding="20" border="neutral-medium" direction="column" gap="16">
            <Row horizontal="between" vertical="start" fillWidth wrap gap="8">
              <Row gap="12" vertical="center">
                <Avatar
                  size="m"
                  value={conductor.nombre
                    .split(" ")
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join("")}
                />
                <Column gap="2">
                  <Heading variant="heading-default-m">{conductor.nombre}</Heading>
                  <Text variant="label-default-xs" onBackground="neutral-weak">
                    {conductor.id} • {conductor.licencia}
                  </Text>
                </Column>
              </Row>

              <Row gap="8" vertical="center">
                <StatusIndicator
                  size="m"
                  color={
                    conductor.estado === "En Servicio"
                      ? "green"
                      : conductor.estado === "Disponible"
                      ? "blue"
                      : "gray"
                  }
                />
                <Text variant="label-default-s" onBackground="neutral-strong">
                  {conductor.estado}
                </Text>
              </Row>
            </Row>

            {/* Asignación y turno */}
            <Row horizontal="between" vertical="center" borderTop="neutral-alpha-weak" paddingTop="12" fillWidth wrap gap="8">
              <Column gap="2">
                <Text variant="label-default-xs" onBackground="neutral-weak">Camión Asignado</Text>
                <Text variant="body-default-s">{conductor.camionAsignado}</Text>
              </Column>
              <Column gap="2">
                <Text variant="label-default-xs" onBackground="neutral-weak">Turno</Text>
                <Badge textVariant="code-default-s" border="neutral-alpha-medium">
                  {conductor.turno}
                </Badge>
              </Column>
              <Column gap="2">
                <Text variant="label-default-xs" onBackground="neutral-weak">Eco-Puntaje</Text>
                <Tag scheme={conductor.puntuacionEcologica >= 90 ? "brand" : "warning"} size="s">
                  {conductor.puntuacionEcologica} pts
                </Tag>
              </Column>
            </Row>

            <Column gap="4" fillWidth>
              <Text variant="label-default-xs" onBackground="neutral-weak">Ruta Actual</Text>
              <Text variant="body-default-s" onBackground="neutral-strong">
                {conductor.rutaActual}
              </Text>
            </Column>

            <Row horizontal="between" vertical="center" gap="8" fillWidth wrap>
              <Text variant="label-default-xs" onBackground="neutral-weak">
                Tel: {conductor.telefono}
              </Text>
              <Row gap="8">
                <Button variant="ghost" size="s">Llamar</Button>
                <Button variant="secondary" size="s">Reasignar Unidad</Button>
              </Row>
            </Row>
          </Card>
        ))}
      </Grid>
    </Column>
  );
}
