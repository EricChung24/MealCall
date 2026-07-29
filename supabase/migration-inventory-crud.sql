-- Inventory CRUD policies for authenticated household members.
drop policy if exists "members can update ingredients" on public.ingredients;
create policy "members can update ingredients" on public.ingredients
  for update using (public.is_household_member(household_id))
  with check (public.is_household_member(household_id));

drop policy if exists "members can delete ingredients" on public.ingredients;
create policy "members can delete ingredients" on public.ingredients
  for delete using (public.is_household_member(household_id));

drop policy if exists "members can delete inventory" on public.inventory;
create policy "members can delete inventory" on public.inventory
  for delete using (exists (select 1 from public.ingredients i where i.id = ingredient_id and public.is_household_member(i.household_id)));
