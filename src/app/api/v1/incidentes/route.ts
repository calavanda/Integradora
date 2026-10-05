import { NextResponse } from "next/server";
import { conectarMongoose } from "@/lib/conexionMongoose";
import { ModeloIncidente } from "@/modelos/Incidente";

export async function GET() {
  try {
    await conectarMongoose();
    const incidentes = await ModeloIncidente.find({}).sort({ creadoEn: -1 }).lean();

    return NextResponse.json({
      exito: true,
      total: incidentes.length,
      incidentes: incidentes.map((inc) => ({
        id: inc._id?.toString(),
        camion_id: inc.camion_id,
        conductor_id: inc.conductor_id,
        tipo_incidente: inc.tipo_incidente,
        descripcion: inc.descripcion,
        latitud: inc.ubicacion?.coordinates?.[1] ?? 20.4527,
        longitud: inc.ubicacion?.coordinates?.[0] ?? -97.0896,
        velocidad_registrada: inc.velocidad_registrada ?? 0,
        estado: inc.estado,
        fecha: inc.creadoEn,
      })),
    });
  } catch (error: any) {
    console.error("[GET /api/v1/incidentes] Error:", error);
    return NextResponse.json(
      { exito: false, error: error.message || "Error al obtener incidentes." },
      { status: 500 }
    );
  }
}

export async function POST(peticion: Request) {
  try {
    const cuerpo = await peticion.json();
    const {
      camion_id,
      conductor_id = "Conductor en Turno",
      tipo_incidente,
      descripcion,
      latitud = 20.4527,
      longitud = -97.0896,
      velocidad_registrada = 0,
    } = cuerpo;

    if (!camion_id || !tipo_incidente || !descripcion) {
      return NextResponse.json(
        {
          exito: false,
          error: "Los campos 'camion_id', 'tipo_incidente' y 'descripcion' son requeridos.",
        },
        { status: 400 }
      );
    }

    await conectarMongoose();

    const nuevoIncidente = await ModeloIncidente.create({
      camion_id,
      conductor_id,
      tipo_incidente,
      descripcion,
      ubicacion: {
        type: "Point",
        coordinates: [Number(longitud), Number(latitud)],
      },
      velocidad_registrada: Number(velocidad_registrada),
      estado: "ACTIVO",
    });

    return NextResponse.json({
      exito: true,
      mensaje: "Incidente reportado exitosamente.",
      incidente: nuevoIncidente,
    });
  } catch (error: any) {
    console.error("[POST /api/v1/incidentes] Error:", error);
    return NextResponse.json(
      { exito: false, error: error.message || "Error al crear incidente." },
      { status: 500 }
    );
  }
}

export async function PUT(peticion: Request) {
  try {
    const cuerpo = await peticion.json();
    const { id, estado, descripcion, tipo_incidente } = cuerpo;

    if (!id) {
      return NextResponse.json(
        { exito: false, error: "El ID del incidente es requerido." },
        { status: 400 }
      );
    }

    await conectarMongoose();

    const actualizacion: any = {};
    if (estado) actualizacion.estado = estado;
    if (descripcion) actualizacion.descripcion = descripcion;
    if (tipo_incidente) actualizacion.tipo_incidente = tipo_incidente;

    const actualizado = await ModeloIncidente.findByIdAndUpdate(id, actualizacion, { new: true });

    if (!actualizado) {
      return NextResponse.json(
        { exito: false, error: "Incidente no encontrado." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      exito: true,
      mensaje: "Incidente actualizado exitosamente.",
      incidente: actualizado,
    });
  } catch (error: any) {
    console.error("[PUT /api/v1/incidentes] Error:", error);
    return NextResponse.json(
      { exito: false, error: error.message || "Error al actualizar incidente." },
      { status: 500 }
    );
  }
}

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
        { exito: false, error: "El ID es requerido para eliminar el incidente." },
        { status: 400 }
      );
    }

    await conectarMongoose();
    const eliminado = await ModeloIncidente.findByIdAndDelete(id);

    if (!eliminado) {
      return NextResponse.json(
        { exito: false, error: "No se encontró el incidente a eliminar." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      exito: true,
      mensaje: "Incidente eliminado exitosamente.",
    });
  } catch (error: any) {
    console.error("[DELETE /api/v1/incidentes] Error:", error);
    return NextResponse.json(
      { exito: false, error: error.message || "Error al eliminar incidente." },
      { status: 500 }
    );
  }
}
