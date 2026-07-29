'use client';

import { useEffect, useState } from 'react';
import { createClient } from '../../src/lib/supabase/client';
import { isAdminEmail } from '../../src/lib/admin';
import { loadDashboard } from '../../src/lib/supabase/dashboard';
import { loadMembers, updateMemberPermissions } from '../../src/lib/supabase/members';
import { MemberPermissions } from '../../src/components/members/MemberPermissions';
import type { Member } from '../../src/domain/types';

export default function AdminPage() {
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const [householdId, setHouseholdId] = useState<string>();
  const [members, setMembers] = useState<Member[]>([]);
  const [error, setError] = useState('');
  useEffect(() => { (async () => {
    const client = createClient(); const { data } = client ? await client.auth.getUser() : { data: { user: null } };
    if (!isAdminEmail(data.user?.email)) { setAllowed(false); return; }
    setAllowed(true);
    try { const dashboard = await loadDashboard(); if (!dashboard) throw new Error('找不到家庭資料'); setHouseholdId(dashboard.householdId); setMembers(await loadMembers(dashboard.householdId)); }
    catch (e) { setError(e instanceof Error ? e.message : '載入會員失敗'); }
  })(); }, []);
  if (allowed === null) return <main className="auth-page"><div className="auth-card"><p>載入管理員後台…</p></div></main>;
  if (!allowed) return <main className="auth-page"><div className="auth-card"><h1>沒有權限</h1><p>只有指定管理員帳號可以進入後台。</p><a className="primary-button" href="/">回到看板</a></div></main>;
  return <main className="content"><div className="page-heading"><div><span className="eyebrow">ADMIN CONSOLE</span><h1>管理員後台</h1><p>管理所有家庭會員、角色名稱與逐項功能權限。</p></div><a className="outline-button" href="/">回到看板</a></div>{error && <p className="form-message error">{error}</p>}{householdId && <MemberPermissions members={members} onSave={async (next) => { for (const member of next) await updateMemberPermissions(householdId, member); setMembers(next); }} />}</main>;
}
