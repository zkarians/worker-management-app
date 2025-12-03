import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

// Get JWT_SECRET - will be validated at runtime when first used
const getSecretKey = () => {
    const SECRET_KEY = process.env.JWT_SECRET;
    if (!SECRET_KEY) {
        // In production, this should be set. For dev/build, use a default but log warning
        if (process.env.NODE_ENV === 'production') {
            throw new Error('JWT_SECRET environment variable is required in production');
        }
        console.warn('⚠️  JWT_SECRET not set. Using default secret (NOT SECURE)');
        return 'development-secret-key-change-in-production';
    }
    return SECRET_KEY;
};

const getKey = () => new TextEncoder().encode(getSecretKey());

export async function signToken(payload: any) {
    return await new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('24h')
        .sign(getKey());
}

export async function verifyToken(token: string) {
    try {
        const { payload } = await jwtVerify(token, getKey());
        return payload;
    } catch (error) {
        return null;
    }
}

export async function getSession() {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) return null;
    return await verifyToken(token);
}

export async function login(payload: any) {
    const token = await signToken(payload);
    const cookieStore = await cookies();
    cookieStore.set('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict', // CSRF protection
        maxAge: 60 * 60 * 24, // 1 day
        path: '/',
    });
}

export async function logout() {
    const cookieStore = await cookies();
    cookieStore.delete('token');
}
