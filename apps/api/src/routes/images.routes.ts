// routes/images.ts

import { FastifyInstance } from 'fastify';
import { Prisma } from '../generated/client/client';
import { serializeBigInt } from './colors.routes';
import type { images as ImageRow } from '../generated/client/client';
import { toBool, toInt, toOptionalInt } from '../utils/query';
import { ColorQuery, searchImagesByColor } from '../services/color-search';

// [start of day, start of next day) for a YYYY-MM-DD string, in UTC.
function dayRange(day: string): { gte: Date; lt: Date } {
    const start = new Date(`${day}T00:00:00.000Z`);
    const end = new Date(start);
    end.setUTCDate(end.getUTCDate() + 1);
    return { gte: start, lt: end };
}

export async function imageRoutes(fastify: FastifyInstance) {
    // 1. Get tags list with counts
    fastify.get('/tags', async (request, reply) => {
        try {
            const keywords = await fastify.prisma.keywords.findMany({
                orderBy: { name: 'asc' }
            });

            const counts = await fastify.prisma.keyword_to_image.groupBy({
                by: ['keyword_id'],
                _count: {
                    image_id: true
                }
            });

            const countMap = new Map<string, number>();
            counts.forEach(c => {
                countMap.set(c.keyword_id.toString(), c._count.image_id);
            });

            const tags = keywords.map(kw => ({
                id: kw.id.toString(),
                name: kw.name,
                slug: kw.slug,
                count: countMap.get(kw.id.toString()) || 0
            })).filter(t => t.count > 0);

            return tags;
        } catch (error) {
            fastify.log.error(error);
            return reply.status(500).send({ message: 'Failed to fetch tags.' });
        }
    });

    // 1b. Get all travel days (galleries with preview pictures)
    fastify.get('/days', async (request, reply) => {
        try {
            const days = await fastify.prisma.galleries.findMany({
                where: {
                    NOT: { previewpic: null }
                },
                orderBy: { name: 'asc' }
            });
            
            const previewPicIds = days.map(d => Number(d.previewpic)).filter(id => !isNaN(id));
            
            const images = await fastify.prisma.images.findMany({
                where: { id: { in: previewPicIds } },
                select: { id: true, filename: true, country: true }
            });
            
            const imageMap = new Map<number, { filename: string, country: string }>();
            images.forEach(img => {
                imageMap.set(img.id, { filename: img.filename, country: img.country || '' });
            });
            
            const mappedDays = days.map(d => {
                const img = imageMap.get(Number(d.previewpic));
                return {
                    id: d.id.toString(),
                    date: d.name,
                    title: d.title,
                    description: d.galdesc,
                    preview: img ? `https://quer-durch-asien.de/assets/images/final/${img.country}/thumb2/${img.filename}` : null
                };
            });
            
            return serializeBigInt(mappedDays);
        } catch (error) {
            fastify.log.error(error);
            return reply.status(500).send({ message: 'Failed to fetch travel days.' });
        }
    });

    // 2. Get single image details by title/filename
    fastify.get('/by-title/:title', async (request, reply) => {
        const { title } = request.params as { title: string };

        try {
            const image = await fastify.prisma.images.findFirst({
                where: {
                    OR: [
                        { title: title },
                        { filename: title }
                    ]
                }
            });

            if (!image) {
                return reply.status(404).send({ message: 'Image not found.' });
            }

            // Find prev/next image based on date
            const [prevImage, nextImage] = await Promise.all([
                fastify.prisma.images.findFirst({
                    where: {
                        date: { lt: image.date || new Date() },
                        NOT: { country: '' }
                    },
                    orderBy: { date: 'desc' }
                }),
                fastify.prisma.images.findFirst({
                    where: {
                        date: { gt: image.date || new Date() },
                        NOT: { country: '' }
                    },
                    orderBy: { date: 'asc' }
                })
            ]);

            // Find keywords for current image
            const kwRelations = await fastify.prisma.keyword_to_image.findMany({
                where: { image_id: BigInt(image.id) }
            });
            const kwIds = kwRelations.map(r => r.keyword_id);
            const keywords = await fastify.prisma.keywords.findMany({
                where: { id: { in: kwIds } }
            });

            // Find colors for current image
            const colorRelations = await fastify.prisma.color_to_image.findMany({
                where: { image_id: BigInt(image.id) }
            });
            const colorIds = colorRelations.map(r => r.color_id);
            const colors = await fastify.prisma.colors.findMany({
                where: { id: { in: colorIds } }
            });

            return serializeBigInt({
                image,
                keywords,
                colors,
                prev: prevImage ? { title: prevImage.title || prevImage.filename, filename: prevImage.filename, country: prevImage.country } : null,
                next: nextImage ? { title: nextImage.title || nextImage.filename, filename: nextImage.filename, country: nextImage.country } : null
            });
        } catch (error) {
            fastify.log.error(error);
            return reply.status(500).send({ message: 'Failed to fetch image details.' });
        }
    });

    // 3. Get images (main endpoint supporting colors, tags, countries, dates, and pagination)
    fastify.get('/', async (request, reply) => {
        const query = request.query as {
            limit?: string;
            random?: string;
            r?: string;
            g?: string;
            b?: string;
            h?: string;
            s?: string;
            v?: string;
            page?: string;
            country?: string;
            tag?: string;
            date?: string;
        };
        const { country, tag, date } = query;

        // Query params are strings: parse them to bounded numbers up front so the
        // range arithmetic below is numeric (previously `h + 10` concatenated).
        const take = toInt(query.limit, 14, 1, 100);
        const page = toInt(query.page, 1, 1, 100000);
        const skip = (page - 1) * take;
        const random = toBool(query.random);
        const r = toOptionalInt(query.r, 0, 255);
        const g = toOptionalInt(query.g, 0, 255);
        const b = toOptionalInt(query.b, 0, 255);
        const h = toOptionalInt(query.h, 0, 360);
        const s = toOptionalInt(query.s, 0, 100);
        const v = toOptionalInt(query.v, 0, 100);

        let dbImages: ImageRow[] = [];
        let totalCount = 0;

        const colorQuery: ColorQuery | undefined =
            h !== undefined && s !== undefined && v !== undefined ? { kind: 'hsv', h, s, v }
            : r !== undefined && g !== undefined && b !== undefined ? { kind: 'rgb', r, g, b }
            : undefined;

        try {
            if (colorQuery) {
                // Colour search: images whose closest palette colour is nearest first
                const { matches, total } = await searchImagesByColor(fastify.prisma, colorQuery, take, skip);
                totalCount = total;
                const rows = await fastify.prisma.images.findMany({
                    where: { id: { in: matches.map(m => m.id) } },
                });
                const byId = new Map(rows.map(row => [row.id, row]));
                dbImages = matches.flatMap(m => byId.get(m.id) ?? []);
            } else {
                // Unified dynamic filtering (Country, Tag, Date, or Default)
                const whereClause: Prisma.imagesWhereInput = {
                    NOT: { country: '' }
                };

                if (country) {
                    whereClause.country = {
                        equals: country,
                        mode: 'insensitive'
                    };
                }

                if (date && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
                    whereClause.date = dayRange(date);
                }

                if (tag) {
                    const kw = await fastify.prisma.keywords.findFirst({
                        where: { slug: tag }
                    });
                    if (kw) {
                        const mappings = await fastify.prisma.keyword_to_image.findMany({
                            where: { keyword_id: kw.id }
                        });
                        const imageIds = mappings.map(m => Number(m.image_id));
                        whereClause.id = { in: imageIds };
                    } else if (/^\d{4}-\d{2}-\d{2}$/.test(tag)) {
                        // Legacy CodeIgniter routes also used the tag slot for a travel day
                        whereClause.date = dayRange(tag);
                    } else {
                        whereClause.id = -1; // Empty results
                    }
                }

                [totalCount, dbImages] = await Promise.all([
                    fastify.prisma.images.count({ where: whereClause }),
                    fastify.prisma.images.findMany({
                        where: whereClause,
                        orderBy: [{ date: 'asc' }, { id: 'asc' }],
                        take,
                        skip
                    }),
                ]);
            }

            if (random) {
                dbImages = dbImages.sort(() => 0.5 - Math.random()).slice(0, take);
            }

            const mapped = dbImages.map((img) => ({
                id: img.id,
                title: img.title || img.filename,
                desc: img.desc || '',
                date: img.EXIFDateTimeOriginal || null,
                day: img.date ? img.date.toISOString().split('T')[0] : null,
                country: img.country || '',
                file: img.filename,
                folder: img.country || '',
                width: img.width || null,
                height: img.height || null,
                lat: img.EXIFGPSLatitude?.replace(',', '.') || null,
                lng: img.EXIFGPSLongitude?.replace(',', '.') || null,
                alt: img.EXIFGPSAltitude || null
            }));

            return serializeBigInt({
                images: mapped,
                pagination: {
                    total: totalCount,
                    limit: take,
                    page,
                    pages: Math.ceil(totalCount / take),
                }
            });

        } catch (error) {
            fastify.log.error(error);
            return reply.status(500).send({ message: 'Failed to fetch images.' });
        }
    });
}