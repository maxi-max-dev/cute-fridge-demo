# 冰箱今天吃什么

一个移动端优先的冰箱决策助手 Demo：先看临期食材，再决定今晚做什么。

## 在线预览

- [GitHub Pages](https://maxi-max-dev.github.io/cute-fridge-demo/)
- [Sites 私密预览](https://bingxiang-jintian-chi-shenme.maxorila.chatgpt.site/)

## 可演示流程

1. 在「今天」首页查看临期提醒，并点击「换一道」。
2. 打开菜谱，将缺少的食材加入购物清单。
3. 点击「做完了」，确认消耗食材并更新库存。
4. 进入「我的冰箱」查看冷藏区、冷冻区和到期状态。
5. 使用「快速入库」连续添加番茄、鸡蛋、青菜或牛肉。

所有数据均为前端模拟，刷新页面会恢复起始示例。

## 本地运行

需要 Node.js 22.13 或更高版本。

```bash
npm install
npm run dev
```

普通构建：

```bash
npm run build
```

GitHub Pages 静态构建：

```bash
GITHUB_PAGES=true \
NEXT_PUBLIC_SITE_URL=https://maxi-max-dev.github.io \
npm run build
```

静态文件会输出到 `dist/client`。推送到 `main` 后，GitHub Actions 会自动发布 Pages。
