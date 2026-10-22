import {FastifyInstance} from 'fastify';
import {colorsModel as Color} from '../generated/client/models';

import {colorSchema} from "../schemas/color.schema";
import {requireAdmin} from "../utils/auth";
import {isNumericId} from "../utils/query";

export function serializeBigInt(obj: any): any {
    if (Array.isArray(obj)) {
        return obj.map(serializeBigInt);
    } else if (obj !== null && typeof obj === 'object' && typeof obj.toJSON === 'function') {
        // Date -> ISO string, Prisma.Decimal -> numeric string
        return obj.toJSON();
    } else if (obj !== null && typeof obj === 'object') {
        const newObj: any = {};
        for (const key in obj) {
            const value = obj[key];
            newObj[key] = typeof value === 'bigint' ? value.toString() : serializeBigInt(value);
        }
        return newObj;
    }
    return obj;
}

export default async function colorsRoutes(fastify: FastifyInstance) {
    const prisma = fastify.prisma;

    // Alle Farben
    fastify.get('/', async (request, reply) => {
        const allColors = await prisma.colors.findMany();
        return serializeBigInt(allColors);
    });

    // Einzelne Farbe
    fastify.get('/:id', async (request, reply) => {
        const {id} = request.params as { id: string };
        if (!isNumericId(id)) {
            return reply.status(400).send({message: 'Invalid id.'});
        }
        const color = await prisma.colors.findUnique({
            where: {id: BigInt(id)},
        });
        if (!color) {
            return reply.status(404).send({message: 'Color not found.'});
        }
        return serializeBigInt(color);
    });

    fastify.get('/random', {
        schema: {
            summary: 'Get 80 random colors',
            description: 'Returns 80 random colors from the database',
            response: {
                200: {
                    type: 'array',
                    items: colorSchema
                }
            }
        }
    }, async (request, reply) => {
        const colors = await prisma.$queryRaw<Color[]>`SELECT *
                                                       FROM "colors"
                                                       ORDER BY RANDOM() LIMIT 90`;
        return serializeBigInt(colors);
    });

    // Neue Farbe anlegen
    fastify.post('/', {preHandler: requireAdmin}, async (request, reply) => {
        const data = request.body as Color;
        const newColor = await prisma.colors.create({data});
        return serializeBigInt(newColor);
    });

    // Farbe aktualisieren
    fastify.put('/:id', {preHandler: requireAdmin}, async (request, reply) => {
        const {id} = request.params as { id: string };
        if (!isNumericId(id)) {
            return reply.status(400).send({message: 'Invalid id.'});
        }
        const data = request.body as Partial<Color>;
        const updatedColor = await prisma.colors.update({
            where: {id: BigInt(id)},
            data,
        });
        return serializeBigInt(updatedColor);
    });

    // Farbe löschen
    fastify.delete('/:id', {preHandler: requireAdmin}, async (request, reply) => {
        const {id} = request.params as { id: string };
        if (!isNumericId(id)) {
            return reply.status(400).send({message: 'Invalid id.'});
        }
        const deletedColor = await prisma.colors.delete({
            where: {id: BigInt(id)},
        });
        return serializeBigInt(deletedColor);
    });
}
