import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export const metadata = {
  title: "Política de Privacidad | Univvy",
  description: "Política de privacidad y protección de datos de Univvy.",
}

export default function PrivacidadPage() {
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

        <h1 className="mb-2 text-3xl font-bold text-balance">Política de Privacidad</h1>
        <p className="mb-8 text-sm text-muted-foreground">Última actualización: julio de 2026</p>

        <div className="flex flex-col gap-6 leading-relaxed text-foreground">
          <section>
            <h2 className="mb-2 text-xl font-semibold">1. Información que recopilamos</h2>
            <p className="text-muted-foreground">
              Recopilamos la información que nos proporcionas al registrarte: nombre completo, correo electrónico,
              universidad y carrera. También recopilamos información sobre las sesiones que reservas y los mensajes
              que intercambias dentro de la plataforma.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-xl font-semibold">2. Cómo usamos tu información</h2>
            <p className="text-muted-foreground">
              Utilizamos tus datos para operar la plataforma: gestionar tu cuenta, procesar reservas y pagos,
              facilitar la comunicación entre estudiantes y asesores, y enviarte notificaciones relacionadas con tus
              sesiones.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-xl font-semibold">3. Pagos</h2>
            <p className="text-muted-foreground">
              Los pagos se procesan a través de proveedores de pago seguros. Univvy no almacena los datos completos
              de tu tarjeta de crédito o débito en sus servidores.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-xl font-semibold">4. Compartir información</h2>
            <p className="text-muted-foreground">
              Solo compartimos la información necesaria entre estudiantes y asesores para llevar a cabo las sesiones
              (nombre, universidad y detalles de la reserva). No vendemos tus datos personales a terceros.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-xl font-semibold">5. Seguridad de los datos</h2>
            <p className="text-muted-foreground">
              Aplicamos medidas técnicas y organizativas para proteger tus datos, incluyendo cifrado en tránsito y
              controles de acceso a nivel de base de datos.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-xl font-semibold">6. Tus derechos</h2>
            <p className="text-muted-foreground">
              Puedes acceder, rectificar o eliminar tus datos personales en cualquier momento desde tu perfil, o
              solicitarlo escribiéndonos. También puedes solicitar la eliminación completa de tu cuenta.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-xl font-semibold">7. Contacto</h2>
            <p className="text-muted-foreground">
              Para cualquier consulta sobre privacidad, escríbenos a{" "}
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
