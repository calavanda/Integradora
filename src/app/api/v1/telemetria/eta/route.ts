import { NextResponse } from "next/server";
import { conectarMongoose } from "@/lib/conexionMongoose";
import { ModeloCamion } from "@/modelos/Camion";

/**
 * Fórmula de Haversine para calcular distancia en kilómetros entre dos coordenadas terrestres
 */
function calcularDistanciaHaversine(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Radio de la Tierra en km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * GET /api/v1/telemetria/eta?latitud=...&longitud=...
 * Estimación de Tiempo de Llegada (ETA) del camión de basura más cercano
 * a la ubicación del ciudadano en Gutiérrez Zamora.
 */
export async function GET(peticion: Request) {
  try {
    const { searchParams } = new URL(peticion.url);
    const latStr = searchParams.get("latitud");
    const lngStr = searchParams.get("longitud");

    if (!latStr || !lngStr) {
      return NextResponse.json(
        {
          exito: false,
          error: "Los parámetros 'latitud' y 'longitud' son requeridos para estimar el ETA.",
        },
        { status: 400 }
      );
    }

    const latCiudadano = Number(latStr);
    const lngCiudadano = Number(lngStr);

    await conectarMongoose();

    // Obtener camiones que estén activos o en ruta
    const camiones = await ModeloCamion.find({
      estado: { $in: ["EN_RUTA", "EN_PAUSA"] },
    }).lean();

    if (!camiones || camiones.length === 0) {
      return NextResponse.json({
        exito: true,
        mensaje: "No hay camiones en ruta activa en este momento en el municipio.",
        camion_cercano: null,
        distancia_km: null,
        eta_minutos: null,
      });
    }

    // Calcular distancia a cada camión
    const camionesConDistancia = camiones.map((camion) => {
      const lngCamion = camion.ubicacion_actual?.coordinates?.[0] ?? -97.0896;
      const latCamion = camion.ubicacion_actual?.coordinates?.[1] ?? 20.4527;
      const distanciaKm = calcularDistanciaHaversine(
        latCiudadano,
        lngCiudadano,
        latCamion,
        lngCamion
      );

      // Velocidad efectiva para cálculo de ETA (si está detenido o < 10 km/h, se asume velocidad urbana de 18 km/h con paradas)
      const velocidadCalculo = camion.velocidad_actual > 8 ? camion.velocidad_actual : 18;
      const tiempoHoras = distanciaKm / velocidadCalculo;
      const etaMinutos = Math.max(1, Math.round(tiempoHoras * 60));

      return {
        numero_economico: camion.numero_economico,
        placas: camion.placas,
        estado: camion.estado,
        velocidad_actual: camion.velocidad_actual,
        conductor: camion.conductor_asignado || "Conductor en turno",
        coordenadas: {
          latitud: latCamion,
          longitud: lngCamion,
        },
        distancia_km: Number(distanciaKm.toFixed(2)),
        eta_minutos: etaMinutos,
      };
    });

    // Ordenar de menor a mayor distancia
    camionesConDistancia.sort((a, b) => a.distancia_km - b.distancia_km);
    const masCercano = camionesConDistancia[0];

    return NextResponse.json({
      exito: true,
      ciudadano: {
        latitud: latCiudadano,
        longitud: lngCiudadano,
      },
      camion_mas_cercano: masCercano,
      flota_activa: camionesConDistancia,
    });
  } catch (error: any) {
    console.error("[GET /api/v1/telemetria/eta] Error:", error);
    return NextResponse.json(
      {
        exito: false,
        error: error.message || "Error al calcular tiempo estimado de llegada.",
      },
      { status: 500 }
    );
  }
}
