# Git 团队协作工作流

## 分支模型

- `main`：生产稳定分支，只接受 PR 合并
- `develop`：日常开发主分支
- `feature/*`：功能开发分支
- `hotfix/*`：线上紧急修复

## 提交信息规范

采用 Conventional Commits：

```
<type>(<scope>): <subject>

<body>
```

常用 type：
- **feat**：新功能
- **fix**：修复 bug
- **docs**：文档
- **refactor**：重构
- **chore**：杂项

## 示例

```bash
git checkout -b feature/user-login
git commit -m "feat(auth): 新增用户登录接口"
git push origin feature/user-login
# 在 GitHub 上发起 PR
```
