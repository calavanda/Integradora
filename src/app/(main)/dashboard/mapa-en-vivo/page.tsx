import { VistaMapaEnVivo } from "@/components/views/MapaEnVivo";

export const metadata = {
  title: "Mapa en Vivo · EcoRuta Zamora Limpia",
  description: "Monitoreo satelital en tiempo real de la flota de recolección en Gutiérrez Zamora.",
};

export default function MapaEnVivoPage() {
  return <VistaMapaEnVivo />;
}
