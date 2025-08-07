// routes/images.ts

import { FastifyInstance } from 'fastify';
import {serializeBigInt} from "./colors.routes";
import {images} from "../generated/client/client";

export async function imageRoutes(fastify: FastifyInstance) {
    fastify.get('/', async (request, reply) => {
        const { limit = 14, offset = 0, random = false } = request.query as {
            limit?: number;
            offset?: number;
            random?: boolean;
        };

        let images: images[] = await fastify.prisma.images.findMany({
            where: {
                NOT: {
                    country: '',
                },
            },
            orderBy: {
                id: 'asc', // fallback
            },
            skip: Number(offset),
            take: Number(limit),
        });


        if (random) {
            images = images.sort(() => 0.5 - Math.random()).slice(0, limit);
        }

        const mapped = images.map((img) => ({
            id: img.id,
            date: img.EXIFDateTimeOriginal,
            day: img.date?.toISOString().split('T')[0],
            country: img.country,
            file: img.filename,
            folder: img.country,
            lat: img.EXIFGPSLatitude?.replace(',', '.'),
            lng: img.EXIFGPSLongitude?.replace(',', '.'),
            alt: img.EXIFGPSAltitude,
        })) ;

        return serializeBigInt(mapped);

    });

}
