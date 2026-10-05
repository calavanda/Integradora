"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
  FaTruckFast,
  FaRoute,
  FaTriangleExclamation,
  FaCheckDouble,
  FaWeightHanging,
  FaClock,
  FaArrowsRotate,
} from "react-icons/fa6";

interface MetricasReales {
  camionesTotal: number;
  camionesEnRuta: number;
  camionesPausa: number;
  camionesInactivos: number;
  rutasTotal: number;
  incidentesTotal: number;
  reclamosTotal: number;
  conductoresTotal: number;
}

interface RutaResumen {
  id: string;
  nombre_ruta: string;
  dias_recoleccion: string[] | string;
  horario_inicio: string;
  horario_fin: string;
  distancia_km: number;
}

const METRICAS_VACIAS: MetricasReales = {
  camionesTotal: 0,
  camionesEnRuta: 0,
  camionesPausa: 0,
  camionesInactivos: 0,
  rutasTotal: 0,
  incidentesTotal: 0,
  reclamosTotal: 0,
  conductoresTotal: 0,
};

export function OverviewPanel({ alCambiarTab }: { alCambiarTab?: (tab: string) => void }) {
  const router = useRouter();
  const [metricas, setMetricas] = useState<MetricasReales>(METRICAS_VACIAS);
  const [rutas, setRutas] = useState<RutaResumen[]>([]);
  const [cargando, setCargando] = useState(true);

  const cargarDatos = async () => {
    setCargando(true);
    try {
      // Consultar todas las APIs en paralelo
      const [resCamiones, resRutas, resIncidentes, resReclamos, resConductores] =
        await Promise.allSettled([
          fetch("/api/v1/camiones", { cache: "no-store" }),
          fetch("/api/v1/rutas", { cache: "no-store" }),
          fetch("/api/v1/incidentes", { cache: "no-store" }),
          fetch("/api/v1/reclamos", { cache: "no-store" }),
          fetch("/api/v1/conductores", { cache: "no-store" }),
        ]);

      const nuevasMetricas: MetricasReales = { ...METRICAS_VACIAS };

      if (resCamiones.status === "fulfilled" && resCamiones.value.ok) {
        const data = await resCamiones.value.json();
        if (data.exito && Array.isArray(data.camiones)) {
          nuevasMetricas.camionesTotal = data.camiones.length;
          nuevasMetricas.camionesEnRuta = data.camiones.filter((c: any) => c.estado === "EN_RUTA").length;
          nuevasMetricas.camionesPausa = data.camiones.filter((c: any) => c.estado === "EN_PAUSA").length;
          nuevasMetricas.camionesInactivos = data.camiones.filter((c: any) => c.estado === "FUERA_DE_SERVICIO").length;
        }
      }

      if (resRutas.status === "fulfilled" && resRutas.value.ok) {
        const data = await resRutas.value.json();
        if (data.exito && Array.isArray(data.rutas)) {
          nuevasMetricas.rutasTotal = data.rutas.length;
          setRutas(data.rutas.slice(0, 5)); // Mostrar máximo las 5 más recientes
        } else {
          setRutas([]);
        }
      }

      if (resIncidentes.status === "fulfilled" && resIncidentes.value.ok) {
        const data = await resIncidentes.value.json();
        if (data.exito && Array.isArray(data.incidentes)) {
          nuevasMetricas.incidentesTotal = data.incidentes.length;
        }
      }

      if (resReclamos.status === "fulfilled" && resReclamos.value.ok) {
        const data = await resReclamos.value.json();
        if (data.exito && Array.isArray(data.reclamos)) {
          nuevasMetricas.reclamosTotal = data.reclamos.length;
        }
      }

      if (resConductores.status === "fulfilled" && resConductores.value.ok) {
        const data = await resConductores.value.json();
        if (data.exito && Array.isArray(data.conductores)) {
          nuevasMetricas.conductoresTotal = data.conductores.length;
        }
      }

      setMetricas(nuevasMetricas);
    } catch (err) {
      console.error("Error al cargar métricas del dashboard:", err);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const irARuta = (ruta: string, tabFallback?: string) => {
    if (alCambiarTab && tabFallback) {
      alCambiarTab(tabFallback);
    }
    router.push(ruta);
  };

  return (
    <Column gap="24" fillWidth>
      {/* Encabezado */}
      <Row fillWidth horizontal="between" vertical="center" gap="16" wrap>
        <Column gap="4">
          <Row gap="8" vertical="center">
            <Heading variant="display-strong-s" onBackground="neutral-strong">
              Resumen Operativo — EcoRuta Gutiérrez Zamora
            </Heading>
            <Badge textVariant="code-default-s" border="neutral-alpha-medium">
              Datos en Tiempo Real
            </Badge>
          </Row>
          <Text variant="body-default-m" onBackground="neutral-medium">
            Todos los datos provienen de la base de datos municipal. Sin simulaciones ni valores precargados.
          </Text>
        </Column>

        <Row gap="8" wrap vertical="center">
          <Button variant="ghost" size="s" onClick={cargarDatos}>
            <Row gap="8" vertical="center">
              <FaArrowsRotate size={13} />
              <Text>Actualizar</Text>
            </Row>
          </Button>
          <Button
            variant="primary"
            size="m"
            onClick={() => irARuta("/dashboard/mapa-en-vivo", "mapa")}
          >
            Ver Mapa en Vivo
          </Button>
          <Button
            variant="secondary"
            size="m"
            onClick={() => irARuta("/dashboard/editor-rutas", "rutas")}
          >
            Trazar Nueva Ruta
          </Button>
        </Row>
      </Row>

      {/* KPIs reales desde la BD */}
      <Grid columns="4" gap="16" fillWidth s={{ columns: 1 }} m={{ columns: 2 }}>
        <Card padding="m" radius="l" border="neutral-alpha-weak" background="surface">
          <Column gap="8">
            <Row horizontal="between" vertical="center">
              <Text variant="label-default-s" onBackground="neutral-weak">
                Flota Registrada
              </Text>
              <FaTruckFast size={18} style={{ color: "var(--eco-cyan-400)" }} />
            </Row>
            <Heading variant="display-strong-xs" style={{ color: "var(--eco-cyan-400)" }}>
              {cargando ? "—" : metricas.camionesTotal} Unidades
            </Heading>
            <Text variant="body-default-s" onBackground="neutral-weak">
              {metricas.camionesEnRuta} en ruta · {metricas.camionesPausa} pausados · {metricas.camionesInactivos} inactivos
            </Text>
          </Column>
        </Card>

        <Card padding="m" radius="l" border="neutral-alpha-weak" background="surface">
          <Column gap="8">
            <Row horizontal="between" vertical="center">
              <Text variant="label-default-s" onBackground="neutral-weak">
                Rutas Configuradas
              </Text>
              <FaRoute size={18} style={{ color: "var(--eco-emerald-400)" }} />
            </Row>
            <Heading variant="display-strong-xs" onBackground="neutral-strong">
              {cargando ? "—" : metricas.rutasTotal} Rutas
            </Heading>
            <Text variant="body-default-s" onBackground="neutral-weak">
              Creadas en el Editor de Rutas municipal
            </Text>
          </Column>
        </Card>

        <Card padding="m" radius="l" border="neutral-alpha-weak" background="surface">
          <Column gap="8">
            <Row horizontal="between" vertical="center">
              <Text variant="label-default-s" onBackground="neutral-weak">
                Conductores Activos
              </Text>
              <FaCheckDouble size={18} style={{ color: "var(--eco-cyan-400)" }} />
            </Row>
            <Heading variant="display-strong-xs" onBackground="neutral-strong">
              {cargando ? "—" : metricas.conductoresTotal}
            </Heading>
            <Text variant="body-default-s" onBackground="neutral-weak">
              Operadores registrados en la BD
            </Text>
          </Column>
        </Card>

        <Card padding="m" radius="l" border="neutral-alpha-weak" background="surface">
          <Column gap="8">
            <Row horizontal="between" vertical="center">
              <Text variant="label-default-s" onBackground="neutral-weak">
                Novedades Abiertas
              </Text>
              <FaTriangleExclamation size={18} style={{ color: "var(--eco-amber-400)" }} />
            </Row>
            <Heading variant="display-strong-xs" style={{ color: metricas.incidentesTotal + metricas.reclamosTotal > 0 ? "var(--eco-amber-400)" : undefined }}>
              {cargando ? "—" : metricas.incidentesTotal + metricas.reclamosTotal}
            </Heading>
            <Text variant="body-default-s" onBackground="neutral-weak">
              {metricas.incidentesTotal} incidentes · {metricas.reclamosTotal} reclamos
            </Text>
          </Column>
        </Card>
      </Grid>

      {/* Rutas registradas en la BD / Reglas de operación */}
      <Grid columns="2" gap="20" fillWidth s={{ columns: 1 }}>
        <Card padding="l" radius="l" border="neutral-alpha-weak" background="surface" fillWidth>
          <Column gap="16">
            <Row horizontal="between" vertical="center">
              <Heading variant="heading-strong-m">
                Rutas Registradas en la BD
              </Heading>
              <Button variant="ghost" size="s" onClick={() => irARuta("/dashboard/editor-rutas")}>
                <FaRoute size={13} style={{ marginRight: 6 }} /> Ver todas
              </Button>
            </Row>

            {cargando ? (
              <Text variant="body-default-s" onBackground="neutral-weak">Cargando rutas...</Text>
            ) : rutas.length === 0 ? (
              <Column gap="8" padding="m" radius="m" border="neutral-alpha-weak" background="page">
                <Text variant="body-default-m" onBackground="neutral-weak">
                  No hay rutas registradas en la base de datos.
                </Text>
                <Button
                  variant="primary"
                  size="s"
                  onClick={() => irARuta("/dashboard/editor-rutas")}
                >
                  Trazar la primera ruta
                </Button>
              </Column>
            ) : (
              <Column gap="8">
                {rutas.map((r) => (
                  <Row
                    key={r.id}
                    fillWidth
                    horizontal="between"
                    vertical="center"
                    padding="s"
                    radius="m"
                    border="neutral-alpha-weak"
                  >
                    <Column gap="2">
                      <Text variant="heading-strong-xs">{r.nombre_ruta}</Text>
                      <Text variant="body-default-s" onBackground="neutral-weak">
                        {Array.isArray(r.dias_recoleccion) ? r.dias_recoleccion.join(", ") : r.dias_recoleccion} · {r.horario_inicio} - {r.horario_fin}
                      </Text>
                    </Column>
                    <Tag size="s" border="neutral-alpha-weak">{r.distancia_km || 0} km</Tag>
                  </Row>
                ))}
              </Column>
            )}
          </Column>
        </Card>

        {/* Reglas de Operación Municipal */}
        <Card padding="l" radius="l" border="neutral-alpha-weak" background="surface" fillWidth>
          <Column gap="16">
            <Heading variant="heading-strong-m">Reglas de Operación Municipal</Heading>
            <Column gap="12">
              <Row gap="8" vertical="start">
                <FaClock size={16} style={{ color: "var(--eco-cyan-400)", marginTop: 2 }} />
                <Text variant="body-default-s">
                  <strong>Límite Urbano:</strong> 40 km/h máximo con monitoreo satelital en tiempo real.
                </Text>
              </Row>
              <Row gap="8" vertical="start">
                <FaTruckFast size={16} style={{ color: "var(--eco-emerald-400)", marginTop: 2 }} />
                <Text variant="body-default-s">
                  <strong>Cero Simulaciones:</strong> Posición transmitida directamente por smartphone del conductor.
                </Text>
              </Row>
              <Row gap="8" vertical="start">
                <FaRoute size={16} style={{ color: "var(--eco-amber-400)", marginTop: 2 }} />
                <Text variant="body-default-s">
                  <strong>OSRM Snap to Roads:</strong> Trazado fiel a las calles de Gutiérrez Zamora, Ver.
                </Text>
              </Row>
              <Row gap="8" vertical="start">
                <FaWeightHanging size={16} style={{ color: "var(--eco-cyan-400)", marginTop: 2 }} />
                <Text variant="body-default-s">
                  <strong>Mapas OpenStreetMap:</strong> Cartografía 100% gratuita, sin API Key ni pagos.
                </Text>
              </Row>
            </Column>
          </Column>
        </Card>
      </Grid>
    </Column>
  );
}

export default OverviewPanel;
