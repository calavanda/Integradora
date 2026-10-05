import mongoose, { Schema, Document, Model } from "mongoose";
import { ICoordenadasPunto } from "./Camion";

export type TipoIncidente =
  | "TRAFICO_CALLE_CERRADA"
  | "FALLA_MECANICA"
  | "TIEMPO_DESCANSO"
  | "IMPREVISTO_OTRO"
  | "EXCESO_VELOCIDAD"; // Añadido para detección automática > 40 km/h

export type EstadoIncidente = "ACTIVO" | "RESUELTO";

export interface IIncidente extends Document {
  camion_id: string; // numero_economico o ObjectId
  conductor_id?: string;
  tipo_incidente: TipoIncidente;
  descripcion: string;
  ubicacion: ICoordenadasPunto;
  velocidad_registrada?: number;
  estado: EstadoIncidente;
  resueltoPor?: string;
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

const esquemaIncidente = new Schema<IIncidente>(
  {
    camion_id: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    conductor_id: {
      type: String,
      trim: true,
      default: "Sin especificar",
    },
    tipo_incidente: {
      type: String,
      enum: [
        "TRAFICO_CALLE_CERRADA",
        "FALLA_MECANICA",
        "TIEMPO_DESCANSO",
        "IMPREVISTO_OTRO",
        "EXCESO_VELOCIDAD",
      ],
      required: true,
      index: true,
    },
    descripcion: {
      type: String,
      required: true,
      trim: true,
    },
    ubicacion: {
      type: esquemaPuntoGeoJSON,
      required: true,
      default: () => ({
        type: "Point",
        coordinates: [-97.0896, 20.4527],
      }),
    },
    velocidad_registrada: {
      type: Number,
      default: 0,
    },
    estado: {
      type: String,
      enum: ["ACTIVO", "RESUELTO"],
      default: "ACTIVO",
      index: true,
    },
    resueltoPor: {
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

esquemaIncidente.index({ ubicacion: "2dsphere" });

export const ModeloIncidente: Model<IIncidente> =
  mongoose.models.Incidente ||
  mongoose.model<IIncidente>("Incidente", esquemaIncidente);

export default ModeloIncidente;
