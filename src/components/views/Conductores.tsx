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
  Tag,
  Badge,
  Input,
  IconButton,
} from "@once-ui-system/core";
import { PiSteeringWheelFill } from "react-icons/pi";
import { FaPlus, FaTrash, FaPen, FaArrowsRotate } from "react-icons/fa6";

export interface ElementoConductor {
  id: string;
  nombre: string;
  licencia: string;
  turno: "Matutino" | "Vespertino" | "Nocturno";
  camionAsignado: string;
  rutaActual: string;
  puntuacionEcologica: number;
  telefono: string;
  estado: "En Servicio" | "Disponible" | "Descanso";
}

export function VistaConductores() {
  const [conductores, setConductores] = useState<ElementoConductor[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [filtroEstado, setFiltroEstado] = useState<string>("Todos");

  // Modal Registro
  const [modalRegistroAbierto, setModalRegistroAbierto] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [formConductor, setFormConductor] = useState({
    nombre: "",
    licencia: "",
    turno: "Matutino",
    telefono: "",
    camion_asignado: "Sin asignar",
    estado: "Disponible",
  });

  // Modal Edición
  const [conductorAEditar, setConductorAEditar] = useState<ElementoConductor | null>(null);

  const cargarConductores = useCallback(async () => {
    setCargando(true);
    try {
      const res = await fetch("/api/v1/conductores", { cache: "no-store" });
      const data = await res.json();
      if (data.exito && Array.isArray(data.conductores)) {
        setConductores(data.conductores);
      } else {
        setConductores([]);
      }
    } catch (err) {
      console.error("Error al cargar conductores:", err);
      setConductores([]);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarConductores();
  }, [cargarConductores]);

  const registrarConductor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formConductor.nombre || !formConductor.licencia) return;
    setGuardando(true);
    try {
      const res = await fetch("/api/v1/conductores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formConductor),
      });
      const data = await res.json();
      if (data.exito) {
        setModalRegistroAbierto(false);
        setFormConductor({
          nombre: "",
          licencia: "",
          turno: "Matutino",
          telefono: "",
          camion_asignado: "Sin asignar",
          estado: "Disponible",
        });
        await cargarConductores();
      } else {
        alert(data.error || "Error al registrar el conductor.");
      }
    } catch (err: any) {
      alert(`Error de conexión: ${err.message}`);
    } finally {
      setGuardando(false);
    }
  };

  const guardarEdicion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!conductorAEditar) return;
    setGuardando(true);
    try {
      const res = await fetch("/api/v1/conductores", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: conductorAEditar.id,
          nombre: conductorAEditar.nombre,
          licencia: conductorAEditar.licencia,
          turno: conductorAEditar.turno,
          telefono: conductorAEditar.telefono,
          camion_asignado: conductorAEditar.camionAsignado,
          estado: conductorAEditar.estado,
        }),
      });
      const data = await res.json();
      if (data.exito) {
        setConductorAEditar(null);
        await cargarConductores();
      } else {
        alert(data.error || "Error al actualizar conductor.");
      }
    } catch (err: any) {
      alert(`Error de red: ${err.message}`);
    } finally {
      setGuardando(false);
    }
  };

  const eliminarConductor = async (id: string, nombre: string) => {
    const confirmacion = window.confirm(`¿Estás seguro de que deseas eliminar al conductor ${nombre}?`);
    if (!confirmacion) return;
    try {
      const res = await fetch(`/api/v1/conductores?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.exito) {
        await cargarConductores();
      } else {
        alert(data.error || "No se pudo eliminar el conductor.");
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  const conductoresFiltrados =
    filtroEstado === "Todos"
      ? conductores
      : conductores.filter((c) => c.estado === filtroEstado);

  return (
    <Column gap="24" fillWidth>
      {/* Encabezado y Acciones */}
      <Row fillWidth horizontal="between" vertical="center" gap="16" wrap>
        <Column gap="4">
          <Row gap="8" vertical="center">
            <PiSteeringWheelFill size={32} style={{ color: "var(--eco-cyan-400)" }} />
            <Heading variant="display-strong-s" onBackground="neutral-strong">
              Padrón de Conductores y Operadores
            </Heading>
            <Badge textVariant="code-default-s" border="neutral-alpha-medium">
              {conductores.length} Registrados
            </Badge>
          </Row>
          <Text variant="body-default-m" onBackground="neutral-medium">
            Supervisión del personal operativo, licencias, asignación de cuadrantes y turnos municipales.
          </Text>
        </Column>

        <Row gap="8" vertical="center" wrap>
          <Button variant="ghost" size="s" onClick={cargarConductores}>
            <Row gap="8" vertical="center">
              <FaArrowsRotate size={13} />
              <Text>Actualizar</Text>
            </Row>
          </Button>
          <Button variant="primary" size="s" onClick={() => setModalRegistroAbierto(true)}>
            <Row gap="8" vertical="center">
              <FaPlus size={13} />
              <Text>Registrar Conductor</Text>
            </Row>
          </Button>
        </Row>
      </Row>

      {/* Filtros */}
      <Row gap="8" fillWidth wrap vertical="center">
        <Text variant="label-default-xs" onBackground="neutral-weak">Filtrar por estado:</Text>
        {["Todos", "En Servicio", "Disponible", "Descanso"].map((estado) => (
          <Button
            key={estado}
            size="s"
            variant={filtroEstado === estado ? "primary" : "tertiary"}
            onClick={() => setFiltroEstado(estado)}
          >
            {estado}
          </Button>
        ))}
      </Row>

      {/* Estado Vacío */}
      {!cargando && conductores.length === 0 && (
        <Card padding="xl" radius="l" border="neutral-alpha-weak" background="surface">
          <Column horizontal="center" vertical="center" gap="16" paddingY="xl">
            <PiSteeringWheelFill size={54} style={{ color: "var(--eco-text-secondary)", opacity: 0.5 }} />
            <Heading variant="heading-strong-m">No hay conductores registrados</Heading>
            <Text variant="body-default-m" onBackground="neutral-weak" style={{ textAlign: "center", maxWidth: "50ch" }}>
              Aún no has registrado conductores u operadores de camiones compactadores. Utiliza el botón superior para agregar el primer miembro del equipo.
            </Text>
            <Button variant="primary" size="m" onClick={() => setModalRegistroAbierto(true)}>
              <FaPlus style={{ marginRight: 8 }} /> Registrar Primer Conductor
            </Button>
          </Column>
        </Card>
      )}

      {/* Grid de Conductores */}
      <Grid columns="2" gap="16" fillWidth s={{ columns: 1 }}>
        {conductoresFiltrados.map((conductor) => (
          <Card key={conductor.id} padding="l" radius="l" border="neutral-alpha-weak" background="surface">
            <Column gap="16">
              <Row horizontal="between" vertical="center">
                <Column gap="2">
                  <Row gap="8" vertical="center">
                    <Heading variant="heading-strong-m" onBackground="neutral-strong">
                      {conductor.nombre}
                    </Heading>
                    <Badge textVariant="code-default-s" border="neutral-alpha-weak">
                      {conductor.licencia}
                    </Badge>
                  </Row>
                  <Text variant="body-default-xs" onBackground="neutral-weak">
                    Turno: {conductor.turno} · Tel: {conductor.telefono || "No especificado"}
                  </Text>
                </Column>

                <Row gap="xs" vertical="center">
                  <Tag
                    size="s"
                    border="neutral-alpha-weak"
                    style={{
                      color:
                        conductor.estado === "En Servicio"
                          ? "var(--eco-cyan-400)"
                          : conductor.estado === "Disponible"
                          ? "var(--eco-emerald-400)"
                          : "var(--eco-text-secondary)",
                    }}
                  >
                    {conductor.estado}
                  </Tag>
                  <Button
                    size="s"
                    variant="tertiary"
                    onClick={() => setConductorAEditar(conductor)}
                  >
                    <FaPen size={12} />
                  </Button>
                  <Button
                    size="s"
                    variant="danger"
                    onClick={() => eliminarConductor(conductor.id, conductor.nombre)}
                  >
                    <FaTrash size={12} />
                  </Button>
                </Row>
              </Row>

              <Row horizontal="between" vertical="center" padding="s" radius="m" background="page">
                <Column gap="2">
                  <Text variant="label-default-xs" onBackground="neutral-weak">Camión Asignado:</Text>
                  <Text variant="body-strong-s">{conductor.camionAsignado || "Sin asignar"}</Text>
                </Column>
                <Column gap="2" horizontal="end">
                  <Text variant="label-default-xs" onBackground="neutral-weak">Ruta Asignada:</Text>
                  <Text variant="body-strong-s">{conductor.rutaActual || "Sin ruta asignada"}</Text>
                </Column>
              </Row>
            </Column>
          </Card>
        ))}
      </Grid>

      {/* Modal Registrar Conductor */}
      {modalRegistroAbierto && (
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
            <form onSubmit={registrarConductor}>
              <Column gap="16">
                <Row horizontal="between" vertical="center">
                  <Heading variant="heading-strong-m">Registrar Conductor Municipal</Heading>
                  <Button variant="ghost" size="s" onClick={() => setModalRegistroAbierto(false)}>
                    Cerrar
                  </Button>
                </Row>

                <Input
                  id="reg-cond-nombre"
                  label="Nombre Completo"
                  value={formConductor.nombre}
                  onChange={(e) => setFormConductor({ ...formConductor, nombre: e.target.value })}
                  required
                />

                <Input
                  id="reg-cond-lic"
                  label="Número de Licencia (ej. LIC-FED-8842)"
                  value={formConductor.licencia}
                  onChange={(e) => setFormConductor({ ...formConductor, licencia: e.target.value })}
                  required
                />

                <Input
                  id="reg-cond-tel"
                  label="Teléfono de Contacto"
                  value={formConductor.telefono}
                  onChange={(e) => setFormConductor({ ...formConductor, telefono: e.target.value })}
                />

                <Input
                  id="reg-cond-camion"
                  label="Camión Asignado (opcional)"
                  value={formConductor.camion_asignado}
                  onChange={(e) => setFormConductor({ ...formConductor, camion_asignado: e.target.value })}
                />

                <Row gap="12">
                  <Column gap="4" fillWidth>
                    <Text variant="label-default-xs" onBackground="neutral-weak">Turno:</Text>
                    <select
                      value={formConductor.turno}
                      onChange={(e) => setFormConductor({ ...formConductor, turno: e.target.value })}
                      style={{
                        padding: "10px",
                        borderRadius: "8px",
                        backgroundColor: "var(--page)",
                        color: "var(--foreground)",
                        border: "1px solid var(--neutral-alpha-weak)",
                      }}
                    >
                      <option value="Matutino">Matutino</option>
                      <option value="Vespertino">Vespertino</option>
                      <option value="Nocturno">Nocturno</option>
                    </select>
                  </Column>

                  <Column gap="4" fillWidth>
                    <Text variant="label-default-xs" onBackground="neutral-weak">Estado:</Text>
                    <select
                      value={formConductor.estado}
                      onChange={(e) => setFormConductor({ ...formConductor, estado: e.target.value })}
                      style={{
                        padding: "10px",
                        borderRadius: "8px",
                        backgroundColor: "var(--page)",
                        color: "var(--foreground)",
                        border: "1px solid var(--neutral-alpha-weak)",
                      }}
                    >
                      <option value="En Servicio">En Servicio</option>
                      <option value="Disponible">Disponible</option>
                      <option value="Descanso">Descanso</option>
                    </select>
                  </Column>
                </Row>

                <Row horizontal="end" gap="8" marginTop="12">
                  <Button variant="ghost" size="s" onClick={() => setModalRegistroAbierto(false)} type="button">
                    Cancelar
                  </Button>
                  <Button variant="primary" size="s" type="submit" disabled={guardando}>
                    {guardando ? "Guardando..." : "Guardar Conductor"}
                  </Button>
                </Row>
              </Column>
            </form>
          </Card>
        </div>
      )}

      {/* Modal Editar Conductor */}
      {conductorAEditar && (
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
            <form onSubmit={guardarEdicion}>
              <Column gap="16">
                <Row horizontal="between" vertical="center">
                  <Heading variant="heading-strong-m">Editar Conductor</Heading>
                  <Button variant="ghost" size="s" onClick={() => setConductorAEditar(null)}>
                    Cerrar
                  </Button>
                </Row>

                <Input
                  id="edit-cond-nombre"
                  label="Nombre Completo"
                  value={conductorAEditar.nombre}
                  onChange={(e) => setConductorAEditar({ ...conductorAEditar, nombre: e.target.value })}
                  required
                />

                <Input
                  id="edit-cond-lic"
                  label="Licencia"
                  value={conductorAEditar.licencia}
                  onChange={(e) => setConductorAEditar({ ...conductorAEditar, licencia: e.target.value })}
                  required
                />

                <Input
                  id="edit-cond-tel"
                  label="Teléfono"
                  value={conductorAEditar.telefono}
                  onChange={(e) => setConductorAEditar({ ...conductorAEditar, telefono: e.target.value })}
                />

                <Input
                  id="edit-cond-camion"
                  label="Camión Asignado"
                  value={conductorAEditar.camionAsignado}
                  onChange={(e) => setConductorAEditar({ ...conductorAEditar, camionAsignado: e.target.value })}
                />

                <Row gap="12">
                  <Column gap="4" fillWidth>
                    <Text variant="label-default-xs" onBackground="neutral-weak">Turno:</Text>
                    <select
                      value={conductorAEditar.turno}
                      onChange={(e) => setConductorAEditar({ ...conductorAEditar, turno: e.target.value as any })}
                      style={{
                        padding: "10px",
                        borderRadius: "8px",
                        backgroundColor: "var(--page)",
                        color: "var(--foreground)",
                        border: "1px solid var(--neutral-alpha-weak)",
                      }}
                    >
                      <option value="Matutino">Matutino</option>
                      <option value="Vespertino">Vespertino</option>
                      <option value="Nocturno">Nocturno</option>
                    </select>
                  </Column>

                  <Column gap="4" fillWidth>
                    <Text variant="label-default-xs" onBackground="neutral-weak">Estado:</Text>
                    <select
                      value={conductorAEditar.estado}
                      onChange={(e) => setConductorAEditar({ ...conductorAEditar, estado: e.target.value as any })}
                      style={{
                        padding: "10px",
                        borderRadius: "8px",
                        backgroundColor: "var(--page)",
                        color: "var(--foreground)",
                        border: "1px solid var(--neutral-alpha-weak)",
                      }}
                    >
                      <option value="En Servicio">En Servicio</option>
                      <option value="Disponible">Disponible</option>
                      <option value="Descanso">Descanso</option>
                    </select>
                  </Column>
                </Row>

                <Row horizontal="end" gap="8" marginTop="12">
                  <Button variant="ghost" size="s" onClick={() => setConductorAEditar(null)} type="button">
                    Cancelar
                  </Button>
                  <Button variant="primary" size="s" type="submit" disabled={guardando}>
                    {guardando ? "Guardando..." : "Guardar Cambios"}
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
