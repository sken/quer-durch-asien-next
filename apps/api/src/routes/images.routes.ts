// routes/images.ts

import { FastifyInstance } from 'fastify';
import { Prisma } from '@prisma/client';
import {serializeBigInt} from "./colors.routes";
import {images} from "../generated/client/client";

export async function imageRoutes(fastify: FastifyInstance) {
    fastify.get('/', async (request, reply) => {
        const { limit = 14, offset = 0, random = false, r, g, b, h, s, v, page = 1 } = request.query as {
            limit?: number;
            offset?: number;
            random?: boolean;
            r?: number;
            g?: number;
            b?: number;
            h?: number;
            s?: number;
            v?: number;
            page?: number;
        };

        const take = Number(limit);
        const skip = (Number(page) - 1) * take;

        let images: images[] = [];

        // Helper to create a range
        const createRange = (val: number, range: number, minVal: number, maxVal: number) => {
            const min = Math.max(minVal, val - range);
            const max = Math.min(maxVal, val + range);
            return [min, max];
        };

        if (h !== undefined && s !== undefined && v !== undefined) {
            // HSV filtering (using raw SQL query)
            const hue_range = 10;
            const saturation_value_range = 20;
            const rel = 1;

            let min_h, max_h;
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

            images = await fastify.prisma.$queryRaw<images[]>(Prisma.sql`
                SELECT
                    i.id, i.filename, i.title, i.title_number, i.desc, i.country, i.copyright, i.commentson, i.show, i.date, i.height, i.width, i."thumbX", i."thumbY", i."thumbW", i."thumbH", i.mtime, i.hitcounter, i."EXIFValid", i."EXIFOrientation", i."EXIFMake", i."EXIFModel", i."EXIFExposureTime", i."EXIFFNumber", i."EXIFFocalLength", i."EXIFFocalLength35mm", i."EXIFISOSpeedRatings", i."EXIFDateTimeOriginal", i."EXIFExposureBiasValue", i."EXIFMeteringMode", i."EXIFFlash", i."EXIFImageWidth", i."EXIFImageHeight", i."EXIFContrast", i."EXIFSharpness", i."EXIFSaturation", i."EXIFWhiteBalance", i."EXIFSubjectDistance", i."EXIFGPSLatitude", i."EXIFGPSLatitudeRef", i."EXIFGPSLongitude", i."EXIFGPSLongitudeRef", i."EXIFGPSAltitude", i."EXIFGPSAltitudeRef", i.custom_data, MIN(c.hue) AS hue, MIN(c.saturation) AS saturation, MIN(c.value) AS value, MIN(c."rgb") AS rgb, MIN(c.hex) AS hex, i.created_on
                FROM
                    images i
                JOIN
                    color_to_image cti ON i.id = cti.image_id
                JOIN
                    colors c ON cti.color_id = c.id
                WHERE
                    i.country IS NOT NULL AND i.country != '' AND
                    c.hue BETWEEN ${min_h} AND ${max_h} AND
                    c.saturation BETWEEN ${min_s} AND ${max_s} AND
                    c.value BETWEEN ${min_v} AND ${max_v}
                GROUP BY
                    i.id, i.filename, i.title, i.title_number, i.desc, i.country, i.copyright, i.commentson, i.show, i.date, i.height, i.width, i."thumbX", i."thumbY", i."thumbW", i."thumbH", i.mtime, i.hitcounter, i."EXIFValid", i."EXIFOrientation", i."EXIFMake", i."EXIFModel", i."EXIFExposureTime", i."EXIFFNumber", i."EXIFFocalLength", i."EXIFFocalLength35mm", i."EXIFISOSpeedRatings", i."EXIFDateTimeOriginal", i."EXIFExposureBiasValue", i."EXIFMeteringMode", i."EXIFFlash", i."EXIFImageWidth", i."EXIFImageHeight", i."EXIFContrast", i."EXIFSharpness", i."EXIFSaturation", i."EXIFWhiteBalance", i."EXIFSubjectDistance", i."EXIFGPSLatitude", i."EXIFGPSLatitudeRef", i."EXIFGPSLongitude", i."EXIFGPSLongitudeRef", i."EXIFGPSAltitude", i."EXIFGPSAltitudeRef", i.custom_data, i.rgb, i.created_on
                ORDER BY
                    ABS((hue::numeric + saturation::numeric + value::numeric) - (${h}::numeric + ${s}::numeric + ${v}::numeric)) ASC
                LIMIT ${take} OFFSET ${skip};
            `);

        } else if (r !== undefined && g !== undefined && b !== undefined) {
            // RGB filtering (using raw SQL query)
            const rgb_range = 30; // Assuming a default range for make_ranger

            const [min_r, max_r] = createRange(r, rgb_range, 0, 255);
            const [min_g, max_g] = createRange(g, rgb_range, 0, 255);
            const [min_b, max_b] = createRange(b, rgb_range, 0, 255);

            images = await fastify.prisma.$queryRaw<images[]>(Prisma.sql`
                SELECT
                    i.id, i.filename, i.title, i.title_number, i.desc, i.country, i.copyright, i.commentson, i.show, i.date, i.height, i.width, i."thumbX", i."thumbY", i."thumbW", i."thumbH", i.mtime, i.hitcounter, i."EXIFValid", i."EXIFOrientation", i."EXIFMake", i."EXIFModel", i."EXIFExposureTime", i."EXIFFNumber", i."EXIFFocalLength", i."EXIFFocalLength35mm", i."EXIFISOSpeedRatings", i."EXIFDateTimeOriginal", i."EXIFExposureBiasValue", i."EXIFMeteringMode", i."EXIFFlash", i."EXIFImageWidth", i."EXIFImageHeight", i."EXIFContrast", i."EXIFSharpness", i."EXIFSaturation", i."EXIFWhiteBalance", i."EXIFSubjectDistance", i."EXIFGPSLatitude", i."EXIFGPSLatitudeRef", i."EXIFGPSLongitude", i."EXIFGPSLongitudeRef", i."EXIFGPSAltitude", i."EXIFGPSAltitudeRef", i.custom_data, MIN(c.hue) AS hue, MIN(c.saturation) AS saturation, MIN(c.value) AS value, MIN(c."rgb") AS rgb, MIN(c.hex) AS hex, i.created_on
                FROM
                    images i
                JOIN
                    color_to_image cti ON i.id = cti.image_id
                JOIN
                    colors c ON cti.color_id = c.id
                WHERE
                    i.country IS NOT NULL AND i.country != '' AND
                    c.red BETWEEN ${min_r} AND ${max_r} AND
                    c.green BETWEEN ${min_g} AND ${max_g} AND
                    c.blue BETWEEN ${min_b} AND ${max_b}
                GROUP BY
                    i.id, i.filename, i.title, i.title_number, i.desc, i.country, i.copyright, i.commentson, i.show, i.date, i.height, i.width, i."thumbX", i."thumbY", i."thumbW", i."thumbH", i.mtime, i.hitcounter, i."EXIFValid", i."EXIFOrientation", i."EXIFMake", i."EXIFModel", i."EXIFExposureTime", i."EXIFFNumber", i."EXIFFocalLength", i."EXIFFocalLength35mm", i."EXIFISOSpeedRatings", i."EXIFDateTimeOriginal", i."EXIFExposureBiasValue", i."EXIFMeteringMode", i."EXIFFlash", i."EXIFImageWidth", i."EXIFImageHeight", i."EXIFContrast", i."EXIFSharpness", i."EXIFSaturation", i."EXIFWhiteBalance", i."EXIFSubjectDistance", i."EXIFGPSLatitude", i."EXIFGPSLatitudeRef", i."EXIFGPSLongitude", i."EXIFGPSLongitudeRef", i."EXIFGPSAltitude", i."EXIFGPSAltitudeRef", i.custom_data, i.rgb, i.created_on
                ORDER BY
                    ABS((red::numeric + green::numeric + blue::numeric) - (${r}::numeric + ${g}::numeric + ${b}::numeric)) ASC
                LIMIT ${take} OFFSET ${skip};
            `);

        } else {
            // Default behavior if no color filters are provided
            images = await fastify.prisma.images.findMany({
                where: {
                    NOT: {
                        country: '',
                    },
                },
                orderBy: {
                    id: 'asc',
                },
                skip: skip,
                take: take,
            });
        }

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
            hex: img.hex,
        })) ;

        return serializeBigInt(mapped);

    });

    fastify.get('/parsed-sample', async (request, reply) => {
        const sampleImages = [
            {
                "color": "#a85204",
                "title": "Tibet am 14.09",
                "imageSrc": "https://quer-durch-asien.de/assets/images/final/tibet/thumb2/_MG_6761.jpg"
            },
            {
                "color": "#9b4b1b",
                "title": "Mongolei am 07.09",
                "imageSrc": "https://quer-durch-asien.de/assets/images/final/mongolei/thumb2/_MG_5564.jpg"
            },
            {
                "color": "#a9222e",
                "title": "Tibet am 23.09",
                "imageSrc": "https://quer-durch-asien.de/assets/images/final/tibet/thumb2/IMG_8550.jpg"
            }
        ];

        return { images: sampleImages };
    });

}