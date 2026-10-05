import mongoose, { Schema, Document, Model } from "mongoose";

export interface IConductor extends Document {
  nombre: string;
  licencia: string;
  turno: "Matutino" | "Vespertino" | "Nocturno";
  camion_asignado?: string;
  ruta_actual?: string;
  telefono?: string;
  estado: "En Servicio" | "Disponible" | "Descanso";
  puntuacion_ecologica: number;
  creadoEn: Date;
  actualizadoEn: Date;
}

const esquemaConductor = new Schema<IConductor>(
  {
    nombre: { type: String, required: true, trim: true },
    licencia: { type: String, required: true, trim: true, unique: true },
    turno: {
      type: String,
      enum: ["Matutino", "Vespertino", "Nocturno"],
      default: "Matutino",
    },
    camion_asignado: { type: String, default: "Sin asignar" },
    ruta_actual: { type: String, default: "Sin ruta asignada" },
    telefono: { type: String, default: "" },
    estado: {
      type: String,
      enum: ["En Servicio", "Disponible", "Descanso"],
      default: "Disponible",
    },
    puntuacion_ecologica: { type: Number, default: 95 },
  },
  {
    timestamps: { createdAt: "creadoEn", updatedAt: "actualizadoEn" },
  }
);

export const ModeloConductor: Model<IConductor> =
  mongoose.models.Conductor || mongoose.model<IConductor>("Conductor", esquemaConductor);
