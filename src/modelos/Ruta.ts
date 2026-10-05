import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICoordenadasLineString {
  type: "LineString";
  coordinates: [number, number][]; // Array de [longitud, latitud]
}

export interface IRuta extends Document {
  nombre_ruta: string;
  geometria: ICoordenadasLineString;
  dias_recoleccion: string[];
  horario_inicio: string; // ej. "07:00"
  horario_fin: string; // ej. "14:30"
  colonia_zona: string; // ej. "Centro y Malecón"
  distancia_km?: number;
  activa: boolean;
  creadoEn: Date;
  actualizadoEn: Date;
}

const esquemaLineStringGeoJSON = new Schema(
  {
    type: {
      type: String,
      enum: ["LineString"],
      default: "LineString",
      required: true,
    },
    coordinates: {
      type: [[Number]], // [[lng, lat], [lng, lat], ...]
      required: true,
      validate: {
        validator: function (val: number[][]) {
          return Array.isArray(val) && val.length >= 2;
        },
        message: "Una geometría LineString requiere al menos 2 coordenadas [longitud, latitud]",
      },
    },
  },
  { _id: false }
);

const esquemaRuta = new Schema<IRuta>(
  {
    nombre_ruta: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    geometria: {
      type: esquemaLineStringGeoJSON,
      required: true,
    },
    dias_recoleccion: {
      type: [String],
      default: ["Lunes", "Miércoles", "Viernes"],
    },
    horario_inicio: {
      type: String,
      required: true,
      default: "07:00",
      trim: true,
    },
    horario_fin: {
      type: String,
      required: true,
      default: "14:00",
      trim: true,
    },
    colonia_zona: {
      type: String,
      required: true,
      default: "Gutiérrez Zamora Centro",
      trim: true,
    },
    distancia_km: {
      type: Number,
      default: 0,
    },
    activa: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: { createdAt: "creadoEn", updatedAt: "actualizadoEn" },
  }
);

esquemaRuta.index({ geometria: "2dsphere" });

export const ModeloRuta: Model<IRuta> =
  mongoose.models.Ruta || mongoose.model<IRuta>("Ruta", esquemaRuta);

export default ModeloRuta;
