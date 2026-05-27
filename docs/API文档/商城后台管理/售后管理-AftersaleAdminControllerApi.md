---
service: mall-admin
yaml_file: mall-admin-openapi.yaml
md_file: 售后管理-AftersaleAdminControllerApi.md
program_id: B-2026-001-aftersale-revamp
version: v1.1.0
updated_at: 2026-05-26
controller: AftersaleAdminController
module: AftersaleAdmin
title: 售后管理
---

# 售后管理 API（管理后台）

## 接口总览

| 方法 | 路径 | 说明 | 操作人 |
|------|------|------|--------|
| POST | `/mall-admin/api/admin/aftersale/page-list` | 售后列表查询（管理后台） | 管理员 |
| GET | `/mall-admin/api/admin/aftersale/{aftersaleNo}/detail` | 售后详情查询（管理后台） | 管理员 |
| POST | `/mall-admin/api/admin/aftersale/update-note` | 修改运营备注 | 管理员 |
| GET | `/mall-admin/api/admin/aftersale/enums/status` | 售后状态枚举 | 管理员 |
| GET | `/mall-admin/api/admin/aftersale/enums/type` | 售后类型枚举 | 管理员 |

## 通用说明

### 请求头

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| Authorization | String | 是 | Bearer Token，管理员鉴权信息 |

> **注**：operatorId 由后端从 Header 解析注入，文档中透明处理。

### 响应格式

所有接口统一返回 `CommonResult<T>`：

```json
{
  "code": 200,
  "message": "success",
  "data": {}
}
```

### 分页响应格式

列表查询接口返回分页数据：

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "totalCount": 100,
    "items": []
  }
}
```

### 错误码说明

| 错误码区间 | 说明 |
|-----------|------|
| 200 | 成功 |
| 4xx | 客户端错误（参数错误、权限不足等） |
| 5xx | 服务端错误 |

---

## API 详情

### 1. 售后列表查询（管理后台）

**路径**：`POST /mall-admin/api/admin/aftersale/page-list`

**描述**：管理后台分页查询售后单列表，支持多维度筛选

#### 请求参数（Body）

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| statusList | Array<Integer> | 否 | 售后状态列表（多状态筛选；单状态传单元素列表） |
| aftersaleTypeList | Array<String> | 否 | 售后类型列表（多类型筛选；单类型传单元素列表） |
| aftersaleNo | String | 否 | 售后单号（前缀 LIKE 匹配） |
| subOrderSn | String | 否 | 子订单号（前缀 LIKE 匹配） |
| productCode | String | 否 | 商品编码（前缀 LIKE 匹配） |
| merchantId | Long | 否 | 商家ID |
| userId | Long | 否 | 用户ID |
| applyStartTime | String | 否 | 申请时间-起，格式：yyyy-MM-dd HH:mm:ss |
| applyEndTime | String | 否 | 申请时间-止，格式：yyyy-MM-dd HH:mm:ss |
| slaTimeoutHours | Integer | 否 | SLA 临期阈值（小时），仅枚举 {4, 12, 24} 生效；其它值不抛错，按不过滤处理 |
| minRefundAmount | BigDecimal | 否 | 最低申请退款金额 |
| maxRefundAmount | BigDecimal | 否 | 最高申请退款金额 |
| pageNum | Integer | 否 | 页码（默认1） |
| pageSize | Integer | 否 | 每页条数（默认20） |

> 排序由后端固定为「申请时间倒序」，前端不可改写。

#### 请求示例

```json
{
  "statusList": [10, 20],
  "aftersaleTypeList": ["RETURN_AND_REFUND"],
  "merchantId": 2001,
  "aftersaleNo": "AS2026",
  "applyStartTime": "2026-05-01 00:00:00",
  "applyEndTime": "2026-05-31 23:59:59",
  "slaTimeoutHours": 4,
  "minRefundAmount": 10.00,
  "maxRefundAmount": 1000.00,
  "pageNum": 1,
  "pageSize": 20
}
```

#### 响应参数

| 参数 | 类型 | 说明 |
|------|------|------|
| totalCount | Long | 总记录数 |
| items | Array<AftersaleAdminListItem> | 列表数据 |

#### 响应示例

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "totalCount": 100,
    "items": [
      {
        "aftersaleNo": "AS20260518000001",
        "orderSn": "ON20260518000001",
        "subOrderSn": "SUB20260518000001",
        "userId": 10001,
        "merchantName": "XX旗舰店",
        "status": 10,
        "statusName": "PENDING_MERCHANT_AUDIT",
        "statusText": "待商家审核",
        "aftersaleType": "RETURN_AND_REFUND",
        "aftersaleTypeName": "RETURN_AND_REFUND",
        "aftersaleTypeText": "退货退款",
        "applyRefundAmount": 100.00,
        "slaDeadline": "2026-05-20 10:00:00",
        "createdAt": "2026-05-18 10:00:00"
      }
    ]
  }
}
```

---

### 2. 售后详情查询（管理后台）

**路径**：`GET /mall-admin/api/admin/aftersale/{aftersaleNo}/detail`

**描述**：管理后台查询售后单详情，包含用户信息、商品信息、商家信息、物流信息、售后记录等

#### 请求参数（Path）

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| aftersaleNo | String | 是 | 售后单号 |

#### 响应参数

| 参数 | 类型 | 说明 |
|------|------|------|
| aftersaleNo | String | 售后单号 |
| orderSn | String | 订单号 |
| subOrderSn | String | 子订单号 |
| status | Integer | 主状态编码 |
| statusName | String | 主状态枚举名 |
| statusText | String | 主状态中文文案 |
| aftersaleType | String | 售后类型 |
| aftersaleTypeText | String | 售后类型中文 |
| applyRefundAmount | BigDecimal | 申请退款金额 |
| actualRefundAmount | BigDecimal | 实际退款金额 |
| refundReason | String | 退款原因 |
| refundDesc | String | 退款说明 |
| userInfo | Object | 用户信息模块 |
| orderInfo | Object | 售后订单商品信息模块 |
| merchantInfo | Object | 商家信息模块 |
| logisticsInfo | Object | 物流信息模块 |
| returnAddress | Object | 退货地址模块 |
| aftersaleEvents | Array | 售后记录列表 |
| adminNote | String | 运营备注 |
| merchantNote | String | 商家备注 |
| createdAt | String | 创建时间 |

#### 响应示例

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "aftersaleNo": "AS20260518000001",
    "orderSn": "ON20260518000001",
    "status": 10,
    "statusName": "PENDING_MERCHANT_AUDIT",
    "statusText": "待商家审核",
    "aftersaleType": "RETURN_AND_REFUND",
    "aftersaleTypeText": "退货退款",
    "applyRefundAmount": 100.00,
    "userInfo": {
      "userId": 10001,
      "userName": "张三",
      "userPhone": "138****5678",
      "userLevel": "VIP"
    },
    "orderInfo": {
      "productId": 1001,
      "productName": "夏季连衣裙",
      "skuDesc": "红色/L码"
    },
    "merchantInfo": {
      "merchantId": 2001,
      "merchantName": "XX旗舰店"
    },
    "adminNote": "已联系商家确认",
    "merchantNote": "商品已下架",
    "createdAt": "2026-05-18 10:00:00"
  }
}
```

---

### 3. 修改运营备注

**路径**：`POST /mall-admin/api/admin/aftersale/update-note`

**描述**：运营人员对售后单添加或修改运营备注信息

#### 请求参数（Body）

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| aftersaleNo | String | 是 | 售后单号 |
| adminNote | String | 否 | 运营备注内容 |

#### 请求示例

```json
{
  "aftersaleNo": "AS20260518000001",
  "adminNote": "已联系商家确认退款时间"
}
```

#### 响应参数

无

#### 响应示例

```json
{
  "code": 200,
  "message": "success",
  "data": null
}
```

---

### 4. 售后状态枚举

**路径**：`GET /mall-admin/api/admin/aftersale/enums/status`

**描述**：查询售后状态枚举列表（供前端下拉筛选）

#### 请求参数

无

#### 响应参数

| 参数 | 类型 | 说明 |
|------|------|------|
| code | Integer | 状态编码 |
| text | String | 状态文案 |

#### 响应示例

```json
{
  "code": 200,
  "message": "success",
  "data": [
    {"code": 10, "text": "待商家审核"},
    {"code": 20, "text": "待用户寄回"},
    {"code": 30, "text": "待商家收货"},
    {"code": 40, "text": "待商家发货"},
    {"code": 50, "text": "待用户确认收货"},
    {"code": 60, "text": "退款中"},
    {"code": 70, "text": "验货争议"},
    {"code": 80, "text": "平台介入中"},
    {"code": 90, "text": "售后已拒绝"},
    {"code": 100, "text": "售后已完成"}
  ]
}
```

---

### 5. 售后类型枚举

**路径**：`GET /mall-admin/api/admin/aftersale/enums/type`

**描述**：查询售后类型枚举列表（供前端下拉筛选）

#### 请求参数

无

#### 响应参数

| 参数 | 类型 | 说明 |
|------|------|------|
| code | String | 类型编码 |
| text | String | 类型文案 |

#### 响应示例

```json
{
  "code": 200,
  "message": "success",
  "data": [
    {"code": "REFUND_ONLY_BEFORE_SHIP", "text": "未发货仅退款"},
    {"code": "RETURN_AND_REFUND", "text": "退货退款"},
    {"code": "EXCHANGE", "text": "换货"},
    {"code": "RESEND", "text": "补发"}
  ]
}
```

---

## 附录

### 售后状态枚举表

| 状态编码 | 枚举名 | 中文文案 | 终态 |
|---------|--------|---------|------|
| 10 | PENDING_MERCHANT_AUDIT | 待商家审核 | 否 |
| 20 | PENDING_USER_RETURN | 待用户寄回 | 否 |
| 30 | PENDING_MERCHANT_RECEIVE | 待商家收货 | 否 |
| 40 | PENDING_MERCHANT_SHIP | 待商家发货 | 否 |
| 50 | PENDING_USER_RECEIVE | 待用户确认收货 | 否 |
| 60 | REFUNDING | 退款中 | 否 |
| 70 | INSPECTION_DISPUTE | 验货争议 | 否 |
| 80 | PLATFORM_ARBITRATION | 平台介入中 | 否 |
| 90 | MERCHANT_REJECTED | 售后已拒绝 | 是 |
| 100 | COMPLETED | 售后已完成 | 是 |

### 售后类型枚举表

| 类型编码 | 中文文案 |
|---------|---------|
| REFUND_ONLY_BEFORE_SHIP | 未发货仅退款 |
| RETURN_AND_REFUND | 退货退款 |
| EXCHANGE | 换货 |
| RESEND | 补发 |

### 业务类型枚举表

| 类型编码 | 中文文案 |
|---------|---------|
| 1 | SELF（自营） |
| 2 | TMALL（天猫） |

### 错误码说明

| 错误码 | 说明 |
|-------|------|
| 200 | 成功 |
| 400 | 参数错误 |
| 401 | 未授权/Token无效 |
| 403 | 权限不足 |
| 404 | 资源不存在 |
| 500 | 服务端内部错误 |
