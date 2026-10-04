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

// POST /api/v1/usuarios/crear — Crea un usuario en Clerk y guarda su rol en MongoDB
export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "No autorizado. Inicia sesión como administrador." }, { status: 401 });
    }

    const body = await request.json();
    const { nombre, apellidos, correo, nombreUsuario, contrasena, rol, departamento } = body;

    if (!correo || !contrasena) {
      return NextResponse.json(
        { error: "El correo electrónico y la contraseña son requeridos" },
        { status: 400 }
      );
    }

    if (contrasena.length < 8) {
      return NextResponse.json(
        { error: "La contraseña debe tener al menos 8 caracteres" },
        { status: 400 }
      );
    }

    // 1. Crear el usuario en Clerk
    const clerk = await clerkClient();
    const nuevoUsuarioClerk = await clerk.users.createUser({
      firstName: nombre || undefined,
      lastName: apellidos || undefined,
      emailAddress: [correo],
      username: nombreUsuario ? nombreUsuario.toLowerCase().trim() : undefined,
      password: contrasena,
      publicMetadata: {
        rol: rol || "CIUDADANO",
        departamento: departamento || "Sin asignar",
      },
    });

    // 2. Persistir rol y configuración extendida en MongoDB
    try {
      const conexion = await getMongoDb();
      if (conexion) {
        const { client, db } = conexion;
        try {
          const coleccion = db.collection("usuario_roles");
          await coleccion.updateOne(
            { clerkId: nuevoUsuarioClerk.id },
            {
              $set: {
                clerkId: nuevoUsuarioClerk.id,
                email: correo.toLowerCase(),
                rol: rol || "OPERADOR",
                departamento: departamento || "Sin asignar",
                creadoPor: userId,
                creadoEn: new Date(),
              },
            },
            { upsert: true }
          );
        } finally {
          await client.close();
        }
      }
    } catch (mongoError) {
      console.warn("[POST /api/v1/usuarios/crear] Advertencia al guardar en Mongo:", mongoError);
    }

    return NextResponse.json({
      ok: true,
      clerkId: nuevoUsuarioClerk.id,
      nombreUsuario: nuevoUsuarioClerk.username || correo,
      mensaje: "Usuario creado exitosamente en Clerk y registrado en el sistema.",
    });
  } catch (error: any) {
    console.error("[POST /api/v1/usuarios/crear] Error:", error);

    // Extraer mensaje amigable de Clerk si hay errores de validación
    let mensajeError = error.message || "Error al crear el usuario en Clerk";
    if (error.errors && error.errors[0]?.longMessage) {
      mensajeError = error.errors[0].longMessage;
    } else if (error.errors && error.errors[0]?.message) {
      mensajeError = error.errors[0].message;
    }

    return NextResponse.json({ error: mensajeError }, { status: 400 });
  }
}
