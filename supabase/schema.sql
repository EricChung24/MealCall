create extension if not exists "pgcrypto";

create table public.households (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

create table public.household_members (
  household_id uuid not null references public.households(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role_id text not null default 'viewer',
  role_name text not null default '查看者',
  permissions text[] not null default array['inventory:view'],
  primary key (household_id, user_id)
);

create table public.ingredients (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  name text not null,
  unit text not null,
  safety_stock numeric not null default 0 check (safety_stock >= 0)
);

create table public.inventory (
  ingredient_id uuid primary key references public.ingredients(id) on delete cascade,
  quantity numeric not null default 0 check (quantity >= 0),
  updated_at timestamptz not null default now()
);

create table public.meals (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  date date not null,
  slot text not null check (slot in ('早餐','午餐','晚餐')),
  title text not null,
  cook_id uuid not null references auth.users(id),
  status text not null default '草稿' check (status in ('草稿','已發布','已完成','已取消')),
  created_at timestamptz not null default now(),
  unique (household_id, date, slot)
);

create table public.meal_ingredients (
  meal_id uuid not null references public.meals(id) on delete cascade,
  ingredient_id uuid not null references public.ingredients(id),
  planned_amount numeric not null check (planned_amount > 0),
  reserved_amount numeric not null default 0 check (reserved_amount >= 0),
  consumed_amount numeric not null default 0 check (consumed_amount >= 0),
  primary key (meal_id, ingredient_id)
);

alter table public.households enable row level security;
alter table public.household_members enable row level security;
alter table public.ingredients enable row level security;
alter table public.inventory enable row level security;
alter table public.meals enable row level security;
alter table public.meal_ingredients enable row level security;

create or replace function public.is_household_member(target_household uuid)
returns boolean language sql security definer set search_path = public as $$
  select exists(select 1 from public.household_members where household_id = target_household and user_id = auth.uid());
$$;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select lower(coalesce(auth.jwt() ->> 'email', '')) = 'lf2net679@yahoo.com.tw';
$$;

create policy "admin can manage households" on public.households for all using (public.is_admin());
create policy "admin can manage members" on public.household_members for all using (public.is_admin());
create policy "admin can manage ingredients" on public.ingredients for all using (public.is_admin());
create policy "admin can manage inventory" on public.inventory for all using (public.is_admin());
create policy "admin can manage meals" on public.meals for all using (public.is_admin());
create policy "admin can manage meal ingredients" on public.meal_ingredients for all using (public.is_admin());

create policy "members can read households" on public.households for select using (public.is_household_member(id));
create policy "members can read members" on public.household_members for select using (public.is_household_member(household_id));
create policy "members can read ingredients" on public.ingredients for select using (public.is_household_member(household_id));
create policy "members can read meals" on public.meals for select using (public.is_household_member(household_id));
create policy "members can read inventory" on public.inventory for select using (exists(select 1 from public.ingredients i where i.id = ingredient_id and public.is_household_member(i.household_id)));
create policy "members can read meal ingredients" on public.meal_ingredients for select using (exists(select 1 from public.meals m where m.id = meal_id and public.is_household_member(m.household_id)));
