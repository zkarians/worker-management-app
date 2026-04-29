import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
    try {
        const { token, newPassword } = await request.json();

        if (!token || !newPassword) {
            return NextResponse.json({ error: '토큰과 새 비밀번호가 필요합니다.' }, { status: 400 });
        }

        // Find the token
        const resetTokenRecord = await prisma.passwordResetToken.findUnique({
            where: { token },
            include: { user: true },
        });

        if (!resetTokenRecord) {
            return NextResponse.json({ error: '유효하지 않거나 만료된 토큰입니다.' }, { status: 400 });
        }

        // Check expiration
        if (new Date() > resetTokenRecord.expiresAt) {
            await prisma.passwordResetToken.delete({ where: { id: resetTokenRecord.id } });
            return NextResponse.json({ error: '토큰이 만료되었습니다. 다시 요청해주세요.' }, { status: 400 });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update user password
        await prisma.user.update({
            where: { id: resetTokenRecord.userId },
            data: { password: hashedPassword },
        });

        // Delete the used token (and any other expired ones for this user optionally)
        await prisma.passwordResetToken.deleteMany({
            where: { userId: resetTokenRecord.userId },
        });

        return NextResponse.json({ message: '비밀번호가 성공적으로 변경되었습니다.' });
    } catch (error) {
        console.error('Password reset confirm error:', error);
        return NextResponse.json({ error: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' }, { status: 500 });
    }
}
