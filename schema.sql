-- Domain Admin Database Schema
-- 域名管理系统数据库架构
-- 

-- Users table
-- 用户表：存储系统用户信息
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,  -- 用户ID（主键，自增）
  username TEXT UNIQUE NOT NULL,  -- 用户名（唯一，不能为空）
  password_hash TEXT NOT NULL,  -- 密码哈希值（不能为空）
  locale TEXT DEFAULT 'zh-CN',  -- 语言偏好设置（默认：中文）
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP  -- 创建时间（默认：当前时间）
);

-- Domains table
-- 域名表：存储域名信息和状态
CREATE TABLE IF NOT EXISTS domains (
  id INTEGER PRIMARY KEY AUTOINCREMENT,  -- 域名ID（主键，自增）
  domain TEXT NOT NULL,  -- 域名（不能为空）
  domain_url TEXT,  -- 域名访问链接（可选）
  registrar TEXT,  -- 注册商名称（可选）
  registrar_url TEXT,  -- 注册商链接（可选）
  expiry_date DATETIME,  -- 到期日期（可选）
  notes TEXT,  -- 备注信息（可选）
  status TEXT,  -- 状态（如：Active/Inactive）
  last_checked DATETIME,  -- 最后检查时间（可选）
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP  -- 创建时间（默认：当前时间）
);

-- Notification settings table
-- 通知设置表：存储通知配置信息
CREATE TABLE IF NOT EXISTS notification_settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,  -- 设置ID（主键，自增）
  telegram_enabled INTEGER DEFAULT 0,  -- 是否启用Telegram通知（0=否，1=是）
  telegram_bot_token TEXT,  -- Telegram机器人令牌（可选）
  telegram_chat_id TEXT,  -- Telegram聊天ID（可选）
  feishu_enabled INTEGER DEFAULT 0,  -- 是否启用飞书通知（0=否，1=是）
  feishu_webhook_url TEXT,  -- 飞书Webhook地址（可选）
  notify_days_before INTEGER DEFAULT 30,  -- 提前多少天发送通知（默认：30天）
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP  -- 更新时间（默认：当前时间）
);

-- Initialize with default notification settings (if not exists)
-- 初始化默认通知设置（如果不存在）
INSERT INTO notification_settings (telegram_enabled, feishu_enabled, notify_days_before) 
SELECT 0, 0, 30
WHERE NOT EXISTS (SELECT 1 FROM notification_settings);
