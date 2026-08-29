import Link from "next/link"
import Image from "next/image"
import { Search, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { NotFoundIllustration } from "@/components/not-found-illustration"

export default function NotFound() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-b from-red-50 via-background to-background px-4">
      <div className="flex w-full max-w-md flex-col items-center gap-6 py-10 text-center">
        <div className="relative size-11 flex-none overflow-hidden rounded-full">
          <Image src="/univvy-logo.png" alt="Univvy" fill sizes="44px" className="object-contain" priority />
        </div>

        <div className="relative h-[150px] w-[300px]">
          <NotFoundIllustration />
        </div>

        <div className="flex flex-col items-center gap-2">
          <span className="text-6xl font-bold tracking-tight text-primary">404</span>
          <h1 className="text-xl font-semibold text-foreground">Burnout académico detectado</h1>
          <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
            Esta página se desmayó estudiando y quedó sepultada entre libros. Mientras se recupera con un café,
            volvamos a un lugar que sí existe.
          </p>
        </div>

        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          <Button asChild size="lg">
            <Link href="/">
              <Home data-icon="inline-start" />
              Volver al inicio
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/buscar">
              <Search data-icon="inline-start" />
              Buscar asesores
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
