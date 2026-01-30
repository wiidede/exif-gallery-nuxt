<div align="center">

# EXIF Gallery Nuxt

**A modern, AI-powered photo gallery built on the edge**

[English](README.md) | [简体中文](README_zh.md)

[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-F38020?style=for-the-badge&logo=cloudflare&logoColor=white)](https://workers.cloudflare.com/)
[![Nuxt](https://img.shields.io/badge/Nuxt-4.0-00DC82?style=for-the-badge&logo=nuxt.js&logoColor=white)](https://nuxt.com/)
[![Vue](https://img.shields.io/badge/Vue-3.5-4FC08D?style=for-the-badge&logo=vue.js&logoColor=white)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

</div>

---

![exif-gallery-nuxt](./public/exif-gallery-nuxt.jpg)

## ✨ Features

- 🧠 **AI-Powered Image Intelligence** - Integration with OpenAI and Gemini for semantic analysis and intelligent image descriptions
- 🖼️ **Smart Image Processing** - Browser-side compression supporting JPEG, WebP, and AVIF formats with automatic thumbnail generation
- 💾 **Edge-Native Storage** - Cloudflare R2 object storage with D1 database for optimal performance and global edge deployment
- 📊 **Complete EXIF Management** - Full extraction and display of image metadata including camera settings, location data, and timestamps
- 🏷️ **Flexible Tagging System** - Organize photos with custom tags and filter by categories
- 🎨 **Modern User Experience** - Responsive design with smooth view transitions and beautiful UI components
- 🔐 **Secure Admin Panel** - Built-in authentication system for secure photo management and uploads

## 🚀 Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) 18.x or higher
- [pnpm](https://pnpm.io/) (recommended)

```bash
# Install pnpm (if not already installed)
corepack enable pnpm

# Clone the repository
git clone https://github.com/wiidede/exif-gallery-nuxt.git
cd exif-gallery-nuxt

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

Visit `http://localhost:3000` to see the application.

## 🛠️ Tech Stack

- **Framework**: [Nuxt 4](https://nuxt.com/) - The Intuitive Vue Framework
- **Edge Platform**: [NuxtHub](https://hub.nuxt.com) - Build fullstack applications on the edge
- **Database**: [D1](https://developers.cloudflare.com/d1/) - SQLite at the edge
- **Storage**: [R2](https://developers.cloudflare.com/r2/) - S3-compatible object storage
- **Styling**: [UnoCSS](https://unocss.dev/) - The instant on-demand atomic CSS engine
- **UI Components**: [shadcn-vue](https://www.shadcn-vue.com/) + [inspira-ui](https://inspira-ui.com/)
- **State Management**: [Pinia](https://pinia.vuejs.org/)
- **Validation**: [vee-validate](https://vee-validate.logaretm.com/) + [Zod](https://zod.dev/)
- **AI**: [OpenAI](https://openai.com/) + [Google Gemini](https://gemini.google.com/)
- **Code Quality**: [TypeScript](https://www.typescriptlang.org/) + [ESLint](https://eslint.org/)

## 📦 Deployment

### Deploy to Cloudflare Workers

This project is designed for deployment on Cloudflare Workers with NuxtHub.

#### Step 1: Create Cloudflare Resources

1. **Create D1 Database**
   - Navigate to **Storage & Databases** → **D1 SQL Database** in Cloudflare Dashboard
   - Create a database named `exif-gallery-nuxt` and note the **Database ID**

2. **Create R2 Bucket**
   - Navigate to **Storage & Databases** → **R2 Object Storage**
   - Create a bucket and note the **bucket name**

#### Step 2: Configure Deployment

Update `wrangler.jsonc` with your Cloudflare resource IDs:

```jsonc
{
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "exif-gallery-nuxt",
      "database_id": "YOUR_DATABASE_ID",
      "migrations_dir": "server/db/migrations/sqlite",
      "migrations_table": "_hub_migrations"
    }
  ],
  "r2_buckets": [
    {
      "binding": "BLOB",
      "bucket_name": "YOUR_BUCKET_NAME"
    }
  ]
}
```

#### Step 2.5: Initialize Database

**Important**: Cloudflare D1 database cannot be connected during build, so migrations are **not automatically applied**. You must manually run migrations to create the table structure.

**Using GitHub Actions (Recommended, Automated)**

The project includes a `.github/workflows/migrate.yml` file. You can:

1. Add the following secrets in your GitHub repository settings:
   - `CLOUDFLARE_ACCOUNT_ID` - Your Cloudflare account ID (visible in Cloudflare Dashboard)
   - `CLOUDFLARE_API_TOKEN` - API token with D1 edit permissions (create at Cloudflare Dashboard → My Profile → API Tokens)

2. Push code to the `main` branch, or manually trigger the `Database Migration` workflow in GitHub Actions

> [!NOTE]
> This project adopts a separated migration management strategy:
> - Local Development: Migrations are automatically managed by NuxtHub and recorded in the `_hub_migrations` table.
> - Cloud Deployment: Migrations are managed via GitHub Actions using Wrangler, also recorded in the `_hub_migrations` table, but with an additional `.sql` file extension compared to NuxtHub migrations.
> - Note: Do not manually run Wrangler migration commands during local development, as those files lack the `.sql` suffix.

#### Step 3: Deploy via Cloudflare Dashboard

1. Go to **Workers & Pages** → **Create application** → **Connect to Git**
2. Select your forked repository
3. Configure build settings:
   - **Build command**: `pnpm run build`
   - **Deploy command**: `npx wrangler deploy`
4. Add environment variables:
   - `NUXT_SESSION_PASSWORD` - Generate a secure random string (at least 32 characters)
   - `NUXT_ADMIN_PASSWORD` - Set your admin panel password
5. Click **Deploy**

NuxtHub will automatically configure D1 and R2 bindings based on `wrangler.jsonc`.

### Manual Deployment

```bash
# Build for production
pnpm run build

# Deploy to Cloudflare Workers
npx wrangler deploy
```

### Remote Development

Connect to your remote Cloudflare resources locally:

```bash
pnpm dev --remote
```

### Migration from NuxtHub Admin

For users who previously deployed using NuxtHub Admin:

1. **Update your fork** to get the latest changes:

2. **Get existing resources** from your NuxtHub project:
   - D1 database ID
   - R2 bucket name

3. **Update `wrangler.jsonc`** with your existing resources:
   ```jsonc
   {
     "d1_databases": [{ "binding": "DB", "database_id": "YOUR_EXISTING_DATABASE_ID" }],
     "r2_buckets": [{ "binding": "BLOB", "bucket_name": "YOUR_EXISTING_BUCKET_NAME" }]
   }
   ```
   Commit and push this change.

4. **Create new Worker** by following steps 2-3 in the deployment section above

5. **Configure environment variables** from your old project

6. **Deploy** - your data remains in the same D1 database and R2 bucket

## 🔧 Configuration

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NUXT_ADMIN_PASSWORD` | Yes | `admin` | Admin panel access password |
| `NUXT_SESSION_PASSWORD` | Yes | -- | Session encryption key(at least 32 characters) |
| `NUXT_PUBLIC_TITLE` | No | `Exif Gallery Nuxt` | Application title |
| `NUXT_PUBLIC_DESCRIPTION` | No | `A full-stack photo album solution that integrates AI intelligent processing, browser image compression, and other functions` | Application description |

## 📁 Project Structure

```
exif-gallery-nuxt/
├── app/                    # Frontend application
│   ├── components/         # Vue components
│   ├── composables/       # Vue composables
│   ├── pages/             # Application pages
│   ├── stores/            # Pinia stores
│   ├── utils/             # Utility functions
│   └── workers/           # Web Workers
├── server/                # Backend API
│   ├── api/               # API routes
│   ├── db/                # Database schema
│   └── utils/             # Server utilities
└── types/                 # TypeScript definitions
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [exif-photo-blog](https://github.com/sambecker/exif-photo-blog) - Inspiration for EXIF handling
- [nuxt-image-gallery](https://github.com/Flosciante/nuxt-image-gallery) - Gallery implementation reference
- [NuxtHub](https://hub.nuxt.com) - Edge deployment platform
- [shadcn-vue](https://www.shadcn-vue.com/) - Beautiful UI components
- [inspira-ui](https://inspira-ui.com/) - Animated UI components

---

<div align="center">

Made with ❤️ by [wiidede](https://github.com/wiidede)

</div>
