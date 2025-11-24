# 域名管理系统 (Domain Admin System)

### 🚀 部署指南

#### 1. 创建 D1 数据库

在 [Cloudflare Dashboard](https://dash.cloudflare.com) 中：

- `Workers & Pages` > `D1` > `Create database`，名称：`domain-admin-db`
- 进入数据库 > `Console`，复制并执行 `schema.sql` 文件中的所有 SQL 语句以初始化数据库结构



#### 2. 部署 Pages 项目

- Fork [本仓库](https://github.com/deerwan/domain-admin-demo) 到 GitHub
- 在 Cloudflare Dashboard 创建 Pages 项目，连接 GitHub 仓库
- 构建设置：构建命令 `npm run build`，输出目录 `dist`

#### 3. 配置绑定和变量

**绑定 D1 数据库**：

- Pages 项目 > `Settings` > `Functions` > `D1 database bindings`
- 添加绑定：变量名 `DB`，选择 `domain-admin-db`

**配置环境变量**：

- Pages 项目 > `Settings` > `Environment variables`
- 添加以下变量：
    - `ADMIN_USER`: 管理员用户名
    - `ADMIN_PASSWORD`: 管理员密码
    - `JWT_SECRET`: JWT 签名密钥 (建议设置)

> 配置完成后，在 `Deployments` 页面重试部署 (Retry deployment) 以使配置生效。

#### 4. 配置自动通知（GitHub Actions）

本项目使用 **GitHub Actions** 实现域名到期自动提醒和状态检查：

**配置步骤**：

1. 在 GitHub 仓库设置中添加 Secret：
   - 进入仓库 **Settings** > **Secrets and variables** > **Actions**
   - 点击 **New repository secret**
   - 添加 `PAGES_URL`，值为您的 Cloudflare Pages 地址（如 `https://your-project.pages.dev`）

2. **自动执行**（无需其他操作）：
   - ✅ **域名到期通知**：每天北京时间上午 9:00 自动执行
   - ✅ **域名状态检查**：每天北京时间上午 9:30 自动执行

3. **手动触发**（可选）：
   - 进入 GitHub 仓库 **Actions** 标签页
   - 选择对应的 Workflow
   - 点击 **Run workflow** 立即执行

> ⚠️ **注意**：自动执行默认已禁用，只能手动触发。如需启用自动执行，请参考 [工作流配置指南](.github/WORKFLOWS.md)

#### 5. 配置通知设置

登录系统后，在**通知管理**页面配置：
- Telegram 机器人通知（Bot Token 和 Chat ID）
- 飞书 Webhook 通知
- 到期提醒天数

所有通知设置会保存在数据库中，无需配置环境变量。

---

### 📦 导入导出功能

系统支持 JSON 格式的域名数据导入导出：

- **支持格式**：JSON
- **使用方法**：域名管理页面 → 导入/导出按钮
- **示例文件**：查看 `/examples/domains-sample.json` 示例文件

---

