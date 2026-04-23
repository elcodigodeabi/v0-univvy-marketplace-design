import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Routes that require authentication
const protectedRoutes = [
  '/dashboard',
  '/dashboard-asesor',
  '/perfil',
  '/mensajes',
  '/mis-sesiones',
  '/mis-sesiones-asesor',
  '/agendar',
  '/calendario-asesor',
  '/configuracion-asesor',
  '/gestion-asesor',
  '/solicitudes-asesor',
  '/wallet',
  '/pago',
]

// Routes that should redirect to dashboard if already authenticated
const authRoutes = ['/login', '/registro']

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          )
        },
      },
    },
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname

  // Check if the current path is a protected route
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
  
  // Check if the current path is an auth route
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route))

  // If user is not logged in and trying to access protected route, redirect to login
  if (isProtectedRoute && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(url)
  }

  // If user is logged in and trying to access auth routes, redirect to appropriate dashboard
  if (isAuthRoute && user) {
    const userType = user.user_metadata?.tipo || 'alumno'
    const url = request.nextUrl.clone()
    url.pathname = userType === 'asesor' ? '/dashboard-asesor' : '/dashboard'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
