import Fastify, { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';

// Integration tests run against a disposable Postgres database whose schema
// matches prisma/schema.prisma (`prisma db push`). They are skipped when
// TEST_DATABASE_URL is not set, because seeding wipes the tables it uses.
export const TEST_DATABASE_URL = process.env.TEST_DATABASE_URL;
export const skipWithoutDb = TEST_DATABASE_URL ? false : 'TEST_DATABASE_URL not set';

export async function buildApp(): Promise<FastifyInstance> {
    process.env.DATABASE_URL = TEST_DATABASE_URL;
    const { default: app } = await import('../src/app');
    const fastify = Fastify({ logger: false });
    // fp() exposes the app's decorators (fastify.prisma) to the test instance
    await fastify.register(fp(app));
    await fastify.ready();
    return fastify;
}

// Small fixture set that exercises the colour search, tags, countries and blog.
export async function seed(fastify: FastifyInstance) {
    const db = fastify.prisma;
    await db.$executeRawUnsafe(
        'TRUNCATE images, colors, color_to_image, keywords, keyword_to_image, wp_posts, wp_comments RESTART IDENTITY',
    );

    await db.colors.createMany({
        data: [
            { id: 1, hue: 0, saturation: 100, value: 100, red: 255, green: 0, blue: 0, hex: 'ff0000', websafe: 'ff0000' },
            { id: 2, hue: 355, saturation: 90, value: 90, red: 230, green: 20, blue: 30, hex: 'e6141e', websafe: 'ff0033' },
            { id: 3, hue: 240, saturation: 100, value: 100, red: 0, green: 0, blue: 255, hex: '0000ff', websafe: '0000ff' },
            { id: 4, hue: 0, saturation: 100, value: 50, red: 128, green: 0, blue: 0, hex: '800000', websafe: '990000' },
        ],
    });

    const image = (id: number, country: string, day: string) => ({
        id,
        filename: `img_${id}.jpg`,
        title: `bild-${id}`,
        title_number: id,
        country,
        date: new Date(`${day}T08:00:00.000Z`),
        hue: 0,
        saturation: 0,
        value: 0,
        rgb: '',
    });
    await db.images.createMany({
        data: [
            image(1, 'china', '2008-09-10'),
            image(2, 'tibet', '2008-09-20'),
            image(3, 'nepal', '2008-10-01'),
            image(4, '', '2008-09-11'), // not published: empty country
            image(5, 'china', '2008-09-12'),
        ],
    });

    await db.color_to_image.createMany({
        data: [
            { image_id: 1, color_id: 1 },
            { image_id: 2, color_id: 2 },
            { image_id: 3, color_id: 3 },
            { image_id: 4, color_id: 1 },
            { image_id: 5, color_id: 4 },
        ],
    });

    await db.keywords.create({ data: { id: 1, name: 'Berge', slug: 'berge' } });
    await db.keyword_to_image.create({ data: { image_id: 2, keyword_id: 1 } });

    const post = (id: number, fields: Record<string, unknown>) => ({
        ID: id,
        post_date: new Date('2008-09-10T12:00:00.000Z'),
        post_content: '<p>Hallo</p>',
        post_title: `Post ${id}`,
        post_excerpt: '',
        post_name: `post-${id}`,
        to_ping: '',
        pinged: '',
        post_content_filtered: '',
        ...fields,
    });
    await db.wp_posts.createMany({
        data: [
            post(1, {}),
            post(2, { post_status: 'draft' }),
            post(3, { post_password: 'geheim' }),
            post(4, { comment_status: 'closed', post_date: new Date('2008-09-01T12:00:00.000Z') }),
        ],
    });

    await db.wp_comments.createMany({
        data: [
            {
                comment_post_ID: 1,
                comment_author: 'Anna',
                comment_author_email: 'anna@example.com',
                comment_author_IP: '10.0.0.1',
                comment_content: 'Schöne Bilder!',
                comment_date: new Date('2008-09-11T10:00:00.000Z'),
                comment_approved: '1',
            },
            {
                comment_post_ID: 1,
                comment_author: 'Spam',
                comment_author_email: 'spam@example.com',
                comment_content: 'waiting for moderation',
                comment_approved: '0',
            },
        ],
    });
}
