# 账号服务 API

> 版本：v1.0 · 最后更新：2026-05

用户中心下的账号服务，负责用户资料的查询、修改以及账号注销。

---

## 基础信息

- **BaseURL**：`https://api.example.com/account/v1`
- **鉴权方式**：Bearer Token（Header: `Authorization: Bearer <token>`）

---

## 1. 获取当前用户资料

**`GET /me`**

### 响应示例

```json
{
    "code": 0,
    "data": {
        "userId": "10086",
        "nickname": "张三",
        "avatar": "https://cdn.example.com/avatar/10086.jpg",
        "email": "zhangsan@example.com",
        "phone": "138****8000",
        "createdAt": "2024-03-15T10:20:30Z"
    }
}
```

---

## 2. 修改资料

**`PATCH /me`**

仅传需要修改的字段即可，未传字段保持原值。

### 请求参数

| 字段 | 类型 | 说明 |
|---|---|---|
| `nickname` | string | 昵称，2~20 字 |
| `avatar` | string | 头像 URL（需先调用上传接口） |
| `email` | string | 邮箱，修改后需重新验证 |

---

## 3. 注销账号

**`DELETE /me`**

**⚠️ 不可逆操作**：将永久删除账号及关联数据，需二次确认。

### 请求参数

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `password` | string | 是 | 当前密码（二次验证） |
| `reason` | string | 否 | 注销原因（用于统计改进） |

---

## 错误码

| code | 含义 |
|---|---|
| 40401 | 用户不存在 |
| 40001 | 密码校验失败 |
| 42901 | 近期操作过于频繁 |

> 本文档为**演示用的二层子目录示例**。
