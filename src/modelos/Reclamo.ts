import mongoose, { Schema, Document, Model } from "mongoose";
import { ICoordenadasPunto } from "./Camion";

export type TipoReclamo =
  | "CAMION_NO_PASO"
  | "BASURA_TIRADA"
  | "CONTENEDOR_DANADO";

export type EstadoReclamo = "PENDIENTE" | "EN_REVISION" | "RESUELTO";

export interface IReclamo extends Document {
  ciudadano_id: string; // clerk_id o correo
  ciudadano_nombre?: string;
  tipo_reclamo: TipoReclamo;
  descripcion?: string;
  ubicacion: ICoordenadasPunto;
  fotografia_url?: string;
  estado: EstadoReclamo;
  respuesta_ayuntamiento?: string;
  resueltoEn?: Date;
  creadoEn: Date;
  actualizadoEn: Date;
}

const esquemaPuntoGeoJSON = new Schema(
  {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point",
      required: true,
    },
    coordinates: {
      type: [Number], // [longitud, latitud]
      required: true,
    },
  },
  { _id: false }
);

const esquemaReclamo = new Schema<IReclamo>(
  {
    ciudadano_id: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    ciudadano_nombre: {
      type: String,
      trim: true,
      default: "Ciudadano de Gutiérrez Zamora",
    },
    tipo_reclamo: {
      type: String,
      enum: ["CAMION_NO_PASO", "BASURA_TIRADA", "CONTENEDOR_DANADO"],
      required: true,
      index: true,
    },
    descripcion: {
      type: String,
      trim: true,
      default: "",
    },
    ubicacion: {
      type: esquemaPuntoGeoJSON,
      required: true,
      default: () => ({
        type: "Point",
        coordinates: [-97.0896, 20.4527],
      }),
    },
    fotografia_url: {
      type: String,
      trim: true,
    },
    estado: {
      type: String,
      enum: ["PENDIENTE", "EN_REVISION", "RESUELTO"],
      default: "PENDIENTE",
      index: true,
    },
    respuesta_ayuntamiento: {
      type: String,
      trim: true,
    },
    resueltoEn: {
      type: Date,
    },
  },
  {
    timestamps: { createdAt: "creadoEn", updatedAt: "actualizadoEn" },
  }
);

esquemaReclamo.index({ ubicacion: "2dsphere" });

export const ModeloReclamo: Model<IReclamo> =
  mongoose.models.Reclamo ||
  mongoose.model<IReclamo>("Reclamo", esquemaReclamo);

export default ModeloReclamo;
