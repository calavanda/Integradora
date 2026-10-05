import { VistaReproduccionRutas } from "@/components/views/ReproduccionRutas";

export const metadata = {
  title: "Reproducción Histórica GPS · EcoRuta Zamora Limpia",
  description: "Auditoría de recorridos y playback satelital por día y número económico.",
};

export default function PlaybackPage() {
  return <VistaReproduccionRutas />;
}
