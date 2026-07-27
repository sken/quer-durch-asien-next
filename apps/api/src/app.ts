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


// Pass --options via CLI arguments in command to enable these options.
const options: AppOptions = {}

const app: FastifyPluginAsync<AppOptions> = async (
    fastify,
    opts
): Promise<void> => {
    fastify.register(prismaPlugin);
    fastify.register(swaggerPlugin);
    fastify.register(cors, { origin: ['http://localhost:4200', 'http://localhost:4300'] }); // Registered cors plugin supporting port 4200 and 4300
    fastify.register(colorsRoutes, {prefix: '/colors'});
    fastify.register(imageRoutes, {prefix: '/images'});
    fastify.register(postsRoutes, {prefix: '/posts'});
    fastify.register(gpsRoutes, {prefix: '/gps'});
};

export default app;
export {app, options}