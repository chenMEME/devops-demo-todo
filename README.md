# 📋 待办事项

**技术栈:** Tauri + HTML/JS + Supabase

## 功能
- ✅ 增删改查 + 完成切换
- 🏷 分类标签（工作/个人/学习/其他）
- 📅 截止日期 + 逾期标红
- 💾 离线缓存（localStorage）
- 🔄 Supabase 云同步

## 文件
| 文件 | 说明 |
|------|------|
| `src/index.html` | 主界面 |
| `src-tauri/` | Tauri 后端（Rust） |
| `tests/e2e.js` | Playwright E2E 测试 |

## 构建
```bash
# 需要 Rust + VS Build Tools
cargo install tauri-cli
npm install -g @tauri-apps/cli
tauri build --bundles msi
```

## 产物
- `待办事项.exe` (8.5MB)
- `待办事项_1.0.0_x64_zh-CN.msi` (2.8MB)

## E2E 测试结果
```
📋 结果: 7/7 通过
✅ 页面正常加载
✅ 添加待办项
✅ 标记完成
✅ 编辑待办项
✅ 删除待办项
✅ 分类和日期
✅ 统计更新
```
