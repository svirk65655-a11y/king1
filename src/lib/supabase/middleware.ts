import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

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
                    cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    const {
        data: { user },
    } = await supabase.auth.getUser()

    // Protected routes
    const protectedPaths = ['/dashboard', '/admin']
    const isProtectedPath = protectedPaths.some(path =>
        request.nextUrl.pathname.startsWith(path)
    )

    if (isProtectedPath && !user) {
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        url.searchParams.set('redirectTo', request.nextUrl.pathname)
        return NextResponse.redirect(url)
    }

    // NOTE: Admin role check is done in admin layout.tsx using service role key
    // to bypass RLS. No admin check needed here in middleware.

    // Redirect logged-in users away from auth pages
    const authPaths = ['/login', '/signup']
    const isAuthPath = authPaths.some(path =>
        request.nextUrl.pathname.startsWith(path)
    )

    if (isAuthPath && user) {
        const redirectTo = request.nextUrl.searchParams.get('redirectTo') || '/dashboard'
        const url = request.nextUrl.clone()
        url.pathname = redirectTo
        url.search = ''
        return NextResponse.redirect(url)
    }

    return supabaseResponse
}
