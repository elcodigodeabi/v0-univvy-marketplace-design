import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { BookOpen, Users, Clock, Award, ChevronLeft, ChevronRight } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <img src="/univvy-logo.jpg" alt="Univvy" className="h-10 w-auto rounded-full border border-gray-100 shadow-sm" />
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            <Link href="#servicios" className="text-gray-700 hover:text-red-600 transition-colors">
              Servicios
            </Link>
            <Link href="#como-funciona" className="text-gray-700 hover:text-red-600 transition-colors">
              Cómo Funciona
            </Link>
            <Link href="#contacto" className="text-gray-700 hover:text-red-600 transition-colors">
              Contacto
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild className="text-gray-700 hover:text-red-600 hover:bg-red-50">
              <Link href="/login">Iniciar Sesión</Link>
            </Button>
            <Button asChild className="bg-red-600 hover:bg-red-700 text-white">
              <Link href="/registro">Registrarse</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight text-balance">
                Conecta con asesores académicos verificados
              </h1>
              <p className="text-lg md:text-xl text-gray-600 mb-8 leading-relaxed text-pretty">
                Encuentra apoyo académico personalizado de estudiantes avanzados y profesores calificados de tu
                universidad.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg" className="bg-red-600 hover:bg-red-700 text-white text-lg px-8">
                  <Link href="/buscar">Buscar Asesor</Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-gray-300 text-gray-700 hover:bg-gray-50 text-lg px-8 bg-transparent"
                >
                  <Link href="/registro?tipo=asesor">Ser Asesor</Link>
                </Button>
              </div>
            </div>
            <div className="relative h-[400px] md:h-[500px]">
              <img
                src="/estudiantes-universitarios-colaborando-en-estudio-.jpg"
                alt="Estudiantes colaborando"
                className="rounded-2xl object-cover w-full h-full shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: "Asesores Activos", value: "500+" },
              { label: "Universidades", value: "20+" },
              { label: "Asesorías Realizadas", value: "2,000+" },
              { label: "Satisfacción", value: "98%" },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-red-600 mb-2">{stat.value}</div>
                <div className="text-sm md:text-base text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial Carousel Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 text-balance">
              Lo que dicen nuestros usuarios
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto text-pretty">
              Miles de estudiantes y asesores ya confían en Univyy
            </p>
          </div>

          <div className="relative max-w-6xl mx-auto">
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="border-gray-200">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <img
                      src="/estudiante-sonriendo-con-laptop.jpg"
                      alt="Estudiante"
                      className="h-16 w-16 rounded-full object-cover"
                    />
                    <div>
                      <h4 className="font-semibold text-gray-900">Laura Martínez</h4>
                      <p className="text-sm text-gray-600">Estudiante de Ingeniería</p>
                    </div>
                  </div>
                  <p className="text-gray-700 leading-relaxed">
                    "Gracias a Univyy pude encontrar un asesor excelente que me ayudó a aprobar cálculo. La plataforma es
                    súper fácil de usar."
                  </p>
                </CardContent>
              </Card>

              <Card className="border-gray-200">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <img
                      src="/profesor-joven-con-libros.jpg"
                      alt="Asesor"
                      className="h-16 w-16 rounded-full object-cover"
                    />
                    <div>
                      <h4 className="font-semibold text-gray-900">Carlos Ramírez</h4>
                      <p className="text-sm text-gray-600">Asesor de Programación</p>
                    </div>
                  </div>
                  <p className="text-gray-700 leading-relaxed">
                    "Como asesor, Univyy me permite organizar mis sesiones fácilmente y conectar con estudiantes que
                    realmente necesitan ayuda."
                  </p>
                </CardContent>
              </Card>

              <Card className="border-gray-200">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <img
                      src="/estudiante-universitaria-feliz.jpg"
                      alt="Estudiante"
                      className="h-16 w-16 rounded-full object-cover"
                    />
                    <div>
                      <h4 className="font-semibold text-gray-900">Ana Gómez</h4>
                      <p className="text-sm text-gray-600">Estudiante de Medicina</p>
                    </div>
                  </div>
                  <p className="text-gray-700 leading-relaxed">
                    "La mejor inversión que hice este semestre. Los asesores están muy bien preparados y son pacientes."
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="servicios" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 text-balance">Por qué elegir Univyy</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto text-pretty">
              Una plataforma diseñada para hacer el apoyo académico más accesible, confiable y efectivo.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: BookOpen,
                title: "Asesores Verificados",
                description:
                  "Todos nuestros asesores son estudiantes avanzados o profesores calificados de universidades reconocidas.",
              },
              {
                icon: Users,
                title: "Personalizado",
                description:
                  "Encuentra asesores especializados en las materias específicas de tu carrera y universidad.",
              },
              {
                icon: Clock,
                title: "Flexible",
                description: "Elige horarios que se adapten a tu agenda y modalidad de asesoría (presencial u online).",
              },
              {
                icon: Award,
                title: "Confiable",
                description: "Sistema de calificaciones y reseñas para garantizar la calidad del servicio.",
              },
            ].map((service, index) => (
              <Card key={index} className="border-gray-200 hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                    <service.icon className="h-6 w-6 text-red-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{service.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{service.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="como-funciona" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 text-balance">Cómo funciona</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto text-pretty">
              Obtén apoyo académico en 3 simples pasos
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                step: "01",
                title: "Regístrate",
                description: "Crea tu cuenta como alumno o asesor en menos de 2 minutos.",
                image: "/estudiante-registr-ndose-en-laptop.jpg",
              },
              {
                step: "02",
                title: "Busca o Publica",
                description: "Alumnos: busca asesores. Asesores: publica tu perfil y disponibilidad.",
                image: "/buscar-y-filtrar-asesores-en-plataforma-web.jpg",
              },
              {
                step: "03",
                title: "Conecta",
                description: "Usa nuestro sistema de mensajería para coordinar tu asesoría.",
                image: "/estudiantes-conversando-por-chat-acad-mico.jpg",
              },
            ].map((step, index) => (
              <div key={index} className="relative">
                <div className="bg-white rounded-2xl p-6 shadow-md">
                  <div className="absolute -top-4 -left-4 h-12 w-12 bg-red-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-lg">{step.step}</span>
                  </div>
                  <div className="mb-4 rounded-lg overflow-hidden">
                    <img src={step.image || "/placeholder.svg"} alt={step.title} className="w-full h-48 object-cover" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="bg-red-600 rounded-3xl p-12 md:p-16 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 text-balance">
              ¿Listo para mejorar tu rendimiento académico?
            </h2>
            <p className="text-lg text-red-100 mb-8 max-w-2xl mx-auto text-pretty">
              Únete a miles de estudiantes que ya están alcanzando sus metas académicas con Univyy.
            </p>
            <Button asChild size="lg" className="bg-white text-red-600 hover:bg-gray-100 text-lg px-8">
              <Link href="/registro">Comenzar Ahora</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <Link href="/" className="flex items-center gap-2 mb-4">
                <img src="/univvy-logo.jpg" alt="Univvy" className="h-10 w-auto rounded-full bg-white p-1 shadow-sm" />
              </Link>
              <p className="text-gray-400 text-sm">Conectando estudiantes con asesores académicos de calidad.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Plataforma</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <Link href="/buscar" className="hover:text-white transition-colors">
                    Buscar
                  </Link>
                </li>
                <li>
                  <Link href="/registro" className="hover:text-white transition-colors">
                    Ser Asesor
                  </Link>
                </li>
                <li>
                  <Link href="/como-funciona" className="hover:text-white transition-colors">
                    Cómo Funciona
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Soporte</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <Link href="/ayuda" className="hover:text-white transition-colors">
                    Centro de Ayuda
                  </Link>
                </li>
                <li>
                  <Link href="/contacto" className="hover:text-white transition-colors">
                    Contacto
                  </Link>
                </li>
                <li>
                  <Link href="/faq" className="hover:text-white transition-colors">
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <Link href="/terminos" className="hover:text-white transition-colors">
                    Términos de Uso
                  </Link>
                </li>
                <li>
                  <Link href="/privacidad" className="hover:text-white transition-colors">
                    Privacidad
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            © 2025 Univyy. Todos los derechos reservados.
          </div>
        </div>
      </footer>
    </div>
  )
}
