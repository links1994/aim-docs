# 团队文档中心

基于 **GitHub Pages** 的纯静态文档站点，用于浏览和下载 API 文档、知识库等 Markdown 资料。

- **零构建**：纯 HTML/CSS/JS，push 即生效
- **自动识别**：新增文件无需改代码，通过 GitHub API 自动列目录
- **中文描述**：用 `_meta.json` 给目录/文件加上中文标题和说明
- **在线预览 + 一键下载**：md 文件在线渲染，任何文件都可下载原文
- **全站搜索**：按文件名、描述、路径搜索

## 🚀 启用 GitHub Pages

1. 推送本仓库代码到 `main` 分支
2. 进入 **仓库 Settings → Pages**
3. Source 选择 **Deploy from a branch** → Branch：`main`、Folder：`/ (root)`
4. 保存后等待 1-2 分钟，访问：

```
https://links1994.github.io/aim-docs/
```

## 📁 目录结构

```
aim-docs/
├── index.html              # 主页面
├── assets/
│   ├── style.css           # 样式
│   └── app.js              # 核心逻辑
├── docs/                   # 📝 所有文档放这里
│   ├── _meta.json          # 根目录元信息（首页展示）
│   ├── API文档/
│   │   ├── _meta.json
│   │   ├── APP端&小程序/
│   │   │   └── _meta.json
│   │   ├── 商城后台管理/
│   │   │   ├── _meta.json
│   │   │   ├── mall-admin-openapi.yaml
│   │   │   └── 售后管理-AftersaleAdminControllerApi.md
│   │   └── 商家后台管理/
│   │       ├── _meta.json
│   │       ├── mall-tob-service-openapi.yaml
│   │       └── 售后管理-AftersaleMerchantControllerApi.md
│   └── 知识WIKI/
│       ├── _meta.json
│       └── git-workflow.md
├── .nojekyll               # 禁用 Jekyll 处理
└── README.md
```

## ✍️ 添加新文档

### 方式 1：直接丢文件

把 md / pdf / 任何文件放进 `docs/` 下合适的子目录即可，**无需改任何代码**。

### 方式 2：添加中文描述（推荐）

在该目录下编辑 `_meta.json`：

```json
{
    "title": "目录的中文名",
    "description": "这个目录是做什么的",
    "dirs": {
        "子目录原名": "子目录的中文描述"
    },
    "files": {
        "xxx.md": "这个文件的用途说明",
        "yyy.pdf": "这个文件的用途说明"
    }
}
```

只需维护 `_meta.json`，页面上会自动显示中文标题与描述。

## ⚙️ 配置

如果仓库名或用户名有变动，修改 [assets/app.js](assets/app.js) 顶部的 `CONFIG`：

```js
const CONFIG = {
    owner: 'links1994',
    repo: 'aim-docs',
    branch: 'main',
    docsRoot: 'docs',
};
```

## ❓ 常见问题

**Q: 访问时报 403 / rate limit？**
A: GitHub 未登录用户每小时 60 次 API 调用。团队内部访问通常够用；若超额，让访问者登录 GitHub 即可。

**Q: 支持私有仓库吗？**
A: 不支持匿名访问私有仓库。当前方案针对公开仓库。

**Q: 中文目录名乱码？**
A: 本项目已通过 `encodeURI` 处理，正常。若你的 Git 有 `core.quotepath` 问题，执行：
```bash
git config --global core.quotepath false
```
