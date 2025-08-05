import Fastify from 'fastify';
import prismaPlugin from './plugins/prisma';
import swaggerPlugin from './plugins/swagger';
import colorsRoutes from "./routes/colors.routes";
import {imageRoutes} from "./routes/images.routes";

export function buildApp() {
    const app = Fastify();

    app.register(prismaPlugin);
    app.register(swaggerPlugin);
    app.register(colorsRoutes, {prefix: '/colors'});
    app.register(imageRoutes, {prefix: '/images'});

    return app;
}
