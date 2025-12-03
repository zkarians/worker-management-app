/**
 * API Configuration for Mobile and Web
 * 
 * For mobile apps: Points to external server
 * For web builds: Uses relative paths (same server)
 */

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

// Mobile app will use external API server
// Web app will use relative paths
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

/**
 * Build full API endpoint URL
 * @param path - API path (e.g., '/api/workers')
 * @returns Full URL for the API endpoint
 */
export function getApiUrl(path: string): string {
    // Ensure path starts with /
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;

    // If API_BASE_URL is set, use it (for mobile)
    if (API_BASE_URL) {
        return `${API_BASE_URL}${normalizedPath}`;
    }

    // For web, use relative path
    return normalizedPath;
}

/**
 * Fetch wrapper with automatic API URL resolution
 */
export async function apiFetch(path: string, options?: RequestInit): Promise<Response> {
    const url = getApiUrl(path);
    return fetch(url, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options?.headers,
        },
    });
}
