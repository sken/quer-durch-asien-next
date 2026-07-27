# Feature Spec: Contact Form, Captcha & Static Pages

This specification outlines the migration path for the Contact Form, the Captcha verification engine, and static informational pages.

---

## 💾 Database Schema Mapping

The database models are defined in [schema.prisma](file:///Users/stefan.kendlbacher/skendlba/quer-durch-asien-next/apps/api/prisma/schema.prisma):

```prisma
model captcha {
  captcha_id   BigInt @unique(map: "idx_16393_PRIMARY") @default(autoincrement())
  captcha_time BigInt
  ip_address   String @default("0") @db.VarChar(16)
  word         String @db.VarChar(20) // The text word the user must enter
}
```

---

## 🔀 Legacy Routing & Logic

### 1. Static Pages
- **Route**: `/impressum` (routed to `main/impressum` controller action).
  - Renders legal and copy owner text.
- **Route**: `/packliste` (routed to `main/packliste` controller action).
  - Renders a checklist of travel items. Uses `print.css` for clean print stylesheets.

### 2. Contact Form with Captcha
- **Route**: `/kontakt` & `/kontakt/send` (routed to `main/kontakt` and `main/kontakt/send`).
- **Spam Mitigation**:
  - Generates a random alphanumeric string, inserts it into the `captcha` table with the user's IP address and a timestamp.
  - Generates an image representing the word.
  - When the form is submitted, the code checks if a record exists matching the entered word, IP, and age ($<2$ hours). If verified, it sends the email to the administrator.

---

## 🚀 Target Architecture

### 1. Static Pages (`apps/web`)
* **Imprint**: `app/impressum/page.tsx`. Can be fully pre-rendered static content.
* **Packing List**: `app/packliste/page.tsx`. Clean checklist grid. We can use Tailwind CSS printable utilities (`print:hidden`, `print:block`) to handle print layouts natively instead of a separate CSS file.

### 2. Contact & Captcha (`apps/web` & `apps/api`)
We can either keep the legacy database-driven Captcha or modernize it:

#### Modern Serverless Alternative (Recommended)
* Replace the `captcha` table checks with a modern library like **Google reCAPTCHA v3** or **hCaptcha** in the Next.js frontend. This eliminates database reads/writes for captcha tokens and provides superior spam filtering.

#### Database Captcha Flow (To preserve legacy structure)
* **API Endpoints**:
  * `GET /captcha`: Generates a random word, saves it in the database with IP, and returns a generated SVG/image stream (using libraries like `svg-captcha` in Node).
  * `POST /contact`: Receives fields `name`, `email`, `message`, and `captchaWord`. Queries the `captcha` table to verify, then uses a Node mailing library like `nodemailer` to dispatch the contact email.
