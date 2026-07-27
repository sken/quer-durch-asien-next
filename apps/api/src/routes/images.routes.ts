// routes/images.ts

import { FastifyInstance } from 'fastify';
import { Prisma } from '@prisma/client';
import { serializeBigInt } from './colors.routes';

interface DbImage {
    id: number;
    filename: string;
    title: string | null;
    title_number: number;
    desc: string | null;
    country: string | null;
    copyright: string | null;
    commentson: number;
    show: number;
    date: Date | null;
    height: number | null;
    width: number | null;
    thumbX: number | null;
    thumbY: number | null;
    thumbW: number | null;
    thumbH: number | null;
    mtime: number | null;
    hitcounter: number | null;
    EXIFValid: number | null;
    EXIFOrientation: string | null;
    EXIFMake: string | null;
    EXIFModel: string | null;
    EXIFExposureTime: string | null;
    EXIFFNumber: string | null;
    EXIFFocalLength: string | null;
    EXIFFocalLength35mm: string | null;
    EXIFISOSpeedRatings: string | null;
    EXIFDateTimeOriginal: string | null;
    EXIFExposureBiasValue: string | null;
    EXIFMeteringMode: string | null;
    EXIFFlash: string | null;
    EXIFImageWidth: string | null;
    EXIFImageHeight: string | null;
    EXIFContrast: string | null;
    EXIFSharpness: string | null;
    EXIFSaturation: string | null;
    EXIFWhiteBalance: string | null;
    EXIFSubjectDistance: string | null;
    EXIFGPSLatitude: string | null;
    EXIFGPSLatitudeRef: string | null;
    EXIFGPSLongitude: string | null;
    EXIFGPSLongitudeRef: string | null;
    EXIFGPSAltitude: string | null;
    EXIFGPSAltitudeRef: string | null;
    custom_data: string | null;
    hue: number;
    saturation: number;
    value: number;
    rgb: string;
    created_on: Date;
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
        const { limit = 14, random = false, r, g, b, h, s, v, page = 1, country, tag, date } = request.query as {
            limit?: number;
            random?: boolean;
            r?: number;
            g?: number;
            b?: number;
            h?: number;
            s?: number;
            v?: number;
            page?: number;
            country?: string;
            tag?: string;
            date?: string;
        };

        const take = Number(limit);
        const skip = (Number(page) - 1) * take;

        let dbImages: DbImage[] = [];
        let totalCount = 0;

        // Helper to create a range
        const createRange = (val: number, range: number, minVal: number, maxVal: number) => {
            const min = Math.max(minVal, val - range);
            const max = Math.min(maxVal, val + range);
            return [min, max];
        };

        try {
            if (h !== undefined && s !== undefined && v !== undefined) {
                // HSV filtering
                const hue_range = 10;
                const saturation_value_range = 20;
                const rel = 1;

                let min_h: number, max_h: number;
                if (h > hue_range && h < (360 - (hue_range / rel))) {
                    min_h = h - (hue_range / rel);
                    max_h = h + (hue_range / rel);
                } else if (h < hue_range) {
                    min_h = 0;
                    max_h = hue_range;
                } else {
                    min_h = (360 - hue_range);
                    max_h = 360;
                }

                const [min_s, max_s] = createRange(s, saturation_value_range, 0, 100);
                const [min_v, max_v] = createRange(v, saturation_value_range, 0, 100);

                const counts = await fastify.prisma.$queryRaw<{ total: bigint }[]>(Prisma.sql`
                    SELECT COUNT(DISTINCT i.id) as total
                    FROM images i
                    JOIN color_to_image cti ON i.id = cti.image_id
                    JOIN colors c ON cti.color_id = c.id
                    WHERE i.country IS NOT NULL AND i.country != '' AND
                          c.hue BETWEEN ${min_h} AND ${max_h} AND
                          c.saturation BETWEEN ${min_s} AND ${max_s} AND
                          c.value BETWEEN ${min_v} AND ${max_v}
                `);
                totalCount = Number(counts[0]?.total || 0);

                dbImages = await fastify.prisma.$queryRaw<DbImage[]>(Prisma.sql`
                    SELECT i.*, MIN(c.hue) AS hue, MIN(c.saturation) AS saturation, MIN(c.value) AS value, MIN(c."rgb") AS rgb
                    FROM images i
                    JOIN color_to_image cti ON i.id = cti.image_id
                    JOIN colors c ON cti.color_id = c.id
                    WHERE i.country IS NOT NULL AND i.country != '' AND
                          c.hue BETWEEN ${min_h} AND ${max_h} AND
                          c.saturation BETWEEN ${min_s} AND ${max_s} AND
                          c.value BETWEEN ${min_v} AND ${max_v}
                    GROUP BY i.id
                    ORDER BY ABS((MIN(c.hue)::numeric + MIN(c.saturation)::numeric + MIN(c.value)::numeric) - (${h}::numeric + ${s}::numeric + ${v}::numeric)) ASC
                    LIMIT ${take} OFFSET ${skip};
                `);

            } else if (r !== undefined && g !== undefined && b !== undefined) {
                // RGB filtering using clean SQL join to fetch full columns without GROUP BY errors
                const rgb_range = 30;
                const [min_r, max_r] = createRange(r, rgb_range, 0, 255);
                const [min_g, max_g] = createRange(g, rgb_range, 0, 255);
                const [min_b, max_b] = createRange(b, rgb_range, 0, 255);

                const counts = await fastify.prisma.$queryRaw<{ total: bigint }[]>(Prisma.sql`
                    SELECT COUNT(DISTINCT i.id) as total
                    FROM images i
                    JOIN color_to_image cti ON i.id = cti.image_id
                    JOIN colors c ON cti.color_id = c.id
                    WHERE i.country IS NOT NULL AND i.country != '' AND
                          c.red BETWEEN ${min_r} AND ${max_r} AND
                          c.green BETWEEN ${min_g} AND ${max_g} AND
                          c.blue BETWEEN ${min_b} AND ${max_b}
                `);
                totalCount = Number(counts[0]?.total || 0);

                dbImages = await fastify.prisma.$queryRaw<DbImage[]>(Prisma.sql`
                    SELECT i.*, MIN(c.hue) AS hue, MIN(c.saturation) AS saturation, MIN(c.value) AS value, MIN(c."rgb") AS rgb
                    FROM images i
                    JOIN color_to_image cti ON i.id = cti.image_id
                    JOIN colors c ON cti.color_id = c.id
                    WHERE i.country IS NOT NULL AND i.country != '' AND
                          c.red BETWEEN ${min_r} AND ${max_r} AND
                          c.green BETWEEN ${min_g} AND ${max_g} AND
                          c.blue BETWEEN ${min_b} AND ${max_b}
                    GROUP BY i.id
                    ORDER BY ABS((MIN(c.red)::numeric + MIN(c.green)::numeric + MIN(c.blue)::numeric) - (${r}::numeric + ${g}::numeric + ${b}::numeric)) ASC
                    LIMIT ${take} OFFSET ${skip};
                `);

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

                if (date) {
                    const parsedDate = new Date(date);
                    const nextDay = new Date(parsedDate);
                    nextDay.setDate(nextDay.getDate() + 1);
                    whereClause.date = {
                        gte: parsedDate,
                        lt: nextDay
                    };
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
                    } else {
                        // Fallback: If tag matches a date format (CodeIgniter's route mapping legacy), filter by date instead
                        if (/^\d{4}-\d{2}-\d{2}$/.test(tag)) {
                            const parsedDate = new Date(tag);
                            const nextDay = new Date(parsedDate);
                            nextDay.setDate(nextDay.getDate() + 1);
                            whereClause.date = {
                                gte: parsedDate,
                                lt: nextDay
                            };
                        } else {
                            whereClause.id = -1; // Empty results
                        }
                    }
                }

                totalCount = await fastify.prisma.images.count({
                    where: whereClause
                });

                const rawImages = await fastify.prisma.images.findMany({
                    where: whereClause,
                    orderBy: { date: 'asc' },
                    take,
                    skip
                });
                dbImages = rawImages.map(img => ({ ...img, hue: 0, saturation: 0, value: 0, rgb: '' }));
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
                    page: Number(page),
                    pages: Math.ceil(totalCount / take),
                }
            });

        } catch (error) {
            fastify.log.error(error);
            return reply.status(500).send({ message: 'Failed to fetch images.' });
        }
    });
}