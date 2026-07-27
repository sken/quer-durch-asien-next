import { FastifyInstance } from 'fastify';
import { Prisma } from '@prisma/client';
import { serializeBigInt } from './colors.routes';

export default async function gpsRoutes(fastify: FastifyInstance) {
    // 1. Get downsampled GPS track points for plotting the polyline route path
    fastify.get('/tracks', async (request, reply) => {
        const { downsample = 10 } = request.query as { downsample?: number };
        const factor = Number(downsample);

        try {
            // Downsample in PostgreSQL for speed and performance
            const tracks = await fastify.prisma.$queryRaw<any[]>(Prisma.sql`
                SELECT id, lat, lon, altitude, utc, countrycode
                FROM gpstrack
                WHERE id % ${factor} = 0 AND lat != 0 AND lon != 0
                ORDER BY id ASC
            `);

            const mappedTracks = tracks.map(t => ({
                id: t.id.toString(),
                lat: t.lat,
                lng: t.lon,
                alt: t.altitude,
                utc: t.utc,
                country: t.countrycode
            }));

            return serializeBigInt(mappedTracks);
        } catch (error) {
            fastify.log.error(error);
            return reply.status(500).send({ message: 'Failed to fetch GPS track logs.' });
        }
    });

    // 2. Get geotagged photos to render markers along the route
    fastify.get('/photos', async (request, reply) => {
        try {
            const photos = await fastify.prisma.images.findMany({
                where: {
                    NOT: [
                        { EXIFGPSLatitude: null },
                        { EXIFGPSLatitude: '0' },
                        { EXIFGPSLatitude: '' },
                        { EXIFGPSLongitude: null },
                        { EXIFGPSLongitude: '0' },
                        { EXIFGPSLongitude: '' },
                        { country: '' }
                    ]
                },
                select: {
                    id: true,
                    filename: true,
                    title: true,
                    country: true,
                    date: true,
                    EXIFGPSLatitude: true,
                    EXIFGPSLongitude: true,
                    EXIFGPSAltitude: true
                }
            });

            const mapped = photos.map(p => {
                const latStr = p.EXIFGPSLatitude ? p.EXIFGPSLatitude.replace(',', '.') : '';
                const lngStr = p.EXIFGPSLongitude ? p.EXIFGPSLongitude.replace(',', '.') : '';
                const altStr = p.EXIFGPSAltitude ? p.EXIFGPSAltitude.replace(',', '.') : '';

                const lat = parseFloat(latStr);
                const lng = parseFloat(lngStr);
                const alt = altStr ? parseFloat(altStr) : 0;

                return {
                    id: p.id,
                    title: p.title || p.filename,
                    file: p.filename,
                    folder: p.country,
                    date: p.date,
                    lat,
                    lng,
                    alt
                };
            }).filter(p => !isNaN(p.lat) && !isNaN(p.lng) && p.lat !== 0 && p.lng !== 0);

            return serializeBigInt(mapped);
        } catch (error) {
            fastify.log.error(error);
            return reply.status(500).send({ message: 'Failed to fetch geotagged photos.' });
        }
    });
}
