# AGENTS.md

本文档为 AI 代理提供项目上下文和工作指南。

## 用户偏好设置

1. 请保持对话语言为中文
2. 我的系统为 Mac
3. 遇到复杂且不确定的问题请积极查阅官方文档，使用 context7 mcp
4. 前端 ts 项目不要使用 any 类型
5. 禁止修改 gitignore 中的文件
6. 最后用 `pnpm lint --fix` 修复代码风格问题

---

## 项目概述

**EXIF Gallery Nuxt** 是一个全栈照片管理解决方案，可免费部署在 Cloudflare Workers 上，集成了 AI 智能处理、浏览器端图片压缩等功能。

### 核心功能

- **免费 Cloudflare 部署** - 基于 Cloudflare Workers 的零成本托管
- **AI 智能图像分析** - 支持 OpenAI 和 Gemini 进行语义分析和智能描述生成
- **浏览器端图片压缩** - 使用 JSQuash 在浏览器端进行 JPEG、WebP、AVIF 格式转换和压缩
- **EXIF 数据管理** - 完整的 EXIF 信息读取、展示和编辑
- **标签系统** - 灵活的照片标签管理和筛选
- **相机/镜头筛选** - 按相机品牌、型号和镜头筛选照片
- **云存储** - 基于 NuxtHub (Cloudflare R2) 的对象存储
- **现代 UI** - 基于 shadcn-vue 和 inspira-ui 的美观界面
- **响应式设计** - 支持桌面、平板和移动端的完美适配
- **视图过渡** - 使用 Vue View Transition API 实现流畅的页面切换效果

### 技术栈

| 类别           | 技术                                                                              |
| -------------- | --------------------------------------------------------------------------------- |
| **框架**       | Nuxt 4 (Vue 3.5)                                                                  |
| **边缘运行时** | [NuxtHub](https://hub.nuxt.com) v0.10.4 - Cloudflare 部署                         |
| **数据库**     | D1 (SQLite) + [Drizzle ORM](https://orm.drizzle.team/)                            |
| **存储**       | Cloudflare R2 (via NuxtHub Blob)                                                  |
| **样式**       | [UnoCSS](https://unocss.dev/) + Tailwind CSS                                      |
| **UI 组件**    | [shadcn-vue](https://www.shadcn-vue.com/) + [inspira-ui](https://inspira-ui.com/) |
| **状态管理**   | Pinia 3                                                                           |
| **认证**       | [nuxt-auth-utils](https://github.com/Atinux/nuxt-auth-utils)                      |
| **国际化**     | @nuxtjs/i18n (English/中文)                                                       |
| **验证**       | vee-validate + Zod 4                                                              |
| **AI**         | ai-sdk + @ai-sdk/openai + @ai-sdk/google                                          |
| **图片处理**   | @jsquash/\* (JPEG, WebP, AVIF, PNG, Resize) - 浏览器端压缩                        |
| **设备检测**   | @nuxtjs/device                                                                    |
| **图标**       | Lucide Icons (via @iconify-json/lucide)                                           |

---

## 项目结构

```
exif-gallery-nuxt/
├── app/                    # 前端应用
│   ├── components/         # Vue 组件
│   │   ├── ui/            # shadcn-vue 风格组件
│   │   ├── inspira/       # inspira-ui 动画组件
│   │   ├── ui-pro/        # 项目扩展 UI 组件
│   │   ├── AdminUpload.vue    # 管理员上传页面
│   │   ├── UploadConfig.vue   # 上传配置组件
│   │   ├── PhotoItem.vue      # 照片项组件
│   │   ├── EditPhotoDialog.vue # 编辑照片对话框
│   │   └── [其他组件...]
│   ├── composables/       # Vue 组合式函数
│   │   ├── usePhotos.ts       # 照片数据获取逻辑
│   │   ├── useUploadConfig.ts # 上传配置管理
│   │   ├── useAIConfig.ts     # AI 配置管理
│   │   ├── useTheme.ts        # 主题管理
│   │   ├── usePhotoSort.ts    # 照片排序
│   │   └── [其他 composables...]
│   ├── layouts/           # 页面布局
│   │   ├── admin.vue      # 管理后台布局
│   │   ├── default.vue    # 默认布局
│   │   └── home.vue       # 首页布局
│   ├── middleware/        # 路由中间件
│   │   └── auth.ts        # 认证中间件
│   ├── pages/             # 应用页面
│   │   ├── index.vue      # 首页
│   │   ├── grid.vue       # 网格视图
│   │   ├── admin/         # 管理页面
│   │   ├── p/[...id].vue  # 照片详情页
│   │   ├── tag/[...tag].vue # 标签筛选页
│   │   ├── camera/[...camera].vue # 相机筛选页
│   │   └── lens/[...lens].vue     # 镜头筛选页
│   ├── stores/            # Pinia 状态存储
│   │   ├── photos.ts      # 照片数据存储
│   │   └── navigation.ts  # 导航状态存储
│   ├── utils/             # 工具函数
│   │   ├── compress.ts    # 浏览器端图片压缩
│   │   ├── exif.ts        # EXIF 数据提取
│   │   ├── ai.ts          # AI 集成
│   │   ├── aiProviders.ts # AI 供应商管理
│   │   └── [其他工具...]
│   ├── workers/           # Web Workers
│   │   ├── encode.worker.ts # 图片编码 Worker
│   │   └── decode.worker.ts # 图片解码 Worker
│   └── app.vue            # 根 Vue 组件
├── server/                # 后端 API
│   ├── api/               # API 路由
│   │   ├── auth.post.ts       # 管理员认证
│   │   ├── photos/            # 照片管理 API
│   │   │   ├── [id].delete.ts # 删除照片
│   │   │   ├── [id].get.ts    # 获取单张照片
│   │   │   ├── [id].put.ts    # 更新照片
│   │   │   ├── index.get.ts   # 列出照片（分页、筛选）
│   │   │   └── upload.post.ts # 上传照片
│   │   └── tags/              # 标签 API
│   │       └── index.get.ts   # 列出所有标签
│   ├── db/                # 数据库
│   │   ├── schema.ts      # 数据库 Schema 定义
│   │   └── migrations/    # 迁移文件
│   ├── routes/            # 额外的服务端路由
│   │   └── photos/[pathname].get.ts # 照片文件服务
│   └── utils/             # 服务端工具
│       ├── drizzle.ts     # Drizzle 工具
│       └── tag.ts         # 标签工具
├── i18n/                  # 国际化
│   └── locales/           # 翻译文件
│       ├── en.yml         # 英文
│       └── zh.yml         # 中文
├── types/                 # TypeScript 类型定义
│   ├── auth.d.ts          # 认证类型
│   └── index.ts           # 主类型定义
├── public/                # 静态资源
├── .github/workflows/     # GitHub 工作流
│   └── migrate.yml        # 数据库迁移工作流
├── wrangler.jsonc         # Wrangler 部署配置
├── nuxt.config.ts         # Nuxt 配置
├── tsconfig.json          # TypeScript 配置
├── uno.config.ts          # UnoCSS 配置
└── package.json           # 依赖和脚本
```

---

## 开发命令

### 安装

```bash
# 安装依赖
pnpm install

# 启用 pnpm（如需要）
corepack enable pnpm
```

### 开发

```bash
# 启动开发服务器
pnpm dev

# 连接远程 Cloudflare 资源进行本地开发
pnpm dev --remote

# 构建生产版本
pnpm build

# 预览生产构建
pnpm preview

# 部署到 Cloudflare Workers
pnpm deploy

# 查看部署日志
pnpm logs

# 查看预览环境日志
pnpm logs:preview
```

### 数据库

```bash
# 生成数据库迁移
pnpm db:generate
```

### 代码质量

```bash
# Lint 并修复
pnpm lint --fix

# TypeScript 类型检查
pnpm typecheck
```

### UI 组件管理

```bash
# 添加新的 shadcn-vue 组件
pnpm ui add <component-name>
```

---

## 数据库 Schema

### 主要表

**`photos`** - 核心照片表

| 字段                                      | 类型        | 说明                                                                           |
| ----------------------------------------- | ----------- | ------------------------------------------------------------------------------ |
| `id`                                      | text (CUID) | 主键，8字符                                                                    |
| `fileName`                                | text        | 原始文件名                                                                     |
| `fileModified`                            | timestamp   | 文件修改时间                                                                   |
| `jpeg`, `webp`, `avif`, `thumbnail`       | text        | R2 blob 路径                                                                   |
| `title`, `caption`, `semanticDescription` | text        | 照片描述                                                                       |
| `tags`                                    | text        | 标签名（逗号分隔，旧格式）                                                     |
| EXIF 字段                                 | -           | `make`, `model`, `focalLength`, `fNumber`, `iso`, `exposureTime`, `takenAt` 等 |
| 镜头信息                                  | -           | `lensMake`, `lensModel`, `focalLengthIn35mmFormat`, `exposureCompensation`     |
| 位置信息                                  | -           | `locationName`, `latitude`, `longitude`                                        |
| `aspectRatio`                             | real        | 图片宽高比                                                                     |
| `priorityOrder`                           | real        | 显示顺序                                                                       |
| `hidden`                                  | boolean     | 可见性标志                                                                     |
| `createdAt`, `updatedAt`                  | timestamp   | 时间戳                                                                         |

**`tags`** - 标签注册表

| 字段         | 类型        | 说明                 |
| ------------ | ----------- | -------------------- |
| `id`         | text (CUID) | 主键                 |
| `name`       | text        | 唯一标签名           |
| `photoCount` | integer     | 使用此标签的照片数量 |

**`photo_tags`** - 多对多关联表

| 字段      | 类型 | 说明             |
| --------- | ---- | ---------------- |
| `photoId` | text | 外键 → photos.id |
| `tagId`   | text | 外键 → tags.id   |

---

## API 路由

### Photos

| 方法   | 端点                 | 说明                   | 认证       |
| ------ | -------------------- | ---------------------- | ---------- |
| GET    | `/api/photos`        | 列出照片（分页、筛选） | 否         |
| GET    | `/api/photos/:id`    | 获取单张照片           | 否         |
| POST   | `/api/photos/upload` | 上传新照片             | 是 (admin) |
| PUT    | `/api/photos/:id`    | 更新照片元数据         | 是 (admin) |
| DELETE | `/api/photos/:id`    | 删除照片               | 是 (admin) |

**查询参数支持：**

- `hidden`: 是否显示隐藏照片
- `limit`, `offset`: 分页
- `orderBy`: 排序字段 (`takenAt`, `createdAt`)
- `order`: 排序方向 (`desc`, `asc`)
- `tag`: 标签筛选
- `camera`: 相机筛选（格式：`make|model` 或 `make`）
- `lens`: 镜头筛选

### Tags

| 方法 | 端点        | 说明         | 认证 |
| ---- | ----------- | ------------ | ---- |
| GET  | `/api/tags` | 列出所有标签 | 否   |

### Auth

| 方法 | 端点        | 说明       | 认证 |
| ---- | ----------- | ---------- | ---- |
| POST | `/api/auth` | 管理员登录 | 否   |

---

## 前端关键 Composables

### `usePhotos.ts`

```typescript
// 无限滚动照片列表
const { photos, hasMore, loadMore, loading } = usePhotosInfinite(params, limit)

// 获取单张照片
const { photo, loading, refresh } = usePhoto(id)

// 删除照片
const { deletingPhoto, deletePhoto } = useDeletePhoto()
```

### `useUploadConfig.ts`

```typescript
// 上传配置（存储在 localStorage）
const { config } = useUploadConfig()
// config.value = { enableCompression, enableAutoResize, formats: { jpeg, webp, avif, thumbnail } }
```

### `useAIConfig.ts`

```typescript
// AI 配置管理（支持多供应商）
const {
  config, // AIConfig 对象
  selectedProvider, // 当前选中的供应商
  enabledProviders, // 所有已启用的供应商
  addProvider, // 添加自定义供应商
  updateProvider, // 更新供应商配置
  removeProvider, // 删除供应商
  setSelectedProvider, // 切换当前供应商
} = useAIConfig()
```

### `useTheme.ts`

主题切换和自定义。

### `useFile.ts`

文件处理工具。

### `usePhotoSort.ts`

照片排序逻辑。

---

## 环境变量

| 变量                                  | 必需 | 默认值              | 说明                           |
| ------------------------------------- | ---- | ------------------- | ------------------------------ |
| `NUXT_ADMIN_PASSWORD`                 | 是   | `admin`             | 管理面板访问密码               |
| `NUXT_SESSION_PASSWORD`               | 是   | -                   | Session 加密密钥（至少32字符） |
| `NUXT_PUBLIC_TITLE`                   | 否   | `Exif Gallery Nuxt` | 应用标题                       |
| `NUXT_PUBLIC_DESCRIPTION`             | 否   | -                   | 应用描述                       |
| `NUXT_PUBLIC_DISABLE_3D_CARD_DEFAULT` | 否   | `false`             | 是否默认禁用 3D 卡片效果       |

---

## 编码规范

### 风格指南

- **ESLint**: 使用 `@antfu/eslint-config`
- **引号**: 单引号 (`'`)
- **分号**: 无分号
- **TypeScript**: 严格模式，禁止 `any` 类型

### 组件结构

- 使用 `<script setup lang="ts">`
- Composables 和工具函数自动导入
- shadcn-vue 组件在 `app/components/ui/`
- 自定义组件在 `app/components/`
- inspira-ui 组件在 `app/components/inspira/`

### 状态管理

- Pinia stores 在 `app/stores/`
- 照片数据缓存在 `photos` store，支持无限滚动
- UI 状态在 `ui` store 管理

### 图片处理

- 使用 JSQuash Workers 在浏览器端压缩
- Web Workers 在 `app/workers/` 进行编解码
- 多格式支持：JPEG、WebP、AVIF、PNG、缩略图
- 保持宽高比
- 自动缩放：短边 ≥ 2880px 时缩放到 2160px

### AI 功能

- 支持 OpenAI 和 Gemini 两种供应商
- 使用 ai-sdk 的 `generateObject` 进行结构化输出
- 图片分析结果：`title`、`caption`、`tags`、`semanticDescription`
- 支持自定义供应商配置

### i18n

- 翻译文件在 `i18n/locales/`
- `en.yml` (英文) 和 `zh.yml` (中文)
- 模板中使用：`$t('key')`

### 设备检测

- 使用 `@nuxtjs/device` 进行响应式设计
- 移动端友好的 UI 和断点管理

### 视图过渡

- 启用 Vue View Transition API 实现平滑页面过渡
- 全局中间件控制过渡行为

---

## 关键文件

| 文件                                 | 用途                        |
| ------------------------------------ | --------------------------- |
| `nuxt.config.ts`                     | Nuxt 配置、模块、运行时配置 |
| `server/db/schema.ts`                | 数据库 Schema 定义          |
| `app/composables/usePhotos.ts`       | 照片数据获取逻辑            |
| `app/composables/useAIConfig.ts`     | AI 配置管理（多供应商）     |
| `app/composables/useUploadConfig.ts` | 上传配置                    |
| `app/utils/compress.ts`              | 浏览器端图片压缩            |
| `app/utils/exif.ts`                  | EXIF 数据提取               |
| `app/utils/ai.ts`                    | AI 集成                     |
| `app/utils/aiProviders.ts`           | AI 供应商管理               |
| `server/api/photos/upload.post.ts`   | 照片上传 API                |
| `server/api/photos/index.get.ts`     | 照片列表 API（分页、筛选）  |
| `wrangler.jsonc`                     | Wrangler 部署配置           |

---

## 常见开发任务

### 添加新的照片格式

1. 更新 `server/db/schema.ts` - 添加新列
2. 更新 `server/api/photos/upload.post.ts` - 处理新格式
3. 更新 `app/composables/usePhotos.ts` - 更新反序列化
4. 更新显示照片信息的 UI 组件

### 添加新 API 端点

1. 在 `server/api/[endpoint].ts` 或 `server/api/[dir]/[method].ts` 创建文件
2. 使用 `eventHandler()` 包装
3. 通过 `useDB()` 访问数据库
4. 如需认证：`await requireUserSession(event)`

### 添加新 UI 组件

```bash
pnpm ui add <component-name>
```

然后在 `app/components/ui/<component-name>/` 中自定义。

### 修改数据库 Schema

1. 编辑 `server/db/schema.ts`
2. 运行 `pnpm db:generate` 创建迁移
3. 提交迁移文件
4. 推送到 main 分支，GitHub Actions 自动应用迁移

### 部署到 Cloudflare

1. **GitHub Actions（推荐）**: 推送到 main 分支自动触发
2. **手动**: `pnpm deploy`
3. **Cloudflare Dashboard**: 连接 Git 仓库

**重要**: Cloudflare D1 数据库在构建时无法连接，迁移必须手动执行或通过 GitHub Actions。

---

## 部署配置

### wrangler.jsonc

```jsonc
{
  "name": "exif-gallery-nuxt",
  "main": "./.output/server/index.mjs",
  "r2_buckets": [{ "binding": "BLOB", "bucket_name": "exif-gallery-nuxt" }],
  "d1_databases": [{
    "binding": "DB",
    "database_name": "exif-gallery-nuxt",
    "database_id": "YOUR_DATABASE_ID",
    "migrations_dir": "server/db/migrations/sqlite"
  }]
}
```

### GitHub Actions Secrets

- `CLOUDFLARE_ACCOUNT_ID`: Cloudflare 账户 ID
- `CLOUDFLARE_API_TOKEN`: 具有 D1 编辑权限的 API Token

---

## 注意事项

1. **迁移管理策略**：
   - 本地开发：NuxtHub 自动管理迁移，记录在 `_hub_migrations` 表
   - 云端部署：通过 GitHub Actions 使用 Wrangler 管理迁移
   - 不要在本地开发时手动运行 Wrangler 迁移命令

2. **图片压缩**：
   - 浏览器端压缩会移除 EXIF 数据
   - 需要在压缩前提取 EXIF 信息
   - 支持自动缩放大图

3. **AI 功能**：
   - 需要配置 API Key 才能使用
   - 支持 OpenAI 兼容的 API 端点
   - 图片会被压缩后发送给 AI

4. **类型安全**：
   - 项目使用 TypeScript 严格模式
   - 禁止使用 `any` 类型
   - 使用 Zod 进行运行时验证
