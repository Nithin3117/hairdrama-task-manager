create table public.profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    email text unique not null,
    full_name text,
    created_at timestamptz default now()
);

create table public.tasks (
    id uuid primary key default gen_random_uuid(),
    title text not null,
    description text,
    assigned_to uuid not null references public.profiles(id) on delete cascade,
    created_by uuid not null references public.profiles(id) on delete cascade,
    status text not null default 'pending',
    created_at timestamptz default now(),
    completed_at timestamptz
);

alter table public.profiles enable row level security;
alter table public.tasks enable row level security;

create policy "Users can view profiles"
on public.profiles
for select
to authenticated
using (true);

create policy "Users can insert their profile"
on public.profiles
for insert
to authenticated
with check (auth.uid() = id);

create policy "Users can view tasks"
on public.tasks
for select
to authenticated
using (
    auth.uid() = created_by
    or auth.uid() = assigned_to
);

create policy "Users can create tasks"
on public.tasks
for insert
to authenticated
with check (auth.uid() = created_by);

create policy "Assigned users can update tasks"
on public.tasks
for update
to authenticated
using (
    auth.uid() = assigned_to
    or auth.uid() = created_by
)
with check (
    auth.uid() = assigned_to
    or auth.uid() = created_by
);

grant usage on schema public to service_role;

grant select, insert, update, delete
on public.profiles
to service_role;

grant select, insert, update, delete
on public.tasks
to service_role;