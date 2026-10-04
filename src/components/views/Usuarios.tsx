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
  Avatar,
  StatusIndicator,
} from "@once-ui-system/core";
import { BsPersonFillGear } from "react-icons/bs";
import {
  FaXmark,
  FaUserPlus,
  FaCircleCheck,
  FaCircleXmark,
  FaArrowsRotate,
  FaShieldHalved,
} from "react-icons/fa6";

export interface ElementoUsuario {
  id: string;
  clerkId: string;
  nombre: string;
  email: string;
  rol: "SUPER_ADMIN" | "DIRECTOR_OBRAS" | "OPERADOR" | "CONDUCTOR" | "CIUDADANO";
  departamento: string;
  placasVehiculo?: string;
  estado: "Activo" | "Inactivo";
  ultimoAcceso: string;
  avatarUrl?: string;
}

const rolesDisponibles = [
  { valor: "SUPER_ADMIN", etiqueta: "🏛️ Super Administrador" },
  { valor: "DIRECTOR_OBRAS", etiqueta: "📐 Director de Obras" },
  { valor: "OPERADOR", etiqueta: "📡 Operador / Despachador" },
  { valor: "CONDUCTOR", etiqueta: "🚛 Conductor de Camión" },
  { valor: "CIUDADANO", etiqueta: "👤 Ciudadano" },
];

const estadoFormVacio = {
  nombre: "",
  apellidos: "",
  correo: "",
  nombreUsuario: "",
  contrasena: "",
  rol: "OPERADOR",
  departamento: "Obras Públicas y Limpia",
};

export function VistaUsuarios() {
  const [usuarios, setUsuarios] = useState<ElementoUsuario[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [errorCarga, setErrorCarga] = useState<string | null>(null);

  const [filtroRol, setFiltroRol] = useState<string>("Todos");
  const [mostrarModalCrear, setMostrarModalCrear] = useState(false);
  const [formNuevoUsuario, setFormNuevoUsuario] = useState(estadoFormVacio);
  const [creando, setCreando] = useState(false);
  const [resultadoCreacion, setResultadoCreacion] = useState<{ ok: boolean; mensaje: string } | null>(null);

  // Modal para editar rol en MongoDB
  const [usuarioAEditar, setUsuarioAEditar] = useState<ElementoUsuario | null>(null);
  const [nuevoRolEdit, setNuevoRolEdit] = useState<string>("OPERADOR");
  const [nuevoDeptoEdit, setNuevoDeptoEdit] = useState<string>("");
  const [guardandoRol, setGuardandoRol] = useState(false);
  const [mensajeRol, setMensajeRol] = useState<{ ok: boolean; texto: string } | null>(null);

  // Cargar usuarios reales desde Clerk + Mongo
  const cargarUsuarios = useCallback(async () => {
    setCargando(true);
    setErrorCarga(null);
    try {
      const res = await fetch("/api/v1/usuarios", { cache: "no-store" });
      const data = await res.json();
      if (res.ok && data.ok) {
        setUsuarios(data.usuarios || []);
      } else {
        setErrorCarga(data.error || "No se pudieron obtener los usuarios de Clerk.");
      }
    } catch (err: any) {
      setErrorCarga(`Error de conexión con la API: ${err.message}`);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarUsuarios();
  }, [cargarUsuarios]);

  const usuariosFiltrados =
    filtroRol === "Todos"
      ? usuarios
      : usuarios.filter((u) => u.rol === filtroRol);

  const actualizarCampo = (campo: string, valor: string) => {
    setFormNuevoUsuario((prev) => ({ ...prev, [campo]: valor }));
  };

  const abrirModalCrear = () => {
    setFormNuevoUsuario(estadoFormVacio);
    setResultadoCreacion(null);
    setMostrarModalCrear(true);
  };

  const cerrarModalCrear = () => {
    setMostrarModalCrear(false);
    setResultadoCreacion(null);
  };

  // Crear usuario en Clerk y persistir rol en Mongo
  const crearUsuario = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreando(true);
    setResultadoCreacion(null);

    try {
      const respuesta = await fetch("/api/v1/usuarios/crear", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formNuevoUsuario),
      });

      const datos = await respuesta.json();

      if (respuesta.ok && datos.ok) {
        setResultadoCreacion({
          ok: true,
          mensaje: `✓ Usuario creado con éxito en Clerk (ID: ${datos.clerkId}). Guardado en MongoDB.`,
        });
        setFormNuevoUsuario(estadoFormVacio);
        await cargarUsuarios();
      } else {
        setResultadoCreacion({
          ok: false,
          mensaje: datos.error || "Error al crear el usuario en Clerk.",
        });
      }
    } catch (err: any) {
      setResultadoCreacion({ ok: false, mensaje: `Error de red: ${err.message}` });
    } finally {
      setCreando(false);
    }
  };

  // Abrir modal de editar rol
  const abrirEditarRol = (usuario: ElementoUsuario) => {
    setUsuarioAEditar(usuario);
    setNuevoRolEdit(usuario.rol);
    setNuevoDeptoEdit(usuario.departamento || "");
    setMensajeRol(null);
  };

  // Guardar cambio de rol en MongoDB
  const guardarCambioRol = async () => {
    if (!usuarioAEditar) return;
    setGuardandoRol(true);
    setMensajeRol(null);

    try {
      const res = await fetch("/api/v1/usuarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clerkId: usuarioAEditar.clerkId,
          email: usuarioAEditar.email,
          rol: nuevoRolEdit,
          departamento: nuevoDeptoEdit,
        }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setMensajeRol({ ok: true, texto: "¡Rol actualizado y guardado en MongoDB con éxito!" });
        await cargarUsuarios();
        setTimeout(() => setUsuarioAEditar(null), 1200);
      } else {
        setMensajeRol({ ok: false, texto: data.error || "Error al actualizar rol en la base de datos." });
      }
    } catch (err: any) {
      setMensajeRol({ ok: false, texto: `Error de red: ${err.message}` });
    } finally {
      setGuardandoRol(false);
    }
  };

  return (
    <Column gap="24" fillWidth>
      {/* Encabezado */}
      <Row fillWidth horizontal="between" vertical="center" gap="16" wrap>
        <Column gap="4">
          <Heading variant="display-strong-s" onBackground="neutral-strong">
            Directorio de Usuarios y Acceso
          </Heading>
          <Text variant="body-default-m" onBackground="neutral-medium">
            Gestión sincronizada en tiempo real con <strong>Clerk Authentication</strong> y base de datos <strong>MongoDB Atlas</strong>.
          </Text>
        </Column>

        <Row gap="12" vertical="center">
          <Button
            variant="ghost"
            size="s"
            onClick={() => cargarUsuarios()}
            disabled={cargando}
            title="Recargar usuarios desde Clerk"
          >
            <Row gap="8" vertical="center">
              <FaArrowsRotate size={13} />
              <Text>{cargando ? "Sincronizando..." : "Sincronizar"}</Text>
            </Row>
          </Button>

          <Button variant="primary" size="s" onClick={abrirModalCrear}>
            <Row gap="8" vertical="center">
              <FaUserPlus size={14} />
              <Text>Agregar Usuario</Text>
            </Row>
          </Button>
        </Row>
      </Row>

      {/* Métricas rápidas */}
      <Grid columns="3" gap="16" fillWidth s={{ columns: 1 }}>
        <Card padding="20" radius="l" border="neutral-medium" direction="row" vertical="center" gap="16">
          <BsPersonFillGear size={32} color="#30D158" />
          <Column gap="2">
            <Text variant="label-default-s" onBackground="neutral-medium">Total de Cuentas en Clerk</Text>
            <Heading variant="heading-strong-l">{usuarios.length} Cuentas</Heading>
          </Column>
        </Card>

        <Card padding="20" radius="l" border="neutral-medium" direction="column" gap="4">
          <Row horizontal="between" vertical="center">
            <Text variant="label-default-s" onBackground="neutral-medium">Administradores</Text>
            <Tag scheme="brand" size="s">Privilegiado</Tag>
          </Row>
          <Heading variant="heading-strong-l">
            {usuarios.filter((u) => u.rol === "SUPER_ADMIN").length} Super Admin
          </Heading>
        </Card>

        <Card padding="20" radius="l" border="neutral-medium" direction="column" gap="4">
          <Row horizontal="between" vertical="center">
            <Text variant="label-default-s" onBackground="neutral-medium">Operadores y Conductores</Text>
            <Tag scheme="neutral" size="s">En campo</Tag>
          </Row>
          <Heading variant="heading-strong-l">
            {usuarios.filter((u) => u.rol === "OPERADOR" || u.rol === "CONDUCTOR").length} Operativos
          </Heading>
        </Card>
      </Grid>

      {/* Alerta de error si ocurrió */}
      {errorCarga && (
        <div
          style={{
            padding: "14px 18px",
            borderRadius: "12px",
            background: "rgba(239, 68, 68, 0.1)",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            color: "#ef4444",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Text variant="body-default-s">{errorCarga}</Text>
          <Button variant="secondary" size="s" onClick={() => cargarUsuarios()}>
            Reintentar
          </Button>
        </div>
      )}

      {/* Filtros por Rol */}
      <Row gap="8" fillWidth vertical="center" wrap>
        {["Todos", "SUPER_ADMIN", "DIRECTOR_OBRAS", "OPERADOR", "CONDUCTOR", "CIUDADANO"].map((rol) => (
          <Button
            key={rol}
            variant={filtroRol === rol ? "secondary" : "ghost"}
            size="s"
            onClick={() => setFiltroRol(rol)}
          >
            {rol}
          </Button>
        ))}
      </Row>

      {/* Tabla/Listado de Usuarios */}
      <Card radius="l" border="neutral-medium" fillWidth direction="column">
        <Row padding="20" horizontal="between" vertical="center" borderBottom="neutral-alpha-weak" wrap gap="8">
          <Heading variant="heading-default-s">
            Cuentas Oficiales ({usuariosFiltrados.length})
          </Heading>
          <Text variant="label-default-xs" onBackground="neutral-weak">
            Autenticación administrada por Clerk • Roles almacenados en MongoDB
          </Text>
        </Row>

        {cargando && usuarios.length === 0 ? (
          <Column padding="40" center gap="12">
            <Text variant="body-default-m" onBackground="neutral-medium">
              Obteniendo usuarios reales desde los servidores de Clerk...
            </Text>
          </Column>
        ) : usuariosFiltrados.length === 0 ? (
          <Column padding="40" center gap="8">
            <Text variant="body-default-m" onBackground="neutral-medium">
              No se encontraron usuarios con el rol seleccionado.
            </Text>
          </Column>
        ) : (
          <Column fillWidth>
            {usuariosFiltrados.map((usuario) => (
              <Row
                key={usuario.clerkId}
                paddingX="20"
                paddingY="16"
                horizontal="between"
                vertical="center"
                borderBottom="neutral-alpha-weak"
                gap="16"
                wrap
              >
                {/* Datos del usuario */}
                <Row gap="12" vertical="center" flex={1} style={{ minWidth: "280px" }}>
                  {usuario.avatarUrl ? (
                    <img
                      src={usuario.avatarUrl}
                      alt={usuario.nombre}
                      style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "50%",
                        objectFit: "cover",
                        border: "1px solid rgba(255,255,255,0.2)",
                        flexShrink: 0,
                      }}
                    />
                  ) : (
                    <Avatar
                      size="m"
                      value={usuario.nombre
                        .split(" ")
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join("")}
                    />
                  )}
                  <Column gap="2">
                    <Row gap="8" vertical="center" wrap>
                      <Text variant="body-default-s" onBackground="neutral-strong" style={{ fontWeight: 600 }}>
                        {usuario.nombre}
                      </Text>
                      <Badge textVariant="code-default-s" border="neutral-alpha-medium">
                        {usuario.rol}
                      </Badge>
                      {usuario.email.toLowerCase() === "22610282@utgz.edu.mx" && (
                        <Tag scheme="brand" size="s">Admin Principal</Tag>
                      )}
                    </Row>
                    <Text variant="label-default-xs" onBackground="neutral-weak">
                      {usuario.email} • {usuario.departamento}
                      {usuario.placasVehiculo ? ` • Placas: ${usuario.placasVehiculo}` : ""}
                    </Text>
                    <Row gap="8" vertical="center" style={{ marginTop: "2px" }}>
                      <Text variant="code-default-s" onBackground="neutral-weak" style={{ fontSize: "11px", opacity: 0.7 }}>
                        clerkId: {usuario.clerkId}
                      </Text>
                    </Row>
                  </Column>
                </Row>

                {/* Estado y Acciones */}
                <Row gap="16" vertical="center">
                  <Column gap="2" horizontal="end">
                    <Row gap="8" vertical="center">
                      <StatusIndicator
                        size="s"
                        color={usuario.estado === "Activo" ? "green" : "gray"}
                      />
                      <Text variant="label-default-xs">{usuario.estado}</Text>
                    </Row>
                    <Text variant="label-default-xs" onBackground="neutral-weak">
                      Último acceso: {usuario.ultimoAcceso}
                    </Text>
                  </Column>

                  <Row gap="8">
                    <Button
                      variant="ghost"
                      size="s"
                      onClick={() => abrirEditarRol(usuario)}
                    >
                      <Row gap="8" vertical="center">
                        <FaShieldHalved size={12} />
                        <Text>Rol / Permisos</Text>
                      </Row>
                    </Button>
                  </Row>
                </Row>
              </Row>
            ))}
          </Column>
        )}
      </Card>

      {/* ─── MODAL 1: Agregar Usuario en Clerk ─── */}
      {mostrarModalCrear && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.7)",
            backdropFilter: "blur(6px)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
          }}
          onClick={(e) => { if (e.target === e.currentTarget) cerrarModalCrear(); }}
        >
          <div
            style={{
              background: "var(--neutral-background-medium, #18181b)",
              borderRadius: "20px",
              border: "1px solid var(--neutral-border-medium, rgba(255,255,255,0.12))",
              boxShadow: "0 32px 80px rgba(0,0,0,0.8)",
              width: "100%",
              maxWidth: "520px",
              maxHeight: "90vh",
              overflowY: "auto",
              padding: "32px",
            }}
          >
            <Row horizontal="between" vertical="center" style={{ marginBottom: "20px" }}>
              <Column gap="4">
                <Heading variant="heading-strong-m">Registrar Nuevo Usuario</Heading>
                <Text variant="label-default-s" onBackground="neutral-medium">
                  Crea una cuenta en Clerk y asigna sus privilegios en MongoDB.
                </Text>
              </Column>
              <button
                onClick={cerrarModalCrear}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--neutral-on-background-medium, #888)",
                  padding: "4px",
                }}
              >
                <FaXmark size={20} />
              </button>
            </Row>

            {resultadoCreacion && (
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "10px",
                  padding: "14px 16px",
                  borderRadius: "10px",
                  marginBottom: "20px",
                  background: resultadoCreacion.ok
                    ? "rgba(16, 185, 129, 0.12)"
                    : "rgba(239, 68, 68, 0.12)",
                  border: `1px solid ${resultadoCreacion.ok ? "rgba(16, 185, 129, 0.35)" : "rgba(239, 68, 68, 0.35)"}`,
                  color: resultadoCreacion.ok ? "#10b981" : "#ef4444",
                  fontSize: "13px",
                  lineHeight: 1.5,
                }}
              >
                {resultadoCreacion.ok ? (
                  <FaCircleCheck size={16} style={{ flexShrink: 0, marginTop: "1px" }} />
                ) : (
                  <FaCircleXmark size={16} style={{ flexShrink: 0, marginTop: "1px" }} />
                )}
                <span>{resultadoCreacion.mensaje}</span>
              </div>
            )}

            <form onSubmit={crearUsuario} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <Row gap="12">
                <div style={{ flex: 1 }}>
                  <label style={estiloEtiqueta}>Nombre(s) *</label>
                  <input
                    style={estiloInput}
                    type="text"
                    placeholder="Juan Carlos"
                    value={formNuevoUsuario.nombre}
                    onChange={(e) => actualizarCampo("nombre", e.target.value)}
                    required
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={estiloEtiqueta}>Apellidos</label>
                  <input
                    style={estiloInput}
                    type="text"
                    placeholder="Pérez Ramos"
                    value={formNuevoUsuario.apellidos}
                    onChange={(e) => actualizarCampo("apellidos", e.target.value)}
                  />
                </div>
              </Row>

              <div>
                <label style={estiloEtiqueta}>Correo Electrónico *</label>
                <input
                  style={estiloInput}
                  type="email"
                  placeholder="operador@gutierrezzamora.gob.mx"
                  value={formNuevoUsuario.correo}
                  onChange={(e) => actualizarCampo("correo", e.target.value)}
                  required
                />
              </div>

              <Row gap="12">
                <div style={{ flex: 1 }}>
                  <label style={estiloEtiqueta}>Nombre de Usuario (opcional)</label>
                  <input
                    style={estiloInput}
                    type="text"
                    placeholder="j.perez"
                    value={formNuevoUsuario.nombreUsuario}
                    onChange={(e) => actualizarCampo("nombreUsuario", e.target.value.toLowerCase().replace(/\s+/g, ""))}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={estiloEtiqueta}>Rol en el Sistema *</label>
                  <select
                    style={{ ...estiloInput, cursor: "pointer" }}
                    value={formNuevoUsuario.rol}
                    onChange={(e) => actualizarCampo("rol", e.target.value)}
                    required
                  >
                    {rolesDisponibles.map((r) => (
                      <option key={r.valor} value={r.valor}>{r.etiqueta}</option>
                    ))}
                  </select>
                </div>
              </Row>

              <div>
                <label style={estiloEtiqueta}>Departamento / Área Municipal</label>
                <input
                  style={estiloInput}
                  type="text"
                  placeholder="Dirección de Limpia Pública"
                  value={formNuevoUsuario.departamento}
                  onChange={(e) => actualizarCampo("departamento", e.target.value)}
                />
              </div>

              <div>
                <label style={estiloEtiqueta}>Contraseña Inicial * (mínimo 8 caracteres)</label>
                <input
                  style={estiloInput}
                  type="password"
                  placeholder="••••••••••••"
                  value={formNuevoUsuario.contrasena}
                  onChange={(e) => actualizarCampo("contrasena", e.target.value)}
                  required
                  minLength={8}
                />
              </div>

              <Row gap="12" style={{ marginTop: "12px" }}>
                <Button
                  variant="ghost"
                  size="m"
                  fillWidth
                  onClick={cerrarModalCrear}
                  type="button"
                >
                  Cerrar
                </Button>
                <Button
                  variant="primary"
                  size="m"
                  fillWidth
                  type="submit"
                  disabled={creando}
                >
                  {creando ? "Creando en Clerk..." : "Guardar y Registrar"}
                </Button>
              </Row>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL 2: Editar Rol en MongoDB ─── */}
      {usuarioAEditar && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.7)",
            backdropFilter: "blur(6px)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setUsuarioAEditar(null); }}
        >
          <div
            style={{
              background: "var(--neutral-background-medium, #18181b)",
              borderRadius: "20px",
              border: "1px solid var(--neutral-border-medium, rgba(255,255,255,0.12))",
              boxShadow: "0 32px 80px rgba(0,0,0,0.8)",
              width: "100%",
              maxWidth: "480px",
              padding: "28px",
            }}
          >
            <Row horizontal="between" vertical="center" style={{ marginBottom: "16px" }}>
              <Column gap="4">
                <Heading variant="heading-strong-m">Asignar Rol y Privilegios</Heading>
                <Text variant="label-default-s" onBackground="neutral-medium">
                  Modificando perfil para: <strong>{usuarioAEditar.nombre}</strong>
                </Text>
              </Column>
              <button
                onClick={() => setUsuarioAEditar(null)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#888" }}
              >
                <FaXmark size={18} />
              </button>
            </Row>

            <div style={{ marginBottom: "16px", padding: "10px 14px", background: "rgba(255,255,255,0.04)", borderRadius: "8px" }}>
              <Text variant="label-default-xs" onBackground="neutral-weak">
                Correo: <strong>{usuarioAEditar.email}</strong> • Clerk ID: <code style={{ fontSize: "11px" }}>{usuarioAEditar.clerkId}</code>
              </Text>
            </div>

            {mensajeRol && (
              <div
                style={{
                  padding: "10px 14px",
                  borderRadius: "8px",
                  marginBottom: "16px",
                  background: mensajeRol.ok ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)",
                  color: mensajeRol.ok ? "#10b981" : "#ef4444",
                  fontSize: "13px",
                }}
              >
                {mensajeRol.texto}
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={estiloEtiqueta}>Rol Asignado en Base de Datos *</label>
                <select
                  style={{ ...estiloInput, cursor: "pointer" }}
                  value={nuevoRolEdit}
                  onChange={(e) => setNuevoRolEdit(e.target.value)}
                >
                  {rolesDisponibles.map((r) => (
                    <option key={r.valor} value={r.valor}>{r.etiqueta}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={estiloEtiqueta}>Área / Dependencia</label>
                <input
                  style={estiloInput}
                  type="text"
                  value={nuevoDeptoEdit}
                  onChange={(e) => setNuevoDeptoEdit(e.target.value)}
                  placeholder="Ej. Servicios Públicos"
                />
              </div>

              <Row gap="12" style={{ marginTop: "12px" }}>
                <Button variant="ghost" size="m" fillWidth onClick={() => setUsuarioAEditar(null)}>
                  Cancelar
                </Button>
                <Button
                  variant="primary"
                  size="m"
                  fillWidth
                  onClick={guardarCambioRol}
                  disabled={guardandoRol}
                >
                  {guardandoRol ? "Guardando en Mongo..." : "Guardar en MongoDB"}
                </Button>
              </Row>
            </div>
          </div>
        </div>
      )}
    </Column>
  );
}

// ── Estilos reutilizables
const estiloEtiqueta: React.CSSProperties = {
  display: "block",
  fontSize: "12px",
  fontWeight: 600,
  marginBottom: "6px",
  color: "var(--neutral-on-background-medium, #999)",
  letterSpacing: "0.3px",
};

const estiloInput: React.CSSProperties = {
  width: "100%",
  padding: "10px 14px",
  borderRadius: "10px",
  border: "1px solid var(--neutral-border-medium, rgba(255,255,255,0.12))",
  background: "var(--neutral-background-strong, rgba(255,255,255,0.06))",
  color: "var(--neutral-on-background-strong, #f0f0f0)",
  fontSize: "13px",
  fontFamily: "inherit",
  outline: "none",
  boxSizing: "border-box",
};
