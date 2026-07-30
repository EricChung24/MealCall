# MealCall

MealCall 是一個供家庭共用的餐食與食材庫存管理工具。你可以建立餐點、預約食材、完成餐點後扣除庫存，並在庫存低於安全值時收到提示。

## 功能

- 建立今日起三天內的早餐、午餐與晚餐計畫。
- 發布餐點前檢查可用食材；發布後會先保留所需數量。
- 完成餐點時自動將已保留的食材扣除庫存。
- 管理食材、庫存數量、單位與安全庫存值。
- 使用 Supabase Auth 提供 Email／密碼註冊與登入。
- 管理員可在 `/admin` 查看家庭成員並調整權限。

## 技術棧

- Next.js（App Router）
- React + TypeScript
- Supabase（Auth、PostgreSQL、Row Level Security）
- Vitest

## 快速開始

### 1. 安裝套件

```bash
npm install
```

### 2. 建立環境變數

在專案根目錄新增 `.env.local`：

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

兩個值可在 Supabase 專案的 **Settings → API** 取得。請勿將 `.env.local` 提交到版本控制。

### 3. 初始化 Supabase 資料庫

在 Supabase 的 **SQL Editor** 依序執行下列檔案：

1. `supabase/schema.sql`
2. `supabase/migration-public-write.sql`
3. `supabase/migration-multiple-meals.sql`
4. `supabase/migration-inventory-crud.sql`
5. `supabase/migration-admin-member-permissions.sql`
6. `supabase/migration-2026-07-29.sql`

這些 SQL 會建立家庭、成員、食材、庫存、餐點與餐點食材資料表，並啟用 Row Level Security（RLS）及對應存取規則。

> 註冊使用者首次進入首頁時，系統會建立或加入預設家庭「鍾家冰箱」。

### 4. 啟動開發伺服器

```bash
npm run dev
```

開啟 [http://localhost:3000](http://localhost:3000)，註冊帳號後即可開始使用。

## 使用流程

1. 到 `/inventory` 新增食材，設定目前庫存與安全庫存。
2. 回首頁新增餐點，選擇時段並填入所需食材與數量。
3. 發布餐點時，系統會檢查「目前庫存 − 已被其他已發布餐點保留的數量」。
4. 餐點完成後，系統將保留數量轉為實際消耗，並更新庫存。

餐點狀態如下：

| 狀態 | 意義 |
| --- | --- |
| `草稿` | 尚未發布，不影響庫存。 |
| `已發布` | 食材已保留，會影響可用庫存。 |
| `已完成` | 已扣除食材庫存。 |
| `已取消` | 取消保留，不再影響可用庫存。 |

## 路由

| 路徑 | 用途 |
| --- | --- |
| `/` | 餐點總覽、建立餐點與庫存摘要。 |
| `/inventory` | 食材與庫存管理。 |
| `/login` | 註冊與登入。 |
| `/admin` | 管理家庭成員權限。 |

## 管理員設定

目前管理員 Email 由 [`src/lib/admin.ts`](src/lib/admin.ts) 的 `ADMIN_EMAIL` 決定；資料庫端的 `is_admin()` 函式也使用相同 Email。

若要換成你的帳號，請同步修改：

1. `src/lib/admin.ts` 的 `ADMIN_EMAIL`。
2. `supabase/schema.sql` 與 `supabase/migration-2026-07-29.sql` 內的 `is_admin()` 函式。
3. 在 Supabase SQL Editor 重新執行更新過的函式 SQL。

## 指令

```bash
# 啟動開發環境
npm run dev

# 建置正式版本
npm run build

# 啟動正式伺服器（需先建置）
npm run start

# 執行單元測試
npm test
```

## 專案結構

```text
app/                    Next.js 路由與頁面
src/components/         UI 元件
src/domain/             領域型別與餐點／庫存計算邏輯
src/lib/supabase/       Supabase 用戶端與資料存取函式
supabase/               建表、RLS 與功能調整 SQL
```

## 測試

目前單元測試集中在 `src/domain/mealInventory.test.ts`，涵蓋：

- 已發布餐點的食材保留計算。
- 庫存不足時阻止發布餐點。
- 完成餐點後扣除庫存。

執行測試：

```bash
npm test
```

## 注意事項

- 專案目前使用 Supabase 瀏覽器端用戶端；請只使用 `anon key`，不要把 `service_role key` 放入 `NEXT_PUBLIC_*` 環境變數。
- 若 Supabase 開啟 **Confirm email**，使用者註冊後需先完成信箱驗證才能登入；若是本機快速測試，可在 Supabase Auth 設定中關閉此選項。
