import { VistaEditorRutas } from "@/components/views/EditorRutas";

export const metadata = {
  title: "Editor de Rutas OSRM · EcoRuta Zamora Limpia",
  description: "Diseño y trazado geométrico de rutas con ajuste inteligente a calles para Gutiérrez Zamora.",
};

export default function EditorRutasPage() {
  return <VistaEditorRutas />;
}
