// SEO y Metadatos para EcoRuta (Zamora Limpia) — Gutiérrez Zamora, Ver.
const baseURL = "https://ecoruta.zamora.gob.mx";

const meta = {
  home: {
    path: "/",
    title: "EcoRuta · Zamora Limpia | Plataforma Municipal de Gestión y Monitoreo Ambiental",
    description:
      "Plataforma gubernamental de monitoreo satelital en tiempo real para recolección de basura, trazado de rutas OSRM y atención ciudadana en Gutiérrez Zamora, Veracruz.",
    image: "/images/og/home.jpg",
    canonical: baseURL,
    robots: "index,follow",
    alternates: [{ href: baseURL, hrefLang: "es" }],
  },
};

const schema = {
  logo: "",
  type: "GovernmentOrganization",
  name: "EcoRuta - H. Ayuntamiento de Gutiérrez Zamora",
  description: meta.home.description,
  email: "servicios.publicos@gutierrezzamora.gob.mx",
};

export { meta, schema, baseURL };