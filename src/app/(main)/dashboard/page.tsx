"use client";

import { useState } from "react";
import type { ComponentType } from "react";
import { PiTruckTrailerFill, PiSteeringWheelFill } from "react-icons/pi";
import { FaRoute, FaMapLocationDot } from "react-icons/fa6";
import { FaUsersCog } from "react-icons/fa";
import { TbLayoutDashboardFilled, TbMessageReportFilled } from "react-icons/tb";
import { IoSettings } from "react-icons/io5";
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
} from "@once-ui-system/core";
import type { MenuGroup, IconName } from "@once-ui-system/core";
import { UserButton } from "@clerk/nextjs";
import { VistaMapaEnVivo } from "@/components/views/MapaEnVivo";
import { VistaEditorRutas } from "@/components/views/EditorRutas";
import { VistaCamiones } from "@/components/views/Camiones";
import { VistaConductores } from "@/components/views/Conductores";
import { VistaUsuarios } from "@/components/views/Usuarios";
import { VistaRoles } from "@/components/views/Roles";

// Definición de tipo para los items de navegación del Sidebar
type SidebarIcon = IconName | ComponentType<{ size?: number | string; style?: React.CSSProperties }>;

interface SidebarItem {
  id: string;
  label: string;
  icon: SidebarIcon;
  href: string;
}

// ─────────────────────────────────────────────
// Panel de Overview (placeholder local)
// ─────────────────────────────────────────────

function OverviewPanel() {
  return (
    <Column fillWidth gap="l">
      <Text variant="heading-strong-l">Overview</Text>
      {/* Agrega aquí el contenido del panel de Overview */}
    </Column>
  );
}

function ReportesPanel() {
  return (
    <Column fillWidth gap="l">
      <Text variant="heading-strong-l">Reportes</Text>
      {/* Agrega aquí el contenido del panel de Reportes */}
    </Column>
  );
}

function AjustesPanel() {
  return (
    <Column fillWidth gap="l">
      <Text variant="heading-strong-l">Ajustes</Text>
      {/* Agrega aquí el contenido del panel de Ajustes */}
    </Column>
  );
}

export default function DashboardPage() {
  // Estado para controlar si el sidebar está colapsado o expandido
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("overview");

  // Opciones del Sidebar con tipado estricto
  const sidebarItems: SidebarItem[] = [
    { id: "overview", label: "Overview", icon: TbLayoutDashboardFilled, href: "/dashboard" },
    { id: "mapa", label: "Mapa", icon: FaMapLocationDot, href: "/mapa" },
    { id: "rutas", label: "Rutas", icon: FaRoute, href: "/rutas" },
    { id: "reportes", label: "Reportes", icon: TbMessageReportFilled, href: "/reportes" },
    { id: "vehiculos", label: "Vehiculos", icon: PiTruckTrailerFill, href: "/vehiculos" },
    { id: "conductores", label: "Conductores", icon: PiSteeringWheelFill, href: "/conductores" },
    { id: "usuarios", label: "Usuarios", icon: FaUsersCog, href: "/usuarios" },
    { id: "roles", label: "Roles", icon: MdWorkspaces, href: "/roles" },
    { id: "ajustes", label: "Ajustes", icon: IoSettings, href: "/ajustes" },
  ];

  const menuGroups: MenuGroup[] = [
    {
      id: "products",
      label: "Products",
      suffixIcon: "chevronDown",
      sections: [
        {
          title: "Featured",
          links: [
            {
              label: "Analytics",
              href: "/analytics",
              icon: "HiOutlineDocumentChartBar",
              description: "Get insights into your data",
            },
            {
              label: "Security",
              href: "/security",
              icon: "HiOutlineShieldCheck",
              description: "Protect your assets",
            },
          ],
        },
        {
          title: "Tools",
          links: [
            {
              label: "Dashboard",
              href: "/dashboard",
              icon: "HiOutlineSquares2X2",
              description: "Monitor your metrics",
            },
            {
              label: "Settings",
              href: "/settings",
              icon: "HiCog8Tooth",
              description: "Configure your preferences",
            },
          ],
        },
      ],
    },
    {
      id: "solutions",
      label: "Solutions",
      suffixIcon: "chevronDown",
      sections: [
        {
          title: "By industry",
          links: [
            {
              label: "Enterprise",
              href: "/enterprise",
              icon: "cube",
              description: "Solutions for large organizations",
            },
            {
              label: "Startups",
              href: "/startups",
              icon: "rocket",
              description: "Perfect for growing companies",
            },
          ],
        },
        {
          title: "By team",
          links: [
            {
              label: "Developers",
              href: "/developers",
              icon: "code",
              description: "Tools and APIs",
            },
            {
              label: "Design teams",
              href: "/design",
              icon: "sparkle",
              description: "Creative solutions",
            },
          ],
        },
      ],
    },
    {
      id: "resources",
      label: "Resources",
      suffixIcon: "chevronDown",
      sections: [
        {
          title: "Documentation",
          links: [
            {
              label: "Guides",
              href: "/guides",
              icon: "book",
              description: "Learn how to use our platform",
            },
            {
              label: "API reference",
              href: "/api",
              icon: "code",
              description: "Technical documentation",
            },
          ],
        },
        {
          title: "Support",
          links: [
            {
              label: "Help center",
              href: "/help",
              icon: "infoCircle",
              description: "Get your questions answered",
            },
            {
              label: "Community",
              href: "/community",
              icon: "people",
              description: "Connect with other users",
            },
          ],
        },
      ],
    },
    {
      id: "company",
      label: "Company",
      suffixIcon: "chevronDown",
      sections: [
        {
          title: "About",
          links: [
            {
              label: "Our story",
              href: "/about",
              icon: "book",
              description: "Learn about our journey",
            },
            {
              label: "Careers",
              href: "/careers",
              icon: "rocket",
              description: "Join our team",
            },
          ],
        },
        {
          title: "Connect",
          links: [
            {
              label: "Blog",
              href: "/blog",
              icon: "document",
              description: "Latest updates and news",
            },
            {
              label: "Contact",
              href: "/contact",
              icon: "email",
              description: "Get in touch with us",
            },
          ],
        },
      ],
    },
  ];

  return (
    <Column fillWidth minHeight="100vh" background="page" position="relative">
      {/* Header adaptable a temas oscuro/claro */}
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
        {/* Izquierda: Logo adaptable */}
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

        {/* Centro: MegaMenu centrado */}
        <Row fillWidth horizontal="center" vertical="center">
          <MegaMenu menuGroups={menuGroups} />
        </Row>

        {/* Derecha: Selector de tema y perfil Clerk */}
        <Row vertical="center" gap="m" minWidth={10} horizontal="end">
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
            transition: "width 0.35s cubic-bezier(0.4, 0, 0.2, 1), min-width 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
            overflow: "hidden",
            flexShrink: 0,
          }}
          padding="s"
          gap="s"
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
                transition: "max-width 0.35s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.25s ease",
                whiteSpace: "nowrap",
                display: "flex",
                alignItems: "center",
              }}
            >
              <Text variant="heading-strong-xs" onBackground="neutral-weak">
                Menú
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

          {/* Lista de Navegación del Sidebar */}
          {sidebarItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <Row
                key={item.id}
                vertical="center"
                horizontal="start"
                gap="m"
                padding="xs"
                radius="m"
                background={isActive ? "surface" : "transparent"}
                onClick={() => setActiveTab(item.id)}
                title={isCollapsed ? item.label : undefined}
                style={{
                  cursor: "pointer",
                  transition: "background 0.15s ease",
                  minHeight: "36px",
                  overflow: "hidden",
                }}
              >
                {typeof item.icon === "string" ? (
                  <Icon name={item.icon as IconName} size="s" style={{ flexShrink: 0 }} />
                ) : (
                  <item.icon size={16} style={{ flexShrink: 0 }} />
                )}
                <span
                  style={{
                    overflow: "hidden",
                    maxWidth: isCollapsed ? "0px" : "160px",
                    opacity: isCollapsed ? 0 : 1,
                    transition: "max-width 0.35s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.25s ease",
                    whiteSpace: "nowrap",
                  }}
                >
                  <Text variant="body-default-m">{item.label}</Text>
                </span>
              </Row>
            );
          })}
        </Column>

        {/* Área de Contenido Principal – cada tab renderiza su vista dedicada */}
        <Column fillWidth padding="l" flex={1}>
          {activeTab === "overview" && <OverviewPanel />}
          {activeTab === "mapa" && <VistaMapaEnVivo />}
          {activeTab === "rutas" && <VistaEditorRutas />}
          {activeTab === "reportes" && <ReportesPanel />}
          {activeTab === "vehiculos" && <VistaCamiones />}
          {activeTab === "conductores" && <VistaConductores />}
          {activeTab === "usuarios" && <VistaUsuarios />}
          {activeTab === "roles" && <VistaRoles />}
          {activeTab === "ajustes" && <AjustesPanel />}
        </Column>
      </Row>
    </Column>
  );
}