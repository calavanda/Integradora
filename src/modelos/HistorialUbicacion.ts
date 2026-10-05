import mongoose, { Schema, Document, Model } from "mongoose";
import { ICoordenadasPunto } from "./Camion";

export interface IHistorialUbicacion extends Document {
  camion_id: string; // numero_economico o ID del camión
  ubicacion: ICoordenadasPunto;
  velocidad: number; // en km/h
  orientacion?: number;
  exceso_velocidad: boolean; // Flag si superó 40 km/h
  fecha_registro: Date;
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

const esquemaHistorialUbicacion = new Schema<IHistorialUbicacion>({
  camion_id: {
    type: String,
    required: true,
    index: true,
    trim: true,
  },
  ubicacion: {
    type: esquemaPuntoGeoJSON,
    required: true,
  },
  velocidad: {
    type: Number,
    required: true,
    default: 0,
    min: 0,
  },
  orientacion: {
    type: Number,
    default: 0,
    min: 0,
    max: 360,
  },
  exceso_velocidad: {
    type: Boolean,
    default: false,
    index: true,
  },
  fecha_registro: {
    type: Date,
    default: Date.now,
    index: true,
  },
});

// Índices compuestos para consultas rápidas de recorrido histórico (playback)
esquemaHistorialUbicacion.index({ camion_id: 1, fecha_registro: -1 });
esquemaHistorialUbicacion.index({ ubicacion: "2dsphere" });

export const ModeloHistorialUbicacion: Model<IHistorialUbicacion> =
  mongoose.models.HistorialUbicacion ||
  mongoose.model<IHistorialUbicacion>(
    "HistorialUbicacion",
    esquemaHistorialUbicacion
  );

export default ModeloHistorialUbicacion;
