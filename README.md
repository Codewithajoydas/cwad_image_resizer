# CWAD Image Resizer

A fast, full-stack image resizing and conversion application built with **Next.js, TypeScript, Sharp, Cloudinary, and Upstash Redis**.

CWAD Image Resizer allows users to upload an image, resize it to custom dimensions, control image quality, convert it between modern image formats, download the processed image, or optionally generate a permanent shareable Cloudinary URL.

---

## Features

### Image Upload

- Upload images through a file picker
- Drag-and-drop image upload
- Instant image preview
- Automatic detection of original image dimensions
- Client-side validation before processing
- Maximum upload size of **20 MB**

### Image Resizing

- Custom width
- Custom height
- Automatic aspect-ratio calculation
- Lock/unlock aspect ratio
- Resize images up to **10,000 × 10,000 pixels**

When aspect-ratio locking is enabled, changing either width or height automatically calculates the other dimension based on the original image proportions.

### Image Quality

Adjust output quality from:

```text
1% → 100%
```

The selected quality value is passed to Sharp during image generation.

### Format Conversion

The application supports four output formats:

| Format | Supported |
|---|---|
| PNG | Yes |
| JPEG | Yes |
| WebP | Yes |
| AVIF | Yes |

The output format can be selected independently from the input image format.

### Download Processed Images

After processing, users can download the generated image directly.

Downloaded files follow the format:

```text
resized.webp
resized.jpeg
resized.png
resized.avif
```

### Cloudinary Image Hosting

Users can optionally enable **Generate Link**.

When enabled:

1. The image is resized and converted using Sharp.
2. The generated image is uploaded to Cloudinary.
3. Cloudinary returns a secure URL.
4. The URL is displayed to the user.
5. The URL can be copied to the clipboard and shared.

Uploaded images are stored in the Cloudinary folder:

```text
cwad-images
```

### Rate Limiting

The API is protected with **Upstash Redis + Upstash Ratelimit**.

The current application limit is:

```text
10 image-processing requests / 24 hours / IP
```

The API also exposes rate-limit information through response headers:

```text
X-RateLimit-Limit
X-RateLimit-Remaining
X-RateLimit-Reset
```

When the limit is exceeded, the API returns:

```http
429 Too Many Requests
```

### Input Validation

Server-side validation is performed using **Zod**.

The API validates:

- Image file
- Image MIME type
- Width
- Height
- Quality
- Output format

Supported dimensions:

```text
1px → 10,000px
```

Supported quality:

```text
1 → 100
```

Supported output formats:

```text
PNG
JPEG
WebP
AVIF
```

---

# Tech Stack

## Frontend

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- Base UI
- Lucide React
- Shadcn-based components

## Backend

- Next.js Route Handlers
- Sharp
- Zod

## Storage

- Cloudinary

## Rate Limiting

- Upstash Redis
- Upstash Ratelimit

## Monorepo

- Turborepo
- npm Workspaces

## Development Tools

- ESLint
- Prettier
- Vitest
- TypeScript

The application dependencies and workspace configuration are defined in the root and web-app `package.json` files.

---

# Architecture

The project follows a monorepo architecture:

```text
cwad_image_resizer/
│
├── apps/
│   └── web/
│       ├── app/
│       │   ├── api/
│       │   │   └── generate-image/
│       │   │       └── route.ts
│       │   │
│       │   ├── layout.tsx
│       │   ├── page.tsx
│       │   └── globals.css
│       │
│       ├── components/
│       │   ├── layout/
│       │   └── ui/
│       │
│       ├── config/
│       ├── lib/
│       ├── store/
│       ├── types/
│       ├── validators/
│       ├── tests/
│       ├── package.json
│       └── next.config.ts
│
├── packages/
│   ├── types/
│   ├── validation/
│   ├── ui/
│   ├── utils/
│   └── config/
│
├── docs/
├── .github/
│   └── workflows/
│
├── package.json
├── package-lock.json
├── turbo.json
├── tsconfig.base.json
└── README.md
```

The repository uses npm workspaces and Turborepo to manage the application and shared packages.

---

# How Image Processing Works

The processing pipeline is intentionally simple:

```text
User selects image
        │
        ▼
Client validates file
        │
        ▼
User selects:
  ├── Width
  ├── Height
  ├── Quality
  └── Output format
        │
        ▼
POST /api/generate-image
        │
        ▼
Rate limit check
        │
        ▼
Zod validation
        │
        ▼
Convert File → Buffer
        │
        ▼
Sharp
        │
        ├── Resize
        ├── Quality
        └── Format conversion
        │
        ▼
   ┌────┴────┐
   │         │
Download   Cloudinary
   │         │
   │         ▼
   │      Secure URL
   │
   ▼
Processed Image
```

The server converts the uploaded `File` into a Node.js `Buffer`, processes it using Sharp, and either returns the resulting image directly or uploads it to Cloudinary when link generation is requested.

---

# API

## Generate Image

```http
POST /api/generate-image
```

This endpoint handles image resizing, conversion, and optional Cloudinary upload.

### Request

The endpoint accepts `multipart/form-data`.

| Field | Type | Required | Description |
|---|---|---:|---|
| `image` | File | Yes | Input image |
| `width` | Number | Yes | Output width |
| `height` | Number | Yes | Output height |
| `quality` | Number | Yes | Output quality from 1–100 |
| `format` | String | Yes | `png`, `jpeg`, `webp`, or `avif` |
| `generateLink` | Boolean string | No | Upload result to Cloudinary |

Example:

```text
image: photo.jpg
width: 1200
height: 800
quality: 80
format: webp
generateLink: false
```

---

## Successful Download Response

When:

```text
generateLink=false
```

the API returns the processed image directly.

Example headers:

```http
Content-Type: image/webp
Content-Disposition: attachment; filename="resized.webp"
Content-Length: ...
X-Image-Width: 1200
X-Image-Height: 800
X-Image-Format: webp
```

The frontend receives the response as a `Blob` and creates a browser object URL for downloading.

---

## Successful Cloudinary Response

When:

```text
generateLink=true
```

the API uploads the generated image to Cloudinary and returns JSON.

Example response:

```json
{
  "success": true,
  "url": "https://res.cloudinary.com/...",
  "image": {
    "width": 1200,
    "height": 800,
    "format": "webp",
    "size": 123456
  },
  "original": {
    "width": 2400,
    "height": 1600,
    "format": "jpeg",
    "size": 456789
  }
}
```

The response contains both processed-image information and original-image metadata.

---

## Rate Limit Response

When the request limit has been exceeded:

```http
429 Too Many Requests
```

Example:

```json
{
  "success": false,
  "message": "Rate limit exceeded. Please try again later.",
  "remaining": 0,
  "reset": 1234567890
}
```

The current fixed-window limit is configured for 10 requests over 24 hours.

---

## Validation Error

Invalid input returns:

```http
400 Bad Request
```

Example:

```json
{
  "success": false,
  "error": "..."
}
```

The server validates dimensions, quality, image type, and output format before processing.

---

# Requirements

Before running the project locally, make sure you have:

- Node.js
- npm
- Cloudinary account
- Upstash Redis database

The repository currently uses:

```text
Node.js
npm
Turborepo
```

The root package is configured as an npm workspace with `apps/*` and `packages/*`.

---

# Installation

Clone the repository:

```bash
git clone https://github.com/Codewithajoydas/cwad_image_resizer.git
```

Move into the project:

```bash
cd cwad_image_resizer
```

Install dependencies:

```bash
npm install
```

---

# Environment Variables

Create:

```text
apps/web/.env
```

The repository provides an environment template at:

```text
apps/web/.env.example
```

The required variables are:

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000

CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""
```


For Upstash Redis, the application also relies on the environment variables expected by `@upstash/redis` through `Redis.fromEnv()`.

Configure the appropriate Upstash Redis credentials in your environment before running the application with rate limiting enabled.

### Important

Never commit secrets to Git.

Do not expose:

```env
CLOUDINARY_API_SECRET
```

or Redis credentials to the browser.

---

# Cloudinary Configuration

The application initializes Cloudinary using:

```text
CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
```

Cloudinary is only required when the user enables **Generate Link** functionality.

The generated image is uploaded into:

```text
cwad-images
```

The application uses Cloudinary's secure URL as the shareable image URL.

---

# Development

Start the development environment:

```bash
npm run dev
```

The application will be available at:

```text
http://localhost:3000
```

The root development command uses Turborepo to run workspace development tasks.

---

# Production

Build the application:

```bash
npm run build
```

Start the production server:

```bash
npm run start
```

---

# Available Scripts

From the repository root:

| Command | Description |
|---|---|
| `npm run dev` | Start development environment |
| `npm run build` | Build all workspaces |
| `npm run start` | Start production applications |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run TypeScript checks |
| `npm run test` | Run tests |
| `npm run format` | Format project using Prettier |
| `npm run format:check` | Check formatting |
| `npm run clean` | Clean generated workspace files |

These commands are defined in the root `package.json`.

---

# Image Processing Details

The image processor uses **Sharp**.

For every request, Sharp:

1. Reads the input buffer.
2. Reads image metadata.
3. Resizes the image to the requested dimensions.
4. Applies the requested output format.
5. Applies the requested quality.
6. Generates the final image buffer.

The current resize implementation uses:

```ts
fit: "fill"
```

which means the image is resized exactly to the supplied width and height.

### JPEG

JPEG output uses:

```ts
jpeg({
  quality,
  mozjpeg: true
})
```

### PNG

PNG output uses:

```ts
png({
  compressionLevel: 9,
  quality
})
```

### WebP

WebP output uses:

```ts
webp({
  quality
})
```

### AVIF

AVIF output uses:

```ts
avif({
  quality
})
```


---

# Security

The application implements several server-side protections.

### Rate limiting

Requests are rate-limited by client IP using Upstash Ratelimit and Redis.

### Input validation

All important processing parameters are validated on the server with Zod.

### File validation

Only files identified as images are accepted.

### Dimension limits

Width and height are restricted to:

```text
1–10,000 pixels
```

### Quality limits

Quality is restricted to:

```text
1–100
```

### Supported formats

Only these output formats are accepted:

```text
PNG
JPEG
WebP
AVIF
```


---

# Project Structure

A simplified structure of the application is:

```text
apps/web/
│
├── app/
│   ├── api/
│   │   └── generate-image/
│   │       └── route.ts
│   │
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
│
├── components/
│   ├── layout/
│   └── ui/
│
├── config/
│   ├── cloudinary.ts
│   ├── env.ts
│   └── rate-limit.ts
│
├── lib/
│   ├── generate-image.ts
│   ├── rate-limit.ts
│   ├── upload-image.ts
│   └── ...
│
├── store/
├── types/
├── validators/
├── tests/
│
├── .env.example
├── next.config.ts
├── package.json
└── tsconfig.json
```

The main image-processing API lives at:

```text
apps/web/app/api/generate-image/route.ts
```

while Sharp processing, rate limiting, and Cloudinary upload logic are separated into reusable server-side modules.

---

# Frontend Workflow

The frontend follows this workflow:

```text
1. Select image
       ↓
2. Validate image
       ↓
3. Display preview
       ↓
4. Read original dimensions
       ↓
5. Set width / height
       ↓
6. Choose output format
       ↓
7. Set quality
       ↓
8. Optional Cloudinary link
       ↓
9. Generate image
       ↓
10. Show progress
       ↓
11. Download or copy share URL
```

The frontend also handles:

- Upload progress
- Processing state
- Error messages
- Rate-limit information
- Clipboard copying
- Resetting the current image
- Browser object URL cleanup


---

# Why Sharp?

Sharp is used as the image-processing engine because the actual transformation needs to happen on the server.

The application delegates:

```text
Resize
Format conversion
Quality encoding
Image metadata inspection
```

to Sharp rather than attempting to implement image processing manually.

This keeps the image-processing layer focused and efficient.

---

# Why Cloudinary?

Cloudinary is optional rather than being required for every image.

There are two processing modes:

### Download mode

```text
Upload
   ↓
Sharp
   ↓
Processed Buffer
   ↓
Browser Download
```

### Hosted image mode

```text
Upload
   ↓
Sharp
   ↓
Processed Buffer
   ↓
Cloudinary
   ↓
Secure URL
```

This allows the application to function as a normal image converter while also providing image hosting when a shareable URL is needed.

---

# Testing

Run the test suite:

```bash
npm run test
```

Type-check the project:

```bash
npm run typecheck
```

Run linting:

```bash
npm run lint
```

Check formatting:

```bash
npm run format:check
```

---

# Production Deployment

For deployment, configure the required environment variables in your hosting provider.

At minimum, the production environment should have:

```env
NEXT_PUBLIC_APP_URL=https://your-domain.com

CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

UPSTASH_REDIS_REST_URL=...
UPSTASH_REDIS_REST_TOKEN=...
```

Then build the application:

```bash
npm run build
```

and start it using:

```bash
npm run start
```

The exact deployment configuration depends on the hosting platform.

---

# Performance Considerations

The project is designed around server-side image processing.

Important considerations when deploying:

- Use a server/runtime capable of running Sharp.
- Keep image upload limits controlled.
- Keep rate limiting enabled.
- Avoid exposing Cloudinary credentials.
- Monitor Cloudinary storage and bandwidth usage.
- Monitor server memory when processing large images.
- Consider queue-based processing if very large images or high traffic are introduced later.

---

# Current Limitations

The current implementation intentionally keeps the feature set focused.

### Current limitations include:

- Maximum client-side upload size is 20 MB.
- Maximum requested dimensions are 10,000 × 10,000 pixels.
- Processing currently uses `fit: "fill"`, so arbitrary width/height combinations can distort the original aspect ratio when aspect-ratio locking is disabled.
- Only one image is processed per request.
- Cloudinary hosting is optional.
- Rate limiting currently uses a fixed 24-hour window.
- There is no user account system.
- There is no persistent user dashboard or image history.

The 20 MB client-side limit is implemented in the frontend, while the API separately validates the image and processing parameters.

---

# Future Improvements

Potential improvements for future versions:

- [ ] Batch image processing
- [ ] Crop support
- [ ] Smart aspect-ratio presets
- [ ] Social-media image presets
- [ ] Maximum file-size validation on the server
- [ ] Image compression mode
- [ ] Before/after comparison
- [ ] Image file-size comparison
- [ ] EXIF metadata controls
- [ ] Image history
- [ ] User accounts
- [ ] Personal Cloudinary library
- [ ] Expiring share links
- [ ] API authentication
- [ ] API keys for developers
- [ ] Usage dashboard
- [ ] Paid plans
- [ ] Advanced rate-limit tiers
- [ ] Batch downloads as ZIP
- [ ] Background processing for large files
- [ ] Webhooks for asynchronous processing
- [ ] Automated integration tests
- [ ] End-to-end browser testing

---

# Contributing

Contributions are welcome.

### 1. Fork the repository

```bash
git clone https://github.com/Codewithajoydas/cwad_image_resizer.git
```

### 2. Create a feature branch

```bash
git checkout -b feature/my-feature
```

### 3. Install dependencies

```bash
npm install
```

### 4. Make your changes

Follow the existing project structure and coding conventions.

### 5. Run quality checks

```bash
npm run typecheck
npm run lint
npm run test
npm run format:check
```

### 6. Commit your changes

```bash
git add .
git commit -m "feat: add my feature"
```

### 7. Push your branch

```bash
git push origin feature/my-feature
```

### 8. Open a Pull Request

Explain what changed and why the change is useful.

---

# License

This project is currently maintained as a personal/open-source project by **Ajoy Das**.

See the repository license file for the applicable licensing terms.

---

# Author

**Ajoy Das**

GitHub:

https://github.com/Codewithajoydas

---

# Repository

**CWAD Image Resizer**

https://github.com/Codewithajoydas/cwad_image_resizer

---

## Summary

CWAD Image Resizer is a full-stack image-processing application that combines:

```text
Next.js
   +
React
   +
TypeScript
   +
Sharp
   +
Cloudinary
   +
Upstash Redis
   +
Zod
   +
Turborepo
```

It provides a complete workflow for:

```text
Upload
   ↓
Resize
   ↓
Adjust Quality
   ↓
Convert Format
   ↓
Download
        OR
   ↓
Upload to Cloudinary
   ↓
Generate Shareable URL
```

The architecture keeps image processing on the server while giving users a simple browser-based interface for controlling the output.
