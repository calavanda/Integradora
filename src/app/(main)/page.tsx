"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Heading,
  Text,
  Button,
  Column,
  Row,
  Grid,
  Badge,
  Card,
  Tag,
  Logo,
} from "@once-ui-system/core";
import {
  FaTruckFast,
  FaRoute,
  FaLocationDot,
  FaShieldHalved,
  FaClock,
  FaArrowRight,
  FaCompass,
} from "react-icons/fa6";

export default function Home() {
  const [rutas, setRutas] = useState<{ id: string; nombre_ruta: string; dias_recoleccion: string[] | string; horario_inicio: string; horario_fin: string; distancia_km: number }[]>([]);
  const [rutaSeleccionada, setRutaSeleccionada] = useState<string | null>(null);
  const [cargandoRutas, setCargandoRutas] = useState(true);

  useEffect(() => {
    const cargarRutas = async () => {
      try {
        const res = await fetch("/api/v1/rutas", { cache: "no-store" });
        const data = await res.json();
        if (data.exito && Array.isArray(data.rutas) && data.rutas.length > 0) {
          setRutas(data.rutas);
          setRutaSeleccionada(data.rutas[0].id);
        }
      } catch {
        setRutas([]);
      } finally {
        setCargandoRutas(false);
      }
    };
    cargarRutas();
  }, []);

  const rutaActual = rutas.find((r) => r.id === rutaSeleccionada) || null;

  return (
    <Column
      fillWidth
      minHeight="100dvh"
      background="page"
      horizontal="center"
      position="relative"
    >
      {/* Barra Superior Institucional */}
      <Row
        as="nav"
        fillWidth
        minHeight="64"
        horizontal="between"
        vertical="center"
        paddingX="l"
        borderBottom="neutral-alpha-weak"
        background="page"
        style={{ zIndex: 10 }}
      >
        <Row vertical="center" gap="12">
          <Row vertical="center" minWidth={10}>
            <Logo
              dark
              wordmark="/trademarks/wordmark-light.svg"
              size="s"
              href="/"
            />
            <Logo
              light
              wordmark="/trademarks/wordmark-dark.svg"
              size="s"
              href="/"
            />
          </Row>
          <Badge textVariant="code-default-s" border="neutral-alpha-medium">
            Gutiérrez Zamora, Veracruz
          </Badge>
        </Row>

        <Row gap="12" vertical="center">
          <Link href="/login" style={{ textDecoration: "none" }}>
            <Button variant="ghost" size="s">
              Portal Oficial
            </Button>
          </Link>
          <Link href="/dashboard" style={{ textDecoration: "none" }}>
            <Button variant="primary" size="s">
              Ir al Dashboard
            </Button>
          </Link>
        </Row>
      </Row>

      {/* Contenedor Principal Split-Screen (Taste Skill: Asymmetric / Utilitarian) */}
      <Column
        fillWidth
        maxWidth="xl"
        paddingX="l"
        paddingY="xl"
        gap="32"
        style={{ flex: 1 }}
      >
        {/* Sección Hero Asimétrica */}
        <Grid columns="2" gap="32" s={{ columns: 1 }} m={{ columns: 1 }}>
          {/* Columna Izquierda: Mensaje y Acción */}
          <Column gap="20" vertical="start">
            <Badge textVariant="code-default-s" border="neutral-alpha-medium">
              H. AYUNTAMIENTO DE GUTIÉRREZ ZAMORA · GOBIERNO MUNICIPAL
            </Badge>

            <Heading variant="display-strong-l" onBackground="neutral-strong">
              EcoRuta: Zamora Limpia
            </Heading>

            <Text
              variant="heading-default-s"
              onBackground="neutral-medium"
              style={{ maxWidth: "50ch" }}
            >
              Monitoreo satelital en tiempo real de la flota de recolección de residuos, trazado de rutas OSRM y atención ciudadana sin simulaciones.
            </Text>

            <Row gap="12" vertical="center" wrap marginTop="8">
              <Link href="/dashboard" style={{ textDecoration: "none" }}>
                <Button variant="primary" size="l">
                  <Row gap="8" vertical="center">
                    <Text>Entrar al Panel de Control</Text>
                    <FaArrowRight size={14} />
                  </Row>
                </Button>
              </Link>
              <Link href="/login" style={{ textDecoration: "none" }}>
                <Button variant="secondary" size="l">
                  Iniciar Sesión de Operador
                </Button>
              </Link>
            </Row>

            {/* Pilares Técnicos */}
            <Row gap="16" wrap marginTop="12">
              <Row gap="8" vertical="center">
                <FaShieldHalved size={14} style={{ color: "var(--eco-cyan-400)" }} />
                <Text variant="label-default-s" onBackground="neutral-weak">
                  Telemetría GPS Real
                </Text>
              </Row>
              <Row gap="8" vertical="center">
                <FaClock size={14} style={{ color: "var(--eco-emerald-400)" }} />
                <Text variant="label-default-s" onBackground="neutral-weak">
                  Límite Urbano 40 km/h
                </Text>
              </Row>
              <Row gap="8" vertical="center">
                <FaRoute size={14} style={{ color: "var(--eco-amber-400)" }} />
                <Text variant="label-default-s" onBackground="neutral-weak">
                  OSRM Snap to Roads
                </Text>
              </Row>
            </Row>
          </Column>

          {/* Columna Derecha: Tarjeta Interactiva de Consulta Ciudadana */}
          <Card padding="l" radius="l" border="neutral-alpha-weak" background="surface">
            <Column gap="20" fillWidth>
              <Row horizontal="between" vertical="center">
                <Row gap="8" vertical="center">
                  <FaLocationDot size={18} style={{ color: "var(--eco-cyan-400)" }} />
                  <Heading variant="heading-strong-s">
                    Rutas de Recolección Registradas
                  </Heading>
                </Row>
                <Tag size="s" border="neutral-alpha-weak">Base de Datos Oficial</Tag>
              </Row>

              <Text variant="body-default-s" onBackground="neutral-medium">
                Rutas de recolección configuradas por la Dirección de Obras Públicas para Gutiérrez Zamora:
              </Text>

              {cargandoRutas ? (
                <Text variant="body-default-s" onBackground="neutral-weak">Cargando rutas...</Text>
              ) : rutas.length === 0 ? (
                <Card padding="m" radius="m" border="neutral-alpha-weak" background="page">
                  <Column gap="8">
                    <Text variant="heading-strong-xs">Sin rutas registradas aún</Text>
                    <Text variant="body-default-s" onBackground="neutral-weak">
                      El administrador municipal debe registrar las rutas desde el Panel de Control para que aparezcan aquí.
                    </Text>
                  </Column>
                </Card>
              ) : (
                <>
                  <Row gap="8" fillWidth wrap>
                    {rutas.map((r) => (
                      <Button
                        key={r.id}
                        variant={rutaSeleccionada === r.id ? "primary" : "tertiary"}
                        size="s"
                        onClick={() => setRutaSeleccionada(r.id)}
                      >
                        {r.nombre_ruta}
                      </Button>
                    ))}
                  </Row>

                  {rutaActual && (
                    <Card padding="m" radius="m" border="neutral-alpha-weak" background="page">
                      <Column gap="12">
                        <Row horizontal="between" vertical="center">
                          <Text variant="label-default-s" onBackground="neutral-weak">
                            Ruta:
                          </Text>
                          <Badge textVariant="code-default-s">{rutaActual.nombre_ruta}</Badge>
                        </Row>

                        <Row horizontal="between" vertical="center">
                          <Text variant="label-default-s" onBackground="neutral-weak">
                            Días de Servicio:
                          </Text>
                          <Text variant="body-default-s">
                            {Array.isArray(rutaActual.dias_recoleccion)
                              ? rutaActual.dias_recoleccion.join(", ")
                              : rutaActual.dias_recoleccion}
                          </Text>
                        </Row>

                        <Row horizontal="between" vertical="center">
                          <Text variant="label-default-s" onBackground="neutral-weak">
                            Horario:
                          </Text>
                          <Heading variant="heading-strong-m" style={{ color: "var(--eco-cyan-400)" }}>
                            {rutaActual.horario_inicio} – {rutaActual.horario_fin}
                          </Heading>
                        </Row>

                        <Row horizontal="between" vertical="center">
                          <Text variant="label-default-s" onBackground="neutral-weak">
                            Distancia estimada:
                          </Text>
                          <Text variant="body-default-s">{rutaActual.distancia_km || 0} km</Text>
                        </Row>
                      </Column>
                    </Card>
                  )}
                </>
              )}

              <Link href="/dashboard/mapa-en-vivo" style={{ textDecoration: "none", width: "100%" }}>
                <Button variant="secondary" size="m" fillWidth>
                  Ver Flota en el Mapa en Tiempo Real
                </Button>
              </Link>
            </Column>
          </Card>
        </Grid>

        {/* Sección de Compromiso Institucional */}
        <Grid columns="3" gap="20" fillWidth marginTop="20" s={{ columns: 1 }} m={{ columns: 2 }}>
          <Card padding="m" radius="l" border="neutral-alpha-weak" background="surface">
            <Column gap="8">
              <FaTruckFast size={22} style={{ color: "var(--eco-cyan-400)" }} />
              <Heading variant="heading-strong-xs">Flota 100% Monitoreada</Heading>
              <Text variant="body-default-s" onBackground="neutral-medium">
                Los conductores reportan posición real vía GPS directo a la API municipal sin intermediarios ni estimaciones ficticias.
              </Text>
            </Column>
          </Card>

          <Card padding="m" radius="l" border="neutral-alpha-weak" background="surface">
            <Column gap="8">
              <FaCompass size={22} style={{ color: "var(--eco-emerald-400)" }} />
              <Heading variant="heading-strong-xs">Editor Snap to Roads</Heading>
              <Text variant="body-default-s" onBackground="neutral-medium">
                La Dirección de Obras Públicas traza rutas optimizadas con OSRM respetando el sentido vial de Gutiérrez Zamora.
              </Text>
            </Column>
          </Card>

          <Card padding="m" radius="l" border="neutral-alpha-weak" background="surface">
            <Column gap="8">
              <FaRoute size={22} style={{ color: "var(--eco-amber-400)" }} />
              <Heading variant="heading-strong-xs">Auditoría y Playback</Heading>
              <Text variant="body-default-s" onBackground="neutral-medium">
                Supervisión de velocidades con alerta instantánea cuando un camión excede los 40 km/h en zonas habitacionales.
              </Text>
            </Column>
          </Card>
        </Grid>
      </Column>

      {/* Pie de Página Institucional */}
      <Row
        as="footer"
        fillWidth
        horizontal="between"
        vertical="center"
        paddingX="l"
        paddingY="m"
        borderTop="neutral-alpha-weak"
        background="page"
        wrap
        gap="12"
      >
        <Text variant="body-default-s" onBackground="neutral-weak">
          © {new Date().getFullYear()} EcoRuta · H. Ayuntamiento de Gutiérrez Zamora, Ver. Todos los derechos reservados.
        </Text>
        <Row gap="16">
          <Link href="/dashboard" style={{ textDecoration: "none" }}>
            <Text variant="body-default-s" onBackground="neutral-medium">
              Dashboard
            </Text>
          </Link>
          <Link href="/dashboard/documentacion-apis" style={{ textDecoration: "none" }}>
            <Text variant="body-default-s" onBackground="neutral-medium">
              Documentación APIs
            </Text>
          </Link>
          <Link href="/login" style={{ textDecoration: "none" }}>
            <Text variant="body-default-s" onBackground="neutral-medium">
              Acceso Funcionarios
            </Text>
          </Link>
        </Row>
      </Row>
    </Column>
  );
}
