# MealCall 前端第一版 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 建立可互動的 MealCall 前端原型，讓家庭成員查看三餐看板、建立餐點、保留食材、完成／取消餐點，以及查看完整庫存。

**Architecture:** 使用 Next.js App Router 與 TypeScript 建立單頁原型；先以前端 state 與明確的 domain functions 模擬 Supabase 資料層。頁面元件只負責呈現與事件轉送，庫存計算與餐點狀態轉換集中在 domain module，未來可替換成 Supabase repository。

**Tech Stack:** Next.js、React、TypeScript、CSS Modules 或全域 CSS、Vitest（domain logic tests）。

---

## 檔案配置

- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `app/layout.tsx`, `app/page.tsx`, `app/globals.css`
- Create: `src/domain/types.ts`（餐點、食材、庫存、成員型別）
- Create: `src/domain/mealInventory.ts`（保留、取消、完成與庫存計算）
- Create: `src/data/mockData.ts`（家庭、成員、餐點與庫存初始資料）
- Create: `src/components/dashboard/MealBoard.tsx`（三餐看板）
- Create: `src/components/dashboard/InventorySummary.tsx`（庫存摘要與補貨摘要）
- Create: `src/components/inventory/InventoryPage.tsx`（完整庫存列表與篩選）
- Create: `src/components/meals/MealForm.tsx`（建立／編輯餐點表單）
- Create: `src/components/meals/MealCard.tsx`（餐點卡片與狀態操作）
- Create: `src/components/ui/Modal.tsx`, `src/components/ui/StatusBadge.tsx`
- Create: `src/appStyles.css` 或延續 `app/globals.css`，負責 layout、spacing、typography、狀態色彩與 responsive 行為
- Create: `src/domain/mealInventory.test.ts`（核心庫存流程測試）

### Task 1: 建立可啟動的 Next.js 前端骨架

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`
- Create: `app/layout.tsx`, `app/page.tsx`, `app/globals.css`

- [ ] **Step 1: 建立 package scripts 與依賴**

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "test": "vitest run"
  },
  "dependencies": {
    "next": "latest",
    "react": "latest",
    "react-dom": "latest"
  },
  "devDependencies": {
    "@types/node": "latest",
    "@types/react": "latest",
    "@types/react-dom": "latest",
    "typescript": "latest",
    "vitest": "latest"
  }
}
```

- [ ] **Step 2: 安裝依賴並確認 Next.js 可啟動**

Run: `npm.cmd install`

Expected: 安裝完成且沒有 dependency error。

Run: `npm.cmd run build`

Expected: Next.js build 成功。

- [ ] **Step 3: 建立最小頁面與全域 reset**

`app/page.tsx` 先渲染 `MealCall` 標題與空的 `<main>`；`app/layout.tsx` 設定 `lang="zh-Hant"`；`app/globals.css` 設定 box sizing、body margin、基本字型與背景色。

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json tsconfig.json next.config.ts app
git commit -m "chore: scaffold MealCall frontend"
```

### Task 2: 建立 domain 型別、假資料與庫存狀態函式

**Files:**
- Create: `src/domain/types.ts`
- Create: `src/domain/mealInventory.ts`
- Create: `src/data/mockData.ts`
- Test: `src/domain/mealInventory.test.ts`

- [ ] **Step 1: 定義穩定的 domain 型別**

```ts
export type MealSlot = 'breakfast' | 'lunch' | 'dinner';
export type MealStatus = 'draft' | 'published' | 'completed' | 'cancelled';

export type Ingredient = { id: string; name: string; unit: string; safetyStock: number };
export type InventoryItem = { ingredientId: string; quantity: number };
export type MealIngredient = { ingredientId: string; plannedAmount: number; reservedAmount: number; consumedAmount: number };
export type Meal = { id: string; date: string; slot: MealSlot; title: string; cookId: string; status: MealStatus; ingredients: MealIngredient[] };
```

- [ ] **Step 2: 寫會失敗的 domain tests**

測試 `getAvailableAmount`（總量減已發布保留量）、`publishMeal`（庫存不足回傳錯誤並不改資料）、`cancelMeal`（釋放保留量）與 `completeMeal`（把保留量轉為消耗）。

Run: `npm.cmd test -- src/domain/mealInventory.test.ts`

Expected: FAIL，因為 domain functions 尚未存在。

- [ ] **Step 3: 實作純函式庫存流程**

所有函式都接收目前資料並回傳新資料，不直接修改輸入陣列；`publishMeal` 必須先檢查每項食材可用量，再一次建立所有 reservation，確保失敗時不會部分保留。

- [ ] **Step 4: 建立與型別相符的假資料**

準備至少 8 項食材、3 筆不同餐期餐點（包含已發布與已完成）及家庭成員，讓看板能展示總量、保留量、可用量與不足狀態。

- [ ] **Step 5: 測試通過並 commit**

Run: `npm.cmd test -- src/domain/mealInventory.test.ts`

Expected: PASS。

```bash
git add src/domain src/data
git commit -m "feat: add meal inventory domain model"
```

### Task 3: 建立看板與庫存摘要元件

**Files:**
- Create: `src/components/dashboard/MealBoard.tsx`
- Create: `src/components/dashboard/InventorySummary.tsx`
- Modify: `app/page.tsx`, `app/globals.css`

- [ ] **Step 1: 建立看板 props 介面**

`MealBoard` 接收 `meals` 與 `onSelectMeal`；依日期與 `MealSlot` 排出早餐、午餐、晚餐卡片。`InventorySummary` 接收 ingredients、inventory、meals，顯示摘要與低於 safety stock 的項目。

- [ ] **Step 2: 實作看板視覺結構**

頁首顯示家庭名稱與目前成員；主區域為日期／三餐卡片；右側顯示庫存摘要、補貨數量與「查看全部庫存」按鈕，窄螢幕時改為上下排列。

- [ ] **Step 3: 將 mock data 接到首頁**

`app/page.tsx` 使用 client component state 載入 mock data，先渲染看板與庫存摘要；尚未加入表單操作時，按鈕顯示對應 placeholder 狀態。

- [ ] **Step 4: 驗證畫面**

Run: `npm.cmd run dev`

Expected: 開啟 `http://localhost:3000` 可看到三餐看板、庫存摘要與完整庫存入口；桌機與手機寬度都不產生水平捲軸。

- [ ] **Step 5: Commit**

```bash
git add app src/components/dashboard
git commit -m "feat: add meal dashboard and inventory summary"
```

### Task 4: 實作餐點建立、發布與狀態操作

**Files:**
- Create: `src/components/meals/MealForm.tsx`, `src/components/meals/MealCard.tsx`
- Create: `src/components/ui/Modal.tsx`, `src/components/ui/StatusBadge.tsx`
- Modify: `app/page.tsx`, `app/globals.css`

- [ ] **Step 1: 建立可控表單**

表單欄位包含日期、餐期、餐點名稱及動態食材列；每列選擇食材與數量，送出前顯示目前可用量與缺少數量。

- [ ] **Step 2: 接上發布流程**

首頁以 state 保存 meals 與 inventory；送出表單呼叫 `publishMeal`，成功後新增已發布餐點並重新計算摘要，失敗則顯示具體缺少食材。

- [ ] **Step 3: 加入完成與取消操作**

`MealCard` 只在權限允許且狀態正確時顯示操作；取消／完成前使用 `Modal` 確認，成功後呼叫對應 domain function。

- [ ] **Step 4: 支援草稿與未來日期**

表單允許選擇今天之後的日期；儲存草稿不保留食材，發布草稿才執行庫存檢查與保留。

- [ ] **Step 5: 驗證互動並 commit**

手動驗證：成功發布、庫存不足、取消歸還、完成扣除、同日期同餐期衝突，以及已完成餐點不可修改。

```bash
git add app src/components/meals src/components/ui
git commit -m "feat: add meal planning and reservation interactions"
```

### Task 5: 實作完整庫存頁與篩選入口

**Files:**
- Create: `src/components/inventory/InventoryPage.tsx`
- Modify: `app/page.tsx`, `app/globals.css`

- [ ] **Step 1: 建立庫存表格／卡片資料列**

每列顯示食材名稱、總庫存、已保留、可用量、安全庫存與補貨狀態；狀態至少有正常、已保留、需補貨。

- [ ] **Step 2: 加入篩選 state**

提供「全部／不足／已保留」三個篩選鈕；篩選依計算後的可用量與 reservation 判斷，不直接依文字比對。

- [ ] **Step 3: 將看板按鈕接到庫存檢視**

第一版可用同頁 view state 或 query string 控制 `dashboard`／`inventory`；返回按鈕回到看板，且保留目前假資料狀態。

- [ ] **Step 4: 驗證 responsive 與 commit**

確認桌機右側入口、手機上方入口、表格在窄螢幕可讀且不溢出。

```bash
git add app src/components/inventory
git commit -m "feat: add full inventory view and filters"
```

### Task 6: 加入成員權限展示、錯誤狀態與整合驗收

**Files:**
- Create: `src/components/members/MemberPermissions.tsx`
- Modify: `app/page.tsx`, `app/globals.css`

- [ ] **Step 1: 建立成員與逐項權限 UI**

顯示家庭成員、角色與能力開關（建立餐點、修改庫存、管理成員、查看補貨）；切換假資料權限後，首頁操作按鈕應依目前登入者權限顯示或停用。

- [ ] **Step 2: 補齊空、錯誤與成功回饋**

加入無餐點、無庫存、發布成功、庫存不足及操作失敗的明確訊息；表單提交期間禁用送出按鈕，避免重複操作。

- [ ] **Step 3: 執行完整驗收**

Run: `npm.cmd test`

Expected: domain tests 全部 PASS。

Run: `npm.cmd run build`

Expected: production build 成功。

手動驗收：看板三餐、建立自訂名稱、發布保留、取消歸還、完成扣除、未來排程、庫存入口、篩選、權限控制與手機版排版。

- [ ] **Step 4: Commit**

```bash
git add app src
git commit -m "feat: complete MealCall frontend prototype"
```
