---
service: mall-toc-service
yaml_file: mall-toc-service-openapi.yaml
md_file: 售后管理-AftersaleOrderControllerApi.md
program_id: B-2026-001-aftersale-revamp
version: v1.2.0
updated_at: 2026-05-26
controller: AftersaleOrderController
module: AftersaleOrder
title: C端售后管理
---

# C端售后管理 API

## 接口总览

| 方法 | 路径 | 说明 | 操作人 |
|------|------|------|--------|
| POST | `/mall-toc-service/api/user/aftersale/apply` | 申请售后 | 用户 |
| POST | `/mall-toc-service/api/user/aftersale/cancel` | 取消售后 | 用户 |
| POST | `/mall-toc-service/api/user/aftersale/ship-back` | 用户发货退回 | 用户 |
| POST | `/mall-toc-service/api/user/aftersale/confirm` | 确认收货/退款 | 用户 |
| POST | `/mall-toc-service/api/user/aftersale/request-arbitration` | 申请平台介入 | 用户 |
| GET | `/mall-toc-service/api/user/aftersale/detail` | 售后详情（用户视角） | 用户 |
| GET | `/mall-toc-service/api/user/aftersale/available-types` | 查询可申请的售后类型 | 用户 |
| GET | `/mall-toc-service/api/user/aftersale/reasons` | 查询售后原因枚举列表 | - |
| POST | `/mall-toc-service/api/user/aftersale/negotiation-history` | 查询协商历史（分页） | 用户 |
| GET | `/mall-toc-service/api/user/aftersale/express-companies` | 查询快递公司列表 | - |

## 通用说明

### 请求头

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| Authorization | String | 是 | Bearer Token，用户鉴权信息 |

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

### 错误码说明

| 错误码区间 | 说明 |
|-----------|------|
| 200 | 成功 |
| 4xx | 客户端错误（参数错误、权限不足等） |
| 5xx | 服务端错误 |

---

## API 详情

### 1. 申请售后

**路径**：`POST /mall-toc-service/api/user/aftersale/apply`

**描述**：用户发起售后申请，支持未发货仅退款、退货退款、换货、补发四种类型

#### 请求参数（Body）

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| subOrderSn | String | 是 | 子订单号 |
| aftersaleType | String | 是 | 售后类型：REFUND_ONLY_BEFORE_SHIP/RETURN_AND_REFUND/EXCHANGE/RESEND |
| aftersaleReason | String | 否 | 售后原因：QUALITY_ISSUE/WRONG_ITEM/NOT_AS_DESCRIBED/CHANGED_MIND/DELAYED_DELIVERY/OTHER |
| applyRefundAmount | BigDecimal | 是 | 申请退款金额 |
| applyRefundQuantity | Integer | 否 | 申请退款商品数量 |
| description | String | 否 | 问题描述 |
| attachments | Array<AttachmentDTO> | 否 | 凭证图片列表（最多9张） |

#### 请求示例

```json
{
  "subOrderSn": "SO20260518000001",
  "aftersaleType": "RETURN_AND_REFUND",
  "aftersaleReason": "QUALITY_ISSUE",
  "applyRefundAmount": 100.00,
  "applyRefundQuantity": 1,
  "description": "商品有质量问题，收到时外包装破损",
  "attachments": [
    {
      "cdn": "https://imgcdn.aimkeji.com",
      "objectKey": "aftersale/2026/05/0a1b2c3d.jpg"
    }
  ]
}
```

#### 响应参数

| 参数 | 类型 | 说明 |
|------|------|------|
| aftersaleNo | String | 售后单号 |
| status | Integer | 主状态编码 |
| statusName | String | 主状态枚举名 |
| statusText | String | 主状态中文文案 |
| createdAt | String | 创建时间 |

#### 响应示例

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "aftersaleNo": "AS20260518000001",
    "status": 10,
    "statusName": "PENDING_MERCHANT_AUDIT",
    "statusText": "待商家审核",
    "createdAt": "2026-05-18 10:00:00"
  }
}
```

---

### 2. 取消售后

**路径**：`POST /mall-toc-service/api/user/aftersale/cancel`

**描述**：用户取消已提交的售后申请，仅在待审核状态下可取消

#### 请求参数（Body）

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| aftersaleNo | String | 是 | 售后单号 |
| cancelReason | String | 否 | 取消原因 |

#### 请求示例

```json
{
  "aftersaleNo": "AS20260518000001",
  "cancelReason": "不需要退货了"
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

### 3. 用户发货退回

**路径**：`POST /mall-toc-service/api/user/aftersale/ship-back`

**描述**：用户填写退货物流信息，将商品寄回给商家

#### 请求参数（Body）

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| aftersaleNo | String | 是 | 售后单号 |
| logisticsCompany | String | 否 | 物流公司 |
| logisticsNo | String | 是 | 物流单号 |
| attachmentKeys | Array<String> | 否 | 凭证图片OSS Key列表 |

#### 请求示例

```json
{
  "aftersaleNo": "AS20260518000001",
  "logisticsCompany": "顺丰速运",
  "logisticsNo": "SF1234567890",
  "attachmentKeys": ["aftersale/2026/05/0a1b2c3d.jpg"]
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

### 4. 确认收货/退款

**路径**：`POST /mall-toc-service/api/user/aftersale/confirm`

**描述**：用户确认收到换货商品，售后流程完成

#### 请求参数（Body）

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| aftersaleNo | String | 是 | 售后单号 |

#### 请求示例

```json
{
  "aftersaleNo": "AS20260518000001"
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

### 5. 申请平台介入

**路径**：`POST /mall-toc-service/api/user/aftersale/request-arbitration`

**描述**：用户申请平台介入处理售后争议

#### 请求参数（Body）

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| aftersaleNo | String | 是 | 售后单号 |
| arbitrationReason | String | 否 | 仲裁原因 |
| evidenceKeys | Array<String> | 否 | 举证图片OSS Key列表 |

#### 请求示例

```json
{
  "aftersaleNo": "AS20260518000001",
  "arbitrationReason": "商家验货结果不合理，申请平台介入",
  "evidenceKeys": ["arbitration/2026/05/evidence1.jpg"]
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

### 6. 售后详情（用户视角）

**路径**：`GET /mall-toc-service/api/user/aftersale/detail`

**描述**：获取售后单详细信息，包含协商历史、退货地址等（手机号脱敏）

#### 请求参数（Query）

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| aftersaleNo | String | 是 | 售后单号 |
| userId | Long | 是 | 用户ID |

#### 请求示例

```
GET /mall-toc-service/api/user/aftersale/detail?aftersaleNo=AS20260518000001&userId=10001
```

#### 响应参数

| 参数 | 类型 | 说明 |
|------|------|------|
| aftersaleNo | String | 售后单号 |
| orderSn | String | 订单号 |
| subOrderSn | String | 子订单号 |
| userId | Long | 用户ID |
| merchantId | Long | 商家ID |
| status | Integer | 主状态编码 |
| statusName | String | 主状态枚举名 |
| statusText | String | 主状态中文文案 |
| aftersaleType | String | 售后类型编码 |
| aftersaleTypeName | String | 售后类型枚举名 |
| aftersaleTypeText | String | 售后类型中文文案 |
| aftersaleReason | String | 售后原因编码 |
| aftersaleReasonName | String | 售后原因枚举名 |
| aftersaleReasonText | String | 售后原因中文文案 |
| applyRefundAmount | BigDecimal | 申请退款金额 |
| actualRefundAmount | BigDecimal | 实际退款金额（审核后可能调整） |
| applyRefundQuantity | Integer | 申请退款数量 |
| description | String | 问题描述 |
| orderInfo | TocOrderInfo | 售后订单商品信息 |
| attachmentKeys | Array<String> | 凭证图片OSS Key列表 |
| returnLogisticsCompany | String | 用户退货物流公司 |
| returnLogisticsNo | String | 用户退货物流单号 |
| merchantLogisticsCompany | String | 商家换货物流公司 |
| merchantLogisticsNo | String | 商家换货物流单号 |
| merchantContactPhone | String | 商家联系电话（脱敏） |
| negotiationHistory | Array<NegotiationHistory> | 协商历史列表 |
| returnAddress | ReturnAddress | 退货地址 |
| createdAt | String | 创建时间 |
| updatedAt | String | 更新时间 |

#### 响应示例

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "aftersaleNo": "AS20260518000001",
    "orderSn": "ON20260518000001",
    "subOrderSn": "SO20260518000001",
    "userId": 10001,
    "merchantId": 2001,
    "status": 10,
    "statusName": "PENDING_MERCHANT_AUDIT",
    "statusText": "待商家审核",
    "aftersaleType": "RETURN_AND_REFUND",
    "aftersaleTypeName": "RETURN_AND_REFUND",
    "aftersaleTypeText": "退货退款",
    "aftersaleReason": "QUALITY_ISSUE",
    "aftersaleReasonName": "QUALITY_ISSUE",
    "aftersaleReasonText": "质量问题",
    "applyRefundAmount": 100.00,
    "actualRefundAmount": 99.00,
    "applyRefundQuantity": 1,
    "description": "商品有质量问题",
    "attachmentKeys": [],
    "returnLogisticsCompany": "顺丰速运",
    "returnLogisticsNo": "SF1234567890",
    "merchantLogisticsCompany": null,
    "merchantLogisticsNo": null,
    "merchantContactPhone": "138****5678",
    "negotiationHistory": [],
    "returnAddress": {
      "receiverName": "张三",
      "receiverPhone": "138****5678",
      "province": "广东省",
      "city": "深圳市",
      "district": "南山区",
      "detail": "科技园南区xxx大厦xxx室",
      "postalCode": "518000"
    },
    "createdAt": "2026-05-18 10:00:00",
    "updatedAt": "2026-05-18 12:00:00"
  }
}
```

**TocOrderInfo 结构**：

| 字段 | 类型 | 说明 | 示例 |
|------|------|------|------|
| skuCode | String | SKU编码 | SKU20260518000001 |
| skuName | String | 商品名称 | iPhone 15 Pro Max 256G |
| productImage | String | 商品主图（CDN URL） | https://imgcdn.aimkeji.com/product/iphone15.jpg |
| quantity | Integer | 购买数量 | 1 |

---

### 7. 查询可申请的售后类型

**路径**：`GET /mall-toc-service/api/user/aftersale/available-types`

**描述**：根据子订单当前发货状态，返回用户可申请的售后类型列表。未发货→仅退款；已发货→退货退款/换货/补发

#### 请求参数（Query）

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| subOrderSn | String | 是 | 子订单号 |

#### 请求示例

```
GET /mall-toc-service/api/user/aftersale/available-types?subOrderSn=SO20260518000001
```

#### 响应参数

| 参数 | 类型 | 说明 |
|------|------|------|
| code | String | 售后类型编码 |
| text | String | 售后类型中文文案 |

#### 响应示例

```json
{
  "code": 200,
  "message": "success",
  "data": [
    { "code": "RETURN_AND_REFUND", "text": "退货退款" },
    { "code": "EXCHANGE", "text": "换货" },
    { "code": "RESEND", "text": "补发" }
  ]
}
```

---

### 8. 查询售后原因枚举列表

**路径**：`GET /mall-toc-service/api/user/aftersale/reasons`

**描述**：返回所有售后原因枚举选项（静态数据）

#### 请求参数

无

#### 请求示例

```
GET /mall-toc-service/api/user/aftersale/reasons
```

#### 响应参数

| 参数 | 类型 | 说明 |
|------|------|------|
| code | String | 售后原因编码 |
| text | String | 售后原因中文文案 |

#### 响应示例

```json
{
  "code": 200,
  "message": "success",
  "data": [
    { "code": "QUALITY_ISSUE", "text": "质量问题" },
    { "code": "WRONG_ITEM", "text": "错发/漏发" },
    { "code": "NOT_AS_DESCRIBED", "text": "商品与描述不符" },
    { "code": "CHANGED_MIND", "text": "改变主意" },
    { "code": "DELAYED_DELIVERY", "text": "物流延迟" },
    { "code": "OTHER", "text": "其他" }
  ]
}
```

---

### 9. 查询协商历史（分页）

**路径**：`POST /mall-toc-service/api/user/aftersale/negotiation-history`

**描述**：分页查询售后工单的协商历史记录

#### 请求参数（Body）

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| aftersaleNo | String | 是 | 售后单号 |
| pageNum | Integer | 否 | 页码，默认1 |
| pageSize | Integer | 否 | 每页条数，默认20，最大50 |

#### 请求示例

```json
{
  "aftersaleNo": "AS20260518000001",
  "pageNum": 1,
  "pageSize": 10
}
```

#### 响应参数

| 参数 | 类型 | 说明 |
|------|------|------|
| totalCount | Long | 总记录数 |
| items | Array\<NegotiationHistory\> | 协商历史列表 |

**NegotiationHistory 结构**：

| 参数 | 类型 | 说明 |
|------|------|------|
| eventType | String | 事件类型编码 |
| eventTypeName | String | 事件类型名称 |
| eventTypeText | String | 事件类型中文文案 |
| operatorRole | Integer | 操作人类型编码 |
| operatorRoleName | String | 操作人角色枚举名 |
| operatorRoleText | String | 操作人角色中文文案 |
| content | String | 事件内容描述 |
| occurredAt | String | 发生时间 |

#### 响应示例

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "totalCount": 3,
    "items": [
      {
        "eventType": "USER_APPLY",
        "eventTypeName": "USER_APPLY",
        "eventTypeText": "用户发起售后",
        "operatorRole": 1,
        "operatorRoleName": "USER",
        "operatorRoleText": "用户",
        "content": "用户发起退货退款申请",
        "occurredAt": "2026-05-18 10:00:00"
      }
    ]
  }
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

### 售后原因枚举表

| 原因编码 | 中文文案 |
|---------|---------|
| QUALITY_ISSUE | 质量问题 |
| WRONG_ITEM | 错发/漏发 |
| NOT_AS_DESCRIBED | 商品与描述不符 |
| CHANGED_MIND | 改变主意 |
| DELAYED_DELIVERY | 物流延迟 |
| OTHER | 其他 |

### 错误码说明

| 错误码 | 说明 |
|-------|------|
| 200 | 成功 |
| 400 | 参数错误 |
| 401 | 未授权/Token无效 |
| 403 | 权限不足 |
| 404 | 资源不存在 |
| 500 | 服务端内部错误 |

---

### 10. 查询快递公司列表

**路径**：`GET /mall-toc-service/api/user/aftersale/express-companies`

**描述**：查询快递公司列表，供用户寄回快递时选择

**实现状态**：⏸️ 本期仅定义接口结构，返回空列表

#### 请求参数

无

#### 响应参数

| 参数 | 类型 | 说明 |
|------|------|------|
| code | Integer | 响应码 |
| message | String | 响应消息 |
| data | Array<ExpressCompanyResponse> | 快递公司列表 |

**ExpressCompanyResponse 结构**：

| 字段 | 类型 | 说明 | 示例 |
|------|------|------|------|
| expressCode | String | 快递公司编码（快递100标准编码） | shunfeng |
| expressName | String | 快递公司名称 | 顺丰速运 |

#### 响应示例

```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "expressCode": "shunfeng",
      "expressName": "顺丰速运"
    },
    {
      "expressCode": "yuantong",
      "expressName": "圆通速递"
    },
    {
      "expressCode": "zhongtong",
      "expressName": "中通快递"
    }
  ]
}
```

#### 备注

- 本期实现标注 `//todo`，仅返回空列表供前端调试
- 后续可从快递100 API 获取或本地缓存常用快递公司列表
