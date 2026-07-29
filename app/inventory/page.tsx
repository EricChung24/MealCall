'use client';

import { useEffect, useState } from 'react';
import { loadDashboard } from '../../src/lib/supabase/dashboard';
import { createIngredient, deleteIngredient, updateIngredient, updateInventory, InventoryRow } from '../../src/lib/supabase/inventory';

export default function InventoryPage() {
  const [rows, setRows] = useState<InventoryRow[]>([]);
  const [householdId, setHouseholdId] = useState('');
  const [form, setForm] = useState({ name: '', unit: '份', quantity: 0, safetyStock: 1 });
  const [message, setMessage] = useState('');

  const refresh = async () => {
    const data = await loadDashboard();
    if (!data) return;
    setHouseholdId(data.householdId);
    setRows(data.ingredients.map((ingredient) => ({
      id: ingredient.id,
      name: ingredient.name,
      unit: ingredient.unit,
      safetyStock: ingredient.safetyStock,
      quantity: data.inventory.find((item) => item.ingredientId === ingredient.id)?.quantity ?? 0,
    })));
  };
  useEffect(() => { void refresh(); }, []);

  const add = async () => {
    if (!householdId || !form.name.trim()) return setMessage('請輸入食材名稱');
    try {
      await createIngredient({ householdId, ...form });
      setForm({ name: '', unit: '份', quantity: 0, safetyStock: 1 });
      setMessage('食材已新增');
      await refresh();
    } catch (error) { setMessage(error instanceof Error ? error.message : '新增失敗'); }
  };

  const adjust = async (row: InventoryRow, delta: number) => {
    const quantity = Math.max(0, row.quantity + delta);
    try { await updateInventory(row.id, quantity); setRows((current) => current.map((item) => item.id === row.id ? { ...item, quantity } : item)); }
    catch (error) { setMessage(error instanceof Error ? error.message : '更新失敗'); }
  };

  const editSafety = async (row: InventoryRow) => {
    const value = window.prompt('安全庫存數量', String(row.safetyStock));
    if (value === null) return;
    const safetyStock = Number(value);
    if (!Number.isFinite(safetyStock) || safetyStock < 0) return setMessage('請輸入有效數字');
    try { await updateIngredient(row.id, { safetyStock }); setRows((current) => current.map((item) => item.id === row.id ? { ...item, safetyStock } : item)); }
    catch (error) { setMessage(error instanceof Error ? error.message : '更新失敗'); }
  };

  const remove = async (row: InventoryRow) => {
    if (!window.confirm(`確定刪除「${row.name}」？`)) return;
    try { await deleteIngredient(row.id); setRows((current) => current.filter((item) => item.id !== row.id)); }
    catch (error) { setMessage(error instanceof Error ? error.message : '刪除失敗'); }
  };

  return <main className="content">
    <div className="page-heading compact"><div><a className="back-link" href="/">← 回到看板</a><h1>冰箱庫存</h1><p>新增食材、調整數量與安全庫存。</p></div></div>
    <section className="side-panel inventory-form"><h2>新增食材</h2><div className="inventory-form-grid">
      <label>名稱<input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="例如：雞蛋" /></label>
      <label>單位<input value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} /></label>
      <label>目前數量<input type="number" min="0" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })} /></label>
      <label>安全庫存<input type="number" min="0" value={form.safetyStock} onChange={(e) => setForm({ ...form, safetyStock: Number(e.target.value) })} /></label>
    </div><button className="primary-button" onClick={add}>新增食材</button>{message && <div className="notice">{message}</div>}</section>
    <section className="inventory-table"><div className="table-header"><span>食材</span><span>目前庫存</span><span>安全庫存</span><span>操作</span></div>
      {rows.length === 0 && <div className="empty-state">尚未有食材，請先新增。</div>}
      {rows.map((row) => <div className="table-row inventory-manage-row" key={row.id}><span className="food-name">{row.name}<small>{row.unit}</small></span><span><button className="quantity-button" onClick={() => void adjust(row, -1)}>−</button><b className="quantity-value">{row.quantity}</b><button className="quantity-button" onClick={() => void adjust(row, 1)}>＋</button></span><span>{row.safetyStock}</span><span><button onClick={() => void editSafety(row)}>編輯</button><button onClick={() => void remove(row)}>刪除</button></span></div>)}
    </section>
  </main>;
}
