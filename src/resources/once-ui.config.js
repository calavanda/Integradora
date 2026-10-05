// Import and set font for each variant
import { Geist } from "next/font/google";
import { Geist_Mono } from "next/font/google";

const heading = Geist({
  variable: "--font-heading",
  subsets: ["latin"],
  display: "swap",
});

const body = Geist({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

const label = Geist({
  variable: "--font-label",
  subsets: ["latin"],
  display: "swap",
});

const code = Geist_Mono({
  variable: "--font-code",
  subsets: ["latin"],
  display: "swap",
});

const fonts = {
  heading: heading,
  body: body,
  label: label,
  code: code,
};

// EcoRuta — Paleta Institucional Municipal
// Cyan brand: gobierno cívico-tecnológico, profesional, no genérico
const style = {
  theme: "dark",         // Dashboard operativo = dark mode lock
  neutral: "gray",       // Neutro institucional sin sesgo de temperatura
  brand: "cyan",         // Cívico-tecnológico — no neon verde genérico
  accent: "cyan",        // Acento consistente con marca
  solid: "contrast",     // Botones de alto contraste
  solidStyle: "flat",    // Plano, sin plástico
  border: "conservative",// Gobierno = bordes sobrios
  surface: "translucent",// Profundidad sutil con translucencia
  transition: "all",     // Transiciones en todos los elementos
  scaling: "100",        // Escala estándar
};

const dataStyle = {
  variant: "flat",        // Datos planos, legibilidad primero
  mode: "categorical",
  height: 24,
  axis: {
    stroke: "var(--neutral-alpha-weak)",
  },
  tick: {
    fill: "var(--neutral-on-background-weak)",
    fontSize: 11,
    line: false,
  },
};

export { fonts, style, dataStyle };
