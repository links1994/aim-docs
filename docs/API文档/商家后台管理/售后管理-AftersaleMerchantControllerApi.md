---
service: mall-tob-service
yaml_file: mall-tob-service-openapi.yaml
md_file: 售后管理-AftersaleMerchantControllerApi.md
program_id: B-2026-001-aftersale-revamp
version: v1.5.0
updated_at: 2026-05-26
controller: AftersaleMerchantController
module: AftersaleMerchant
title: 商家售后管理
---

# 商家售后管理 API

## 接口总览

| 方法 | 路径 | 说明 | 操作人 |
|------|------|------|--------|
| POST | `/mall-merchant/api/merchant/aftersale/page-list` | 售后列表查询 | 商家 |
| GET | `/mall-merchant/api/merchant/aftersale/dashboard` | 商家售后仪表盘 | 商家 |
| POST | `/mall-merchant/api/merchant/aftersale/update-note` | 修改商家备注 | 商家 |
| POST | `/mall-merchant/api/merchant/aftersale/audit` | 商家审核（通过/拒绝） | 商家 |
| POST | `/mall-merchant/api/merchant/aftersale/ship` | 换货发货 | 商家 |
| GET | `/mall-merchant/api/merchant/aftersale/enums/status` | 售后状态枚举 | 商家 |
| GET | `/mall-merchant/api/merchant/aftersale/enums/type` | 售后类型枚举 | 商家 |

## 通用说明

### 请求头

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| Authorization | String | 是 | Bearer Token，商家鉴权信息 |

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

### 1. 售后列表查询

**路径**：`POST /mall-merchant/api/merchant/aftersale/page-list`

**描述**：商家分页查询售后单列表，支持状态/类型多选筛选，固定按申请时间倒序

#### 请求参数（Body）

| 参数 | 类型 | 必填 | 位置 | 说明 |
|------|------|------|------|------|
| merchantId | Long | 是 | Body | 商家ID |
| aftersaleNo | String | 否 | Body | 售后单号（前缀 LIKE 匹配） |
| subOrderSn | String | 否 | Body | 子订单号（前缀 LIKE 匹配） |
| statusList | Array<Integer> | 否 | Body | 售后状态列表（多状态筛选） |
| aftersaleTypeList | Array<String> | 否 | Body | 售后类型列表（多类型筛选） |
| pageNum | Integer | 否 | Body | 页码（默认1） |
| pageSize | Integer | 否 | Body | 每页条数（默认20） |

#### 请求示例

```json
{
  "merchantId": 2001,
  "aftersaleNo": "AS2026",
  "subOrderSn": "SO202605",
  "statusList": [10, 20],
  "aftersaleTypeList": ["RETURN_AND_REFUND"],
  "pageNum": 1,
  "pageSize": 20
}
```

#### 响应参数

| 参数 | 类型 | 说明 |
|------|------|------|
| totalCount | Long | 总记录数 |
| items | Array<AftersaleMerchantListItem> | 列表数据 |

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
        "subOrderSn": "SO20260518000001",
        "productCdn": "https://imgcdn.aimkeji.com",
        "productImageKey": "product/2026/05/abc123.jpg",
        "skuCode": "SKU00001234",
        "skuName": "夏季新款短袖T恤 白色 XL",
        "status": 10,
        "statusName": "PENDING_MERCHANT_AUDIT",
        "statusText": "待商家审核",
        "aftersaleType": "RETURN_AND_REFUND",
        "aftersaleTypeName": "RETURN_AND_REFUND",
        "aftersaleTypeText": "退货退款",
        "applyRefundAmount": 100.00,
        "applyRefundQuantity": 1,
        "slaDeadline": "2026-05-20 10:00:00",
        "createdAt": "2026-05-18 10:00:00"
      }
    ]
  }
}
```

---

### 2. 商家售后仪表盘

**路径**：`GET /mall-merchant/api/merchant/aftersale/dashboard`

**描述**：获取商家工作台统计数据，包括待审核数、待验货数、SLA预警数等

#### 请求参数（Query）

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| merchantId | Long | 是 | 商家ID |

#### 请求示例

```
GET /mall-merchant/api/merchant/aftersale/dashboard?merchantId=2001
```

#### 响应参数

| 参数 | 类型 | 说明 |
|------|------|------|
| pendingAuditCount | Integer | 待审核数量 |
| pendingInspectCount | Integer | 待验货数量 |
| pendingShipCount | Integer | 待发货数量（换货） |
| todayApprovedCount | Integer | 今日审核通过数量 |
| slaWarningCount | Integer | SLA预警数量 |
| totalAftersaleAmount | BigDecimal | 累计售后金额 |

#### 响应示例

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "pendingAuditCount": 5,
    "pendingInspectCount": 3,
    "pendingShipCount": 2,
    "todayApprovedCount": 10,
    "slaWarningCount": 1,
    "totalAftersaleAmount": 15000.00
  }
}
```

---

### 3. 修改商家备注

**路径**：`POST /mall-merchant/api/merchant/aftersale/update-note`

**描述**：商家对售后单添加或修改备注信息

#### 请求参数（Body）

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| aftersaleNo | String | 是 | 售后单号 |
| merchantNote | String | 否 | 商家备注内容 |

#### 请求示例

```json
{
  "aftersaleNo": "AS20260518000001",
  "merchantNote": "客户多次投诉，优先处理"
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

### 4. 商家审核（通过/拒绝）

**路径**：`POST /mall-merchant/api/merchant/aftersale/audit`

**描述**：商家审核售后申请，通过或拒绝（拒绝需填写理由）

#### 请求参数（Body）

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| aftersaleNo | String | 是 | 售后单号 |
| operatorId | Long | 是 | 操作人ID |
| operatorType | Integer | 是 | 操作人类型：1=user 2=merchant 3=admin |
| approveResult | Integer | 是 | 审核结果：1=通过, 2=拒绝 |
| rejectReason | String | 否 | 拒绝理由（approveResult=2 时必填，10~200字） |

#### 请求示例

```json
{
  "aftersaleNo": "AS20260518000001",
  "operatorId": 20001,
  "operatorType": 2,
  "approveResult": 1,
  "rejectReason": null
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

### 5. 换货发货

**路径**：`POST /mall-merchant/api/merchant/aftersale/ship`

**描述**：商家填写换货物流信息，发货给用户（支持重新发货）

#### 请求参数（Body）

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| aftersaleNo | String | 是 | 售后单号 |
| logisticsCompany | String | 否 | 物流公司 |
| logisticsNo | String | 是 | 物流单号 |

#### 请求示例

```json
{
  "aftersaleNo": "AS20260518000001",
  "logisticsCompany": "顺丰速运",
  "logisticsNo": "SF9876543210",
  "operatorId": 20001,
  "operatorType": 2
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

### 6. 售后状态枚举

**路径**：`GET /mall-merchant/api/merchant/aftersale/enums/status`

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

### 7. 售后类型枚举

**路径**：`GET /mall-merchant/api/merchant/aftersale/enums/type`

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

### 审核结果枚举表

| 结果编码 | 中文文案 |
|---------|---------|
| 1 | 通过 |
| 2 | 拒绝 |

### 操作人类型枚举表

| 类型编码 | 中文文案 |
|---------|---------|
| 1 | 用户 |
| 2 | 商家 |
| 3 | 管理员 |

### 错误码说明

| 错误码 | 说明 |
|-------|------|
| 200 | 成功 |
| 400 | 参数错误 |
| 401 | 未授权/Token无效 |
| 403 | 权限不足 |
| 404 | 资源不存在 |
| 500 | 服务端内部错误 |
