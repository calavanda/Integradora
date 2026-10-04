"use client";

import React from "react";
import { Column, Row, Heading, Text, Button } from "@once-ui-system/core";
import { SignOutButton } from "@clerk/nextjs";
import { FiAlertTriangle, FiLogOut } from "react-icons/fi";

interface Props {
  emailActual: string;
  adminRequerido: string;
}

export function AccesoRestringido({ emailActual, adminRequerido }: Props) {
  return (
    <Column
      fillWidth
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        background: "var(--page-background, #0a0a0a)",
      }}
    >
      <div
        style={{
          maxWidth: "520px",
          width: "100%",
          padding: "36px",
          borderRadius: "20px",
          border: "1px solid rgba(239, 68, 68, 0.3)",
          background: "rgba(239, 68, 68, 0.04)",
          backdropFilter: "blur(12px)",
          boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "20px",
        }}
      >
        <div
          style={{
            width: "64px",
            height: "64px",
            borderRadius: "50%",
            background: "rgba(239, 68, 68, 0.15)",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#ef4444",
          }}
        >
          <FiAlertTriangle size={32} />
        </div>

        <Column gap="8" horizontal="center">
          <Heading variant="heading-strong-m" style={{ color: "#f87171" }}>
            Acceso Exclusivo de Administrador
          </Heading>
          <Text variant="body-default-m" onBackground="neutral-medium" style={{ lineHeight: 1.6 }}>
            El panel administrativo de <strong>EcoRuta Gutiérrez Zamora</strong> está en modo restringido.
            Por el momento, únicamente el correo institucional <strong>{adminRequerido}</strong> tiene permisos para acceder al dashboard.
          </Text>
        </Column>

        <div
          style={{
            width: "100%",
            padding: "14px 16px",
            borderRadius: "12px",
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            display: "flex",
            flexDirection: "column",
            gap: "4px",
            textAlign: "left",
          }}
        >
          <Text variant="label-default-xs" onBackground="neutral-weak">
            Cuenta conectada actualmente:
          </Text>
          <Text variant="body-strong-s" onBackground="neutral-strong">
            {emailActual}
          </Text>
        </div>

        <Row gap="12" fillWidth horizontal="center" style={{ marginTop: "8px" }}>
          <SignOutButton redirectUrl="/login">
            <Button variant="secondary" size="m">
              <Row gap="8" vertical="center">
                <FiLogOut size={16} />
                <Text>Cerrar Sesión / Cambiar Cuenta</Text>
              </Row>
            </Button>
          </SignOutButton>
        </Row>
      </div>
    </Column>
  );
}
