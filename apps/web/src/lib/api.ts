// Base URL of the Fastify API. NEXT_PUBLIC_ so client components can use it too.
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.quer-durch-asien.de';

export function apiUrl(path: string): string {
    return `${API_URL}${path}`;
}
