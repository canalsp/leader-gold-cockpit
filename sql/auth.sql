-- Auth base para substituir login mock por autenticação real no Supabase.
-- Execute no SQL Editor.

create extension if not exists "pgcrypto";

create table if not exists public.admin_users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  username text not null unique,
  password_hash text not null,
  role text not null default 'editor',
  is_active boolean not null default true,
  last_login_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint admin_users_role_check check (role in ('admin', 'editor', 'author'))
);

create table if not exists public.admin_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.admin_users(id) on delete cascade,
  token_hash text not null unique,
  ip_address inet,
  user_agent text,
  expires_at timestamptz not null,
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists admin_sessions_user_idx on public.admin_sessions(user_id);
create index if not exists admin_sessions_expires_idx on public.admin_sessions(expires_at);

create table if not exists public.admin_password_reset_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.admin_users(id) on delete cascade,
  token_hash text not null unique,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists admin_reset_user_idx on public.admin_password_reset_tokens(user_id);
create index if not exists admin_reset_expires_idx on public.admin_password_reset_tokens(expires_at);

-- Trigger simples para updated_at.
create or replace function public.set_updated_at_timestamp()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_admin_users_updated_at on public.admin_users;
create trigger trg_admin_users_updated_at
before update on public.admin_users
for each row execute function public.set_updated_at_timestamp();

