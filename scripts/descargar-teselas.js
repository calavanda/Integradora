/**
 * Descargador de teselas (map tiles) para Gutiérrez Zamora, Veracruz
 * 
 * Descarga tiles de OpenStreetMap para uso offline.
 * Los tiles se guardan en public/tiles/{z}/{x}/{y}.png
 * 
 * Uso: node scripts/descargar-teselas.js
 */

const https = require("https");
const http = require("http");
const fs = require("fs");
const path = require("path");

// ──────────────────────────────────────────────────────────────────────
// Configuración geográfica: Gutiérrez Zamora, Veracruz
// ──────────────────────────────────────────────────────────────────────
const BBOX = {
  latMin: 20.4380, // Sur
  latMax: 20.4680, // Norte
  lngMin: -97.1100, // Oeste
  lngMax: -97.0650, // Este
};

// Niveles de zoom a descargar (12-17 cubre desde vista regional hasta calles)
const ZOOM_MIN = 12;
const ZOOM_MAX = 17;

// Directorio de salida
const DIR_SALIDA = path.join(__dirname, "..", "public", "tiles");

// Servidor de teselas (CartoDB Voyager - teselas limpias, sin labels pesados)
const SERVIDORES = [
  "https://a.basemaps.cartocdn.com/rastertiles/voyager",
  "https://b.basemaps.cartocdn.com/rastertiles/voyager",
  "https://c.basemaps.cartocdn.com/rastertiles/voyager",
  "https://d.basemaps.cartocdn.com/rastertiles/voyager",
];

// ──────────────────────────────────────────────────────────────────────
// Utilidades de conversión geográfica
// ──────────────────────────────────────────────────────────────────────
function latLngATesela(lat, lng, zoom) {
  const n = Math.pow(2, zoom);
  const x = Math.floor(((lng + 180) / 360) * n);
  const latRad = (lat * Math.PI) / 180;
  const y = Math.floor(
    ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n
  );
  return { x, y };
}

function obtenerRangoTeselas(zoom) {
  const min = latLngATesela(BBOX.latMax, BBOX.lngMin, zoom); // NW corner
  const max = latLngATesela(BBOX.latMin, BBOX.lngMax, zoom); // SE corner
  return {
    xMin: min.x,
    xMax: max.x,
    yMin: min.y,
    yMax: max.y,
  };
}

// ──────────────────────────────────────────────────────────────────────
// Descarga con reintentos
// ──────────────────────────────────────────────────────────────────────
function descargarArchivo(url, rutaDestino, reintentos = 3) {
  return new Promise((resolve, reject) => {
    const dir = path.dirname(rutaDestino);
    fs.mkdirSync(dir, { recursive: true });

    // Verificar si ya existe
    if (fs.existsSync(rutaDestino)) {
      const stats = fs.statSync(rutaDestino);
      if (stats.size > 0) {
        return resolve("existente");
      }
    }

    const protocolo = url.startsWith("https") ? https : http;

    const solicitud = protocolo.get(url, {
      headers: {
        "User-Agent": "EcoRuta-TileDownloader/1.0 (Proyecto universitario Gutiérrez Zamora)",
      },
    }, (respuesta) => {
      if (respuesta.statusCode === 200) {
        const flujo = fs.createWriteStream(rutaDestino);
        respuesta.pipe(flujo);
        flujo.on("finish", () => {
          flujo.close();
          resolve("descargado");
        });
        flujo.on("error", (err) => {
          fs.unlinkSync(rutaDestino);
          reject(err);
        });
      } else if (respuesta.statusCode === 429 && reintentos > 0) {
        // Rate limited - esperar y reintentar
        setTimeout(() => {
          descargarArchivo(url, rutaDestino, reintentos - 1).then(resolve).catch(reject);
        }, 2000);
      } else {
        reject(new Error(`HTTP ${respuesta.statusCode} para ${url}`));
      }
    });

    solicitud.on("error", (err) => {
      if (reintentos > 0) {
        setTimeout(() => {
          descargarArchivo(url, rutaDestino, reintentos - 1).then(resolve).catch(reject);
        }, 1000);
      } else {
        reject(err);
      }
    });

    solicitud.setTimeout(15000, () => {
      solicitud.destroy();
      if (reintentos > 0) {
        descargarArchivo(url, rutaDestino, reintentos - 1).then(resolve).catch(reject);
      } else {
        reject(new Error(`Timeout para ${url}`));
      }
    });
  });
}

// ──────────────────────────────────────────────────────────────────────
// Proceso principal
// ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log("╔══════════════════════════════════════════════════╗");
  console.log("║  Descargador de Teselas — EcoRuta Zamora Limpia ║");
  console.log("╠══════════════════════════════════════════════════╣");
  console.log(`║  Área: Gutiérrez Zamora, Veracruz               ║`);
  console.log(`║  Zoom: ${ZOOM_MIN} - ${ZOOM_MAX}                                ║`);
  console.log("╚══════════════════════════════════════════════════╝\n");

  // Calcular total de teselas
  let totalTeselas = 0;
  const tareasPorZoom = [];

  for (let z = ZOOM_MIN; z <= ZOOM_MAX; z++) {
    const rango = obtenerRangoTeselas(z);
    const cuenta = (rango.xMax - rango.xMin + 1) * (rango.yMax - rango.yMin + 1);
    totalTeselas += cuenta;
    tareasPorZoom.push({ z, rango, cuenta });
    console.log(`  Zoom ${z}: ${cuenta} teselas (x: ${rango.xMin}-${rango.xMax}, y: ${rango.yMin}-${rango.yMax})`);
  }

  console.log(`\n  Total: ${totalTeselas} teselas a descargar\n`);

  let descargadas = 0;
  let existentes = 0;
  let errores = 0;

  for (const { z, rango } of tareasPorZoom) {
    console.log(`\n─── Zoom ${z} ───`);

    for (let x = rango.xMin; x <= rango.xMax; x++) {
      for (let y = rango.yMin; y <= rango.yMax; y++) {
        const servidorIdx = (x + y) % SERVIDORES.length;
        const url = `${SERVIDORES[servidorIdx]}/${z}/${x}/${y}@2x.png`;
        const rutaLocal = path.join(DIR_SALIDA, `${z}`, `${x}`, `${y}.png`);

        try {
          const resultado = await descargarArchivo(url, rutaLocal);
          if (resultado === "existente") {
            existentes++;
          } else {
            descargadas++;
            // Pausa entre descargas para no saturar el servidor
            await new Promise(r => setTimeout(r, 100));
          }
          process.stdout.write(`  [${descargadas + existentes + errores}/${totalTeselas}] z=${z} x=${x} y=${y} ✓\r`);
        } catch (err) {
          errores++;
          console.error(`  ✗ Error descargando z=${z} x=${x} y=${y}: ${err.message}`);
        }
      }
    }
  }

  console.log("\n\n╔══════════════════════════════════════════════════╗");
  console.log(`║  Descarga completada                             ║`);
  console.log(`║  Nuevas:     ${String(descargadas).padEnd(6)} teselas                    ║`);
  console.log(`║  Existentes: ${String(existentes).padEnd(6)} teselas                    ║`);
  console.log(`║  Errores:    ${String(errores).padEnd(6)}                              ║`);
  console.log(`║  Directorio: public/tiles/                       ║`);
  console.log("╚══════════════════════════════════════════════════╝");
}

main().catch(console.error);
