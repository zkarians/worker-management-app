import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import bcrypt from 'bcryptjs';
import { login } from '@/app/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    // Ensure we always return JSON
    const jsonResponse = (data: any, status: number = 200) => {
        return NextResponse.json(data, {
            status,
            headers: { 'Content-Type': 'application/json' }
        });
    };

    try {
        // Test database connection first with a simple query and timeout
        try {
            if (!prisma) throw new Error('Prisma client not initialized');
            
            const queryPromise = prisma.$queryRaw`SELECT 1`;
            const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Connection timeout after 10 seconds')), 10000)
            );
            
            await Promise.race([queryPromise, timeoutPromise]);
        } catch (dbError: any) {
            console.error('Database connection error:', dbError);
            console.error('Error code:', dbError.code);
            console.error('Error message:', dbError.message);
            
            if (dbError.code === 'P1001') {
                return jsonResponse({ 
                    error: '데이터베이스 서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.' 
                }, 503);
            }
            
            if (dbError.message?.includes('timeout')) {
                return jsonResponse({ 
                    error: '데이터베이스 연결 시간이 초과되었습니다. 잠시 후 다시 시도해주세요.' 
                }, 503);
            }
            
            return jsonResponse({ 
                error: '데이터베이스 연결 오류가 발생했습니다. 관리자에게 문의하세요.' 
            }, 503);
        }

        let body;
        try {
            body = await request.json();
        } catch (parseError) {
            return jsonResponse({
                error: '잘못된 요청 형식입니다.'
            }, 400);
        }

        const { username, password } = body;

        if (!username || !password) {
            return jsonResponse({ error: '아이디와 비밀번호를 입력해주세요.' }, 400);
        }

        let user;
        try {
            user = await prisma.user.findUnique({
                where: { username },
            });
        } catch (dbError: any) {
            console.error('Database query error:', dbError);
            return jsonResponse({
                error: '데이터베이스 조회 중 오류가 발생했습니다.'
            }, 500);
        }

        if (!user) {
            return jsonResponse({ error: '아이디 또는 비밀번호가 올바르지 않습니다.' }, 401);
        }

        let isPasswordValid;
        try {
            isPasswordValid = await bcrypt.compare(password, user.password);
        } catch (bcryptError) {
            console.error('Password comparison error:', bcryptError);
            return jsonResponse({
                error: '비밀번호 확인 중 오류가 발생했습니다.'
            }, 500);
        }

        if (!isPasswordValid) {
            return jsonResponse({ error: '아이디 또는 비밀번호가 올바르지 않습니다.' }, 401);
        }

        if (!user.isApproved) {
            return jsonResponse({ error: '승인 대기 중인 계정입니다.' }, 403);
        }

        try {
            await login({ userId: user.id, role: user.role, name: user.name });
        } catch (loginError) {
            console.error('Login function error:', loginError);
            return jsonResponse({
                error: '로그인 처리 중 오류가 발생했습니다.'
            }, 500);
        }

        return jsonResponse({
            message: 'Login successful',
            user: { id: user.id, role: user.role, name: user.name }
        });
    } catch (error: any) {
        console.error('Login error:', error);

        // Check if it's a database connection error
        if (error.code === 'P1001' || error.message?.includes('Can\'t reach database server')) {
            return jsonResponse({
                error: '데이터베이스 연결 오류가 발생했습니다. 관리자에게 문의하세요.'
            }, 503);
        }

        // Check if it's a Prisma error
        if (error.code && error.code.startsWith('P')) {
            return jsonResponse({
                error: '데이터베이스 오류가 발생했습니다.'
            }, 500);
        }

        // Generic error
        return jsonResponse({
            error: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
        }, 500);
    }
}
