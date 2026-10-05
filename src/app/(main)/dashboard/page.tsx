import { OverviewPanel } from "@/components/views/OverviewPanel";

export const metadata = {
  title: "Resumen Operativo · EcoRuta Zamora Limpia",
  description: "Tablero central de supervisión del servicio de recolección en Gutiérrez Zamora.",
};

export default function DashboardPage() {
  return <OverviewPanel />;
}