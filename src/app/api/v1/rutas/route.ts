import { NextResponse } from "next/server";
import { conectarMongoose } from "@/lib/conexionMongoose";
import { ModeloRuta } from "@/modelos/Ruta";

/**
 * GET /api/v1/rutas
 * Obtiene todas las rutas oficiales de recolección de Gutiérrez Zamora.
 */
export async function GET() {
  try {
    await conectarMongoose();
    const rutas = await ModeloRuta.find({}).sort({ creadoEn: -1 }).lean();

    return NextResponse.json({
      exito: true,
      total: rutas.length,
      rutas: rutas.map((r) => ({
        id: r._id?.toString(),
        nombre_ruta: r.nombre_ruta,
        dias_recoleccion: r.dias_recoleccion,
        horario_inicio: r.horario_inicio,
        horario_fin: r.horario_fin,
        colonia_zona: r.colonia_zona,
        distancia_km: r.distancia_km,
        activa: r.activa,
        // Conversión a formato Leaflet [lat, lng] para facilitar renderizado en frontend
        coordenadasLeaflet: r.geometria?.coordinates?.map(([lng, lat]) => [lat, lng]) || [],
        geometriaGeoJSON: r.geometria,
      })),
    });
  } catch (error: any) {
    console.error("[GET /api/v1/rutas] Error:", error);
    return NextResponse.json(
      {
        exito: false,
        error: error.message || "Error al listar las rutas de recolección.",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/rutas
 * Guarda una nueva ruta trazada con el Editor Intuitivo OSRM (Snap to Roads).
 */
export async function POST(peticion: Request) {
  try {
    const cuerpo = await peticion.json();
    const {
      nombre_ruta,
      puntos, // Array de [lat, lng]
      dias_recoleccion,
      horario_inicio = "07:00",
      horario_fin = "14:00",
      colonia_zona = "Gutiérrez Zamora",
      distancia_km = 0,
    } = cuerpo;

    if (!nombre_ruta || !puntos || puntos.length < 2) {
      return NextResponse.json(
        {
          exito: false,
          error: "Se requiere 'nombre_ruta' y al menos 2 puntos de coordenadas para registrar la ruta.",
        },
        { status: 400 }
      );
    }

    // Convertir puntos [lat, lng] a coordenadas estándar GeoJSON LineString [longitud, latitud]
    const coordenadasGeoJSON = puntos.map((p: [number, number]) => [p[1], p[0]]);

    // Procesar días de recolección
    const diasArray = Array.isArray(dias_recoleccion)
      ? dias_recoleccion
      : typeof dias_recoleccion === "string"
      ? dias_recoleccion.split(",").map((d) => d.trim())
      : ["Lunes", "Miércoles", "Viernes"];

    await conectarMongoose();

    const nuevaRuta = await ModeloRuta.create({
      nombre_ruta,
      geometria: {
        type: "LineString",
        coordinates: coordenadasGeoJSON,
      },
      dias_recoleccion: diasArray,
      horario_inicio,
      horario_fin,
      colonia_zona,
      distancia_km: Number(distancia_km) || 0,
      activa: true,
    });

    return NextResponse.json({
      success: true, // compatibilidad con EditorRutas.tsx existente
      exito: true,
      mensaje: "Ruta de recolección guardada exitosamente en la base de datos municipal.",
      ruta: {
        id: nuevaRuta._id.toString(),
        nombre_ruta: nuevaRuta.nombre_ruta,
        distancia_km: nuevaRuta.distancia_km,
      },
    });
  } catch (error: any) {
    console.error("[POST /api/v1/rutas] Error:", error);
    return NextResponse.json(
      {
        exito: false,
        error: error.message || "Error al guardar la ruta de recolección.",
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/v1/rutas
 * Edita los datos de una ruta existente.
 */
export async function PUT(peticion: Request) {
  try {
    const cuerpo = await peticion.json();
    const { id, nombre_ruta, dias_recoleccion, horario_inicio, horario_fin, colonia_zona, activa } = cuerpo;

    if (!id) {
      return NextResponse.json(
        { exito: false, error: "El ID de la ruta es obligatorio." },
        { status: 400 }
      );
    }

    await conectarMongoose();

    const actualizacion: any = {};
    if (nombre_ruta) actualizacion.nombre_ruta = nombre_ruta;
    if (dias_recoleccion) {
      actualizacion.dias_recoleccion = Array.isArray(dias_recoleccion)
        ? dias_recoleccion
        : dias_recoleccion.split(",").map((d: string) => d.trim());
    }
    if (horario_inicio) actualizacion.horario_inicio = horario_inicio;
    if (horario_fin) actualizacion.horario_fin = horario_fin;
    if (colonia_zona) actualizacion.colonia_zona = colonia_zona;
    if (activa !== undefined) actualizacion.activa = activa;

    const rutaActualizada = await ModeloRuta.findByIdAndUpdate(id, actualizacion, { new: true });

    if (!rutaActualizada) {
      return NextResponse.json(
        { exito: false, error: "Ruta no encontrada." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      exito: true,
      mensaje: "Ruta actualizada exitosamente.",
      ruta: rutaActualizada,
    });
  } catch (error: any) {
    console.error("[PUT /api/v1/rutas] Error:", error);
    return NextResponse.json(
      { exito: false, error: error.message || "Error al actualizar la ruta." },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/v1/rutas
 * Elimina permanentemente una ruta oficial.
 */
export async function DELETE(peticion: Request) {
  try {
    const { searchParams } = new URL(peticion.url);
    let id = searchParams.get("id");

    if (!id) {
      try {
        const cuerpo = await peticion.json();
        id = cuerpo.id;
      } catch {
        // no body
      }
    }

    if (!id) {
      return NextResponse.json(
        { exito: false, error: "El parámetro 'id' es requerido para eliminar la ruta." },
        { status: 400 }
      );
    }

    await conectarMongoose();
    const eliminado = await ModeloRuta.findByIdAndDelete(id);

    if (!eliminado) {
      return NextResponse.json(
        { exito: false, error: "No se encontró la ruta a eliminar." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      exito: true,
      mensaje: "Ruta eliminada exitosamente de la base de datos municipal.",
    });
  } catch (error: any) {
    console.error("[DELETE /api/v1/rutas] Error:", error);
    return NextResponse.json(
      { exito: false, error: error.message || "Error al eliminar la ruta." },
      { status: 500 }
    );
  }
}

