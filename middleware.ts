import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/app/lib/auth';

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // 대시보드 하위 경로 보호
    if (pathname.startsWith('/dashboard')) {
        const token = request.cookies.get('token')?.value;

        if (!token) {
            return NextResponse.redirect(new URL('/login', request.url));
        }

        // 토큰 유효성 및 만료 검증
        const payload = await verifyToken(token);
        if (!payload) {
            // 만료되거나 유효하지 않은 토큰이면 로그인 페이지로 리다이렉트
            const response = NextResponse.redirect(new URL('/login', request.url));
            response.cookies.delete('token');
            return response;
        }
    }

    return NextResponse.next();
}

export const config = {
    // dashboard 하위의 모든 라우트에 대해 미들웨어 실행
    matcher: ['/dashboard/:path*'],
};
