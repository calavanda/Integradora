import { NextResponse } from "next/server";
import { conectarMongoose } from "@/lib/conexionMongoose";
import { ModeloCamion } from "@/modelos/Camion";

/**
 * GET /api/v1/camiones
 * Obtiene la flota real de camiones compactadores desde MongoDB.
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
        velocidad_actual: c.velocidad_actual ?? 0,
        orientacion: c.orientacion ?? 0,
        modelo: c.modelo || "Camión Compactador",
        conductor: c.conductor_asignado || "Sin asignar",
        porcentaje_carga: c.porcentaje_carga || 0,
        nivel_combustible: c.nivel_combustible || 100,
        ultima_actualizacion: c.ultima_actualizacion || new Date(),
      })),
    });
  } catch (error: any) {
    console.error("[GET /api/v1/camiones] Error:", error);
    return NextResponse.json(
      { exito: false, error: error.message || "Error al obtener la flota de camiones." },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/camiones
 * Registra un nuevo camión compactador en la flota municipal.
 */
export async function POST(peticion: Request) {
  try {
    const cuerpo = await peticion.json();
    const {
      numero_economico,
      placas,
      modelo = "Freightliner M2 106",
      conductor_asignado = "Sin asignar",
      estado = "EN_PAUSA",
      latitud = 20.4527,
      longitud = -97.0896,
    } = cuerpo;

    if (!numero_economico || !placas) {
      return NextResponse.json(
        { exito: false, error: "numero_economico y placas son requeridos." },
        { status: 400 }
      );
    }

    await conectarMongoose();

    const nuevoCamion = await ModeloCamion.create({
      numero_economico,
      placas,
      modelo,
      conductor_asignado,
      estado,
      ubicacion_actual: {
        type: "Point",
        coordinates: [Number(longitud), Number(latitud)],
      },
      velocidad_actual: 0,
      orientacion: 0,
      ultima_actualizacion: new Date(),
    });

    return NextResponse.json({
      exito: true,
      mensaje: "Camión registrado exitosamente en la flota municipal.",
      camion: nuevoCamion,
    });
  } catch (error: any) {
    console.error("[POST /api/v1/camiones] Error:", error);
    return NextResponse.json(
      { exito: false, error: error.message || "Error al registrar el camión." },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/v1/camiones
 * Edita un camión existente por su ID.
 */
export async function PUT(peticion: Request) {
  try {
    const cuerpo = await peticion.json();
    const { id, numero_economico, placas, modelo, conductor_asignado, estado, nivel_combustible, porcentaje_carga } = cuerpo;

    if (!id) {
      return NextResponse.json(
        { exito: false, error: "El ID del camión es obligatorio para editar." },
        { status: 400 }
      );
    }

    await conectarMongoose();

    const actualizacion: any = {};
    if (numero_economico) actualizacion.numero_economico = numero_economico;
    if (placas) actualizacion.placas = placas;
    if (modelo) actualizacion.modelo = modelo;
    if (conductor_asignado !== undefined) actualizacion.conductor_asignado = conductor_asignado;
    if (estado) actualizacion.estado = estado;
    if (nivel_combustible !== undefined) actualizacion.nivel_combustible = Number(nivel_combustible);
    if (porcentaje_carga !== undefined) actualizacion.porcentaje_carga = Number(porcentaje_carga);
    actualizacion.ultima_actualizacion = new Date();

    const camionActualizado = await ModeloCamion.findByIdAndUpdate(id, actualizacion, { new: true });

    if (!camionActualizado) {
      return NextResponse.json(
        { exito: false, error: "No se encontró el camión especificado." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      exito: true,
      mensaje: "Camión actualizado exitosamente.",
      camion: camionActualizado,
    });
  } catch (error: any) {
    console.error("[PUT /api/v1/camiones] Error:", error);
    return NextResponse.json(
      { exito: false, error: error.message || "Error al actualizar el camión." },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/v1/camiones
 * Elimina un camión de la flota municipal.
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
        { exito: false, error: "El parámetro 'id' es requerido para eliminar el camión." },
        { status: 400 }
      );
    }

    await conectarMongoose();
    const eliminado = await ModeloCamion.findByIdAndDelete(id);

    if (!eliminado) {
      return NextResponse.json(
        { exito: false, error: "No se encontró el camión a eliminar." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      exito: true,
      mensaje: "Camión eliminado exitosamente de la base de datos.",
    });
  } catch (error: any) {
    console.error("[DELETE /api/v1/camiones] Error:", error);
    return NextResponse.json(
      { exito: false, error: error.message || "Error al eliminar el camión." },
      { status: 500 }
    );
  }
}
