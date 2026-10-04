"use client";

import {
  Heading,
  Text,
  Button,
  Column,
  Row,
  Card,
  Badge,
  Line,
} from "@once-ui-system/core";
import Link from "next/link";
import { SignIn } from "@clerk/nextjs";
import SplitText from "@/component/SplitText";

export default function LoginPage() {
  return (
    <Column
      fillWidth
      minHeight="100vh"
      horizontal="center"
      vertical="center"
      padding="m"
      position="relative"
      style={{ zIndex: 1 }}
    >
      <Column
        maxWidth="s"
        fillWidth
        gap="m"
        horizontal="center"
        align="center"
      >
        {/* Cabecera Institucional y Advertencia de Seguridad */}
        <Column horizontal="center" align="center" gap="xs">
          <Badge
            textVariant="code-default-s"
            border="brand-alpha-strong"
            onBackground="brand-strong"
            paddingX="12"
            paddingY="4"
          >
            🔒 ACCESO RESTRINGIDO • USO OFICIAL EXCLUSIVO
          </Badge>

          <Heading variant="display-strong-s" marginTop="12" align="center">
            <SplitText
              text="Portal Institucional de Gobierno"
              tag="span"
              delay={35}
              duration={0.8}
            />
          </Heading>

          <Text
            variant="body-default-s"
            onBackground="neutral-weak"
            align="center"
            style={{ maxWidth: "460px" }}
          >
            Sistema clasificado para funcionarios y personal gubernamental acreditado.
            El acceso y actividades dentro de esta plataforma son auditados y monitoreados.
          </Text>
        </Column>

        {/* Tarjeta de Autenticación con Clerk */}
        <Card
          fillWidth
          direction="column"
          padding="l"
          radius="l"
          border="neutral-alpha-medium"
          background="surface"
          gap="m"
          horizontal="center"
        >
          {/* Componente oficial de Clerk */}
          <Column fillWidth horizontal="center" align="center">
            <SignIn
              routing="hash"
              fallbackRedirectUrl="/dashboard"
              appearance={{
                elements: {
                  rootBox: {
                    width: "100%",
                  },
                  card: {
                    boxShadow: "none",
                    background: "transparent",
                    border: "none",
                  },
                },
              }}
            />
          </Column>

          {/* Aviso Legal Institucional */}
          <Column
            fillWidth
            padding="s"
            radius="s"
            border="neutral-alpha-weak"
            background="page"
          >
            <Text
              variant="label-default-s"
              onBackground="neutral-weak"
              align="center"
              style={{ fontSize: "11px", lineHeight: "1.4" }}
            >
              ⚠️ Aviso legal: Cualquier intento de acceso no autorizado, alteración o uso indebido de los datos será consignado ante las autoridades competentes conforme al marco legal aplicable.
            </Text>
          </Column>

          <Line background="neutral-alpha-weak" />

          <Row fillWidth horizontal="between" vertical="center">
            <Link href="/" style={{ textDecoration: "none" }}>
              <Button variant="tertiary" size="s">
                ← Volver al inicio
              </Button>
            </Link>

            <Link href="/dashboard" style={{ textDecoration: "none" }}>
              <Button variant="secondary" size="s">
                Panel de control →
              </Button>
            </Link>
          </Row>
        </Card>
      </Column>
    </Column>
  );
}
