import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

let cached: MongooseCache = global.mongooseCache || { conn: null, promise: null };

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

/**
 * Conexión singleton y optimizada a MongoDB Atlas con Mongoose
 * para entornos serverless (Vercel) y Node.js tradicional.
 */
export async function conectarMongoose(): Promise<typeof mongoose | null> {
  if (!MONGODB_URI) {
    console.warn("[MongoDB] MONGODB_URI no está definido en variables de entorno.");
    return null;
  }

  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  if (!cached.promise || mongoose.connection.readyState === 0) {
    const opts: mongoose.ConnectOptions = {
      serverSelectionTimeoutMS: 30000,
      connectTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      bufferCommands: true,
      family: 4,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((instancia) => {
      console.log("[MongoDB Atlas] Conexión establecida exitosamente con Mongoose.");
      return instancia;
    });
  }

  try {
    cached.conn = await cached.promise;
    if (mongoose.connection.readyState !== 1) {
      throw new Error("Mongoose connection is not ready (readyState !== 1)");
    }
    return cached.conn;
  } catch (error) {
    cached.conn = null;
    cached.promise = null;
    console.error("[MongoDB Atlas] Error al conectar con Mongoose:", error);
    throw error;
  }
}
