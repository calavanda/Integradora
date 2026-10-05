"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Column,
  Row,
  Grid,
  Heading,
  Text,
  Button,
  Card,
  Badge,
  Tag,
  Input,
  IconButton,
} from "@once-ui-system/core";
import {
  FaTriangleExclamation,
  FaCheck,
  FaBullhorn,
  FaPlus,
  FaTrash,
  FaArrowsRotate,
} from "react-icons/fa6";

interface IncidenteItem {
  id: string;
  camion_id: string;
  conductor_id: string;
  tipo_incidente: string;
  descripcion: string;
  latitud: number;
  longitud: number;
  velocidad_registrada?: number;
  estado: "ACTIVO" | "RESUELTO";
  fecha: string;
}

interface ReclamoItem {
  id: string;
  ciudadano_nombre: string;
  tipo_reclamo: string;
  descripcion: string;
  fotografia_url?: string;
  estado: "PENDIENTE" | "EN_REVISION" | "RESUELTO";
  fecha: string;
}

export function VistaReportesIncidentes() {
  const [tabActiva, setTabActiva] = useState<"incidentes" | "reclamos">("incidentes");
  const [incidentes, setIncidentes] = useState<IncidenteItem[]>([]);
  const [reclamos, setReclamos] = useState<ReclamoItem[]>([]);
  const [cargando, setCargando] = useState(true);

  // Modal Nuevo Incidente
  const [modalIncidenteAbierto, setModalIncidenteAbierto] = useState(false);
  const [formIncidente, setFormIncidente] = useState({
    camion_id: "",
    conductor_id: "Conductor en Turno",
    tipo_incidente: "FALLA_MECANICA",
    descripcion: "",
  });

  // Modal Nuevo Reclamo
  const [modalReclamoAbierto, setModalReclamoAbierto] = useState(false);
  const [formReclamo, setFormReclamo] = useState({
    ciudadano_nombre: "",
    tipo_reclamo: "CAMION_NO_PASO",
    descripcion: "",
    fotografia_url: "",
  });

  const [enviando, setEnviando] = useState(false);

  const cargarDatos = useCallback(async () => {
    setCargando(true);
    try {
      const [resInc, resRec] = await Promise.all([
        fetch("/api/v1/incidentes", { cache: "no-store" }),
        fetch("/api/v1/reclamos", { cache: "no-store" }),
      ]);
      const dataInc = await resInc.json();
      const dataRec = await resRec.json();

      if (dataInc.exito && Array.isArray(dataInc.incidentes)) {
        setIncidentes(dataInc.incidentes);
      } else {
        setIncidentes([]);
      }

      if (dataRec.exito && Array.isArray(dataRec.reclamos)) {
        setReclamos(dataRec.reclamos);
      } else {
        setReclamos([]);
      }
    } catch {
      setIncidentes([]);
      setReclamos([]);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  const registrarIncidente = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formIncidente.camion_id || !formIncidente.descripcion) return;
    setEnviando(true);
    try {
      const res = await fetch("/api/v1/incidentes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formIncidente),
      });
      const data = await res.json();
      if (data.exito) {
        setModalIncidenteAbierto(false);
        setFormIncidente({
          camion_id: "",
          conductor_id: "Conductor en Turno",
          tipo_incidente: "FALLA_MECANICA",
          descripcion: "",
        });
        await cargarDatos();
      } else {
        alert(data.error || "Error al crear incidente");
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setEnviando(false);
    }
  };

  const registrarReclamo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formReclamo.ciudadano_nombre || !formReclamo.descripcion) return;
    setEnviando(true);
    try {
      const res = await fetch("/api/v1/reclamos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formReclamo),
      });
      const data = await res.json();
      if (data.exito) {
        setModalReclamoAbierto(false);
        setFormReclamo({
          ciudadano_nombre: "",
          tipo_reclamo: "CAMION_NO_PASO",
          descripcion: "",
          fotografia_url: "",
        });
        await cargarDatos();
      } else {
        alert(data.error || "Error al registrar reclamo");
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setEnviando(false);
    }
  };

  const toggleEstadoIncidente = async (id: string, estadoActual: string) => {
    const nuevoEstado = estadoActual === "ACTIVO" ? "RESUELTO" : "ACTIVO";
    try {
      const res = await fetch("/api/v1/incidentes", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, estado: nuevoEstado }),
      });
      const data = await res.json();
      if (data.exito) await cargarDatos();
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  const cambiarEstadoReclamo = async (id: string, nuevoEstado: string) => {
    try {
      const res = await fetch("/api/v1/reclamos", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, estado: nuevoEstado }),
      });
      const data = await res.json();
      if (data.exito) await cargarDatos();
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  const eliminarIncidente = async (id: string) => {
    if (!confirm("¿Deseas eliminar este registro de incidente?")) return;
    try {
      const res = await fetch(`/api/v1/incidentes?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.exito) await cargarDatos();
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  const eliminarReclamo = async (id: string) => {
    if (!confirm("¿Deseas eliminar este reclamo ciudadano?")) return;
    try {
      const res = await fetch(`/api/v1/reclamos?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.exito) await cargarDatos();
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  return (
    <Column gap="24" fillWidth>
      {/* Encabezado */}
      <Row fillWidth horizontal="between" vertical="center" gap="16" wrap>
        <Column gap="4">
          <Row gap="8" vertical="center">
            <FaTriangleExclamation size={26} style={{ color: "var(--eco-amber-400)" }} />
            <Heading variant="display-strong-s" onBackground="neutral-strong">
              Centro de Atención: Incidentes y Reclamos
            </Heading>
            <Badge textVariant="code-default-s" border="neutral-alpha-medium">
              Gutiérrez Zamora
            </Badge>
          </Row>
          <Text variant="body-default-m" onBackground="neutral-medium">
            Supervisa emergencias mecánicas de la flota y atiende quejas vecinales de recolección en tiempo real.
          </Text>
        </Column>

        <Row gap="8" vertical="center" wrap>
          <Button variant="ghost" size="s" onClick={cargarDatos}>
            <Row gap="8" vertical="center">
              <FaArrowsRotate size={13} />
              <Text>Actualizar</Text>
            </Row>
          </Button>

          {tabActiva === "incidentes" ? (
            <Button variant="primary" size="s" onClick={() => setModalIncidenteAbierto(true)}>
              <Row gap="8" vertical="center">
                <FaPlus size={13} />
                <Text>Reportar Incidente</Text>
              </Row>
            </Button>
          ) : (
            <Button variant="primary" size="s" onClick={() => setModalReclamoAbierto(true)}>
              <Row gap="8" vertical="center">
                <FaPlus size={13} />
                <Text>Nuevo Reclamo</Text>
              </Row>
            </Button>
          )}
        </Row>
      </Row>

      {/* Selector de Pestaña */}
      <Row gap="8" background="page" padding="xs" radius="m" border="neutral-alpha-weak" style={{ width: "fit-content" }}>
        <Button
          variant={tabActiva === "incidentes" ? "primary" : "tertiary"}
          size="s"
          onClick={() => setTabActiva("incidentes")}
        >
          <Row gap="8" vertical="center">
            <FaTriangleExclamation size={14} />
            <Text>Incidentes en Flota ({incidentes.length})</Text>
          </Row>
        </Button>
        <Button
          variant={tabActiva === "reclamos" ? "primary" : "tertiary"}
          size="s"
          onClick={() => setTabActiva("reclamos")}
        >
          <Row gap="8" vertical="center">
            <FaBullhorn size={14} />
            <Text>Reclamos Ciudadanos ({reclamos.length})</Text>
          </Row>
        </Button>
      </Row>

      {/* Contenido: Incidentes */}
      {tabActiva === "incidentes" && (
        <Column gap="16" fillWidth>
          {!cargando && incidentes.length === 0 && (
            <Card padding="xl" radius="l" border="neutral-alpha-weak" background="surface">
              <Column horizontal="center" vertical="center" gap="16" paddingY="xl">
                <FaTriangleExclamation size={48} style={{ color: "var(--eco-text-secondary)", opacity: 0.5 }} />
                <Heading variant="heading-strong-m">No hay incidentes activos ni reportados</Heading>
                <Text variant="body-default-m" onBackground="neutral-weak" style={{ textAlign: "center", maxWidth: "50ch" }}>
                  La flota opera normalmente sin alertas viales ni fallas mecánicas registradas.
                </Text>
                <Button variant="primary" size="m" onClick={() => setModalIncidenteAbierto(true)}>
                  <FaPlus style={{ marginRight: 8 }} /> Reportar Incidente Manual
                </Button>
              </Column>
            </Card>
          )}

          <Grid columns="2" gap="16" fillWidth s={{ columns: 1 }}>
            {incidentes.map((inc) => (
              <Card key={inc.id} padding="l" radius="l" border="neutral-alpha-weak" background="surface">
                <Column gap="12">
                  <Row horizontal="between" vertical="center">
                    <Row gap="8" vertical="center">
                      <Heading variant="heading-strong-s">{inc.camion_id}</Heading>
                      <Tag size="s" border="neutral-alpha-weak">
                        {inc.tipo_incidente}
                      </Tag>
                    </Row>

                    <Row gap="xs" vertical="center">
                      <Button
                        size="s"
                        variant={inc.estado === "RESUELTO" ? "tertiary" : "secondary"}
                        onClick={() => toggleEstadoIncidente(inc.id, inc.estado)}
                      >
                        {inc.estado === "RESUELTO" ? "✓ Resuelto" : "Marcar Resuelto"}
                      </Button>
                      <IconButton
                        icon="close"
                        size="s"
                        variant="danger"
                        aria-label="Eliminar incidente"
                        onClick={() => eliminarIncidente(inc.id)}
                      />
                    </Row>
                  </Row>

                  <Text variant="body-default-m">{inc.descripcion}</Text>

                  <Row horizontal="between" vertical="center" borderTop="neutral-alpha-weak" paddingTop="8">
                    <Text variant="body-default-xs" onBackground="neutral-weak">
                      Operador: {inc.conductor_id}
                    </Text>
                    <Text variant="code-default-xs" onBackground="neutral-weak">
                      {new Date(inc.fecha).toLocaleString("es-MX")}
                    </Text>
                  </Row>
                </Column>
              </Card>
            ))}
          </Grid>
        </Column>
      )}

      {/* Contenido: Reclamos */}
      {tabActiva === "reclamos" && (
        <Column gap="16" fillWidth>
          {!cargando && reclamos.length === 0 && (
            <Card padding="xl" radius="l" border="neutral-alpha-weak" background="surface">
              <Column horizontal="center" vertical="center" gap="16" paddingY="xl">
                <FaBullhorn size={48} style={{ color: "var(--eco-text-secondary)", opacity: 0.5 }} />
                <Heading variant="heading-strong-m">No hay reclamos ciudadanos registrados</Heading>
                <Text variant="body-default-m" onBackground="neutral-weak" style={{ textAlign: "center", maxWidth: "50ch" }}>
                  Aún no se han recibido quejas vecinales de recolección en Gutiérrez Zamora.
                </Text>
                <Button variant="primary" size="m" onClick={() => setModalReclamoAbierto(true)}>
                  <FaPlus style={{ marginRight: 8 }} /> Registrar Nuevo Reclamo
                </Button>
              </Column>
            </Card>
          )}

          <Grid columns="2" gap="16" fillWidth s={{ columns: 1 }}>
            {reclamos.map((rec) => (
              <Card key={rec.id} padding="l" radius="l" border="neutral-alpha-weak" background="surface">
                <Column gap="12">
                  <Row horizontal="between" vertical="center">
                    <Row gap="8" vertical="center">
                      <Heading variant="heading-strong-s">{rec.ciudadano_nombre}</Heading>
                      <Tag size="s" border="neutral-alpha-weak">
                        {rec.tipo_reclamo}
                      </Tag>
                    </Row>

                    <Row gap="xs" vertical="center">
                      <select
                        value={rec.estado}
                        onChange={(e) => cambiarEstadoReclamo(rec.id, e.target.value)}
                        style={{
                          padding: "6px 10px",
                          borderRadius: "6px",
                          backgroundColor: "var(--page)",
                          color: "var(--foreground)",
                          border: "1px solid var(--neutral-alpha-weak)",
                          fontSize: "12px",
                        }}
                      >
                        <option value="PENDIENTE">Pendiente</option>
                        <option value="EN_REVISION">En Revisión</option>
                        <option value="RESUELTO">Resuelto</option>
                      </select>
                      <IconButton
                        icon="close"
                        size="s"
                        variant="danger"
                        aria-label="Eliminar reclamo"
                        onClick={() => eliminarReclamo(rec.id)}
                      />
                    </Row>
                  </Row>

                  <Text variant="body-default-m">{rec.descripcion}</Text>

                  {rec.fotografia_url && (
                    <Text variant="code-default-xs" style={{ color: "var(--eco-cyan-400)" }}>
                      Evidencia adjunta: {rec.fotografia_url}
                    </Text>
                  )}

                  <Row horizontal="between" vertical="center" borderTop="neutral-alpha-weak" paddingTop="8">
                    <Text variant="code-default-xs" onBackground="neutral-weak">
                      Fecha: {new Date(rec.fecha).toLocaleDateString("es-MX")}
                    </Text>
                    <Badge textVariant="code-default-xs">{rec.estado}</Badge>
                  </Row>
                </Column>
              </Card>
            ))}
          </Grid>
        </Column>
      )}

      {/* Modal Reportar Incidente */}
      {modalIncidenteAbierto && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.75)",
            backdropFilter: "blur(4px)",
            zIndex: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
        >
          <Card padding="l" radius="l" border="neutral-alpha-medium" background="surface" style={{ width: "100%", maxWidth: "500px" }}>
            <form onSubmit={registrarIncidente}>
              <Column gap="16">
                <Row horizontal="between" vertical="center">
                  <Heading variant="heading-strong-m">Reportar Incidente en Flota</Heading>
                  <Button variant="ghost" size="s" onClick={() => setModalIncidenteAbierto(false)}>
                    Cerrar
                  </Button>
                </Row>

                <Input
                  id="inc-camion"
                  label="Número Económico del Camión (ej. ECO-01)"
                  value={formIncidente.camion_id}
                  onChange={(e) => setFormIncidente({ ...formIncidente, camion_id: e.target.value })}
                  required
                />

                <Input
                  id="inc-conductor"
                  label="Conductor / Operador"
                  value={formIncidente.conductor_id}
                  onChange={(e) => setFormIncidente({ ...formIncidente, conductor_id: e.target.value })}
                />

                <Column gap="4">
                  <Text variant="label-default-xs" onBackground="neutral-weak">Tipo de Incidente:</Text>
                  <select
                    value={formIncidente.tipo_incidente}
                    onChange={(e) => setFormIncidente({ ...formIncidente, tipo_incidente: e.target.value })}
                    style={{
                      padding: "10px",
                      borderRadius: "8px",
                      backgroundColor: "var(--page)",
                      color: "var(--foreground)",
                      border: "1px solid var(--neutral-alpha-weak)",
                    }}
                  >
                    <option value="FALLA_MECANICA">Falla Mecánica</option>
                    <option value="BLOQUEO_VIAL">Bloqueo Vial / Calle Cerrada</option>
                    <option value="ACCIDENTE">Accidente / Colisión</option>
                    <option value="EXCESO_VELOCIDAD">Exceso de Velocidad Urbana</option>
                    <option value="OTRO">Otro Imprevisto</option>
                  </select>
                </Column>

                <Input
                  id="inc-desc"
                  label="Descripción Detallada del Suceso"
                  value={formIncidente.descripcion}
                  onChange={(e) => setFormIncidente({ ...formIncidente, descripcion: e.target.value })}
                  required
                />

                <Row horizontal="end" gap="8" marginTop="12">
                  <Button variant="ghost" size="s" onClick={() => setModalIncidenteAbierto(false)} type="button">
                    Cancelar
                  </Button>
                  <Button variant="primary" size="s" type="submit" disabled={enviando}>
                    {enviando ? "Guardando..." : "Registrar Incidente"}
                  </Button>
                </Row>
              </Column>
            </form>
          </Card>
        </div>
      )}

      {/* Modal Nuevo Reclamo */}
      {modalReclamoAbierto && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.75)",
            backdropFilter: "blur(4px)",
            zIndex: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
        >
          <Card padding="l" radius="l" border="neutral-alpha-medium" background="surface" style={{ width: "100%", maxWidth: "500px" }}>
            <form onSubmit={registrarReclamo}>
              <Column gap="16">
                <Row horizontal="between" vertical="center">
                  <Heading variant="heading-strong-m">Registrar Reclamo Ciudadano</Heading>
                  <Button variant="ghost" size="s" onClick={() => setModalReclamoAbierto(false)}>
                    Cerrar
                  </Button>
                </Row>

                <Input
                  id="rec-nombre"
                  label="Nombre del Ciudadano"
                  value={formReclamo.ciudadano_nombre}
                  onChange={(e) => setFormReclamo({ ...formReclamo, ciudadano_nombre: e.target.value })}
                  required
                />

                <Column gap="4">
                  <Text variant="label-default-xs" onBackground="neutral-weak">Tipo de Reclamo:</Text>
                  <select
                    value={formReclamo.tipo_reclamo}
                    onChange={(e) => setFormReclamo({ ...formReclamo, tipo_reclamo: e.target.value })}
                    style={{
                      padding: "10px",
                      borderRadius: "8px",
                      backgroundColor: "var(--page)",
                      color: "var(--foreground)",
                      border: "1px solid var(--neutral-alpha-weak)",
                    }}
                  >
                    <option value="CAMION_NO_PASO">El camión no pasó en su horario</option>
                    <option value="BASURA_TIRADA">Basura derramada en vía pública</option>
                    <option value="CONTENEDOR_DANADO">Contenedor fracturado o desbordado</option>
                    <option value="OTRO">Otro reporte vecinal</option>
                  </select>
                </Column>

                <Input
                  id="rec-desc"
                  label="Dirección y Descripción de la queja"
                  value={formReclamo.descripcion}
                  onChange={(e) => setFormReclamo({ ...formReclamo, descripcion: e.target.value })}
                  required
                />

                <Input
                  id="rec-foto"
                  label="URL Fotografía / Evidencia (opcional)"
                  value={formReclamo.fotografia_url}
                  onChange={(e) => setFormReclamo({ ...formReclamo, fotografia_url: e.target.value })}
                />

                <Row horizontal="end" gap="8" marginTop="12">
                  <Button variant="ghost" size="s" onClick={() => setModalReclamoAbierto(false)} type="button">
                    Cancelar
                  </Button>
                  <Button variant="primary" size="s" type="submit" disabled={enviando}>
                    {enviando ? "Guardando..." : "Registrar Reclamo"}
                  </Button>
                </Row>
              </Column>
            </form>
          </Card>
        </div>
      )}
    </Column>
  );
}
