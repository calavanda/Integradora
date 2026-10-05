import mongoose, { Schema, Document, Model } from "mongoose";

export type RolUsuario =
  | "SUPER_ADMIN"
  | "DIRECTOR_OBRAS"
  | "OPERADOR_DESPACHADOR"
  | "CONDUCTOR"
  | "CIUDADANO";

export interface IUsuario extends Document {
  clerk_id: string;
  nombre: string;
  correo: string;
  telefono?: string;
  rol: RolUsuario;
  placas_vehiculo?: string;
  departamento?: string;
  activo: boolean;
  creadoEn: Date;
  actualizadoEn: Date;
}

const esquemaUsuario = new Schema<IUsuario>(
  {
    clerk_id: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    nombre: {
      type: String,
      required: true,
      trim: true,
    },
    correo: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    telefono: {
      type: String,
      trim: true,
    },
    rol: {
      type: String,
      enum: [
        "SUPER_ADMIN",
        "DIRECTOR_OBRAS",
        "OPERADOR_DESPACHADOR",
        "CONDUCTOR",
        "CIUDADANO",
      ],
      default: "CIUDADANO",
      index: true,
    },
    placas_vehiculo: {
      type: String,
      trim: true,
    },
    departamento: {
      type: String,
      trim: true,
      default: "Ciudadanía",
    },
    activo: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: { createdAt: "creadoEn", updatedAt: "actualizadoEn" },
  }
);

export const ModeloUsuario: Model<IUsuario> =
  mongoose.models.Usuario || mongoose.model<IUsuario>("Usuario", esquemaUsuario);

export default ModeloUsuario;
