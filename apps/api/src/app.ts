import {FastifyPluginAsync} from 'fastify';
import cors from '@fastify/cors'; // Added import

import prismaPlugin from './plugins/prisma';
import swaggerPlugin from './plugins/swagger';
import colorsRoutes from "./routes/colors.routes";
import {imageRoutes} from "./routes/images.routes";
import postsRoutes from "./routes/posts.routes";
import gpsRoutes from "./routes/gps.routes";


export type AppOptions = {
    // Place your custom options for app below here.
};


const DEFAULT_CORS_ORIGINS = [
    'http://localhost:4200',
    'http://localhost:4300',
    'https://quer-durch-asien.de',
    'https://www.quer-durch-asien.de',
    'https://next.quer-durch-asien.de',
];

// Browser-side pages (color search, comment form) call the API directly,
// so production origins must be allowed. Override with CORS_ORIGINS (comma-separated).
function corsOrigins(): string[] {
    const configured = process.env.CORS_ORIGINS;
    if (!configured) {
        return DEFAULT_CORS_ORIGINS;
    }
    return configured.split(',').map(o => o.trim()).filter(Boolean);
}

// Pass --options via CLI arguments in command to enable these options.
const options: AppOptions = {}

const app: FastifyPluginAsync<AppOptions> = async (
    fastify,
    opts
): Promise<void> => {
    fastify.register(prismaPlugin);
    fastify.register(swaggerPlugin);
    fastify.register(cors, { origin: corsOrigins() });
    fastify.register(colorsRoutes, {prefix: '/colors'});
    fastify.register(imageRoutes, {prefix: '/images'});
    fastify.register(postsRoutes, {prefix: '/posts'});
    fastify.register(gpsRoutes, {prefix: '/gps'});
};

export default app;
export {app, options}