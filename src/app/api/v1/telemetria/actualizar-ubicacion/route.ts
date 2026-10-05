import { NextResponse } from "next/server";
import { conectarMongoose } from "@/lib/conexionMongoose";
import { ModeloCamion } from "@/modelos/Camion";
import { ModeloHistorialUbicacion } from "@/modelos/HistorialUbicacion";
import { ModeloIncidente } from "@/modelos/Incidente";

const LIMITE_VELOCIDAD_URBANA_KMH = 40;

/**
 * POST /api/v1/telemetria/actualizar-ubicacion
 * Ingesta de telemetría real proveniente del smartphone del conductor (o GPS del camión).
 * Realiza detección automática de exceso de velocidad (> 40 km/h en zona urbana).
 */
export async function POST(peticion: Request) {
  try {
    const cuerpo = await peticion.json();
    const {
      numero_economico,
      camion_id,
      latitud,
      longitud,
      velocidad = 0,
      orientacion = 0,
      conductor_id,
      estado,
    } = cuerpo;

    const idIdentificador = numero_economico || camion_id;

    if (!idIdentificador || latitud === undefined || longitud === undefined) {
      return NextResponse.json(
        {
          exito: false,
          error: "Los campos 'numero_economico' (o 'camion_id'), 'latitud' y 'longitud' son estrictamente obligatorios.",
        },
        { status: 400 }
      );
    }

    const lat = Number(latitud);
    const lng = Number(longitud);
    const vel = Number(velocidad);
    const orient = Number(orientacion);

    await conectarMongoose();

    const hayExcesoVelocidad = vel > LIMITE_VELOCIDAD_URBANA_KMH;

    // 1. Registrar punto en Historial de Ubicación (para auditoría y reproducción de ruta)
    await ModeloHistorialUbicacion.create({
      camion_id: idIdentificador,
      ubicacion: {
        type: "Point",
        coordinates: [lng, lat], // Estándar GeoJSON [longitud, latitud]
      },
      velocidad: vel,
      orientacion: orient,
      exceso_velocidad: hayExcesoVelocidad,
      fecha_registro: new Date(),
    });

    // 2. Si supera los 40 km/h, registrar automáticamente Incidente de Exceso de Velocidad
    let alertaGenerada = false;
    if (hayExcesoVelocidad) {
      await ModeloIncidente.create({
        camion_id: idIdentificador,
        conductor_id: conductor_id || "Conductor en Turno",
        tipo_incidente: "EXCESO_VELOCIDAD",
        descripcion: `Alerta automática: Vehículo ${idIdentificador} detectado a ${vel.toFixed(1)} km/h en zona urbana (Límite municipal: ${LIMITE_VELOCIDAD_URBANA_KMH} km/h).`,
        ubicacion: {
          type: "Point",
          coordinates: [lng, lat],
        },
        velocidad_registrada: vel,
        estado: "ACTIVO",
      });
      alertaGenerada = true;
    }

    // 3. Actualizar el estado en vivo del camión en la colección Camion
    const estadoNuevo = estado || (vel > 0 ? "EN_RUTA" : "EN_PAUSA");
    const camionActualizado = await ModeloCamion.findOneAndUpdate(
      { numero_economico: idIdentificador },
      {
        $set: {
          ubicacion_actual: {
            type: "Point",
            coordinates: [lng, lat],
          },
          velocidad_actual: vel,
          orientacion: orient,
          estado: estadoNuevo,
          ultima_actualizacion: new Date(),
          ...(conductor_id ? { conductor_asignado: conductor_id } : {}),
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return NextResponse.json({
      exito: true,
      mensaje: "Telemetría recibida y procesada correctamente.",
      camion: {
        numero_economico: camionActualizado.numero_economico,
        latitud: lat,
        longitud: lng,
        velocidad: vel,
        orientacion: orient,
        estado: camionActualizado.estado,
        ultima_actualizacion: camionActualizado.ultima_actualizacion,
      },
      alerta_velocidad: alertaGenerada
        ? {
            supero_limite: true,
            velocidad_registrada: vel,
            limite_permitido: LIMITE_VELOCIDAD_URBANA_KMH,
          }
        : null,
    });
  } catch (error: any) {
    console.error("[POST /api/v1/telemetria/actualizar-ubicacion] Error:", error);
    return NextResponse.json(
      {
        exito: false,
        error: error.message || "Error al procesar la telemetría en tiempo real.",
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/v1/telemetria/actualizar-ubicacion
 * Obtiene el estado actual de los camiones para el Dashboard y la App Móvil.
 */
export async function GET() {
  try {
    await conectarMongoose();
    const camiones = await ModeloCamion.find({}).sort({ numero_economico: 1 }).lean();

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
        velocidad: c.velocidad_actual,
        orientacion: c.orientacion,
        conductor: c.conductor_asignado || "Sin asignar",
        ultima_actualizacion: c.ultima_actualizacion,
      })),
    });
  } catch (error: any) {
    console.error("[GET /api/v1/telemetria/actualizar-ubicacion] Error:", error);
    return NextResponse.json(
      {
        exito: false,
        error: error.message || "Error al obtener telemetría de camiones.",
      },
      { status: 500 }
    );
  }
}
