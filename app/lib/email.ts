import nodemailer from 'nodemailer';

// Create a transporter using SMTP
// User must provide SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS in .env
// For Gmail SMTP:
// SMTP_HOST="smtp.gmail.com"
// SMTP_PORT=465
// SMTP_USER="your-email@gmail.com"
// SMTP_PASS="your-app-password"

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '465'),
    secure: parseInt(process.env.SMTP_PORT || '465') === 465, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

export const sendPasswordResetEmail = async (to: string, token: string) => {
    // Generate the reset link based on the current environment
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const resetLink = `${baseUrl}/login/reset-password?token=${token}`;

    const timestamp = new Date().toLocaleString('ko-KR');

    const mailOptions = {
        from: `"Worker Management" <${process.env.SMTP_USER || 'noreply@example.com'}>`, // sender address
        to, // list of receivers
        subject: `비밀번호 재발급 안내 ${timestamp}`, // Subject line
        html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
                <h2 style="color: #1e293b; text-align: center;">비밀번호 재발급</h2>
                <p style="color: #475569; font-size: 16px; line-height: 1.5;">
                    안녕하세요. 귀하의 계정에 대한 비밀번호 재발급 요청이 접수되었습니다.
                    아래 버튼을 클릭하여 새로운 비밀번호를 설정해주세요.
                </p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${resetLink}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                        비밀번호 재설정하기
                    </a>
                </div>
                <p style="color: #64748b; font-size: 14px; text-align: center;">
                    본인이 요청하지 않은 경우 이 이메일을 무시하셔도 됩니다.<br>
                    이 링크는 1시간 동안만 유효합니다.
                </p>
            </div>
        `,
    };

    // If SMTP_USER or SMTP_PASS is missing, we log it instead of failing (good for local testing)
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.warn('⚠️ SMTP credentials are not configured in .env file!');
        console.log('--- DEVELOPMENT MODE: EMAIL INTERCEPTED ---');
        console.log(`To: ${to}`);
        console.log(`Subject: ${mailOptions.subject}`);
        console.log(`Reset Link: ${resetLink}`);
        console.log('---------------------------------------------');
        return true;
    }

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Message sent: %s', info.messageId);
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        throw new Error('이메일 전송에 실패했습니다.');
    }
};
