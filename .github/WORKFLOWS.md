# GitHub Actions 自动执行配置

本项目包含两个 GitHub Actions 工作流，**默认已禁用自动执行**，仅支持手动触发。

## � 启用自动执行

编辑以下文件，**取消注释** `schedule` 部分：

- `.github/workflows/domain-expiry-notify.yml`
- `.github/workflows/domain-status-check.yml`

### 修改示例

**修改前**（禁用状态）：
```yaml
on:
  # schedule:
  #   - cron: '0 1 * * *'
  workflow_dispatch:
```

**修改后**（启用状态）：
```yaml
on:
  schedule:
    - cron: '0 1 * * *'
  workflow_dispatch:
```

删除 `schedule` 和 `cron` 行前面的 `#` 即可。

---

## ⏸️ 禁用自动执行

编辑工作流文件，**添加注释符号 `#`** 到 `schedule` 部分：

```yaml
on:
  # schedule:          # ← 添加 # 注释
  #   - cron: '...'    # ← 添加 # 注释
  workflow_dispatch:
```

---

## � 执行时间

| 工作流 | 执行时间（北京时间） |
|--------|-------------------|
| 域名到期通知 | 每天上午 9:00 |
| 域名状态检查 | 每天上午 9:30 |

---

## 🎯 手动触发

无论是否启用自动执行，都可以手动触发：

1. GitHub 仓库 → **Actions** → 选择工作流
2. 点击 **Run workflow** → **Run workflow**

---

## ⚙️ 配置要求

启用前请确保已配置：

- **GitHub Secret**: `PAGES_URL`（Cloudflare Pages 地址）
- **通知设置**: Telegram 或飞书（在系统后台配置）
