import {AutoloadPluginOptions} from '@fastify/autoload';
import {FastifyPluginAsync} from 'fastify';

import prismaPlugin from './plugins/prisma';
import swaggerPlugin from './plugins/swagger';
import colorsRoutes from "./routes/colors.routes";
import {imageRoutes} from "./routes/images.routes";


export type AppOptions = {
    // Place your custom options for app below here.
} & Partial<AutoloadPluginOptions>;


// Pass --options via CLI arguments in command to enable these options.
const options: AppOptions = {}

const app: FastifyPluginAsync<AppOptions> = async (
    fastify,
    opts
): Promise<void> => {
    fastify.register(prismaPlugin);
    fastify.register(swaggerPlugin);
    fastify.register(colorsRoutes, {prefix: '/colors'});
    fastify.register(imageRoutes, {prefix: '/images'});
};

export default app;
export {app, options}