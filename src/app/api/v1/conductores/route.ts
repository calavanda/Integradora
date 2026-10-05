import { NextResponse } from "next/server";
import { conectarMongoose } from "@/lib/conexionMongoose";
import { ModeloConductor } from "@/modelos/Conductor";

/**
 * GET /api/v1/conductores
 * Lista todos los conductores registrados en la base de datos municipal.
 */
export async function GET() {
  try {
    await conectarMongoose();
    const conductores = await ModeloConductor.find({}).sort({ creadoEn: -1 }).lean();

    return NextResponse.json({
      exito: true,
      total: conductores.length,
      conductores: conductores.map((c) => ({
        id: c._id?.toString(),
        nombre: c.nombre,
        licencia: c.licencia,
        turno: c.turno,
        camionAsignado: c.camion_asignado || "Sin asignar",
        rutaActual: c.ruta_actual || "Sin ruta asignada",
        telefono: c.telefono || "",
        estado: c.estado,
        puntuacionEcologica: c.puntuacion_ecologica || 95,
      })),
    });
  } catch (error: any) {
    console.error("[GET /api/v1/conductores] Error:", error);
    return NextResponse.json(
      { exito: false, error: error.message || "Error al obtener la lista de conductores." },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/conductores
 * Registra un nuevo conductor municipal.
 */
export async function POST(peticion: Request) {
  try {
    const cuerpo = await peticion.json();
    const {
      nombre,
      licencia,
      turno = "Matutino",
      camion_asignado = "Sin asignar",
      ruta_actual = "Sin ruta asignada",
      telefono = "",
      estado = "Disponible",
    } = cuerpo;

    if (!nombre || !licencia) {
      return NextResponse.json(
        { exito: false, error: "El nombre y la licencia son obligatorios." },
        { status: 400 }
      );
    }

    await conectarMongoose();

    const nuevoConductor = await ModeloConductor.create({
      nombre,
      licencia,
      turno,
      camion_asignado,
      ruta_actual,
      telefono,
      estado,
    });

    return NextResponse.json({
      exito: true,
      mensaje: "Conductor registrado exitosamente.",
      conductor: nuevoConductor,
    });
  } catch (error: any) {
    console.error("[POST /api/v1/conductores] Error:", error);
    return NextResponse.json(
      { exito: false, error: error.message || "Error al registrar el conductor." },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/v1/conductores
 * Edita un conductor existente.
 */
export async function PUT(peticion: Request) {
  try {
    const cuerpo = await peticion.json();
    const { id, nombre, licencia, turno, camion_asignado, ruta_actual, telefono, estado } = cuerpo;

    if (!id) {
      return NextResponse.json(
        { exito: false, error: "El ID del conductor es obligatorio." },
        { status: 400 }
      );
    }

    await conectarMongoose();

    const actualizacion: any = {};
    if (nombre) actualizacion.nombre = nombre;
    if (licencia) actualizacion.licencia = licencia;
    if (turno) actualizacion.turno = turno;
    if (camion_asignado !== undefined) actualizacion.camion_asignado = camion_asignado;
    if (ruta_actual !== undefined) actualizacion.ruta_actual = ruta_actual;
    if (telefono !== undefined) actualizacion.telefono = telefono;
    if (estado) actualizacion.estado = estado;

    const conductorActualizado = await ModeloConductor.findByIdAndUpdate(id, actualizacion, { new: true });

    if (!conductorActualizado) {
      return NextResponse.json(
        { exito: false, error: "Conductor no encontrado." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      exito: true,
      mensaje: "Conductor actualizado exitosamente.",
      conductor: conductorActualizado,
    });
  } catch (error: any) {
    console.error("[PUT /api/v1/conductores] Error:", error);
    return NextResponse.json(
      { exito: false, error: error.message || "Error al actualizar el conductor." },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/v1/conductores
 * Elimina un conductor de la base de datos municipal.
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
        { exito: false, error: "El ID es requerido para eliminar el conductor." },
        { status: 400 }
      );
    }

    await conectarMongoose();
    const eliminado = await ModeloConductor.findByIdAndDelete(id);

    if (!eliminado) {
      return NextResponse.json(
        { exito: false, error: "No se encontró el conductor a eliminar." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      exito: true,
      mensaje: "Conductor eliminado exitosamente.",
    });
  } catch (error: any) {
    console.error("[DELETE /api/v1/conductores] Error:", error);
    return NextResponse.json(
      { exito: false, error: error.message || "Error al eliminar el conductor." },
      { status: 500 }
    );
  }
}
