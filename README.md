# Rebeldom · 一个可以直接部署的静态个人博客

一套完整的、零依赖的中文个人博客模板。使用原生 HTML、CSS 和少量 JavaScript 写成，不需要 Node.js、不需要构建，克隆下来就能发布到 GitHub Pages。

**当前配置**：仓库 [Waveadwake/Rebeldem_Web](https://github.com/Waveadwake/Rebeldem_Web)，站点地址 `https://waveadwake.github.io/Rebeldem_Web/`。

**仍是示例内容**：杭州、独立设计师 / 前端开发者等个人经历，以及 4 篇示例文章和首页短句。博客名、署名、邮箱、GitHub 仓库和站点地址都已按你的信息替换。

---

## 包含什么

- **完整页面**：首页、文章归档页、关于页、4 篇完整文章、自定义 404 页
- **认真排版**：中文宋体标题、编辑式栅格、大留白、打印样式
- **响应式**：手机、平板与桌面端分别调整版式
- **深色 / 浅色模式**：跟随系统，支持手动切换，会记住选择
- **文章归档**：按主题筛选、即时搜索、支持 `?tag=阅读&q=城市` 形式的链接
- **阅读体验**：阅读进度条、自动生成的文章目录、复制代码、复制链接、上一篇 / 下一篇
- **基础 SEO**：每页独立 meta、Open Graph、Twitter Card、`sitemap.xml`、`robots.txt`、RSS
- **无跟踪、无 Cookie、无第三方脚本**：字体与插图全部本地加载
- **自动部署**：内置 GitHub Actions 工作流，推送到 `main` 即发布
- **无障碍细节**：跳转链接、键盘焦点、语义标签、`prefers-reduced-motion` 支持

没有评论系统、访问统计和后台。这些都可以以后按需接入，不影响现在的静态发布。

---

## 目录结构

```text
web/
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Pages 自动部署
├── .nojekyll                   # 让 GitHub Pages 直接发布静态文件
├── index.html                  # 首页
├── posts.html                  # 全部文章 / 搜索 / 筛选
├── about.html                  # 关于页
├── 404.html                    # 自定义 404
├── feed.xml                    # RSS 2.0
├── sitemap.xml                 # 站点地图
├── robots.txt
├── site.webmanifest            # 添加到主屏幕所需的站点信息
├── assets/
│   ├── css/style.css           # 全站样式与设计变量
│   ├── js/site.js              # 主题、导航、筛选、目录、复制等
│   └── images/                 # SVG 插图、图标、社交分享图
└── post/
    ├── slow-is-a-skill.html
    ├── blog-return.html
    ├── reading-method.html
    └── city-walk.html
```

所有站内链接都是**相对路径**。因此部署在项目子路径 `https://waveadwake.github.io/Rebeldem_Web/` 下，样式和站内跳转也能正常工作。

---

## 本地预览

在本目录中启动一个本地静态服务器：

```bash
cd web
python -m http.server 8000
```

然后打开 <http://localhost:8000>。也可以使用 VS Code 的 Live Server 扩展。

> 建议通过本地服务器预览，而不是直接双击 HTML 文件。站点本身可以 `file://` 打开，但浏览器的剪贴板权限、历史记录等行为会更接近真实环境。

---

## 发布到 GitHub Pages

### 方法一：把 `web` 目录当作仓库根目录（推荐）

仓库已经创建好：[Waveadwake/Rebeldem_Web](https://github.com/Waveadwake/Rebeldem_Web)。目前是空仓库，按下面的步骤把站点推上去即可。

1. 在本机的 `web` 目录执行：

   ```bash
   cd web
   git init -b main
   git add .
   git commit -m "chore: initial personal blog"
   git remote add origin https://github.com/Waveadwake/Rebeldem_Web.git
   git push -u origin main
   ```

2. 打开仓库的 **Settings → Pages**，把 **Build and deployment → Source** 设为 **GitHub Actions**。
3. 打开 **Actions** 标签，等待 “Deploy blog to GitHub Pages” 跑完。首次部署通常需要一到两分钟。如果第一次运行发生在开启 Pages 之前并且失败了，开启 Pages 后点一次 **Re-run jobs** 即可。
4. 发布地址是：

   ```text
   https://waveadwake.github.io/Rebeldem_Web/
   ```

工作流会直接把仓库根目录作为 Pages 产物发布，而后端不需要额外配置。若之后修改仓库名，记得同步替换全站的站点根地址。

> **隐藏文件**：`.github`、`.nojekyll` 是部署所需文件。用 GitHub 网页拖拽上传时可能忽略隐藏目录，建议使用上面的 Git 命令。

### 方法二：保留仓库里的 `web` 子目录

如果你已经有一个仓库，希望把网站放在 `web/` 里：

1. 把本目录中的 `web` 文件夹完整放进仓库。
2. 把 `web/.github/workflows/deploy.yml` 复制到**仓库根目录**的 `.github/workflows/` 下，例如命名为 `deploy-blog.yml`。
3. 在 Pages 设置中保持 **Source = GitHub Actions**，然后提交推送。

工作流会自动判断站点在仓库根目录还是 `web/` 子目录，无需修改路径。

### 方法三：从分支直接发布（不使用 Actions）

GitHub Pages 的 “Deploy from a branch” 只支持仓库根目录或 `/docs` 目录。

- 把 `web/` 中的**内容**放到仓库根目录，或重命名为 `docs/`；
- 在 **Settings → Pages → Source** 选择 **Deploy from a branch**；
- 选择 `main` 分支和 `/(root)`（或 `/docs`）；
- 保存后等待发布。

这种方式不使用 `.github/workflows/deploy.yml`，但 `.nojekyll` 仍然建议保留。**更推荐方法一**，因为 Actions 的发布记录、回滚和环境信息都更清楚。

---

## 上线前替换清单

### 1. 站点地址

当前项目已经统一配置为：

```text
https://waveadwake.github.io/Rebeldem_Web/
```

对应仓库：`https://github.com/Waveadwake/Rebeldem_Web`。

如果之后改了仓库名，需要把全站的站点根地址一并替换。涉及：

- 所有 `.html` 文件中的 `<link rel="canonical">`、`og:url`、`og:image`、`twitter:image`
- `feed.xml` 中的链接与图片地址
- `sitemap.xml` 中的所有 `<loc>`
- `robots.txt` 中的 Sitemap 地址
- `404.html` 顶部的 `<base>` 地址（保证任意缺失路径都能加载样式和导航）
- 文章页中的 Open Graph 地址

### 2. 身份与联系方式

已经填写：

- 博客名：`Rebeldom`
- 署名：`Waveadwake`
- 邮箱：`Rebeldom@foxmail.com`
- GitHub：`https://github.com/Waveadwake`
- 仓库：`https://github.com/Waveadwake/Rebeldem_Web`
- 站点地址：`https://waveadwake.github.io/Rebeldem_Web/`

仍是示例内容、可按需修改：

- 关于页和首页中的职业、居住地、个人经历
- 4 篇示例文章与首页的「最近在想」短句
- 文章插图下的 `Rebeldom · 山野习作` 等说明文字
- 可以按自己的需要加入 Instagram 或其他社交链接

RSS 中的 `<author>` 已经同步为你的邮箱和署名。

### 3. 示例文章

4 篇文章是完整示例，不是占位 Lorem Ipsum。你可以：

- 保留它们，改成自己的经历与观点；
- 或删除文章，按下面「新增一篇文章」的步骤重写。

同时更新以下位置的文章数量与分类：

- `posts.html` 顶部的 `04 篇文章 / 04 个主题`
- `posts.html` 中每篇文章的 `data-category` 与 `data-search`
- 文章页底部的上一篇 / 下一篇
- `feed.xml` 与 `sitemap.xml`
- 首页的精选文章卡片和「最近在想」短句
- `about.html` 的 “NOW” 列表和最后更新日期

### 4. 图片与视觉

- 首页插画：`assets/images/hero-window.svg`
- 文章封面：`assets/images/cover-*.svg`（页面显示）及同名 `cover-*.png`（社交分享）
- 关于页插图：`assets/images/about-desk.svg`
- 社交分享图：`assets/images/og-cover.png`（1200 × 630）
- 图标：`favicon.svg`、`icon-192.png`、`icon-512.png`、`apple-touch-icon.png`

插图均为手绘 SVG，可以直接编辑颜色与形状。站点主色在 `assets/css/style.css` 顶部的 `:root` 变量中修改，例如：

```css
--bg: #f3eee4;
--ink: #1d2b24;
--accent: #a4492d;
--sage: #697c6b;
```

深色模式对应 `[data-theme="dark"]` 中的同名变量。

### 5. RSS 与站点地图时间

发布新文章后，记得更新：

- `feed.xml` 的 `<lastBuildDate>` 和对应的 `<item>`
- `sitemap.xml` 的 `<lastmod>`
- 首页的「最近更新」日期

---

## 新增一篇文章

这是一个纯静态站点，没有 Markdown 编译器。新增文章需要复制一个现有 HTML 文件，但这意味着你完全掌控排版。

1. 复制 `post/slow-is-a-skill.html`，重命名为新的英文短链接，例如 `post/my-new-post.html`。
2. 修改 `<title>`、`<meta name="description">`、canonical、Open Graph、发布日期、分类、标签和正文。
3. 把页面中的 `../` 相对路径保持不变；如果封面换成新图，把图片放进 `assets/images/`。
4. 在 `posts.html` 中复制一条 `<article class="archive-item" ...>`，更新 `href`、日期、分类和 `data-search`；同步顶部计数。
5. 在 `index.html` 的精选区域内放入卡片（可选）。
6. 更新文章底部的上一篇 / 下一篇链接。
7. 在 `feed.xml` 增加 `<item>`，在 `sitemap.xml` 增加 `<url>`。

然后：

```bash
git add .
git commit -m "post: 我的新文章"
git push
```

GitHub Actions 会自动发布。也可以把常用的文章结构抽成模板文件，或改用 Eleventy / Hugo / Astro 等静态生成器；当前版本的取舍是**零构建和长期可维护**。

文章正文支持这些样式：

- `.callout`：重点提示框
- `blockquote`：引言
- `<pre><code>`：带复制按钮的代码块
- `.tag` / `.category`：标签与分类
- `<p class="footnote">`：页末小注

---

## 可选：绑定自定义域名

1. 在项目的**发布根目录**添加一个名为 `CNAME` 的文件，内容只写域名，例如：

   ```text
   blog.example.com
   ```

2. 在 DNS 服务商处添加记录。子域名通常使用：

   ```text
   CNAME  blog  waveadwake.github.io
   ```

   根域名需要使用 GitHub Pages 文档中列出的 A 记录。

3. 在 **Settings → Pages → Custom domain** 中填写域名并保存，等待 DNS 检查通过后开启 **Enforce HTTPS**。
4. 把全站占位地址替换为新域名。

---

## 常见问题

**推送到 main 后 Actions 没有触发？**

检查工作流是否位于仓库根目录的 `.github/workflows/` 下，默认分支是否叫 `main`。如果分支叫 `master`，修改 `deploy.yml` 顶部的 `branches`。

**Pages 报 “Get Pages site failed” 或 “Not Found”？**

先在 **Settings → Pages** 把 Source 设为 **GitHub Actions**，再重新运行工作流。仓库必须对当前工作流开放 Pages 权限（工作流中已经声明 `pages: write` 和 `id-token: write`）。

**子路径部署后样式丢失？**

本项目全部使用相对路径，正常不会出现。检查是否误把某一处链接改成了以 `/` 开头的绝对路径。

**搜索为什么只搜这 4 篇？**

搜索完全在浏览器里完成，读取的是 `posts.html` 中每篇文章的 `data-search` 属性。新增文章时需要手动补上该属性。没有后端，也没有全文索引。

**能加评论吗？**

可以。推荐使用 [giscus](https://giscus.app/) 这类基于 GitHub Discussions 的评论组件，在文章页底部加一段脚本即可。接入第三方服务前，请考虑隐私与加载速度。

**字体为什么在不同系统上略有差异？**

为了不依赖外部 CDN，标题使用本机可用的宋体 / 思源宋体字体栈。如果需要完全一致的视觉效果，可以自托管 Noto Serif SC 字体，但会增加页面体积。

**文章可以改成 Markdown 吗？**

可以，但需要引入静态生成器或构建步骤。当前版本刻意选择“无构建”：一个 HTML 文件就是一个页面，十年后仍然能打开。

---

## 浏览器支持

面向现代浏览器（Chrome、Edge、Firefox、Safari 的近两个大版本）。使用了 CSS Grid、`clamp()`、`backdrop-filter` 和 `color-mix()` 等特性；不支持这些特性的旧浏览器仍可阅读正文，只会失去部分视觉效果。

---

## 许可

- 代码（HTML 结构、CSS、JavaScript、构建配置）：MIT License
- 文字与插图：CC BY-NC 4.0

示例文章、首页短句和关于页中的职业与个人经历仅用于展示，不代表真实人物经历。博客名、署名、邮箱、GitHub 信息已按 `Waveadwake` 的资料配置。
