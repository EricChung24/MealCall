import { createClient } from './client';
import type { Member, Permission } from '../../domain/types';

export async function loadMembers(householdId: string): Promise<Member[]> {
  const supabase = createClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('household_members')
    .select('user_id, role_id, role_name, permissions')
    .eq('household_id', householdId)
    .order('role_name');
  if (error) throw error;
  return (data ?? []).map((row) => ({
    id: row.user_id,
    name: row.user_id,
    roleId: row.role_id,
    roleName: row.role_name,
    permissions: (row.permissions ?? []) as Permission[],
  }));
}

export async function updateMemberPermissions(
  householdId: string,
  member: Pick<Member, 'id' | 'roleId' | 'roleName' | 'permissions'>,
) {
  const supabase = createClient();
  if (!supabase) throw new Error('Supabase 尚未設定');
  const { error } = await supabase
    .from('household_members')
    .update({ role_id: member.roleId, role_name: member.roleName, permissions: member.permissions })
    .eq('household_id', householdId)
    .eq('user_id', member.id);
  if (error) throw error;
}
