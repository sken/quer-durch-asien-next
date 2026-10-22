import { FastifyInstance } from 'fastify';
import { Prisma } from '../generated/client/client';
import { serializeBigInt } from './colors.routes';
import { isNumericId, toInt } from '../utils/query';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// New comments are held for moderation unless explicitly enabled.
// Public comment fields only: never expose commenter email, IP or user agent.
const PUBLIC_COMMENT_FIELDS = {
    comment_ID: true,
    comment_post_ID: true,
    comment_author: true,
    comment_author_url: true,
    comment_date: true,
    comment_content: true,
    comment_parent: true,
} as const;

function autoApproveComments(): boolean {
    return process.env.COMMENTS_AUTO_APPROVE === 'true';
}

export default async function postsRoutes(fastify: FastifyInstance) {
    // 1. Get all published posts (paginated)
    fastify.get('/', async (request, reply) => {
        const query = request.query as {
            limit?: string;
            page?: string;
        };

        const take = toInt(query.limit, 10, 1, 50);
        const page = toInt(query.page, 1, 1, 100000);
        const skip = (page - 1) * take;

        try {
            const [posts, total] = await Promise.all([
                fastify.prisma.wp_posts.findMany({
                    where: {
                        post_status: 'publish',
                        post_type: 'post',
                        post_password: '',
                    },
                    orderBy: {
                        post_date: 'desc',
                    },
                    take,
                    skip,
                }),
                fastify.prisma.wp_posts.count({
                    where: {
                        post_status: 'publish',
                        post_type: 'post',
                        post_password: '',
                    },
                }),
            ]);

            return serializeBigInt({
                posts,
                pagination: {
                    total,
                    limit: take,
                    page,
                    pages: Math.ceil(total / take),
                },
            });
        } catch (error) {
            fastify.log.error(error);
            return reply.status(500).send({ message: 'Failed to fetch posts.' });
        }
    });

    // 2. Get a single post by slug
    fastify.get('/by-slug/:slug', async (request, reply) => {
        const { slug } = request.params as { slug: string };

        try {
            const post = await fastify.prisma.wp_posts.findFirst({
                where: {
                    post_name: slug,
                    post_status: 'publish',
                    post_type: 'post',
                    post_password: '',
                },
            });

            if (!post) {
                return reply.status(404).send({ message: 'Post not found.' });
            }

            return serializeBigInt(post);
        } catch (error) {
            fastify.log.error(error);
            return reply.status(500).send({ message: 'Failed to fetch post.' });
        }
    });

    // 3. Get approved comments for a post
    fastify.get('/:postId/comments', async (request, reply) => {
        const { postId } = request.params as { postId: string };
        if (!isNumericId(postId)) {
            return reply.status(400).send({ message: 'Invalid post id.' });
        }

        try {
            const comments = await fastify.prisma.wp_comments.findMany({
                where: {
                    comment_post_ID: new Prisma.Decimal(postId),
                    comment_approved: '1',
                },
                select: PUBLIC_COMMENT_FIELDS,
                orderBy: {
                    comment_date: 'asc',
                },
            });

            return serializeBigInt(comments);
        } catch (error) {
            fastify.log.error(error);
            return reply.status(500).send({ message: 'Failed to fetch comments.' });
        }
    });

    // 4. Submit a comment for a post
    fastify.post('/:postId/comments', async (request, reply) => {
        const { postId } = request.params as { postId: string };
        const body = (request.body ?? {}) as {
            author?: unknown;
            email?: unknown;
            url?: unknown;
            content?: unknown;
            website?: unknown; // honeypot, must stay empty
        };
        const author = typeof body.author === 'string' ? body.author.trim() : '';
        const email = typeof body.email === 'string' ? body.email.trim() : '';
        const url = typeof body.url === 'string' ? body.url.trim() : '';
        const content = typeof body.content === 'string' ? body.content.trim() : '';

        if (!isNumericId(postId)) {
            return reply.status(400).send({ message: 'Invalid post id.' });
        }
        if (!author || !email || !content) {
            return reply.status(400).send({ message: 'Author, email, and content are required.' });
        }
        if (author.length > 245 || email.length > 100 || url.length > 200 || content.length > 5000) {
            return reply.status(400).send({ message: 'Input too long.' });
        }
        if (!EMAIL_RE.test(email)) {
            return reply.status(400).send({ message: 'Invalid email address.' });
        }
        if (url && !/^https?:\/\//i.test(url)) {
            return reply.status(400).send({ message: 'URL must start with http:// or https://.' });
        }
        if (typeof body.website === 'string' && body.website !== '') {
            // Bot filled the hidden honeypot field: pretend success, store nothing.
            return reply.status(201).send({ approved: false });
        }

        try {
            // Confirm the post exists
            const post = await fastify.prisma.wp_posts.findFirst({
                where: {
                    ID: BigInt(postId),
                    post_status: 'publish',
                    post_type: 'post',
                    comment_status: 'open',
                },
            });

            if (!post) {
                return reply.status(404).send({ message: 'Post not found.' });
            }

            const approved = autoApproveComments();
            const now = new Date();
            const ipAddress = request.ip || '127.0.0.1';
            const userAgent = request.headers['user-agent'] || '';

            const newComment = await fastify.prisma.wp_comments.create({
                data: {
                    comment_post_ID: new Prisma.Decimal(postId),
                    comment_author: author,
                    comment_author_email: email,
                    comment_author_url: url,
                    comment_author_IP: ipAddress,
                    comment_content: content,
                    comment_date: now,
                    comment_date_gmt: now,
                    comment_approved: approved ? '1' : '0',
                    comment_agent: userAgent,
                    comment_karma: BigInt(0),
                    comment_parent: new Prisma.Decimal(0),
                    user_id: new Prisma.Decimal(0),
                },
                select: PUBLIC_COMMENT_FIELDS,
            });

            // comment_count only tracks approved comments (WordPress semantics)
            if (approved) {
                await fastify.prisma.wp_posts.update({
                    where: {
                        ID: BigInt(postId),
                    },
                    data: {
                        comment_count: { increment: 1 },
                    },
                });
            }

            return reply.status(201).send({
                approved,
                comment: approved ? serializeBigInt(newComment) : null,
            });
        } catch (error) {
            fastify.log.error(error);
            return reply.status(500).send({ message: 'Failed to submit comment.' });
        }
    });
}
