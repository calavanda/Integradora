import { NextResponse } from "next/server";
import { conectarMongoose } from "@/lib/conexionMongoose";
import { ModeloCamion } from "@/modelos/Camion";

/**
 * GET /api/v1/publico/camiones-activos
 * Endpoint público y ligero para consulta de flota activa en tiempo real.
 * No requiere token de administración privada para permitir transparencia ciudadana.
 */
export async function GET() {
  try {
    await conectarMongoose();
    const camiones = await ModeloCamion.find({
      estado: { $in: ["EN_RUTA", "EN_PAUSA"] },
    })
      .sort({ numero_economico: 1 })
      .lean();

    return NextResponse.json({
      exito: true,
      total: camiones.length,
      camiones: camiones.map((c) => ({
        id: c._id?.toString(),
        numero_economico: c.numero_economico,
        placas: c.placas,
        estado: c.estado,
        latitud: c.ubicacion_actual?.coordinates?.[1] ?? 20.4527,
        longitud: c.ubicacion_actual?.coordinates?.[0] ?? -97.0896,
        velocidad_actual: c.velocidad_actual ?? 0,
        orientacion: c.orientacion ?? 0,
        conductor: c.conductor_asignado || "Operador Municipal",
        ultima_actualizacion: c.ultima_actualizacion || new Date(),
      })),
    });
  } catch (error: any) {
    console.error("[GET /api/v1/publico/camiones-activos] Error:", error);
    return NextResponse.json(
      {
        exito: false,
        error: error.message || "Error al obtener la flota de camiones activos.",
      },
      { status: 500 }
    );
  }
}
