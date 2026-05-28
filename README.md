# 📋 待办事项 — Windows 桌面应用

## 技术栈
- Electron + HTML/CSS/JS
- Supabase (PostgreSQL + Realtime)
- Electron Builder (打包 .exe)

## 功能
- ✅ 增删改查 + 完成切换
- 🏷 分类标签（工作/个人/学习/其他）
- 📅 截止日期 + 逾期标红
- 💾 离线缓存（localStorage）
- 🔄 多窗口实时同步（Supabase Realtime）
- 📬 系统通知 + 托盘图标

## 开发
```bash
npm install
npm start
```

## 打包
```bash
npm run build        # 生成 待办事项.exe
npm run build:installer  # 生成安装包
```
