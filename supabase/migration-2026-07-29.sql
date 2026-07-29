-- 只補充新權限，不重新建立既有資料表
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select lower(coalesce(auth.jwt() ->> 'email', '')) = 'lf2net679@yahoo.com.tw';
$$;

drop policy if exists "authenticated can create household" on public.households;
create policy "authenticated can create household" on public.households
for insert with check (auth.uid() is not null);
drop policy if exists "authenticated can find default household" on public.households;
create policy "authenticated can find default household" on public.households
for select using (name = '鍾家冰箱' and auth.uid() is not null);
drop policy if exists "public can view default household" on public.households;
create policy "public can view default household" on public.households
for select using (name = '鍾家冰箱');
drop policy if exists "public can view default ingredients" on public.ingredients;
create policy "public can view default ingredients" on public.ingredients
for select using (exists (select 1 from public.households h where h.id = household_id and h.name = '鍾家冰箱'));
drop policy if exists "public can view default inventory" on public.inventory;
create policy "public can view default inventory" on public.inventory
for select using (exists (select 1 from public.ingredients i join public.households h on h.id = i.household_id where i.id = ingredient_id and h.name = '鍾家冰箱'));
drop policy if exists "public can view default meals" on public.meals;
create policy "public can view default meals" on public.meals
for select using (exists (select 1 from public.households h where h.id = household_id and h.name = '鍾家冰箱'));
drop policy if exists "public can view default meal ingredients" on public.meal_ingredients;
create policy "public can view default meal ingredients" on public.meal_ingredients
for select using (exists (select 1 from public.meals m join public.households h on h.id = m.household_id where m.id = meal_id and h.name = '鍾家冰箱'));

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

drop policy if exists "members can create ingredients" on public.ingredients;
create policy "members can create ingredients" on public.ingredients for insert with check (public.is_household_member(household_id));
drop policy if exists "members can create inventory" on public.inventory;
create policy "members can create inventory" on public.inventory for insert with check (exists(select 1 from public.ingredients i where i.id = ingredient_id and public.is_household_member(i.household_id)));
drop policy if exists "members can update inventory" on public.inventory;
create policy "members can update inventory" on public.inventory for update using (exists(select 1 from public.ingredients i where i.id = ingredient_id and public.is_household_member(i.household_id)));

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
