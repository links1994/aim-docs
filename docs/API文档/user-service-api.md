# 用户中心 API

## 基础信息

- **BaseURL**: `https://api.example.com/user/v1`
- **鉴权方式**: Bearer Token

## 接口列表

### 1. 用户注册

`POST /register`

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| username | string | 是 | 用户名，4-20 字符 |
| password | string | 是 | 密码，8 位以上 |
| email | string | 否 | 邮箱 |

**响应示例**：

```json
{
    "code": 0,
    "data": {
        "userId": "1001",
        "token": "eyJhbGciOi..."
    }
}
```

### 2. 获取用户信息

`GET /profile`

需携带 `Authorization: Bearer <token>` 请求头。

---

> 本文档由 API 网关自动生成，如有疑问请联系后端团队。
