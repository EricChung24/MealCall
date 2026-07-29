-- 管理員會員權限清單：可重複執行
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select lower(coalesce(auth.jwt() ->> 'email', '')) = 'lf2net679@yahoo.com.tw';
$$;

drop policy if exists "admin can manage members" on public.household_members;
create policy "admin can manage members" on public.household_members
  for all using (public.is_admin()) with check (public.is_admin());

-- 一般成員仍可查看同家庭會員，但不能修改他人權限。
drop policy if exists "members can read members" on public.household_members;
create policy "members can read members" on public.household_members
  for select using (public.is_household_member(household_id));
