'use client';

import { useState } from 'react';
import type { Member, Permission } from '../../domain/types';

export const permissionLabels: Record<Permission, string> = {
  'meal:create': '建立餐點', 'meal:edit': '編輯餐點', 'meal:publish': '發布餐點',
  'meal:complete': '完成／取消餐點', 'inventory:view': '查看庫存', 'inventory:edit': '調整庫存',
  'members:manage': '管理會員', 'roles:manage': '管理角色',
};

export function MemberPermissions({ members, onSave, onClose }: {
  members: Member[]; onSave: (members: Member[]) => Promise<void>; onClose?: () => void;
}) {
  const [rows, setRows] = useState(members);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const toggle = (id: string, permission: Permission, checked: boolean) => setRows((all) => all.map((row) => row.id !== id ? row : ({ ...row, permissions: checked ? (row.permissions.includes(permission) ? row.permissions : [...row.permissions, permission]) : row.permissions.filter((p) => p !== permission) })));
  const save = async () => { setSaving(true); setMessage(''); try { await onSave(rows); setMessage('已儲存會員權限'); } catch (e) { setMessage(e instanceof Error ? e.message : '儲存失敗'); } finally { setSaving(false); } };
  return <section className="side-panel member-permissions"><div className="section-heading"><div><span className="eyebrow">MEMBERS & PERMISSIONS</span><h2>會員權限清單</h2></div>{onClose && <button className="outline-button" onClick={onClose}>關閉</button>}</div>
    <p className="modal-help">管理員可以修改每位家庭成員的角色名稱與個別功能權限。</p>
    {rows.length === 0 ? <p className="empty-state">目前還沒有家庭成員。</p> : rows.map((row) => <div className="member-row" key={row.id}><div className="member-title"><div className="avatar small">{row.name.slice(0, 1).toUpperCase()}</div><div><b>{row.name}</b><input aria-label="角色名稱" value={row.roleName} onChange={(e) => setRows((all) => all.map((x) => x.id === row.id ? { ...x, roleName: e.target.value } : x))} /></div></div><div className="permission-grid">{(Object.keys(permissionLabels) as Permission[]).map((permission) => <label key={permission}><input type="checkbox" checked={row.permissions.includes(permission)} onChange={(e) => toggle(row.id, permission, e.target.checked)} />{permissionLabels[permission]}</label>)}</div></div>)}
    <div className="modal-actions"><button className="primary-button" disabled={saving} onClick={save}>{saving ? '儲存中…' : '儲存所有權限'}</button>{message && <span className="form-message">{message}</span>}</div>
  </section>;
}
