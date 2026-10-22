import { Prisma, PrismaClient } from '../generated/client/client';

// How far a palette colour may be from the requested colour and still match.
export const RGB_RANGE = 30;
export const HUE_RANGE = 10;
export const SATURATION_VALUE_RANGE = 20;

export type RgbQuery = { kind: 'rgb'; r: number; g: number; b: number };
export type HsvQuery = { kind: 'hsv'; h: number; s: number; v: number };
export type ColorQuery = RgbQuery | HsvQuery;

export type Range = [min: number, max: number];

export function clampRange(value: number, spread: number, min: number, max: number): Range {
    return [Math.max(min, value - spread), Math.min(max, value + spread)];
}

// Hue is circular: 355° is 10° away from 5°. A window that crosses 0/360
// is split into two ranges.
export function hueRanges(h: number, spread = HUE_RANGE): Range[] {
    const hue = ((h % 360) + 360) % 360;
    const lo = hue - spread;
    const hi = hue + spread;
    if (lo < 0) {
        return [[0, hi], [360 + lo, 360]];
    }
    if (hi > 360) {
        return [[lo, 360], [0, hi - 360]];
    }
    return [[lo, hi]];
}

// WHERE fragment matching palette colours (alias `c`) near the requested colour.
export function colorMatchCondition(q: ColorQuery): Prisma.Sql {
    if (q.kind === 'rgb') {
        const [minR, maxR] = clampRange(q.r, RGB_RANGE, 0, 255);
        const [minG, maxG] = clampRange(q.g, RGB_RANGE, 0, 255);
        const [minB, maxB] = clampRange(q.b, RGB_RANGE, 0, 255);
        return Prisma.sql`c.red BETWEEN ${minR} AND ${maxR}
            AND c.green BETWEEN ${minG} AND ${maxG}
            AND c.blue BETWEEN ${minB} AND ${maxB}`;
    }
    const hue = Prisma.join(
        hueRanges(q.h).map(([min, max]) => Prisma.sql`c.hue BETWEEN ${min} AND ${max}`),
        ' OR ',
    );
    const [minS, maxS] = clampRange(q.s, SATURATION_VALUE_RANGE, 0, 100);
    const [minV, maxV] = clampRange(q.v, SATURATION_VALUE_RANGE, 0, 100);
    return Prisma.sql`(${hue})
        AND c.saturation BETWEEN ${minS} AND ${maxS}
        AND c.value BETWEEN ${minV} AND ${maxV}`;
}

// Squared distance between a palette colour (alias `c`) and the requested colour.
// RGB: Euclidean distance. HSV: hue difference is taken around the circle and
// scaled from 0–180° to 0–100 so it weighs like saturation and value.
export function colorDistance(q: ColorQuery): Prisma.Sql {
    if (q.kind === 'rgb') {
        return Prisma.sql`(power(c.red - ${q.r}::int, 2) + power(c.green - ${q.g}::int, 2) + power(c.blue - ${q.b}::int, 2))`;
    }
    return Prisma.sql`(power(LEAST(ABS(c.hue - ${q.h}::int), 360 - ABS(c.hue - ${q.h}::int)) * 100.0 / 180.0, 2)
        + power(c.saturation - ${q.s}::int, 2) + power(c.value - ${q.v}::int, 2))`;
}

export type ColorMatch = { id: number; distance: number };

// Returns matching image ids ordered by their closest palette colour, plus the total.
export async function searchImagesByColor(
    prisma: PrismaClient,
    q: ColorQuery,
    take: number,
    skip: number,
): Promise<{ matches: ColorMatch[]; total: number }> {
    const where = Prisma.sql`i.country IS NOT NULL AND i.country != '' AND ${colorMatchCondition(q)}`;

    const [counts, rows] = await Promise.all([
        prisma.$queryRaw<{ total: bigint }[]>(Prisma.sql`
            SELECT COUNT(DISTINCT i.id) AS total
            FROM images i
            JOIN color_to_image cti ON i.id = cti.image_id
            JOIN colors c ON cti.color_id = c.id
            WHERE ${where}
        `),
        prisma.$queryRaw<{ id: number; distance: number }[]>(Prisma.sql`
            SELECT i.id, MIN(${colorDistance(q)})::float8 AS distance
            FROM images i
            JOIN color_to_image cti ON i.id = cti.image_id
            JOIN colors c ON cti.color_id = c.id
            WHERE ${where}
            GROUP BY i.id
            ORDER BY distance ASC, i.id ASC
            LIMIT ${take} OFFSET ${skip}
        `),
    ]);

    return {
        matches: rows.map(r => ({ id: Number(r.id), distance: Number(r.distance) })),
        total: Number(counts[0]?.total ?? 0),
    };
}
