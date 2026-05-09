# 认证服务 API

> 版本：v1.0 · 最后更新：2026-05

用户中心下的认证服务，负责登录、登出、Token 续签等核心身份验证能力。

---

## 基础信息

- **BaseURL**：`https://api.example.com/auth/v1`
- **鉴权方式**：Bearer Token（登录接口除外）
- **响应格式**：`application/json; charset=utf-8`

统一返回结构：

```json
{
    "code": 0,
    "message": "ok",
    "data": { }
}
```

---

## 1. 登录

**`POST /login`**

使用账号密码换取访问令牌。

### 请求参数

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `username` | string | 是 | 登录用户名 / 手机号 / 邮箱 |
| `password` | string | 是 | 密码（前端需 SHA256 加盐哈希） |
| `captcha` | string | 否 | 连续错误 3 次后必填 |

### 响应示例

```json
{
    "code": 0,
    "message": "ok",
    "data": {
        "accessToken": "eyJhbGciOi...",
        "refreshToken": "def502...",
        "expiresIn": 7200
    }
}
```

---

## 2. 刷新 Token

**`POST /token/refresh`**

用 `refreshToken` 换取新的 `accessToken`，避免用户频繁重新登录。

### 请求参数

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `refreshToken` | string | 是 | 登录时返回的刷新令牌 |

---

## 3. 登出

**`POST /logout`**

将当前 Token 加入黑名单，立即失效。

---

## 错误码

| code | 含义 |
|---|---|
| 40001 | 账号或密码错误 |
| 40002 | 账号已锁定 |
| 40003 | 需要验证码 |
| 40101 | Token 无效或已过期 |
| 40102 | RefreshToken 已失效 |

> 本文档为**演示用的二层子目录示例**，用于验证文档站点对嵌套目录的支持能力。
