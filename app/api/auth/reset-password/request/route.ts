import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import crypto from 'crypto';
import { sendPasswordResetEmail } from '@/app/lib/email';

export async function POST(request: Request) {
    try {
        const { username, email } = await request.json();

        if (!username || !email) {
            return NextResponse.json({ error: '아이디와 이메일을 모두 입력해주세요.' }, { status: 400 });
        }

        // Find user by username and email
        const user = await prisma.user.findUnique({
            where: { username },
        });

        // Verify that the email matches the user's registered email
        if (!user || user.email !== email) {
            return NextResponse.json({ error: '등록된 정보와 일치하는 계정을 찾을 수 없습니다.' }, { status: 400 });
        }

        // Generate token
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

        // Save token to database
        await prisma.passwordResetToken.create({
            data: {
                token,
                expiresAt,
                userId: user.id,
            },
        });

        // Send Email
        await sendPasswordResetEmail(user.email!, token);

        return NextResponse.json({ message: '비밀번호 재설정 이메일을 전송했습니다.' });
    } catch (error) {
        console.error('Password reset request error:', error);
        return NextResponse.json({ error: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' }, { status: 500 });
    }
}
