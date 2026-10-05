import { NextResponse } from "next/server";
import { conectarMongoose } from "@/lib/conexionMongoose";
import { ModeloReclamo } from "@/modelos/Reclamo";

export async function GET() {
  try {
    await conectarMongoose();
    const reclamos = await ModeloReclamo.find({}).sort({ creadoEn: -1 }).lean();

    return NextResponse.json({
      exito: true,
      total: reclamos.length,
      reclamos: reclamos.map((rec) => ({
        id: rec._id?.toString(),
        ciudadano_id: rec.ciudadano_id,
        ciudadano_nombre: rec.ciudadano_nombre,
        tipo_reclamo: rec.tipo_reclamo,
        descripcion: rec.descripcion,
        latitud: rec.ubicacion?.coordinates?.[1] ?? 20.4527,
        longitud: rec.ubicacion?.coordinates?.[0] ?? -97.0896,
        fotografia_url: rec.fotografia_url,
        estado: rec.estado,
        fecha: rec.creadoEn,
      })),
    });
  } catch (error: any) {
    console.error("[GET /api/v1/reclamos] Error:", error);
    return NextResponse.json(
      { exito: false, error: error.message || "Error al obtener reclamos ciudadanos." },
      { status: 500 }
    );
  }
}

export async function POST(peticion: Request) {
  try {
    const cuerpo = await peticion.json();
    const {
      ciudadano_id = "anonimo_zamora",
      ciudadano_nombre = "Ciudadano de Gutiérrez Zamora",
      tipo_reclamo,
      descripcion = "",
      latitud = 20.4527,
      longitud = -97.0896,
      fotografia_url,
    } = cuerpo;

    if (!tipo_reclamo) {
      return NextResponse.json(
        {
          exito: false,
          error: "El campo 'tipo_reclamo' es requerido.",
        },
        { status: 400 }
      );
    }

    await conectarMongoose();

    const nuevoReclamo = await ModeloReclamo.create({
      ciudadano_id,
      ciudadano_nombre,
      tipo_reclamo,
      descripcion,
      ubicacion: {
        type: "Point",
        coordinates: [Number(longitud), Number(latitud)],
      },
      fotografia_url,
      estado: "PENDIENTE",
    });

    return NextResponse.json({
      exito: true,
      mensaje: "Reclamo ciudadano registrado exitosamente.",
      reclamo: nuevoReclamo,
    });
  } catch (error: any) {
    console.error("[POST /api/v1/reclamos] Error:", error);
    return NextResponse.json(
      { exito: false, error: error.message || "Error al registrar el reclamo." },
      { status: 500 }
    );
  }
}

export async function PUT(peticion: Request) {
  try {
    const cuerpo = await peticion.json();
    const { id, estado, descripcion, tipo_reclamo } = cuerpo;

    if (!id) {
      return NextResponse.json(
        { exito: false, error: "El ID del reclamo es obligatorio." },
        { status: 400 }
      );
    }

    await conectarMongoose();

    const actualizacion: any = {};
    if (estado) actualizacion.estado = estado;
    if (descripcion) actualizacion.descripcion = descripcion;
    if (tipo_reclamo) actualizacion.tipo_reclamo = tipo_reclamo;

    const actualizado = await ModeloReclamo.findByIdAndUpdate(id, actualizacion, { new: true });

    if (!actualizado) {
      return NextResponse.json(
        { exito: false, error: "Reclamo no encontrado." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      exito: true,
      mensaje: "Reclamo actualizado exitosamente.",
      reclamo: actualizado,
    });
  } catch (error: any) {
    console.error("[PUT /api/v1/reclamos] Error:", error);
    return NextResponse.json(
      { exito: false, error: error.message || "Error al actualizar reclamo." },
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
        { exito: false, error: "El ID es requerido para eliminar el reclamo." },
        { status: 400 }
      );
    }

    await conectarMongoose();
    const eliminado = await ModeloReclamo.findByIdAndDelete(id);

    if (!eliminado) {
      return NextResponse.json(
        { exito: false, error: "No se encontró el reclamo a eliminar." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      exito: true,
      mensaje: "Reclamo eliminado exitosamente.",
    });
  } catch (error: any) {
    console.error("[DELETE /api/v1/reclamos] Error:", error);
    return NextResponse.json(
      { exito: false, error: error.message || "Error al eliminar reclamo." },
      { status: 500 }
    );
  }
}
