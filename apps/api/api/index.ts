import Fastify from "fastify";

const app = Fastify({
    logger: false,
});


app.register(import("../src/app"), {
    prefix: '/'
});


app.listen({ port: 3000 }, (err, address) => {
    if (err) {
        console.error(err)
        process.exit(1)
    }
    console.log(`Server listening at ${address}`)
})




export default async (req: any, res: any) => {
    await app.ready();
    app.server.emit('request', req, res);
}