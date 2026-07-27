import { FastifyInstance } from 'fastify';
import { Prisma } from '@prisma/client';
import { serializeBigInt } from './colors.routes';

export default async function postsRoutes(fastify: FastifyInstance) {
    // 1. Get all published posts (paginated)
    fastify.get('/', async (request, reply) => {
        const { limit = 10, page = 1 } = request.query as {
            limit?: number;
            page?: number;
        };

        const take = Number(limit);
        const skip = (Number(page) - 1) * take;

        try {
            const [posts, total] = await Promise.all([
                fastify.prisma.wp_posts.findMany({
                    where: {
                        post_status: 'publish',
                        post_type: 'post',
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
                    },
                }),
            ]);

            return serializeBigInt({
                posts,
                pagination: {
                    total,
                    limit: take,
                    page: Number(page),
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

        try {
            const comments = await fastify.prisma.wp_comments.findMany({
                where: {
                    comment_post_ID: new Prisma.Decimal(postId),
                    comment_approved: '1',
                },
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
        const { author, email, url = '', content } = request.body as {
            author: string;
            email: string;
            url?: string;
            content: string;
        };

        if (!author || !email || !content) {
            return reply.status(400).send({ message: 'Author, email, and content are required.' });
        }

        try {
            // Confirm the post exists
            const post = await fastify.prisma.wp_posts.findFirst({
                where: {
                    ID: BigInt(postId),
                },
            });

            if (!post) {
                return reply.status(404).send({ message: 'Post not found.' });
            }

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
                    comment_approved: '1', // Auto-approved for simplicity
                    comment_agent: userAgent,
                    comment_karma: BigInt(0),
                    comment_parent: new Prisma.Decimal(0),
                    user_id: new Prisma.Decimal(0),
                },
            });

            // Increment the comment_count on the post
            await fastify.prisma.wp_posts.update({
                where: {
                    ID: BigInt(postId),
                },
                data: {
                    comment_count: post.comment_count + BigInt(1),
                },
            });

            return serializeBigInt(newComment);
        } catch (error) {
            fastify.log.error(error);
            return reply.status(500).send({ message: 'Failed to submit comment.' });
        }
    });
}
