import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request: { headers: request.headers },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Fast session check from cookie (no network roundtrip)
  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user

  const { pathname } = request.nextUrl

  // Admin routes — require login + admin role
  const isAdminRoute = pathname.startsWith('/admin')

  // Write-only protected routes — require login but NOT admin
  // (creating reports only — administration page is publicly viewable,
  //  the "Ajukan" submit action is guarded at the component level)
  const isWriteProtectedRoute =
    pathname === '/environment/new' ||
    pathname.startsWith('/environment/new/')

  // Auth routes
  const isAuthRoute =
    pathname.startsWith('/login') || pathname.startsWith('/register')

  // Dashboard/main app routes — require login
  const isDashboardRoute =
    pathname.startsWith('/overview') ||
    pathname.startsWith('/environment') ||
    pathname.startsWith('/command-center') ||
    pathname.startsWith('/administration') ||
    pathname.startsWith('/marketplace')

  if (!user && isDashboardRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }

  // Write routes — require login
  if (!user && isWriteProtectedRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }

  // Admin routes — require login + admin role
  if (isAdminRoute) {
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }
    const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL
    const isAdminUser = (adminEmail && user.email === adminEmail) || user.user_metadata?.role === 'admin'
    if (!isAdminUser) {
      const url = request.nextUrl.clone()
      url.pathname = '/overview'
      return NextResponse.redirect(url)
    }
  }

  // If authenticated and on login/register, go to overview
  if (user && isAuthRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/overview'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
