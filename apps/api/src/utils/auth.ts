import { FastifyReply, FastifyRequest } from 'fastify';

// Guards write endpoints. Requests must send `x-api-key` matching ADMIN_API_KEY.
// When ADMIN_API_KEY is not configured, write endpoints are disabled entirely.
export async function requireAdmin(request: FastifyRequest, reply: FastifyReply) {
    const expected = process.env.ADMIN_API_KEY;
    if (!expected) {
        return reply.status(403).send({ message: 'Write access is disabled.' });
    }
    if (request.headers['x-api-key'] !== expected) {
        return reply.status(401).send({ message: 'Unauthorized.' });
    }
}
