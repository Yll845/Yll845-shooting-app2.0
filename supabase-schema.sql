create table if not exists public.app_data (
  id uuid primary key default gen_random_uuid(),
  entity_name text not null,
  record_id text not null,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (entity_name, record_id)
);

alter table public.app_data enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'app_data' and policyname = 'Allow public read access'
  ) then
    create policy "Allow public read access" on public.app_data for select using (true);
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'app_data' and policyname = 'Allow public insert access'
  ) then
    create policy "Allow public insert access" on public.app_data for insert with check (true);
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'app_data' and policyname = 'Allow public update access'
  ) then
    create policy "Allow public update access" on public.app_data for update using (true) with check (true);
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'app_data' and policyname = 'Allow public delete access'
  ) then
    create policy "Allow public delete access" on public.app_data for delete using (true);
  end if;
end
$$;
