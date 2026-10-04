import {
  Heading,
  Text,
  Button,
  Column,
  Row,
  Badge,
  Logo,
  Line,
  LetterFx,
  Mask,
  MatrixFx,
} from "@once-ui-system/core";
import Link from "next/link";
import SplitText from "@/component/SplitText";

export default function Home() {
  return (
    <Column fillWidth minHeight="100vh" center padding="l" position="relative" style={{ zIndex: 1 }}>
      <Column fillWidth maxHeight="100dvh" aspectRatio="1" horizontal="center" position="absolute" top="0" left="0">
        <Mask maxWidth="m" x={50} y={0} radius={50}>
          <MatrixFx
            size={1.5}
            spacing={5}
            fps={24}
            colors={["brand-solid-strong"]}
            flicker
          />
        </Mask>
      </Column>
      <Column maxWidth="s" horizontal="center" gap="l" align="center">
        <Badge
          textVariant="code-default-s"
          border="neutral-alpha-medium"
          onBackground="neutral-medium"
          vertical="center"
          gap="16"
        >
          <Logo dark icon="/trademarks/wordmark-dark.svg" href="https://once-ui.com" size="xs" />
          <Logo light icon="/trademarks/wordmark-light.svg" href="https://once-ui.com" size="xs" />
          <Line vert background="neutral-alpha-strong" />
          <Text marginX="4">
            <LetterFx trigger="instant">An ecosystem, not a UI kit</LetterFx>
          </Text>
        </Badge>
        <Heading variant="display-strong-xl" marginTop="24">
          <SplitText
            text="Presence that doesn't beg for attention"
            tag="span"
            delay={30}
            duration={0.9}
          />
        </Heading>
        <Text
          variant="heading-default-xl"
          onBackground="neutral-weak"
          wrap="balance"
          marginBottom="16"
        >
          Build with clarity, speed, and quiet confidence
        </Text>
        <Row gap="s" vertical="center">
          <Link href="/login" style={{ textDecoration: "none" }}>
            <Button variant="primary" data-border="rounded">
              Iniciar Sesión
            </Button>
          </Link>
          <Link href="/dashboard" style={{ textDecoration: "none" }}>
            <Button variant="secondary" data-border="rounded">
              Ir al Dashboard
            </Button>
          </Link>
        </Row>
      </Column>
    </Column>
  );
}
