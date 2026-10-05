import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = "ecoruta";

async function getMongoDb() {
  if (!MONGODB_URI) return null;
  const client = new MongoClient(MONGODB_URI, {
    serverSelectionTimeoutMS: 4000,
  });
  await client.connect();
  return { client, db: client.db(DB_NAME) };
}

// GET /api/v1/usuarios — Lista todos los usuarios de Clerk con roles de MongoDB
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // 1. Obtener lista de usuarios reales desde Clerk
    const clerk = await clerkClient();
    const respuestaClerk = await clerk.users.getUserList({ limit: 100 });
    const usuariosClerk = respuestaClerk.data;

    // 2. Obtener metadatos de roles desde MongoDB (tolerante a fallos de red)
    let rolesMongo: Record<string, any> = {};
    try {
      const conexion = await getMongoDb();
      if (conexion) {
        const { client, db } = conexion;
        try {
          const coleccion = db.collection("usuario_roles");
          const roles = await coleccion.find({}).toArray();
          roles.forEach((r) => {
            if (r.clerkId) rolesMongo[r.clerkId] = r;
            if (r.email) rolesMongo[r.email.toLowerCase()] = r;
          });
        } finally {
          await client.close();
        }
      }
    } catch (mongoError) {
      console.warn("[GET /api/v1/usuarios] Advertencia: MongoDB no disponible temporalmente:", mongoError);
    }

    // 3. Combinar datos de Clerk + MongoDB
    const usuarios = usuariosClerk.map((u) => {
      const email = u.emailAddresses[0]?.emailAddress || "";
      const emailLower = email.toLowerCase();
      const metaMongo = rolesMongo[u.id] || rolesMongo[emailLower] || {};

      const esAdminPrincipal = emailLower === "22610282@utgz.edu.mx";
      const nombreCompleto = [u.firstName, u.lastName].filter(Boolean).join(" ");
      const nombre = nombreCompleto || u.username || (esAdminPrincipal ? "Ing. Alfredo Castillo Gerónimo" : "Usuario");

      const ultimoAcceso = u.lastSignInAt
        ? new Date(u.lastSignInAt).toLocaleString("es-MX", { dateStyle: "short", timeStyle: "short" })
        : "Nunca";

      // Rol por defecto: el admin institucional siempre es SUPER_ADMIN
      const rol = metaMongo.rol || (esAdminPrincipal ? "SUPER_ADMIN" : "CIUDADANO");
      const departamento =
        metaMongo.departamento ||
        (esAdminPrincipal ? "Ingeniería en Desarrollo Web / Presidencia" : "Sin asignar");

      return {
        id: metaMongo._id?.toString() || u.id,
        clerkId: u.id,
        nombre,
        email,
        rol,
        departamento,
        placasVehiculo: metaMongo.placasVehiculo || undefined,
        estado: u.banned ? "Inactivo" : "Activo",
        ultimoAcceso,
        avatarUrl: u.imageUrl,
      };
    });

    return NextResponse.json({ ok: true, usuarios });
  } catch (error: any) {
    console.error("[GET /api/v1/usuarios] Error:", error);
    return NextResponse.json({ error: error.message || "Error al obtener usuarios" }, { status: 500 });
  }
}

// POST /api/v1/usuarios — Actualiza el rol/departamento de un usuario en MongoDB
export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { clerkId, email, rol, departamento, placasVehiculo } = body;

    if (!clerkId || !rol) {
      return NextResponse.json({ error: "clerkId y rol son requeridos" }, { status: 400 });
    }

    const conexion = await getMongoDb();
    if (!conexion) {
      return NextResponse.json({ error: "Base de datos no configurada" }, { status: 500 });
    }

    const { client, db } = conexion;
    try {
      const coleccion = db.collection("usuario_roles");
      await coleccion.updateOne(
        { clerkId },
        {
          $set: {
            clerkId,
            email: email ? email.toLowerCase() : undefined,
            rol,
            departamento: departamento || "Sin asignar",
            placasVehiculo,
            actualizadoEn: new Date(),
          },
        },
        { upsert: true }
      );
    } finally {
      await client.close();
    }

    return NextResponse.json({ ok: true, mensaje: "Rol actualizado correctamente" });
  } catch (error: any) {
    console.error("[POST /api/v1/usuarios] Error:", error);
    return NextResponse.json({ error: error.message || "Error al actualizar rol" }, { status: 500 });
  }
}

// DELETE /api/v1/usuarios — Elimina un usuario de Clerk y de MongoDB
export async function DELETE(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    let clerkId = searchParams.get("clerkId");

    if (!clerkId) {
      try {
        const body = await request.json();
        clerkId = body.clerkId;
      } catch {
        // no body
      }
    }

    if (!clerkId) {
      return NextResponse.json({ error: "El clerkId es requerido para eliminar" }, { status: 400 });
    }

    // 1. Eliminar de Clerk
    const clerk = await clerkClient();
    try {
      await clerk.users.deleteUser(clerkId);
    } catch (clerkErr: any) {
      console.warn("Aviso al eliminar de Clerk:", clerkErr.message);
    }

    // 2. Eliminar de MongoDB
    const conexion = await getMongoDb();
    if (conexion) {
      const { client, db } = conexion;
      try {
        await db.collection("usuario_roles").deleteOne({ clerkId });
      } finally {
        await client.close();
      }
    }

    return NextResponse.json({ ok: true, mensaje: "Usuario eliminado exitosamente" });
  } catch (error: any) {
    console.error("[DELETE /api/v1/usuarios] Error:", error);
    return NextResponse.json({ error: error.message || "Error al eliminar usuario" }, { status: 500 });
  }
}
