import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export const metadata = {
  title: "Términos y Condiciones | Univvy",
  description: "Términos y condiciones de uso de la plataforma Univvy.",
}

export default function TerminosPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-4 py-12">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al inicio
        </Link>

        <h1 className="mb-2 text-3xl font-bold text-balance">Términos y Condiciones</h1>
        <p className="mb-8 text-sm text-muted-foreground">Última actualización: julio de 2026</p>

        <div className="flex flex-col gap-6 leading-relaxed text-foreground">
          <section>
            <h2 className="mb-2 text-xl font-semibold">1. Aceptación de los términos</h2>
            <p className="text-muted-foreground">
              Al acceder y utilizar Univvy, aceptas estar sujeto a estos términos y condiciones. Si no estás de
              acuerdo con alguna parte de estos términos, no debes utilizar la plataforma.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-xl font-semibold">2. Descripción del servicio</h2>
            <p className="text-muted-foreground">
              Univvy es una plataforma que conecta estudiantes con asesores académicos para sesiones de asesoría
              personalizadas, tanto virtuales como presenciales. Univvy actúa como intermediario entre estudiantes y
              asesores, facilitando la reserva, el pago y la comunicación.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-xl font-semibold">3. Cuentas de usuario</h2>
            <p className="text-muted-foreground">
              Para utilizar la plataforma debes registrarte con información veraz y mantener la confidencialidad de
              tus credenciales. Eres responsable de toda actividad que ocurra en tu cuenta.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-xl font-semibold">4. Reservas y pagos</h2>
            <p className="text-muted-foreground">
              Las reservas de sesiones están sujetas a la aceptación del asesor. Los pagos se retienen de forma
              segura hasta la finalización de la sesión. Univvy cobra una comisión de servicio sobre cada
              transacción, la cual se muestra antes de confirmar el pago.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-xl font-semibold">5. Cancelaciones y reembolsos</h2>
            <p className="text-muted-foreground">
              Si un asesor rechaza o no atiende una sesión, el importe se reembolsa íntegramente. Las cancelaciones
              por parte del estudiante están sujetas a la política de cancelación vigente en el momento de la
              reserva.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-xl font-semibold">6. Conducta del usuario</h2>
            <p className="text-muted-foreground">
              Está prohibido utilizar la plataforma para fines ilícitos, compartir contenido ofensivo o intentar
              realizar transacciones fuera de la plataforma para evadir las comisiones de servicio.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-xl font-semibold">7. Contacto</h2>
            <p className="text-muted-foreground">
              Para cualquier consulta sobre estos términos, contáctanos en{" "}
              <a href="mailto:contacto@univvyorg.com" className="text-primary underline underline-offset-4">
                contacto@univvyorg.com
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </main>
  )
}
