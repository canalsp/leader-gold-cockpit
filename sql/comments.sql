-- Tabela de comentários com moderação.
-- Execute no Supabase SQL Editor.

create table if not exists public.post_comments (
  id bigserial primary key,
  post_id bigint not null references public.posts(id) on delete cascade,
  name text not null,
  email text not null,
  comment text not null,
  status text not null default 'pending',
  ip_address text,
  user_agent text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint post_comments_status_check check (status in ('pending', 'approved', 'rejected'))
);

create index if not exists post_comments_post_idx on public.post_comments(post_id);
create index if not exists post_comments_status_idx on public.post_comments(status);
create index if not exists post_comments_created_idx on public.post_comments(created_at desc);

drop trigger if exists trg_post_comments_updated_at on public.post_comments;
create trigger trg_post_comments_updated_at
before update on public.post_comments
for each row execute function public.set_updated_at_timestamp();

