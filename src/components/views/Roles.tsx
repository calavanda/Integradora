"use client";

import React from "react";
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
import { FaBuildingColumns, FaCompassDrafting, FaHeadset, FaTruck, FaPeopleRoof, FaShieldHalved } from "react-icons/fa6";

export interface ElementoRol {
  id: string;
  claveRol: "SUPER_ADMIN" | "DIRECTOR_OBRAS" | "OPERADOR" | "CONDUCTOR" | "CIUDADANO";
  nombre: string;
  dependencia: string;
  usuariosAsignados: number;
  descripcion: string;
  privilegios: string[];
  nivel: "Gubernamental" | "Directivo" | "Operativo" | "Campo" | "Ciudadano";
  icono: React.ReactNode;
}

const rolesGubernamentalesZamora: ElementoRol[] = [
  {
    id: "ROL-GZ-01",
    claveRol: "SUPER_ADMIN",
    nombre: "SUPER_ADMIN",
    dependencia: "Alcaldía / Regiduría de Servicios Públicos",
    usuariosAsignados: 2,
    descripcion: "Vista ejecutiva con KPIs de eficiencia del servicio, porcentaje de reportes atendidos, toneladas recolectadas y métricas globales del municipio de Gutiérrez Zamora.",
    privilegios: ["Tablero Ejecutivo", "Auditorías de Cabildo", "Control Total de Flota", "Métricas Ambientales"],
    nivel: "Gubernamental",
    icono: <FaBuildingColumns size={26} color="#30D158" />,
  },
  {
    id: "ROL-GZ-02",
    claveRol: "DIRECTOR_OBRAS",
    nombre: "DIRECTOR_OBRAS",
    dependencia: "Dirección de Obras Públicas",
    usuariosAsignados: 3,
    descripcion: "Editor intuitivo de rutas con tecnología Snap to Roads (vía OSRM API). Trazado automático al hacer clics en puntos clave respetando el sentido de las calles de Gutiérrez Zamora.",
    privilegios: ["Editor de Rutas OSRM", "Geometría GeoJSON", "Planificación de Cuadrantes", "Puntos Limpios"],
    nivel: "Directivo",
    icono: <FaCompassDrafting size={26} color="#0070F3" />,
  },
  {
    id: "ROL-GZ-03",
    claveRol: "OPERADOR",
    nombre: "OPERADOR",
    dependencia: "Centro de Despacho y Monitoreo",
    usuariosAsignados: 6,
    descripcion: "Mapa interactivo a pantalla completa con actualización en vivo, Badges visuales Once UI por estado, resolución de incidentes, validación de reclamos ciudadanos y Botón de Contingencia Climática.",
    privilegios: ["Monitoreo GPS en Vivo", "Bandeja de Reclamos Ticket", "Botón de Contingencia Climática", "Resolución de Averías"],
    nivel: "Operativo",
    icono: <FaHeadset size={26} color="#FF9F0A" />,
  },
  {
    id: "ROL-GZ-04",
    claveRol: "CONDUCTOR",
    nombre: "CONDUCTOR",
    dependencia: "Sindicato / Operadores de Camión",
    usuariosAsignados: 18,
    descripcion: "Ingesta de telemetría directa desde la app móvil en Flutter mediante el celular del chófer a través de la API POST /api/v1/telemetry/driver-location y reporte de incidencias en ruta.",
    privilegios: ["Transmisión GPS Flutter", "Bitácora de Tolva", "Reporte de Cierre Vial", "Asistencia de Taller"],
    nivel: "Campo",
    icono: <FaTruck size={26} color="#30D158" />,
  },
  {
    id: "ROL-GZ-05",
    claveRol: "CIUDADANO",
    nombre: "CIUDADANO",
    dependencia: "Población de Gutiérrez Zamora",
    usuariosAsignados: 1420,
    descripcion: "Emisión de quejas y reclamos geolocalizados con fotografías de evidencia (Camión no pasó, basura acumulada, contenedor desbordado) y seguimiento de ticket.",
    privilegios: ["Envío de Queja con Foto", "Geolocalización GPS Casa", "Seguimiento de Ticket"],
    nivel: "Ciudadano",
    icono: <FaPeopleRoof size={26} color="#BF5AF2" />,
  },
];

export function VistaRoles() {
  return (
    <Column gap="24" fillWidth>
      {/* Encabezado */}
      <Row fillWidth horizontal="between" vertical="center" gap="16" wrap>
        <Column gap="4">
          <Row gap="8" vertical="center">
            <FaShieldHalved size={24} color="#30D158" />
            <Heading variant="display-strong-s" onBackground="neutral-strong">
              Jerarquía de Roles Gubernamentales (RBAC)
            </Heading>
            <Badge textVariant="code-default-s" border="neutral-alpha-medium">
              Gutiérrez Zamora, Veracruz
            </Badge>
          </Row>
          <Text variant="body-default-m" onBackground="neutral-medium">
            Definición oficial de los 5 perfiles gubernamentales de EcoRuta (Zamora Limpia).
          </Text>
        </Column>
        <Button variant="primary" size="s" prefixIcon="plus">
          Nuevo Rol Gubernamental
        </Button>
      </Row>

      {/* Grid de Roles Oficiales */}
      <Grid columns="2" gap="16" fillWidth s={{ columns: 1 }}>
        {rolesGubernamentalesZamora.map((rol) => (
          <Card key={rol.id} radius="l" padding="20" border="neutral-medium" direction="column" gap="16">
            <Row horizontal="between" vertical="start" fillWidth wrap gap="8">
              <Row gap="12" vertical="center">
                {rol.icono}
                <Column gap="2">
                  <Heading variant="heading-default-m">{rol.nombre}</Heading>
                  <Text variant="label-default-xs" style={{ color: "#30D158", fontWeight: 600 }}>
                    {rol.dependencia}
                  </Text>
                </Column>
              </Row>

              <Tag
                scheme={
                  rol.nivel === "Gubernamental"
                    ? "danger"
                    : rol.nivel === "Directivo"
                    ? "brand"
                    : rol.nivel === "Operativo"
                    ? "warning"
                    : "neutral"
                }
                size="s"
              >
                {rol.nivel}
              </Tag>
            </Row>

            <Text variant="body-default-s" onBackground="neutral-weak">
              {rol.descripcion}
            </Text>

            {/* Privilegios */}
            <Column gap="8" fillWidth borderTop="neutral-alpha-weak" paddingTop="12">
              <Text variant="label-default-xs" onBackground="neutral-medium">
                Privilegios Asignados:
              </Text>
              <Row gap="8" wrap>
                {rol.privilegios.map((privilegio, indice) => (
                  <Badge key={indice} textVariant="code-default-s" border="neutral-alpha-medium">
                    {privilegio}
                  </Badge>
                ))}
              </Row>
            </Column>

            <Row horizontal="between" vertical="center" paddingTop="8" fillWidth wrap gap="8">
              <Text variant="label-default-xs" onBackground="neutral-weak">
                {rol.usuariosAsignados} usuarios activos en el sistema
              </Text>
              <Button variant="secondary" size="s">
                Configurar Privilegios
              </Button>
            </Row>
          </Card>
        ))}
      </Grid>
    </Column>
  );
}
