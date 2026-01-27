# AGENTS.md

This document provides context for AI agents working with this codebase.

## Project Overview

**EXIF Gallery Nuxt** 是一个全栈照片管理解决方案，集成了 AI 智能处理、浏览器端图片压缩等功能。

### Core Features

- **图片上传与管理**: 支持多种格式（JPEG, WebP, AVIF）上传和显示
- **云存储**: 基于 NuxtHub (Cloudflare R2) 的对象存储
- **AI 集成**: 支持 OpenAI 和 Gemini 智能图片处理
- **图片压缩**: 使用 JSQuash 在浏览器端进行图片压缩
- **EXIF 数据**: 完整的 EXIF 信息读取和展示
- **标签管理**: 支持照片标签的添加和管理
- **现代 UI**: 基于 shadcn-vue 和 inspira-ui 的美观界面

### Tech Stack

- **Framework**: Nuxt 3/4 (Vue 3)
- **Edge Runtime**: [NuxtHub](https://hub.nuxt.com) - Cloudflare 部署
- **Database**: SQLite + [Drizzle ORM](https://orm.drizzle.team/)
- **Storage**: Cloudflare R2 (via NuxtHub Blob)
- **Styling**: [UnoCSS](https://unocss.dev/) + Tailwind CSS
- **UI Components**: [shadcn-vue](https://www.shadcn-vue.com/) + [inspira-ui](https://inspira-ui.com/)
- **State Management**: Pinia
- **Authentication**: [nuxt-auth-utils](https://github.com/Atinux/nuxt-auth-utils)
- **i18n**: @nuxtjs/i18n (English/中文)
- **Validation**: vee-validate + zod
- **AI**: @ai-sdk/openai, @ai-sdk/google

---

## Project Structure

```
exif-gallery-nuxt/
├── app/                    # Frontend application
│   ├── components/         # Vue components
│   │   ├── ui/            # shadcn-vue style components
│   │   └── inspira/       # inspira-ui components
│   ├── composables/       # Vue composables (usePhotos, useTheme, etc.)
│   ├── layouts/           # Page layouts
│   ├── middleware/        # Route middleware (auth, etc.)
│   ├── pages/             # Application pages
│   ├── stores/            # Pinia stores
│   ├── utils/             # Utility functions (exif, compress, etc.)
│   └── workers/           # Web Workers (encode/decode images)
├── server/                # Backend API
│   ├── api/               # API routes
│   ├── db/                # Database schema and migrations
│   ├── routes/            # Additional server routes
│   └── utils/             # Server utilities
├── i18n/                  # Internationalization
│   └── locales/           # Translation files (en.yml, zh.yml)
├── types/                 # TypeScript type definitions
├── public/                # Static assets
└── drizzle.config.ts      # Drizzle configuration
```

---

## Development Commands

### Installation

```bash
# Install dependencies
pnpm install

# Enable pnpm if needed
corepack enable pnpm
```

### Development

```bash
# Start development server
pnpm dev

# With remote database connection
pnpm dev --remote
```

### Database

```bash
# Generate database migrations
pnpm db:generate

# Run migrations (handled automatically by NuxtHub in dev)
```

### Build & Deploy

```bash
# Build for production
pnpm build

# Preview production build
pnpm preview

# Deploy to NuxtHub
npx nuxthub deploy

# View deployment logs
pnpm logs

# View preview deployment logs
pnpm logs:preview
```

### Code Quality

```bash
# Lint and fix
pnpm lint

# TypeScript type check
pnpm typecheck
```

### UI Component Management

```bash
# Add new shadcn-vue component
pnpm ui add <component-name>
```

---

## Database Schema

### Main Tables

**`photos`** - Core photo table
- `id`: Primary key (CUID)
- `fileName`: Original file name
- `jpeg`, `webp`, `avif`, `thumbnail`: R2 blob paths
- `title`, `caption`, `semanticDescription`: Photo descriptions
- `tags`: Tag names (comma-separated)
- EXIF fields: `make`, `model`, `focalLength`, `fNumber`, `iso`, `exposureTime`, `takenAt`, etc.
- `hidden`: Visibility flag
- `priorityOrder`: Display order
- Timestamps: `createdAt`, `updatedAt`

**`tags`** - Tag registry
- `id`: Primary key
- `name`: Unique tag name
- `photoCount`: Number of photos with this tag

**`photo_tags`** - Many-to-many junction table
- `photoId`, `tagId`: Foreign keys
- `createdAt`: Association timestamp

---

## API Routes

### Photos

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/photos` | List photos (paginated, filterable) | No |
| GET | `/api/photos/:id` | Get single photo | No |
| POST | `/api/photos/upload` | Upload new photo(s) | Yes (admin) |
| PUT | `/api/photos/:id` | Update photo metadata | Yes (admin) |
| DELETE | `/api/photos/:id` | Delete photo | Yes (admin) |

### Tags

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/tags` | List all tags | No |

### Auth

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth` | Admin login | No |

---

## Frontend Key Composables

### `usePhotos.ts`
- `usePhotosInfinite(params)`: Infinite scroll photo list
- `usePhoto(id)`: Fetch single photo
- `useDeletePhoto()`: Delete photo functionality

### `useUploadConfig.ts`
- Upload configuration management

### `useTheme.ts`
- Theme switching and customization

### `useAIConfig.ts`
- AI configuration (OpenAI/Gemini settings)

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NUXT_ADMIN_PASSWORD` | Yes | Admin panel access password |
| `NUXT_SESSION_PASSWORD` | Yes | Session encryption key |
| `NUXT_PUBLIC_TITLE` | No | Application title |
| `NUXT_PUBLIC_DESCRIPTION` | No | Application description |

---

## Coding Conventions

### Style Guidelines

- **ESLint**: Configured with `@nuxt/eslint-config`
- **Quotes**: Single quotes (`'`)
- **Semicolons**: No semicolons
- **TypeScript**: Strict mode enabled

### Component Structure

- Use `<script setup lang="ts">`
- Auto-imports enabled for composables and utilities
- shadcn-vue components in `app/components/ui/`
- Custom components in `app/components/`

### State Management

- Pinia stores in `app/stores/`
- Photo data cached in `photos` store with infinite scroll support

### Image Processing

- Browser-side compression using JSQuash workers
- Web Workers in `app/workers/` for encode/decode operations
- Multiple format support: JPEG, WebP, AVIF, thumbnail

### i18n

- Translation files in `i18n/locales/`
- Keys in `en.yml` (English) and `zh.yml` (Chinese)
- Usage: `$t('key')` in templates

---

## Key Files

| File | Purpose |
|------|---------|
| `nuxt.config.ts` | Nuxt configuration, modules, runtime config |
| `drizzle.config.ts` | Database migration settings |
| `server/db/schema.ts` | Database schema definitions |
| `app/composables/usePhotos.ts` | Photo data fetching logic |
| `server/api/photos/upload.post.ts` | Photo upload API with AI processing |
| `app/utils/compress.ts` | Browser-side image compression |
| `app/utils/exif.ts` | EXIF data extraction |

---

## Common Development Tasks

### Adding a New Photo Format

1. Update `server/db/schema.ts` - add new column
2. Update `server/api/photos/upload.post.ts` - handle new format
3. Update `app/composables/usePhotos.ts` - update deserialization
4. Update UI components that display photo info

### Adding New API Endpoint

1. Create file in `server/api/[endpoint].ts` or `server/api/[dir]/[method].ts`
2. Use `eventHandler()` wrapper
3. Access database via `useDB()`
4. Add authentication check if needed: `await requireUserSession(event)`

### Adding New UI Component

```bash
pnpm ui add <component-name>
```

Then customize in `app/components/ui/<component-name>/`

### Modifying Database Schema

1. Edit `server/db/schema.ts`
2. Run `pnpm db:generate` to create migration
3. Commit migration file

---

## Testing Notes

- No explicit test framework configured (as of current state)
- Manual testing via `pnpm dev`
- Use browser DevTools for debugging
- Check Cloudflare dashboard for deployed app logs
