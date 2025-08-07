import {FastifyInstance} from 'fastify';
import {PrismaClient} from '@prisma/client';
import {colorsModel as Color} from '../generated/client/models';

import {colorSchema} from "../schemas/color.schema";

const prisma = new PrismaClient();

export function serializeBigInt(obj: any): any {
    if (Array.isArray(obj)) {
        return obj.map(serializeBigInt);
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

    // Alle Farben
    fastify.get('/', async (request, reply) => {
        const allColors = await prisma.colors.findMany();
        return allColors;
    });

    // Einzelne Farbe
    fastify.get('/:id', async (request, reply) => {
        const {id} = request.params as { id: string };
        const color = await prisma.colors.findUnique({
            where: {id: BigInt(id)},
        });
        return color;
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
    fastify.post('/', async (request, reply) => {
        const data = request.body as Color;
        const newColor = await prisma.colors.create({data});
        return newColor;
    });

    // Farbe aktualisieren
    fastify.put('/:id', async (request, reply) => {
        const {id} = request.params as { id: string };
        const data = request.body as Partial<Color>;
        const updatedColor = await prisma.colors.update({
            where: {id: BigInt(id)},
            data,
        });
        return updatedColor;
    });

    // Farbe löschen
    fastify.delete('/:id', async (request, reply) => {
        const {id} = request.params as { id: string };
        const deletedColor = await prisma.colors.delete({
            where: {id: BigInt(id)},
        });
        return deletedColor;
    });
}
