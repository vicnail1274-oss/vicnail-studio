# VicNail Studio 線上課程平台 — 完整規劃

**日期**：2026-05-21
**分支**：`feature/course-platform`
**目標**：在現有 vicnail-studio（Next.js 14 + Supabase + ECPay）擴充完整線上美甲教學平台
**Vic 拍板原則**：「不可能經營一個做到一半的網站」— 按順序全部完成，不留半成品

---

## 一、決策總覽

| 項目 | 決策 | 理由 |
|------|------|------|
| 站點 | 整合到 vicnail-studio | 共用品牌、SEO、ECPay、Supabase Auth |
| 定價 | 單堂買斷 NT$2,500–4,500 | Vic 選定；簡單、學生無壓力、永久觀看 |
| 影片託管 | **Bunny.net Stream** | 月費最便宜（200 學生約 NT$300）、含 HLS+DRM+CDN |
| 金流 | **藍新 Newebpay**（新加）+ 沿用 ECPay 綠界 | 藍新費率 2.8% + 免提領費；ECPay 已串好可同步用 |
| 防盜 | Signed URL（15 分鐘 token）+ 動態浮水印（Email/時戳）+ 限 2 裝置 | 擋 95% 想偷的人，CP 值最高 |
| LINE Login | Phase 6 補 | 現只有 LINE webhook，缺 OAuth |
| 認證 | Supabase Auth（已有 Email/Google）+ 後台密碼（已有） | 不重寫 |
| i18n | zh-TW + en 同步 | 沿用現有 next-intl |

---

## 二、現況盤點（已 audit）

### 已有可直接複用（不動）
- ✅ Supabase Auth（Email + Google OAuth + middleware）
- ✅ ECPay 金流：簽 hash、付款表單、callback 三層容錯、idempotency、庫存競態防護
- ✅ Migration 001：courses / lessons / enrollments / lesson_progress / orders / order_items 全部已建（含 RLS）
- ✅ `order_items.item_type` 已有 `'course'/'product'` enum，課程訂單可直接複用
- ✅ Admin 後台：商品 CRUD、訂單管理（含催單訊息生成器、24h 未付款標記）
- ✅ next-intl + zh-TW/en 翻譯框架
- ✅ shadcn/ui + Tailwind + framer-motion

### 已有但要擴充
- ⚠️ `courses` 缺：`slug`、`long_description`、`what_youll_learn`、`prerequisites`、`category`、`level`、`total_lessons`（cache）、`total_duration_seconds`（cache）、`instructor_name`
- ⚠️ `lessons` 缺：`bunny_video_id`、`hls_url`、`thumbnail_url`、`attachments` — 現有 `video_id` 改名為 `bunny_video_id`
- ⚠️ `enrollments` 缺：`device_limit`、`active_device_count`
- ⚠️ `orders` 缺：`promo_code_id`、`discount_amount`、`original_total`
- ⚠️ `[locale]/courses/page.tsx` 是 hardcoded 5 堂課 → 改從 DB 撈

### 全新建設
- ❌ `courses/[slug]/page.tsx` — 課程詳情頁
- ❌ `courses/[slug]/lessons/[lessonId]/page.tsx` — 影片播放頁
- ❌ `account/courses/page.tsx` — 學生中心
- ❌ `account/courses/[slug]/page.tsx` — 我的課程進度
- ❌ `admin/courses/page.tsx`、`admin/courses/[id]/edit/page.tsx`、`admin/courses/[id]/lessons/page.tsx` — 課程後台
- ❌ `admin/promo-codes/page.tsx` — 優惠碼後台
- ❌ `src/lib/bunny/` — Bunny.net Stream API 封裝
- ❌ `src/lib/promo-codes/` — 優惠碼驗證/折扣計算
- ❌ `src/components/video/` — 播放器 + 浮水印 + 進度追蹤
- ❌ API: `/api/promo-codes/validate`、`/api/courses/[id]/enroll-check`、`/api/lessons/[id]/playback-token`、`/api/lessons/[id]/progress`、`/api/video-sessions/heartbeat`
- ❌ ECPay callback 增強：付款成功自動建 enrollment
- ❌ 新表：`promo_codes`、`promo_code_redemptions`、`video_view_sessions`

---

## 三、實作 Phase 規劃（按 Vic「按順序全部完成」）

### Phase 1：資料層擴充（DB schema + RLS）
- migration `006_course_platform_extensions.sql`：擴充 courses/lessons/enrollments/orders，新表 promo_codes / promo_code_redemptions / video_view_sessions
- migration `007_course_platform_rls.sql`：新表 RLS policies + 課程觀看權檢查 function
- migration `008_seed_courses.sql`：從 `vicnail-core/courses/*.json` 灌入 10+ 套課程基礎資料

### Phase 2：Bunny.net Stream SDK + 後台課程管理
- `src/lib/bunny/stream.ts`：上傳 / 列表 / 刪除 / 生成 Signed URL
- `src/lib/bunny/upload.ts`：直傳到 Bunny（分塊上傳）
- `admin/courses/page.tsx`：課程列表
- `admin/courses/new/page.tsx` + `admin/courses/[id]/edit/page.tsx`：新增/編輯課程
- `admin/courses/[id]/lessons/page.tsx`：章節管理 + 影片上傳
- `api/admin/courses/route.ts`、`api/admin/courses/[id]/route.ts`、`api/admin/lessons/route.ts`、`api/admin/bunny/upload-url/route.ts`

### Phase 3：學生端課程列表 + 詳情頁
- `[locale]/courses/page.tsx`：改從 DB 撈，篩選/排序
- `[locale]/courses/[slug]/page.tsx`：詳情頁（大綱、預覽、講師、購買 CTA）
- 試看功能：`is_preview=true` 的 lesson 無認證可看
- `src/components/courses/CourseCard.tsx`、`CourseDetailHero.tsx`、`LessonList.tsx`、`PurchaseButton.tsx`

### Phase 4：影片播放器 + 防盜 + 進度
- `src/components/video/VideoPlayer.tsx`：HLS.js + Signed URL
- `src/components/video/WatermarkOverlay.tsx`：動態浮水印（Email + 時戳）
- `src/lib/video/session-manager.ts`：限 2 裝置（heartbeat + 踢人）
- `[locale]/courses/[slug]/lessons/[lessonId]/page.tsx`：播放頁
- `api/lessons/[id]/playback-token/route.ts`：簽 15 分鐘 token
- `api/lessons/[id]/progress/route.ts`：每 10 秒儲存進度
- `api/video-sessions/heartbeat/route.ts`：每 30 秒心跳
- `api/video-sessions/release/route.ts`：登出/離開時釋放

### Phase 5：購買流程 + 優惠碼 + 自動授課
- 改 `api/orders/create/route.ts`：支援 `item_type='course'`、套用 promo_code
- 新增 `api/promo-codes/validate/route.ts`：結帳時驗證
- `src/components/checkout/PromoCodeInput.tsx`：結帳頁優惠碼輸入
- 改 `api/payment/ecpay/callback/route.ts`：付款成功時自動 `INSERT INTO enrollments`
- `src/lib/promo-codes/calculate.ts`：折扣計算邏輯

### Phase 6：學生中心 + 後台優惠碼管理
- `[locale]/account/courses/page.tsx`：我購買的課程列表 + 進度條
- `[locale]/account/courses/[slug]/page.tsx`：單課詳細進度
- `admin/promo-codes/page.tsx` + `admin/promo-codes/new/page.tsx` + `admin/promo-codes/[id]/edit/page.tsx`
- `api/admin/promo-codes/route.ts`、`api/admin/promo-codes/[id]/route.ts`

### Phase 7：i18n + 收尾打磨
- 補 `src/messages/zh-TW.json` + `en.json` 課程相關 ~80 個 key
- 結帳頁加課程項目顯示（無運費標示）
- account 側邊欄加「我的課程」入口
- 首頁加「精選課程」區塊（從 DB 撈）
- 響應式檢查（手機優先）
- README + .env.example 更新（Bunny.net、藍新）
- `npm run build` + lint 通過

### Phase 8：藍新 Newebpay 整合（選配，可延後）
- `src/lib/newebpay/` SDK
- `api/payment/newebpay/route.ts` + `callback/route.ts`
- 結帳頁加「綠界 vs 藍新」選擇

### Phase 9：QA + 上線
- 用 Bunny.net 測試影片真實上傳
- 用 ECPay sandbox 測試購買流程
- 真實裝置限制測試（2 裝置 → 第 3 裝置被踢）
- 浮水印視覺確認
- 部署到 Vercel
- 真實使用 1-2 個學生帳號跑完整流程

---

## 四、技術細節

### 影片防盜實作

```
[學生端]                [Next.js API]              [Bunny.net Stream]
    |                        |                            |
    |--GET playback-token--->|                            |
    |                        |--check enrollment (DB)     |
    |                        |--check device count (DB)   |
    |                        |--gen signed HLS URL ------>|
    |<--{ hls_url, expires_in: 900 }------                |
    |                        |                            |
    |--GET hls_url + token--------------------------------|
    |<--HLS playlist------------------------------(15min)-|
    |                                                     |
    |  [WatermarkOverlay 顯示 Email + 時戳]               |
    |                                                     |
    |--POST heartbeat every 30s---->|                     |
    |                        |--update video_view_sessions
```

### 限 2 裝置邏輯

```
video_view_sessions:
  - user_id, lesson_id, device_fingerprint, started_at, last_heartbeat_at, is_active

每次播放開始：
  1. 取得 device_fingerprint（瀏覽器指紋）
  2. SELECT COUNT(*) WHERE user_id=? AND is_active=true AND last_heartbeat_at > now() - 90s
  3. 若 >= 2 且 fingerprint 不在現有列表：拒絕 + 列出現有裝置給學生「踢人」
  4. 若可播：INSERT or UPDATE session

每 30 秒心跳：
  UPDATE video_view_sessions SET last_heartbeat_at = now() WHERE id = ?

90 秒無心跳：自動視為離線（query 時過濾）
```

### 浮水印實作

CSS overlay 在影片上方，內容為 `{email} · {YYYY-MM-DD HH:mm}`，半透明，每 30 秒位置改變（防止簡單裁切）：

```tsx
<div className="absolute inset-0 pointer-events-none z-10">
  <div className="absolute text-white/40 text-sm" style={{ top: `${pos.y}%`, left: `${pos.x}%` }}>
    {user.email} · {format(now, 'yyyy-MM-dd HH:mm')}
  </div>
</div>
```

### 優惠碼類型

| 類型 | 說明 | 範例 |
|------|------|------|
| `percentage` | 百分比折扣 | EARLY20（8 折） |
| `fixed_amount` | 固定金額折扣 | FRIEND500（折 NT$500） |
| `free` | 100% 免費 | VIP（限數量） |

每碼可設：適用課程（全部/單一/多選）、最低消費、起訖日、總用量上限、單人用量上限。

---

## 五、Bunny.net 成本估算

| 項目 | 單價 | 200 學生 × 1000 小時/月 |
|------|------|--------------------------|
| 編碼 | $1/1000 分鐘 | 假設 50 小時課程內容 = $3/月 |
| 儲存 | 含在編碼費 | — |
| 串流（觀看） | $0.005-0.01/GB | 60,000 分 1080p ≈ 500GB ≈ $2.5-5/月 |
| DRM/HLS | **內建免費** | 0 |
| CDN | 全球 | 0 |
| **總計** | | **約 US$10/月（NT$320）** |

對比 Vimeo OTT 每訂戶 $1 → 200 學生 = $200/月。Bunny 省 20 倍。

---

## 六、環境變數新增

```bash
# Bunny.net Stream
BUNNY_STREAM_LIBRARY_ID=xxxxx
BUNNY_STREAM_API_KEY=xxxxx
BUNNY_STREAM_CDN_HOSTNAME=vz-xxxxxx.b-cdn.net
BUNNY_STREAM_TOKEN_AUTH_KEY=xxxxx  # 用於簽 Signed URL

# 藍新 Newebpay（Phase 8）
NEWEBPAY_MERCHANT_ID=xxxxx
NEWEBPAY_HASH_KEY=xxxxx
NEWEBPAY_HASH_IV=xxxxx
NEWEBPAY_SANDBOX=true
```

---

## 七、Vic 需要做的事

| 階段 | Vic 動作 | 預估時間 |
|------|----------|----------|
| Phase 1 完成後 | 跑 migration 到 Supabase Dashboard | 1 分鐘 |
| Phase 2 開始前 | 申請 Bunny.net 帳號 + 拿到 API key 給我 | 10 分鐘 |
| Phase 5 完成後 | 上傳真實課程影片測試 | 視影片數而定 |
| Phase 8 開始前（選） | 申請藍新 Newebpay 商戶 | 1 週審核 |
| Phase 9 | 用學生帳號跑完整買-看-進度流程 | 30 分鐘 |

---

## 八、不做的事（避免 over-engineering）

- ❌ Widevine DRM（200 學生規模不值得）
- ❌ Forensic watermark（隱形編碼追溯外流者，月費 US$100+）
- ❌ 直播功能（先做錄製課，未來再加）
- ❌ 社群討論區（用 LINE 群組更實在）
- ❌ 訂閱制（Vic 選定單堂買斷）
- ❌ 自己架影片伺服器（用 Bunny.net）
- ❌ 課程證書（無認證機構，先省）— 可後續加
- ❌ 評論留言系統（Phase 9 後再評估）
- ❌ 多講師抽成系統（只有 Vic 一個講師）
