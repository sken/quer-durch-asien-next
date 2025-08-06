import type { VercelRequest, VercelResponse } from '@vercel/node'
import {buildApp} from "./app";

export default async function handler(
    req: VercelRequest,
    reply: VercelResponse
) {
    const app = buildApp();

    app.server.emit('request', req, reply)
}