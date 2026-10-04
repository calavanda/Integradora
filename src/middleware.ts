import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Protegemos el dashboard y cualquier ruta interna derivada
const isProtectedRoute = createRouteMatcher(["/dashboard(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    // Si el usuario no tiene sesión iniciada, lo redirige automáticamente a /login
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Excluir archivos estáticos internos de Next.js y assets
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Ejecutar siempre para rutas de API
    "/(api|trpc)(.*)",
  ],
};
