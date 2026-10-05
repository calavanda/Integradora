"use client";

import React, { useState } from "react";
import {
  Column,
  Row,
  Text,
  Badge,
  Button,
} from "@once-ui-system/core";
import { PiTruckTrailerFill, PiSteeringWheelFill } from "react-icons/pi";
import { VistaCamiones } from "./Camiones";
import { VistaConductores } from "./Conductores";

export function VistaFlota() {
  const [pestaña, setPestaña] = useState<"camiones" | "conductores">("camiones");

  return (
    <Column fillWidth gap="l">
      {/* Selector de Submódulo de Flota */}
      <Row fillWidth horizontal="between" vertical="center" style={{ flexWrap: "wrap", gap: "12px" }}>
        <Column gap="4">
          <Row vertical="center" gap="s">
            <Badge textVariant="code-default-s" border="neutral-alpha-medium">
              SUPERVISIÓN DE TRANSPORTE
            </Badge>
            <Badge textVariant="code-default-s" border="neutral-alpha-weak">
              GUTIÉRREZ ZAMORA
            </Badge>
          </Row>
          <Text variant="heading-strong-xl">
            {pestaña === "camiones"
              ? "Flota de Camiones Compactadores"
              : "Padrón de Conductores y Operadores"}
          </Text>
        </Column>

        <Row gap="xs" background="page" padding="xs" radius="m" border="neutral-alpha-weak">
          <Button
            size="s"
            variant={pestaña === "camiones" ? "primary" : "tertiary"}
            onClick={() => setPestaña("camiones")}
          >
            <PiTruckTrailerFill style={{ marginRight: "6px" }} /> Unidades / Camiones
          </Button>
          <Button
            size="s"
            variant={pestaña === "conductores" ? "primary" : "tertiary"}
            onClick={() => setPestaña("conductores")}
          >
            <PiSteeringWheelFill style={{ marginRight: "6px" }} /> Conductores
          </Button>
        </Row>
      </Row>

      {/* Renderizado de la vista seleccionada */}
      {pestaña === "camiones" ? <VistaCamiones /> : <VistaConductores />}
    </Column>
  );
}
