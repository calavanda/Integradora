import { NextResponse } from "next/server";
import { conectarMongoose } from "@/lib/conexionMongoose";
import { ModeloHistorialUbicacion } from "@/modelos/HistorialUbicacion";

/**
 * GET /api/v1/historial/recorrido/[camion_id]?fecha=YYYY-MM-DD
 * Reproducción de Rutas (Playback) para auditar el camino recorrido
 * por un camión de recolección en una fecha específica.
 */
export async function GET(
  peticion: Request,
  contexto: { params: Promise<{ camion_id: string }> }
) {
  try {
    const { camion_id } = await contexto.params;
    const { searchParams } = new URL(peticion.url);
    const fechaParam = searchParams.get("fecha"); // formato 'YYYY-MM-DD' o null para hoy

    await conectarMongoose();

    const inicioDia = fechaParam ? new Date(fechaParam) : new Date();
    inicioDia.setHours(0, 0, 0, 0);

    const finDia = new Date(inicioDia);
    finDia.setHours(23, 59, 59, 999);

    const puntosRecorrido = await ModeloHistorialUbicacion.find({
      camion_id,
      fecha_registro: { $gte: inicioDia, $lte: finDia },
    })
      .sort({ fecha_registro: 1 })
      .lean();

    const puntosFormateados = puntosRecorrido.map((punto) => ({
      latitud: punto.ubicacion?.coordinates?.[1],
      longitud: punto.ubicacion?.coordinates?.[0],
      velocidad: punto.velocidad,
      orientacion: punto.orientacion || 0,
      exceso_velocidad: punto.exceso_velocidad,
      hora: punto.fecha_registro.toISOString(),
      hora_legible: new Date(punto.fecha_registro).toLocaleTimeString("es-MX", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
    }));

    // Estadísticas del recorrido para auditoría municipal
    const totalPuntos = puntosFormateados.length;
    const velocidades = puntosFormateados.map((p) => p.velocidad);
    const velocidadMaxima = totalPuntos > 0 ? Math.max(...velocidades) : 0;
    const velocidadPromedio =
      totalPuntos > 0
        ? Number(
            (
              velocidades.reduce((acc, curr) => acc + curr, 0) / totalPuntos
            ).toFixed(1)
          )
        : 0;
    const puntosExceso = puntosFormateados.filter((p) => p.exceso_velocidad);

    return NextResponse.json({
      exito: true,
      camion_id,
      fecha: inicioDia.toISOString().split("T")[0],
      auditoria: {
        total_puntos_gps: totalPuntos,
        velocidad_maxima_kmh: velocidadMaxima,
        velocidad_promedio_kmh: velocidadPromedio,
        infracciones_exceso_velocidad: puntosExceso.length,
      },
      puntos: puntosFormateados,
    });
  } catch (error: any) {
    console.error("[GET /api/v1/historial/recorrido/[camion_id]] Error:", error);
    return NextResponse.json(
      {
        exito: false,
        error: error.message || "Error al obtener recorrido histórico del vehículo.",
      },
      { status: 500 }
    );
  }
}
