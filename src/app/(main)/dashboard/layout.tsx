import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { AccesoRestringido } from "@/components/auth/AccesoRestringido";

const ADMIN_EMAIL = "22610282@utgz.edu.mx";

import { DashboardShell } from "@/components/dashboard/DashboardShell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await currentUser();

  // Si no hay sesión activa, redirige a login
  if (!user) {
    redirect("/login");
  }

  // Comprobar si el usuario actual coincide con el correo administrador autorizado
  const emails = user.emailAddresses.map((e) => e.emailAddress.toLowerCase());
  const esAdmin = emails.includes(ADMIN_EMAIL.toLowerCase());

  if (!esAdmin) {
    const emailConectado = user.primaryEmailAddress?.emailAddress || emails[0] || "Desconocido";
    return <AccesoRestringido emailActual={emailConectado} adminRequerido={ADMIN_EMAIL} />;
  }

  return <DashboardShell>{children}</DashboardShell>;
}
