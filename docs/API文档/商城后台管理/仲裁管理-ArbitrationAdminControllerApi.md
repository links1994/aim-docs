---
service: mall-admin
yaml_file: mall-admin-openapi.yaml
md_file: 仲裁管理-ArbitrationAdminControllerApi.md
program_id: B-2026-001-aftersale-revamp
version: v1.1.0
updated_at: 2026-05-26
controller: ArbitrationAdminController
module: ArbitrationAdmin
title: 仲裁管理
---

# 仲裁管理 API（管理后台）

## 接口总览

| 方法 | 路径 | 说明 | 操作人 |
|------|------|------|--------|
| POST | `/mall-admin/api/admin/arbitration/page-list` | 仲裁工单列表查询 | 管理员 |
| GET | `/mall-admin/api/admin/arbitration/{caseNo}/detail` | 仲裁工单详情查询 | 管理员 |
| GET | `/mall-admin/api/admin/arbitration/tab-counts` | 仲裁 Tab 计数查询 | 管理员 |
| POST | `/mall-admin/api/admin/arbitration/arbitrate` | 平台仲裁判定 | 管理员 |
| GET | `/mall-admin/api/admin/arbitration/enums/arbitration-result` | 仲裁判定结果枚举 | 管理员 |

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
|-----------|
| 200 | 成功 |
| 4xx | 客户端错误（参数错误、权限不足等） |
| 5xx | 服务端错误 |

---

## API 详情

### 1. 仲裁工单列表查询

**路径**：`POST /mall-admin/api/admin/arbitration/page-list`

**描述**：管理后台分页查询仲裁工单列表（仅 status IN 60/70/80 仲裁段）

#### 请求参数（Body）

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| statusList | Array<Integer> | 否 | 仲裁状态列表（限定：60/70/80） |
| keyword | String | 否 | 关键词（售后单号/订单号模糊搜索） |
| merchantId | Long | 否 | 商家ID |
| startTime | String | 否 | 查询开始时间，格式：yyyy-MM-dd HH:mm:ss |
| endTime | String | 否 | 查询结束时间，格式：yyyy-MM-dd HH:mm:ss |
| pageNum | Integer | 否 | 页码（默认1） |
| pageSize | Integer | 否 | 每页条数（默认20） |
| sortField | String | 否 | 排序字段（createTime/arbitrationApplyTime） |
| sortOrder | String | 否 | 排序方向：asc/desc |

#### 请求示例

```json
{
  "statusList": [60, 70, 80],
  "keyword": "AS2026",
  "pageNum": 1,
  "pageSize": 20
}
```

#### 响应参数

| 参数 | 类型 | 说明 |
|------|------|------|
| totalCount | Long | 总记录数 |
| items | Array<ArbitrationListItem> | 列表数据 |

#### 响应示例

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "totalCount": 100,
    "items": [
      {
        "caseNo": "AR20260518000001",
        "aftersaleNo": "AS20260518000001",
        "orderSn": "ON20260518000001",
        "subOrderSn": "SO20260518000001",
        "userId": 10001,
        "merchantId": 2001,
        "merchantName": "XX旗舰店",
        "status": 80,
        "statusName": "PLATFORM_ARBITRATION",
        "statusText": "平台介入中",
        "arbitrationTab": "PENDING_ARBITRATION",
        "applyRefundAmount": 100.00,
        "arbitrationDeadline": "2026-05-25 10:00:00",
        "arbitrationApplyTime": "2026-05-20 10:00:00",
        "createdAt": "2026-05-18 10:00:00"
      }
    ]
  }
}
```

---

### 2. 仲裁工单详情查询

**路径**：`GET /mall-admin/api/admin/arbitration/{caseNo}/detail`

**描述**：查询仲裁工单详情，包含双方举证材料、诉求及提交时间

#### 请求参数（Path）

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| caseNo | String | 是 | 仲裁单号 |

#### 响应参数

| 参数 | 类型 | 说明 |
|------|------|------|
| caseNo | String | 仲裁单号 |
| aftersaleNo | String | 售后单号 |
| orderSn | String | 订单号 |
| subOrderSn | String | 子订单号 |
| status | String | 状态（PENDING_EVIDENCE=待举证/PENDING_ARBITRATION=待判定/COMPLETED=已判定） |
| userEvidence | Object | 用户举证信息 |
| merchantEvidence | Object | 商家举证信息 |
| result | Object | 仲裁结果信息 |

#### 响应示例

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "caseNo": "AR20260518000001",
    "aftersaleNo": "AS20260518000001",
    "orderSn": "ON20260518000001",
    "subOrderSn": "SO20260518000001",
    "status": "PENDING_ARBITRATION",
    "userEvidence": {
      "hasSubmitted": true,
      "evidenceText": "商品与描述严重不符",
      "submittedAt": "2026-05-20 14:00:00",
      "userDemand": "全额退款",
      "attachments": [
        {"url": "https://cdn.example.com/img1.jpg", "type": "IMAGE"}
      ]
    },
    "merchantEvidence": {
      "hasSubmitted": true,
      "evidenceText": "商品详情页已标注尺寸",
      "submittedAt": "2026-05-21 10:00:00",
      "attachments": []
    },
    "result": {
      "arbitrationResult": null,
      "arbitrationOpinion": null,
      "refundAmount": null,
      "operatorId": null,
      "operatorName": null
    }
  }
}
```

---

### 3. 仲裁 Tab 计数查询

**路径**：`GET /mall-admin/api/admin/arbitration/tab-counts`

**描述**：查询各仲裁 Tab 的待处理数量，用于显示 Tab 徽标

#### 请求参数

无

#### 响应参数

| 参数 | 类型 | 说明 |
|------|------|------|
| pendingEvidence | Integer | 待举证数量 |
| pendingArbitration | Integer | 待判定数量 |
| completed | Integer | 已判定数量 |

#### 响应示例

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "pendingEvidence": 5,
    "pendingArbitration": 3,
    "completed": 120
  }
}
```

---

### 4. 平台仲裁判定

**路径**：`POST /mall-admin/api/admin/arbitration/arbitrate`

**描述**：平台对仲裁工单进行最终判定

#### 请求参数（Body）

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| caseNo | String | 是 | 仲裁单号 |
| arbitrationResult | String | 是 | 仲裁结果（SUPPORT_REFUND=支持退款/SUPPORT_RETURN=支持退货/REJECT=驳回） |
| refundAmount | BigDecimal | 否 | 判定退款金额 |
| arbitrationOpinion | String | 否 | 仲裁意见 |

#### 请求示例

```json
{
  "caseNo": "AR20260518000001",
  "arbitrationResult": "SUPPORT_REFUND",
  "refundAmount": 99.00,
  "arbitrationOpinion": "经核实，用户举证充分，商家未能提供有效反驳证据，同意全额退款"
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

### 5. 仲裁判定结果枚举

**路径**：`GET /mall-admin/api/admin/arbitration/enums/arbitration-result`

**描述**：查询仲裁判定结果枚举列表（供前端下拉筛选）

#### 请求参数

无

#### 响应参数

| 参数 | 类型 | 说明 |
|------|------|------|
| code | String | 结果编码 |
| text | String | 结果文案 |

#### 响应示例

```json
{
  "code": 200,
  "message": "success",
  "data": [
    {"code": "SUPPORT_REFUND", "text": "支持退款"},
    {"code": "SUPPORT_RETURN", "text": "支持退货"},
    {"code": "REJECT", "text": "驳回"}
  ]
}
```

---

## 附录

### 仲裁状态枚举表

| 状态编码 | 枚举名 | 中文文案 | 说明 |
|---------|--------|---------|------|
| 60 | REFUNDING | 退款中 | 仲裁申请后进入 |
| 70 | INSPECTION_DISPUTE | 验货争议 | 商家拒绝收货 |
| 80 | PLATFORM_ARBITRATION | 平台介入中 | 等待平台仲裁 |

### 仲裁 Tab 枚举表

| Tab 标识 | 中文文案 | 状态范围 |
|---------|---------|---------|
| PENDING_EVIDENCE | 待举证 | status=60 且未提交举证 |
| PENDING_ARBITRATION | 待判定 | 已提交举证，等待仲裁 |
| COMPLETED | 已判定 | 已有仲裁结果 |

### 仲裁结果枚举表

| 结果编码 | 中文文案 |
|---------|---------|
| SUPPORT_REFUND | 支持退款 |
| SUPPORT_RETURN | 支持退货 |
| REJECT | 驳回 |

### 错误码说明

| 错误码 | 说明 |
|-------|------|
| 200 | 成功 |
| 400 | 参数错误 |
| 401 | 未授权/Token无效 |
| 403 | 权限不足 |
| 404 | 资源不存在 |
| 500 | 服务端内部错误 |
