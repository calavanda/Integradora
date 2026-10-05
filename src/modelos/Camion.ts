import mongoose, { Schema, Document, Model } from "mongoose";

export type EstadoCamion =
  | "EN_RUTA"
  | "EN_PAUSA"
  | "MANTENIMIENTO"
  | "FUERA_DE_SERVICIO";

export interface ICoordenadasPunto {
  type: "Point";
  coordinates: [number, number]; // [longitud, latitud] estándar GeoJSON
}

export interface ICamion extends Document {
  numero_economico: string;
  placas: string;
  estado: EstadoCamion;
  ubicacion_actual: ICoordenadasPunto;
  velocidad_actual: number; // en km/h
  orientacion: number; // rumbo en grados 0-360
  ultima_actualizacion: Date;
  modelo?: string;
  conductor_asignado?: string; // Nombre o clerk_id
  porcentaje_carga?: number;
  nivel_combustible?: number;
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
      validate: {
        validator: function (val: number[]) {
          return val.length === 2;
        },
        message: "Las coordenadas deben ser exactamente [longitud, latitud]",
      },
    },
  },
  { _id: false }
);

const esquemaCamion = new Schema<ICamion>(
  {
    numero_economico: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    placas: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    estado: {
      type: String,
      enum: ["EN_RUTA", "EN_PAUSA", "MANTENIMIENTO", "FUERA_DE_SERVICIO"],
      default: "FUERA_DE_SERVICIO",
      index: true,
    },
    ubicacion_actual: {
      type: esquemaPuntoGeoJSON,
      required: true,
      default: () => ({
        type: "Point",
        coordinates: [-97.0896, 20.4527], // Centro de Gutiérrez Zamora [lng, lat]
      }),
    },
    velocidad_actual: {
      type: Number,
      default: 0,
      min: 0,
    },
    orientacion: {
      type: Number,
      default: 0,
      min: 0,
      max: 360,
    },
    ultima_actualizacion: {
      type: Date,
      default: Date.now,
    },
    modelo: {
      type: String,
      trim: true,
    },
    conductor_asignado: {
      type: String,
      trim: true,
    },
    porcentaje_carga: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    nivel_combustible: {
      type: Number,
      default: 100,
      min: 0,
      max: 100,
    },
  },
  {
    timestamps: { createdAt: "creadoEn", updatedAt: "actualizadoEn" },
  }
);

// Índice geoespacial 2dsphere para consultas por proximidad
esquemaCamion.index({ ubicacion_actual: "2dsphere" });

export const ModeloCamion: Model<ICamion> =
  mongoose.models.Camion || mongoose.model<ICamion>("Camion", esquemaCamion);

export default ModeloCamion;
