# MealCall UX、庫存與管理員 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 將首頁改成庫存優先，完成真實庫存 CRUD、日期餐點切換，以及管理員會員權限清單。

**Architecture:** Supabase repository 負責資料讀寫；首頁只處理顯示與互動狀態。庫存計算集中在 domain functions，管理員頁面使用登入使用者與 RLS 雙重驗證。

**Tech Stack:** Next.js、React、TypeScript、Supabase、CSS、Vitest。

---

### Task 1: 庫存優先首頁布局

**Files:** `app/page.tsx`, `src/components/dashboard/InventorySummary.tsx`, `app/globals.css`

- [ ] 將首頁第一區改為庫存摘要，顯示可用、保留、需補貨數量。
- [ ] 在摘要區加入「新增食材」與「調整庫存」入口，連到 `/inventory`。
- [ ] 保留三餐區於庫存區下方，日期按鈕使用實際台灣日期並只顯示選取日期。
- [ ] 在 375px、768px、1440px 寬度驗證單欄／雙欄布局，執行 `npm.cmd run build`。

### Task 2: 完成真實庫存 CRUD

**Files:** `app/inventory/page.tsx`, `src/lib/supabase/inventory.ts`, `supabase/migration-2026-07-29.sql`

- [ ] 新增 `createIngredient`、`adjustInventory`、`updateSafetyStock`、`deleteIngredient` repository functions。
- [ ] 庫存頁提供名稱、分類、單位、目前數量、安全庫存表單。
- [ ] 每項食材提供增加、減少、編輯與刪除；刪除前阻擋仍被餐點保留的食材。
- [ ] 為 ingredients 與 inventory 加入 select/insert/update/delete RLS policies。
- [ ] 用 Supabase SQL Editor 執行 migration 後，以登入帳號測試重新整理資料仍存在。

### Task 3: 管理員會員權限清單

**Files:** `app/admin/page.tsx`, `src/components/members/MemberPermissions.tsx`, `src/lib/supabase/members.ts`, `supabase/migration-2026-07-29.sql`

- [ ] 讀取同家庭所有會員，顯示 Email、姓名、角色名稱與權限 checkbox。
- [ ] 管理員可修改角色名稱、逐項權限、套用角色與移除會員。
- [ ] 非 `lf2net679@yahoo.com.tw` 顯示拒絕頁面，資料庫 RLS 同樣拒絕管理操作。
- [ ] 儲存後重新整理仍保留角色與權限變更。

### Task 4: 餐點與庫存一致性驗收

**Files:** `src/domain/mealInventory.test.ts`, `src/lib/supabase/dashboard.ts`, `app/page.tsx`

- [ ] 發布餐點前檢查可用庫存，成功後寫入保留量。
- [ ] 完成餐點將保留量轉為消耗，取消餐點釋放保留量。
- [ ] 驗證今天／明天／後天建立的餐點顯示在正確日期。
- [ ] 執行 `npm.cmd test` 與 `npm.cmd run build`，兩者成功後再部署 Vercel。
