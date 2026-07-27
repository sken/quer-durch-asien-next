# Feature Spec: Travel Log / Diary & Comments

This specification describes the migration of the Travel Log (blog posts) and the Comments system from the legacy WordPress/CodeIgniter database into the new Fastify + Next.js stack.

---

## 💾 Database Schema Mapping

The database models are defined in [schema.prisma](file:///Users/stefan.kendlbacher/skendlba/quer-durch-asien-next/apps/api/prisma/schema.prisma):

```prisma
model wp_posts {
  ID                    BigInt    @unique(map: "idx_16571_PRIMARY") @default(autoincrement())
  post_author           Decimal   @default(0) @db.Decimal
  post_date             DateTime? @db.Timestamptz(6)
  post_date_gmt         DateTime? @db.Timestamptz(6)
  post_content          String
  post_title            String
  post_excerpt          String
  post_status           String    @default("publish") @db.VarChar(20)
  post_name             String    @default("") @db.VarChar(200) // This is the URL slug
  post_type             String    @default("post") @db.VarChar(20)
  comment_count         BigInt    @default(0)
  // ... other metadata fields
}

model wp_comments {
  comment_ID           BigInt    @unique(map: "idx_16518_PRIMARY") @default(autoincrement())
  comment_post_ID      Decimal   @default(0) @db.Decimal // Links to wp_posts.ID
  comment_author       String
  comment_author_email String    @default("") @db.VarChar(100)
  comment_author_url   String    @default("") @db.VarChar(200)
  comment_author_IP    String    @default("") @db.VarChar(100)
  comment_date         DateTime? @db.Timestamptz(6)
  comment_content      String
  comment_approved     String    @default("1") @db.VarChar(20) // '1' = approved
  comment_parent       Decimal   @default(0) @db.Decimal
  user_id              Decimal   @default(0) @db.Decimal
}
```

---

## 🔀 Legacy Routing & Logic

### 1. Post Index & Pagination
- **Legacy Route**: `/blog` and `/blog/page/(:num)` (routed to `main/blog` controller action).
- **Behavior**: Retrieves published blog posts sorted by date in descending order.

### 2. Single Post View
- **Legacy Route**: `(:num)/(:num)/(:num)/(:any)` (routed to `main/single_entry/$4`).
  - Example URL: `/2008/09/10/china-welcomes-us/`
- **Behavior**: Retrieves a post matching `post_name` and status `publish`, along with all approved comments associated with that post.

---

## 🚀 Target Architecture

### 1. API Endpoints (`apps/api`)
Introduce a new route group `apps/api/src/routes/posts.routes.ts`:

- **`GET /posts`**:
  * **Query Params**: `limit` (default: `10`), `page` (default: `1`).
  * **Action**: Queries `wp_posts` where `post_status = 'publish'` and `post_type = 'post'`. Order by `post_date DESC`.
  * **Response**: JSON array of posts along with pagination metadata.

- **`GET /posts/:slug`**:
  * **Action**: Finds a unique post in `wp_posts` where `post_name = slug`.
  * **Response**: Single post record or `404`.

- **`GET /posts/:postId/comments`**:
  * **Action**: Fetch all comments in `wp_comments` where `comment_post_ID = postId` and `comment_approved = '1'`. Order by `comment_date ASC`.
  * **Response**: Array of comments.

- **`POST /posts/:postId/comments`**:
  * **Action**: Insert a new comment into `wp_comments`. Requires validation (name, email, content) and protection against spam (can integrate with the Captcha module).

### 2. Next.js Routing (`apps/web`)
* **Blog List**: `app/blog/page.tsx` & `app/blog/page/[id]/page.tsx`.
* **Single Post**: `app/[year]/[month]/[day]/[slug]/page.tsx` (using Next.js Dynamic Segment Routing to match the legacy URL structure exactly).
  * Serves the blog entry using static or server-side rendering for optimal SEO.
  * Embeds a custom `CommentsSection` component that fetches approved comments from `/posts/:id/comments` and renders a simple comment form.
