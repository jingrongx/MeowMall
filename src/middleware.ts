import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { fallbackLng } from './app/settings'
 
export function middleware(request: NextRequest) {
  // 检查请求路径是否已包含语言代码
  const pathname = request.nextUrl.pathname
  const pathnameIsMissingLocale = pathname === '/' || 
    !pathname.startsWith('/zh') && !pathname.startsWith('/en')
 
  // 如果路径中没有语言代码，重定向到默认语言
  if (pathnameIsMissingLocale) {
    const locale = fallbackLng

    return NextResponse.redirect(
      new URL(`/${locale}${pathname === '/' ? '' : pathname}`, request.url)
    )
  }
}
 
export const config = {
  // 匹配所有路径，除了api路由、静态文件等
  matcher: ['/((?!api|_next/static|_next/image|images|favicon.ico).*)']
}