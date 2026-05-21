# 線上課程平台 — 部署設定指南

## 一、Vic 需要做的事（按順序）

### Step 1 — 跑 Supabase migration（5 分鐘）
1. 進 [Supabase Dashboard](https://supabase.com/dashboard) → 您的專案 → **SQL Editor**
2. 依序貼上並執行：
   - `supabase/migrations/006_course_platform_extensions.sql`
   - `supabase/migrations/007_course_platform_rls.sql`
   - `supabase/migrations/008_course_platform_helpers.sql`
3. 驗證：左側「Table Editor」應出現 `promo_codes`、`promo_code_redemptions`、`video_view_sessions` 三張新表

### Step 2 — 申請 Bunny.net Stream 帳號（10 分鐘）
1. 開 [https://dash.bunny.net/](https://dash.bunny.net/) 註冊免費帳號（信用卡只是驗證，免費額度夠開始）
2. Dashboard → **Stream** → **Add Video Library**
   - Name: `vicnail-studio`
   - Region: Singapore（離台灣最近）
   - 點 Create
3. 進入 Library，到 **API** 頁面記下：
   - **Library ID**（網址內的數字，如 `12345`）
   - **API Key**（一長串字串）
4. 到 **Security** 頁面：
   - 開啟 **Token Authentication**
   - 記下 **Token Authentication Key**
5. 回 Stream Library 主頁面記下 **CDN Hostname**（如 `vz-xxxxxxxx-xxx.b-cdn.net`）

### Step 3 — 把 4 個變數加到 Vercel
1. Vercel 專案 → Settings → Environment Variables
2. 加入：
   ```
   BUNNY_STREAM_LIBRARY_ID=12345
   BUNNY_STREAM_API_KEY=xxxxxxxx-xxxx-xxxx
   BUNNY_STREAM_CDN_HOSTNAME=vz-xxxxxxxx-xxx.b-cdn.net
   BUNNY_STREAM_TOKEN_AUTH_KEY=xxxxxxxxxxxxxxxx
   ```
3. 點 Redeploy 部署最新版

### Step 4 — 在後台建第一堂課
1. 開 [https://vicnail-studio.com/admin/login](https://vicnail-studio.com/admin/login) 用後台密碼登入
2. 左側選單點 **課程管理** → **新增課程**
3. 填寫課程基本資料 → **建立課程並新增章節**
4. 在章節管理頁面點 **新增章節**，輸入章節名稱
5. 在章節下方點 **選擇影片檔案**，選 mp4 / mov / mkv（上限 5GB）
6. 點 **開始上傳**，等進度條跑完（Bunny 處理約 1-3 分鐘）
7. 編輯章節補上「時長（秒）」、勾選「免費試看」（如需要）
8. 全部章節上傳完後，回到課程編輯頁，把狀態改成 **已上架**

### Step 5 — 建優惠碼（可選）
1. 後台 → **優惠碼** → 新增優惠碼
2. 範例：早鳥 8 折碼
   - Code: `EARLY20`
   - 折扣類型: 百分比折扣
   - 折扣值: 20
   - 適用範圍: 只限課程
   - 截止時間: 開課後兩週

---

## 二、學生使用流程

```
購買流程：
  /zh-TW/courses                      ← 課程列表
    ↓ 點某堂課
  /zh-TW/courses/[slug]               ← 課程詳情（可看試看課）
    ↓ 點「立即購買」
  /zh-TW/auth/login                   ← 未登入則先登入
    ↓
  /zh-TW/courses/[slug]/buy           ← 結帳頁（填資料/優惠碼/付款方式）
    ↓ 點「前往付款」
  ECPay 綠界                          ← 付款
    ↓ 付款成功 callback
  自動建 enrollment                    ← 觀看權開通
    ↓
  /zh-TW/account/courses              ← 學生中心（看「我的課程」）
    ↓ 點某堂課
  /zh-TW/courses/[slug]/lessons/[id]  ← 觀看影片（HLS + 浮水印）
```

---

## 三、防盜機制（自動運作）

### Signed URL（15 分鐘過期）
- 每次播放都向 `/api/lessons/[id]/playback-token` 換新的 HLS URL
- URL 內含 token，過期前 1 分鐘自動換新
- 學生直接複製 URL 給別人也用不了

### 動態浮水印
- 影片上方顯示學生的 Email + 當下時間
- 每 30 秒換位置（防止裁切）
- 半透明，不影響觀看

### 限 2 裝置同時觀看
- 學生在第 3 台裝置打開時會跳「請選擇要踢出哪一台」
- 90 秒沒心跳的裝置自動視為離線
- 學生可在播放頁手動踢人

### 防右鍵 + 防下載 + 防 PiP
- `controlsList="nodownload"`
- `disablePictureInPicture`
- `onContextMenu` 阻擋右鍵選單

---

## 四、新增的檔案清單

### Migrations (3 個)
- `supabase/migrations/006_course_platform_extensions.sql` — 擴充 courses/lessons/enrollments/orders + 新表
- `supabase/migrations/007_course_platform_rls.sql` — RLS + my_enrolled_courses view + validate_promo_code function
- `supabase/migrations/008_course_platform_helpers.sql` — atomic increment + enrollment grant helpers

### Lib (3 個)
- `src/lib/bunny/stream.ts` — Bunny.net Stream SDK（建片/簽 HLS/TUS）
- `src/lib/promo-codes/calculate.ts` — 折扣計算
- `src/lib/device.ts` — 裝置指紋

### Admin Routes (5 個)
- `src/app/admin/courses/page.tsx` — 課程列表
- `src/app/admin/courses/edit/page.tsx` — 課程編輯
- `src/app/admin/courses/[id]/lessons/page.tsx` — 章節管理 + 影片上傳
- `src/app/admin/promo-codes/page.tsx` — 優惠碼列表
- `src/app/admin/promo-codes/edit/page.tsx` — 優惠碼編輯

### API Routes (14 個)
- `src/app/api/admin/courses/route.ts` — 課程 CRUD
- `src/app/api/admin/lessons/route.ts` — 章節 CRUD
- `src/app/api/admin/bunny/upload/route.ts` — 取得 TUS 上傳簽章
- `src/app/api/admin/promo-codes/route.ts` — 優惠碼 CRUD
- `src/app/api/courses/route.ts` — 公開課程列表
- `src/app/api/courses/[slug]/route.ts` — 公開課程詳情
- `src/app/api/courses/checkout/route.ts` — 課程購買（無 shipping）
- `src/app/api/promo-codes/validate/route.ts` — 結帳驗證優惠碼
- `src/app/api/lessons/[id]/playback-token/route.ts` — 簽 HLS URL
- `src/app/api/lessons/[id]/progress/route.ts` — 進度儲存
- `src/app/api/video-sessions/heartbeat/route.ts` — 30 秒心跳
- `src/app/api/video-sessions/route.ts` — 列出/結束 active sessions
- `src/app/api/account/courses/route.ts` — 我的課程列表
- `src/app/api/payment/ecpay/callback/route.ts` — **已改造**：付款成功自動建 enrollment

### 學生端頁面 (5 個)
- `src/app/[locale]/courses/page.tsx` — **改寫**：從 DB 撈
- `src/app/[locale]/courses/[slug]/page.tsx` — 課程詳情
- `src/app/[locale]/courses/[slug]/buy/page.tsx` — 結帳
- `src/app/[locale]/courses/[slug]/lessons/[lessonId]/page.tsx` — 影片觀看
- `src/app/[locale]/account/courses/page.tsx` — 學生中心

### Components (4 個)
- `src/components/video/VideoPlayer.tsx` — HLS 播放器 + 心跳 + 進度
- `src/components/video/Watermark.tsx` — 動態浮水印
- `src/components/admin/LessonUploader.tsx` — TUS 上傳元件
- `src/components/courses/CourseCheckoutForm.tsx` — 結帳表單

### 改動
- `src/components/admin/AdminSidebar.tsx` — 加課程管理/優惠碼 nav
- `src/lib/supabase/types.ts` — 同步 migration 006/008 新欄位
- `package.json` — 加 hls.js + tus-js-client
- `.env.example` — 加 Bunny.net 變數

---

## 五、營運建議

### 定價策略（按 Vic 拍板的單堂買斷）
- 入門課 NT$2,500-3,500
- 中階課 NT$3,500-4,500
- 進階課 NT$4,500（單堂上限，更貴改成課程包）

### 優惠碼模板
| 場景 | code | 折扣 | 限制 |
|------|------|------|------|
| 開課首兩週早鳥 | `EARLY20` | 8 折 | 全站、限期兩週 |
| 老學生推薦 | `OLDSTUDENT` | 折 NT$500 | 全站、單人 1 次 |
| 雙 11 限時 | `1111` | 75 折 | 全站、限 11/11 當天 |
| 三人團報 | `GROUP3` | 7 折 | 全站、無人數限制 |
| 給朋友試用 | `VIPGIFT` | 100% 免費 | 限指定課程、max_uses=10 |

### 監控建議
- Supabase Dashboard 看 `video_view_sessions` 是否有異常多裝置（盜帳號跡象）
- Bunny.net Dashboard 看流量是否暴增（盜鏈跡象）
- `promo_code_redemptions` 表追蹤哪些碼最有效

---

## 六、未來擴充（已在規劃文件，暫不實作）

- 課程證書（PDF 生成 + 學生姓名）
- 課程評論 + 評分
- 直播課（Zoom / Mux Live 整合）
- 藍新 Newebpay（更低費率備援）
- 訂閱制（每月看新案例庫）
- 多講師抽成系統（目前只有 Vic 一人）
- Forensic watermark（隱形編碼追溯外流者）

完整規劃見 [COURSE_PLATFORM_PLAN.md](./COURSE_PLATFORM_PLAN.md)
