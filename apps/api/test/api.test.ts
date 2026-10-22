import { after, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import type { FastifyInstance } from 'fastify';

import { buildApp, seed, skipWithoutDb } from './helpers';

describe('API against Postgres', { skip: skipWithoutDb }, () => {
    let app: FastifyInstance;

    before(async () => {
        app = await buildApp();
        await seed(app);
    });

    after(async () => {
        await app?.close();
    });

    const get = async (url: string) => {
        const res = await app.inject({ method: 'GET', url });
        return { status: res.statusCode, body: res.json() };
    };

    describe('GET /images colour search', () => {
        test('RGB search returns the closest colours first and skips unpublished images', async () => {
            const { status, body } = await get('/images?r=255&g=0&b=0');
            assert.equal(status, 200);
            assert.deepEqual(body.images.map((i: { id: number }) => i.id), [1, 2]);
            assert.equal(body.pagination.total, 2);
        });

        test('HSV search matches hues across the 0/360 boundary', async () => {
            const { status, body } = await get('/images?h=2&s=100&v=100');
            assert.equal(status, 200);
            assert.deepEqual(body.images.map((i: { id: number }) => i.id), [1, 2]);
        });

        test('blue does not match red images', async () => {
            const { body } = await get('/images?r=0&g=0&b=255');
            assert.deepEqual(body.images.map((i: { id: number }) => i.id), [3]);
        });

        test('pagination applies to colour results', async () => {
            const { body } = await get('/images?r=255&g=0&b=0&limit=1&page=2');
            assert.deepEqual(body.images.map((i: { id: number }) => i.id), [2]);
            assert.equal(body.pagination.pages, 2);
        });
    });

    describe('GET /images filters', () => {
        test('filters by country, case-insensitively, ordered by date', async () => {
            const { body } = await get('/images?country=CHINA');
            assert.deepEqual(body.images.map((i: { id: number }) => i.id), [1, 5]);
            assert.equal(body.images[0].day, '2008-09-10');
        });

        test('filters by tag slug', async () => {
            const { body } = await get('/images?tag=berge');
            assert.deepEqual(body.images.map((i: { id: number }) => i.id), [2]);
        });

        test('treats a date-shaped tag as a travel day (legacy routes)', async () => {
            const { body } = await get('/images?tag=2008-09-12');
            assert.deepEqual(body.images.map((i: { id: number }) => i.id), [5]);
        });

        test('unknown tag returns no images', async () => {
            const { body } = await get('/images?tag=gibtsnicht');
            assert.equal(body.images.length, 0);
        });

        test('clamps limit and page instead of failing', async () => {
            const { status, body } = await get('/images?limit=0&page=-3');
            assert.equal(status, 200);
            assert.equal(body.pagination.limit, 1);
            assert.equal(body.pagination.page, 1);
        });
    });

    describe('GET /images/tags and /images/by-title', () => {
        test('lists tags with image counts', async () => {
            const { body } = await get('/images/tags');
            assert.deepEqual(body, [{ id: '1', name: 'Berge', slug: 'berge', count: 1 }]);
        });

        test('returns an image with prev/next neighbours by date', async () => {
            const { status, body } = await get('/images/by-title/bild-5');
            assert.equal(status, 200);
            assert.equal(body.image.id, 5);
            assert.equal(body.prev.title, 'bild-1');
            assert.equal(body.next.title, 'bild-2');
            assert.equal(typeof body.image.date, 'string');
        });

        test('404 for an unknown image', async () => {
            const { status } = await get('/images/by-title/nope');
            assert.equal(status, 404);
        });
    });

    describe('posts and comments', () => {
        test('lists only public, published posts with ISO dates', async () => {
            const { body } = await get('/posts');
            assert.deepEqual(body.posts.map((p: { ID: string }) => p.ID), ['1', '4']);
            assert.equal(body.posts[0].post_date, '2008-09-10T12:00:00.000Z');
        });

        test('hides password-protected and draft posts by slug', async () => {
            assert.equal((await get('/posts/by-slug/post-3')).status, 404);
            assert.equal((await get('/posts/by-slug/post-2')).status, 404);
            assert.equal((await get('/posts/by-slug/post-1')).status, 200);
        });

        test('returns approved comments without private fields', async () => {
            const { body } = await get('/posts/1/comments');
            assert.equal(body.length, 1);
            assert.equal(body[0].comment_author, 'Anna');
            assert.equal(body[0].comment_author_email, undefined);
            assert.equal(body[0].comment_author_IP, undefined);
        });

        const postComment = (postId: string, payload: Record<string, string>) =>
            app.inject({ method: 'POST', url: `/posts/${postId}/comments`, payload });

        const valid = { author: 'Ben', email: 'ben@example.com', content: 'Toll!' };

        test('new comments wait for moderation by default', async () => {
            delete process.env.COMMENTS_AUTO_APPROVE;
            const res = await postComment('1', valid);
            assert.equal(res.statusCode, 201);
            assert.equal(res.json().approved, false);

            const stored = await app.prisma.wp_comments.findFirst({ where: { comment_author: 'Ben' } });
            assert.equal(stored?.comment_approved, '0');
            const post = await app.prisma.wp_posts.findFirst({ where: { ID: 1 } });
            assert.equal(post?.comment_count, BigInt(0));
        });

        test('auto-approve publishes the comment and bumps the count', async () => {
            process.env.COMMENTS_AUTO_APPROVE = 'true';
            try {
                const res = await postComment('1', { ...valid, author: 'Cara' });
                assert.equal(res.json().approved, true);
                assert.equal(res.json().comment.comment_author_email, undefined);
                const post = await app.prisma.wp_posts.findFirst({ where: { ID: 1 } });
                assert.equal(post?.comment_count, BigInt(1));
            } finally {
                delete process.env.COMMENTS_AUTO_APPROVE;
            }
        });

        test('rejects comments on closed or unpublished posts', async () => {
            assert.equal((await postComment('4', valid)).statusCode, 404);
            assert.equal((await postComment('2', valid)).statusCode, 404);
        });

        test('rejects invalid input', async () => {
            assert.equal((await postComment('1', { ...valid, email: 'nope' })).statusCode, 400);
            assert.equal((await postComment('1', { ...valid, url: 'javascript:alert(1)' })).statusCode, 400);
            assert.equal((await postComment('x', valid)).statusCode, 400);
        });

        test('honeypot submissions are accepted but not stored', async () => {
            const res = await postComment('1', { ...valid, author: 'Bot', website: 'http://spam' });
            assert.equal(res.statusCode, 201);
            const stored = await app.prisma.wp_comments.findFirst({ where: { comment_author: 'Bot' } });
            assert.equal(stored, null);
        });
    });

    describe('colour write routes', () => {
        test('are disabled without ADMIN_API_KEY', async () => {
            delete process.env.ADMIN_API_KEY;
            const res = await app.inject({ method: 'DELETE', url: '/colors/1' });
            assert.equal(res.statusCode, 403);
        });

        test('require the matching key', async () => {
            process.env.ADMIN_API_KEY = 'secret';
            try {
                const wrong = await app.inject({ method: 'DELETE', url: '/colors/1', headers: { 'x-api-key': 'nope' } });
                assert.equal(wrong.statusCode, 401);
                const ok = await app.inject({
                    method: 'PUT',
                    url: '/colors/3',
                    headers: { 'x-api-key': 'secret' },
                    payload: { hex: '0000fe' },
                });
                assert.equal(ok.statusCode, 200);
                assert.equal(ok.json().hex, '0000fe');
            } finally {
                delete process.env.ADMIN_API_KEY;
            }
        });
    });
});
