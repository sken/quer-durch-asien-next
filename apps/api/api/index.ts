import Fastify from "fastify";

const app = Fastify({
    logger: false,
});

/*
app.register(import("../src/app"), {
    prefix: '/'
});

 */
app.get('/', async (req, reply) => {
    return reply.status(200).type('text/html').send("test")
})
export default async (req: any, res: any) => {
    await app.ready();
    app.server.emit('request', req, res);
}