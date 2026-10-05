"use client";

import React, { useState } from "react";
import type { ComponentType } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { PiTruckTrailerFill } from "react-icons/pi";
import { FaRoute, FaMapLocationDot, FaClockRotateLeft } from "react-icons/fa6";
import { FaUsersCog } from "react-icons/fa";
import { TbLayoutDashboardFilled, TbMessageReportFilled } from "react-icons/tb";
import { HiOutlineCodeBracket } from "react-icons/hi2";
import { MdWorkspaces } from "react-icons/md";
import {
  Row,
  Column,
  Logo,
  MegaMenu,
  ThemeSwitcher,
  Text,
  Icon,
  IconButton,
  Button,
  Badge,
} from "@once-ui-system/core";
import type { MenuGroup, IconName } from "@once-ui-system/core";
import { UserButton } from "@clerk/nextjs";

type SidebarIcon = IconName | ComponentType<{ size?: number | string; style?: React.CSSProperties }>;

interface SidebarItem {
  id: string;
  label: string;
  icon: SidebarIcon;
  href: string;
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const pathname = usePathname();
  const router = useRouter();

  const sidebarItems: SidebarItem[] = [
    { id: "overview", label: "Overview", icon: TbLayoutDashboardFilled, href: "/dashboard" },
    { id: "mapa", label: "Mapa en Vivo", icon: FaMapLocationDot, href: "/dashboard/mapa-en-vivo" },
    { id: "rutas", label: "Editor OSRM", icon: FaRoute, href: "/dashboard/editor-rutas" },
    { id: "reclamos", label: "Incidentes / Reclamos", icon: TbMessageReportFilled, href: "/dashboard/reclamos" },
    { id: "flota", label: "Flota Municipal", icon: PiTruckTrailerFill, href: "/dashboard/flota" },
    { id: "playback", label: "Reproducción GPS", icon: FaClockRotateLeft, href: "/dashboard/playback" },
    { id: "usuarios", label: "Usuarios", icon: FaUsersCog, href: "/dashboard/usuarios" },
    { id: "roles", label: "Roles", icon: MdWorkspaces, href: "/dashboard/roles" },
    { id: "apis", label: "Documentación APIs", icon: HiOutlineCodeBracket, href: "/dashboard/documentacion-apis" },
  ];

  const menuGroups: MenuGroup[] = [
    {
      id: "operaciones",
      label: "Operaciones",
      suffixIcon: "chevronDown",
      sections: [
        {
          title: "Monitoreo Municipal",
          links: [
            {
              label: "Rastreo en Tiempo Real",
              href: "/dashboard/mapa-en-vivo",
              icon: "HiOutlineSquares2X2",
              description: "Ubicación satelital en vivo sin simulaciones",
            },
            {
              label: "Auditoría de Recorridos",
              href: "/dashboard/playback",
              icon: "HiOutlineDocumentChartBar",
              description: "Playback histórico y control de velocidad",
            },
          ],
        },
      ],
    },
    {
      id: "obras",
      label: "Obras Públicas",
      suffixIcon: "chevronDown",
      sections: [
        {
          title: "Planificación Vial",
          links: [
            {
              label: "Editor de Rutas OSRM",
              href: "/dashboard/editor-rutas",
              icon: "code",
              description: "Trazado inteligente ajustado a calles",
            },
            {
              label: "Mantenimiento de Flota",
              href: "/dashboard/flota",
              icon: "cube",
              description: "Supervisión de camiones y conductores",
            },
          ],
        },
      ],
    },
    {
      id: "ciudadania",
      label: "Atención Ciudadana",
      suffixIcon: "chevronDown",
      sections: [
        {
          title: "Ventanilla Municipal",
          links: [
            {
              label: "Reclamos y Quejas",
              href: "/dashboard/reclamos",
              icon: "infoCircle",
              description: "Atención a quejas de recolección vecinal",
            },
          ],
        },
      ],
    },
    {
      id: "tecnologia",
      label: "Desarrolladores",
      suffixIcon: "chevronDown",
      sections: [
        {
          title: "Espacio Técnico",
          links: [
            {
              label: "Documentación de APIs",
              href: "/dashboard/documentacion-apis",
              icon: "code",
              description: "Especificación OpenAPI, endpoints y SDKs",
            },
          ],
        },
      ],
    },
  ];

  return (
    <Column fillWidth minHeight="100vh" background="page" position="relative">
      {/* Header adaptable a temas oscuro/claro con diseño institucional sobrio */}
      <Row
        as="header"
        fillWidth
        minHeight="64"
        vertical="center"
        horizontal="between"
        paddingX="l"
        background="page"
        borderBottom="neutral-alpha-weak"
        position="sticky"
        top="0"
        zIndex={10}
      >
        {/* Izquierda: Identidad Municipal */}
        <Row vertical="center" gap="16" style={{ flexShrink: 0 }}>
          <Row vertical="center" minWidth={10}>
            <Logo
              dark
              wordmark="/trademarks/wordmark-light.svg"
              size="s"
              href="/dashboard"
            />
            <Logo
              light
              wordmark="/trademarks/wordmark-dark.svg"
              size="s"
              href="/dashboard"
            />
          </Row>
          <Badge textVariant="code-default-s" border="neutral-alpha-medium">
            EcoRuta · Zamora Limpia
          </Badge>
        </Row>

        {/* Centro: MegaMenu distribuido limpiamente */}
        <Row vertical="center" horizontal="center" style={{ flex: 1, paddingLeft: "24px", paddingRight: "24px" }}>
          <MegaMenu menuGroups={menuGroups} />
        </Row>

        {/* Derecha: Botón de recarga global, selector de tema y perfil Clerk */}
        <Row vertical="center" gap="m" style={{ flexShrink: 0 }} horizontal="end">
          <Button
            variant="tertiary"
            size="s"
            onClick={() => router.refresh()}
            tooltip="Recargar Datos de la Página"
          >
            <FaClockRotateLeft size={14} style={{ marginRight: 6 }} /> Recargar
          </Button>
          <ThemeSwitcher />
          <UserButton />
        </Row>
      </Row>

      {/* Contenedor principal del Dashboard */}
      <Row fillWidth flex={1} style={{ overflow: "hidden" }}>
        {/* Sidebar Izquierdo Colapsable */}
        <Column
          as="aside"
          style={{
            width: isCollapsed ? "72px" : "240px",
            minWidth: isCollapsed ? "72px" : "240px",
            transition: "width 0.25s cubic-bezier(0.4, 0, 0.2, 1), min-width 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
            overflow: "hidden",
            flexShrink: 0,
          }}
          padding="s"
          gap="xs"
          borderRight="neutral-alpha-weak"
          background="page"
        >
          {/* Cabecera del Sidebar con Botón para Expandir/Colapsar */}
          <Row
            vertical="center"
            horizontal="between"
            paddingX="xs"
            paddingY="s"
            style={{ minHeight: "40px" }}
          >
            <span
              style={{
                overflow: "hidden",
                maxWidth: isCollapsed ? "0px" : "140px",
                opacity: isCollapsed ? 0 : 1,
                transition: "max-width 0.25s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s ease",
                whiteSpace: "nowrap",
                display: "flex",
                alignItems: "center",
              }}
            >
              <Text variant="heading-strong-xs" onBackground="neutral-weak">
                Menú Operativo
              </Text>
            </span>
            <IconButton
              icon={isCollapsed ? "chevronRight" : "chevronLeft"}
              variant="tertiary"
              size="s"
              onClick={() => setIsCollapsed(!isCollapsed)}
              aria-label={isCollapsed ? "Expandir sidebar" : "Colapsar sidebar"}
              style={{ flexShrink: 0 }}
            />
          </Row>

          {/* Lista de Navegación del Sidebar hacia Rutas Reales */}
          {sidebarItems.map((item) => {
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname?.startsWith(item.href);

            return (
              <Row
                key={item.id}
                vertical="center"
                horizontal="start"
                gap="m"
                padding="xs"
                radius="m"
                onClick={() => router.push(item.href)}
                title={isCollapsed ? item.label : undefined}
                style={{
                  cursor: "pointer",
                  backgroundColor: isActive ? "var(--neutral-alpha-weak)" : "transparent",
                  color: isActive ? "var(--eco-cyan-400)" : "inherit",
                  borderLeft: isActive ? "3px solid var(--eco-cyan-400)" : "3px solid transparent",
                  transition: "all 0.15s ease",
                  minHeight: "38px",
                  overflow: "hidden",
                  paddingLeft: "8px",
                }}
              >
                {typeof item.icon === "string" ? (
                  <Icon name={item.icon as IconName} size="s" style={{ flexShrink: 0 }} />
                ) : (
                  <item.icon size={17} style={{ flexShrink: 0 }} />
                )}
                <span
                  style={{
                    overflow: "hidden",
                    maxWidth: isCollapsed ? "0px" : "160px",
                    opacity: isCollapsed ? 0 : 1,
                    transition: "max-width 0.25s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s ease",
                    whiteSpace: "nowrap",
                  }}
                >
                  <Text
                    variant="body-default-m"
                    style={{
                      fontWeight: isActive ? 600 : 400,
                      color: isActive ? "var(--foreground)" : "inherit",
                    }}
                  >
                    {item.label}
                  </Text>
                </span>
              </Row>
            );
          })}
        </Column>

        {/* Área de Contenido Principal Dinámico */}
        <Column fillWidth padding="l" flex={1} style={{ overflowY: "auto" }}>
          {children}
        </Column>
      </Row>
    </Column>
  );
}
