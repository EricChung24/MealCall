-- 只補充新權限，不重新建立既有資料表
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select lower(coalesce(auth.jwt() ->> 'email', '')) = 'lf2net679@yahoo.com.tw';
$$;

drop policy if exists "authenticated can create household" on public.households;
create policy "authenticated can create household" on public.households
for insert with check (auth.uid() is not null);

drop policy if exists "users can join household" on public.household_members;
create policy "users can join household" on public.household_members
for insert with check (user_id = auth.uid());

drop policy if exists "members can write meals" on public.meals;
create policy "members can write meals" on public.meals
for insert with check (public.is_household_member(household_id));

drop policy if exists "members can write meal ingredients" on public.meal_ingredients;
create policy "members can write meal ingredients" on public.meal_ingredients
for insert with check (
  exists (
    select 1 from public.meals m
    where m.id = meal_id and public.is_household_member(m.household_id)
  )
);

drop policy if exists "admin can manage households" on public.households;
create policy "admin can manage households" on public.households
for all using (public.is_admin());

drop policy if exists "admin can manage members" on public.household_members;
create policy "admin can manage members" on public.household_members
for all using (public.is_admin());

drop policy if exists "admin can manage ingredients" on public.ingredients;
create policy "admin can manage ingredients" on public.ingredients
for all using (public.is_admin());

drop policy if exists "admin can manage inventory" on public.inventory;
create policy "admin can manage inventory" on public.inventory
for all using (public.is_admin());

drop policy if exists "admin can manage meals" on public.meals;
create policy "admin can manage meals" on public.meals
for all using (public.is_admin());

drop policy if exists "admin can manage meal ingredients" on public.meal_ingredients;
create policy "admin can manage meal ingredients" on public.meal_ingredients
for all using (public.is_admin());
