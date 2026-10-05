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
  ProgressBar,
  Badge,
  Input,
  IconButton,
} from "@once-ui-system/core";
import { GiMineTruck } from "react-icons/gi";
import { FaPlus, FaTrash, FaPen, FaArrowsRotate } from "react-icons/fa6";

export interface ElementoCamion {
  id: string;
  numero_economico: string;
  placas: string;
  modelo: string;
  conductor: string;
  porcentaje_carga: number;
  estado: "EN_RUTA" | "EN_PAUSA" | "FUERA_DE_SERVICIO";
  nivel_combustible: number;
  velocidad_actual: number;
  ultima_actualizacion?: string;
}

export function VistaCamiones() {
  const [camiones, setCamiones] = useState<ElementoCamion[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [filtroEstado, setFiltroEstado] = useState<string>("Todos");

  // Estado del Modal de Registro
  const [modalRegistroAbierto, setModalRegistroAbierto] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [formCamion, setFormCamion] = useState({
    numero_economico: "",
    placas: "",
    modelo: "Freightliner M2 106 (Compactador)",
    conductor_asignado: "Sin asignar",
    estado: "EN_PAUSA",
  });

  // Estado del Modal de Edición
  const [camionAEditar, setCamionAEditar] = useState<ElementoCamion | null>(null);

  const cargarCamiones = useCallback(async () => {
    setCargando(true);
    try {
      const res = await fetch("/api/v1/camiones", { cache: "no-store" });
      const data = await res.json();
      if (data.exito && Array.isArray(data.camiones)) {
        setCamiones(data.camiones);
      } else {
        setCamiones([]);
      }
    } catch (err) {
      console.error("Error al cargar camiones:", err);
      setCamiones([]);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarCamiones();
  }, [cargarCamiones]);

  const registrarCamion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCamion.numero_economico || !formCamion.placas) return;
    setGuardando(true);
    try {
      const res = await fetch("/api/v1/camiones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formCamion),
      });
      const data = await res.json();
      if (data.exito) {
        setModalRegistroAbierto(false);
        setFormCamion({
          numero_economico: "",
          placas: "",
          modelo: "Freightliner M2 106 (Compactador)",
          conductor_asignado: "Sin asignar",
          estado: "EN_PAUSA",
        });
        await cargarCamiones();
      } else {
        alert(data.error || "Error al registrar el camión.");
      }
    } catch (err: any) {
      alert(`Error de conexión: ${err.message}`);
    } finally {
      setGuardando(false);
    }
  };

  const guardarEdicion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!camionAEditar) return;
    setGuardando(true);
    try {
      const res = await fetch("/api/v1/camiones", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: camionAEditar.id,
          numero_economico: camionAEditar.numero_economico,
          placas: camionAEditar.placas,
          modelo: camionAEditar.modelo,
          conductor_asignado: camionAEditar.conductor,
          estado: camionAEditar.estado,
          nivel_combustible: camionAEditar.nivel_combustible,
          porcentaje_carga: camionAEditar.porcentaje_carga,
        }),
      });
      const data = await res.json();
      if (data.exito) {
        setCamionAEditar(null);
        await cargarCamiones();
      } else {
        alert(data.error || "Error al actualizar camión.");
      }
    } catch (err: any) {
      alert(`Error de red: ${err.message}`);
    } finally {
      setGuardando(false);
    }
  };

  const eliminarCamion = async (id: string, numeroEconomico: string) => {
    const confirmacion = window.confirm(`¿Estás seguro de que deseas eliminar permanentemente el camión ${numeroEconomico}?`);
    if (!confirmacion) return;
    try {
      const res = await fetch(`/api/v1/camiones?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.exito) {
        await cargarCamiones();
      } else {
        alert(data.error || "No se pudo eliminar el camión.");
      }
    } catch (err: any) {
      alert(`Error al eliminar: ${err.message}`);
    }
  };

  const camionesFiltrados =
    filtroEstado === "Todos"
      ? camiones
      : camiones.filter((c) => c.estado === filtroEstado);

  return (
    <Column gap="24" fillWidth>
      {/* Encabezado y Acciones */}
      <Row fillWidth horizontal="between" vertical="center" gap="16" wrap>
        <Column gap="4">
          <Row gap="8" vertical="center">
            <GiMineTruck size={32} style={{ color: "var(--eco-cyan-400)" }} />
            <Heading variant="display-strong-s" onBackground="neutral-strong">
              Gestión de Flota: Camiones Compactadores
            </Heading>
            <Badge textVariant="code-default-s" border="neutral-alpha-medium">
              {camiones.length} Registrados
            </Badge>
          </Row>
          <Text variant="body-default-m" onBackground="neutral-medium">
            Supervisa, registra, edita y administra los vehículos de recolección de Gutiérrez Zamora.
          </Text>
        </Column>

        <Row gap="8" vertical="center" wrap>
          <Button variant="ghost" size="s" onClick={cargarCamiones}>
            <Row gap="8" vertical="center">
              <FaArrowsRotate size={13} />
              <Text>Actualizar</Text>
            </Row>
          </Button>
          <Button variant="primary" size="s" onClick={() => setModalRegistroAbierto(true)}>
            <Row gap="8" vertical="center">
              <FaPlus size={13} />
              <Text>Registrar Camión</Text>
            </Row>
          </Button>
        </Row>
      </Row>

      {/* Barra de Filtros */}
      <Row gap="8" fillWidth wrap vertical="center">
        <Text variant="label-default-xs" onBackground="neutral-weak">Filtrar por estado:</Text>
        {["Todos", "EN_RUTA", "EN_PAUSA", "FUERA_DE_SERVICIO"].map((estado) => (
          <Button
            key={estado}
            size="s"
            variant={filtroEstado === estado ? "primary" : "tertiary"}
            onClick={() => setFiltroEstado(estado)}
          >
            {estado === "Todos"
              ? "Todos los vehículos"
              : estado === "EN_RUTA"
              ? "En Ruta"
              : estado === "EN_PAUSA"
              ? "En Pausa"
              : "Fuera de Servicio"}
          </Button>
        ))}
      </Row>

      {/* Estado Vacío */}
      {!cargando && camiones.length === 0 && (
        <Card padding="xl" radius="l" border="neutral-alpha-weak" background="surface">
          <Column horizontal="center" vertical="center" gap="16" paddingY="xl">
            <GiMineTruck size={54} style={{ color: "var(--eco-text-secondary)", opacity: 0.5 }} />
            <Heading variant="heading-strong-m">No hay camiones registrados en la flota</Heading>
            <Text variant="body-default-m" onBackground="neutral-weak" style={{ textAlign: "center", maxWidth: "50ch" }}>
              Aún no has agregado ningún vehículo de recolección. Utiliza el botón superior para dar de alta tu primera unidad municipal.
            </Text>
            <Button variant="primary" size="m" onClick={() => setModalRegistroAbierto(true)}>
              <FaPlus style={{ marginRight: 8 }} /> Agregar Primer Camión
            </Button>
          </Column>
        </Card>
      )}

      {/* Grid de Camiones */}
      <Grid columns="2" gap="16" fillWidth s={{ columns: 1 }}>
        {camionesFiltrados.map((camion) => (
          <Card key={camion.id} padding="l" radius="l" border="neutral-alpha-weak" background="surface">
            <Column gap="16">
              {/* Cabecera de la Unidad */}
              <Row horizontal="between" vertical="center">
                <Column gap="2">
                  <Row gap="8" vertical="center">
                    <Heading variant="heading-strong-m" onBackground="neutral-strong">
                      {camion.numero_economico}
                    </Heading>
                    <Badge textVariant="code-default-s" border="neutral-alpha-weak">
                      {camion.placas}
                    </Badge>
                  </Row>
                  <Text variant="body-default-xs" onBackground="neutral-weak">
                    {camion.modelo}
                  </Text>
                </Column>

                <Row gap="xs" vertical="center">
                  <Tag
                    size="s"
                    border="neutral-alpha-weak"
                    style={{
                      color:
                        camion.estado === "EN_RUTA"
                          ? "var(--eco-cyan-400)"
                          : camion.estado === "EN_PAUSA"
                          ? "var(--eco-amber-400)"
                          : "var(--eco-rose-400)",
                    }}
                  >
                    {camion.estado === "EN_RUTA"
                      ? "En Ruta"
                      : camion.estado === "EN_PAUSA"
                      ? "En Pausa"
                      : "Fuera de Servicio"}
                  </Tag>
                  <Button
                    size="s"
                    variant="tertiary"
                    onClick={() => setCamionAEditar(camion)}
                  >
                    <FaPen size={12} />
                  </Button>
                  <Button
                    size="s"
                    variant="danger"
                    onClick={() => eliminarCamion(camion.id, camion.numero_economico)}
                  >
                    <FaTrash size={12} />
                  </Button>
                </Row>
              </Row>

              {/* Conductor Asignado y Velocidad */}
              <Row horizontal="between" vertical="center" padding="s" radius="m" background="page">
                <Column gap="2">
                  <Text variant="label-default-xs" onBackground="neutral-weak">Conductor Asignado:</Text>
                  <Text variant="body-strong-s">{camion.conductor || "Sin asignar"}</Text>
                </Column>
                <Column gap="2" horizontal="end">
                  <Text variant="label-default-xs" onBackground="neutral-weak">Velocidad GPS:</Text>
                  <Text variant="code-default-s">{camion.velocidad_actual || 0} km/h</Text>
                </Column>
              </Row>

              {/* Métricas de Combustible y Carga */}
              <Grid columns="2" gap="12">
                <Column gap="4">
                  <Row horizontal="between">
                    <Text variant="label-default-xs" onBackground="neutral-weak">Nivel Combustible:</Text>
                    <Text variant="code-default-xs">{camion.nivel_combustible || 100}%</Text>
                  </Row>
                  <ProgressBar value={camion.nivel_combustible || 100} />
                </Column>
                <Column gap="4">
                  <Row horizontal="between">
                    <Text variant="label-default-xs" onBackground="neutral-weak">Capacidad Carga:</Text>
                    <Text variant="code-default-xs">{camion.porcentaje_carga || 0}%</Text>
                  </Row>
                  <ProgressBar value={camion.porcentaje_carga || 0} />
                </Column>
              </Grid>
            </Column>
          </Card>
        ))}
      </Grid>

      {/* Modal / Panel Flotante para Registrar Camión */}
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
            <form onSubmit={registrarCamion}>
              <Column gap="16">
                <Row horizontal="between" vertical="center">
                  <Heading variant="heading-strong-m">Registrar Nueva Unidad</Heading>
                  <Button variant="ghost" size="s" onClick={() => setModalRegistroAbierto(false)}>
                    Cerrar
                  </Button>
                </Row>

                <Input
                  id="reg-num"
                  label="Número Económico (ej. ECO-01)"
                  value={formCamion.numero_economico}
                  onChange={(e) => setFormCamion({ ...formCamion, numero_economico: e.target.value })}
                  required
                />

                <Input
                  id="reg-placas"
                  label="Placas (ej. XZ-4821-A)"
                  value={formCamion.placas}
                  onChange={(e) => setFormCamion({ ...formCamion, placas: e.target.value })}
                  required
                />

                <Input
                  id="reg-modelo"
                  label="Modelo del Camión"
                  value={formCamion.modelo}
                  onChange={(e) => setFormCamion({ ...formCamion, modelo: e.target.value })}
                />

                <Input
                  id="reg-conductor"
                  label="Conductor Asignado"
                  value={formCamion.conductor_asignado}
                  onChange={(e) => setFormCamion({ ...formCamion, conductor_asignado: e.target.value })}
                />

                <Column gap="4">
                  <Text variant="label-default-xs" onBackground="neutral-weak">Estado Inicial:</Text>
                  <select
                    value={formCamion.estado}
                    onChange={(e) => setFormCamion({ ...formCamion, estado: e.target.value })}
                    style={{
                      padding: "10px",
                      borderRadius: "8px",
                      backgroundColor: "var(--page)",
                      color: "var(--foreground)",
                      border: "1px solid var(--neutral-alpha-weak)",
                    }}
                  >
                    <option value="EN_RUTA">En Ruta</option>
                    <option value="EN_PAUSA">En Pausa</option>
                    <option value="FUERA_DE_SERVICIO">Fuera de Servicio</option>
                  </select>
                </Column>

                <Row horizontal="end" gap="8" marginTop="12">
                  <Button variant="ghost" size="s" onClick={() => setModalRegistroAbierto(false)} type="button">
                    Cancelar
                  </Button>
                  <Button variant="primary" size="s" type="submit" disabled={guardando}>
                    {guardando ? "Guardando..." : "Guardar Camión"}
                  </Button>
                </Row>
              </Column>
            </form>
          </Card>
        </div>
      )}

      {/* Modal para Editar Camión */}
      {camionAEditar && (
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
                  <Heading variant="heading-strong-m">Editar Camión {camionAEditar.numero_economico}</Heading>
                  <Button variant="ghost" size="s" onClick={() => setCamionAEditar(null)}>
                    Cerrar
                  </Button>
                </Row>

                <Input
                  id="edit-num"
                  label="Número Económico"
                  value={camionAEditar.numero_economico}
                  onChange={(e) => setCamionAEditar({ ...camionAEditar, numero_economico: e.target.value })}
                  required
                />

                <Input
                  id="edit-placas"
                  label="Placas"
                  value={camionAEditar.placas}
                  onChange={(e) => setCamionAEditar({ ...camionAEditar, placas: e.target.value })}
                  required
                />

                <Input
                  id="edit-modelo"
                  label="Modelo del Camión"
                  value={camionAEditar.modelo}
                  onChange={(e) => setCamionAEditar({ ...camionAEditar, modelo: e.target.value })}
                />

                <Input
                  id="edit-conductor"
                  label="Conductor Asignado"
                  value={camionAEditar.conductor}
                  onChange={(e) => setCamionAEditar({ ...camionAEditar, conductor: e.target.value })}
                />

                <Column gap="4">
                  <Text variant="label-default-xs" onBackground="neutral-weak">Estado:</Text>
                  <select
                    value={camionAEditar.estado}
                    onChange={(e) => setCamionAEditar({ ...camionAEditar, estado: e.target.value as any })}
                    style={{
                      padding: "10px",
                      borderRadius: "8px",
                      backgroundColor: "var(--page)",
                      color: "var(--foreground)",
                      border: "1px solid var(--neutral-alpha-weak)",
                    }}
                  >
                    <option value="EN_RUTA">En Ruta</option>
                    <option value="EN_PAUSA">En Pausa</option>
                    <option value="FUERA_DE_SERVICIO">Fuera de Servicio</option>
                  </select>
                </Column>

                <Row horizontal="end" gap="8" marginTop="12">
                  <Button variant="ghost" size="s" onClick={() => setCamionAEditar(null)} type="button">
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
