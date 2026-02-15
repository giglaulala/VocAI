-- Facebook / Instagram messaging tables
-- Run this in Supabase SQL editor (or via CLI migrations if you use it).

create extension if not exists pgcrypto;

-- Connected Facebook/Instagram pages
create table if not exists public.connected_pages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  page_id text not null unique,
  page_name text,
  page_access_token text not null,
  platform text not null check (platform in ('facebook', 'instagram')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Conversations with customers
create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  page_id text not null references public.connected_pages(page_id) on delete cascade,
  sender_id text not null,
  platform text not null check (platform in ('facebook', 'instagram')),
  last_message_at timestamptz,
  created_at timestamptz not null default now(),
  unique(page_id, sender_id)
);

-- Individual messages
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  message_id text not null unique,
  sender_id text not null,
  text text,
  platform text not null check (platform in ('facebook', 'instagram')),
  is_from_customer boolean not null default true,
  timestamp timestamptz,
  created_at timestamptz not null default now()
);

-- updated_at trigger
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists connected_pages_set_updated_at on public.connected_pages;
create trigger connected_pages_set_updated_at
before update on public.connected_pages
for each row
execute function public.set_updated_at();

-- Helpful indexes
create index if not exists idx_connected_pages_user_id on public.connected_pages(user_id);
create index if not exists idx_conversations_user_last on public.conversations(user_id, last_message_at desc);
create index if not exists idx_messages_conversation_ts on public.messages(conversation_id, timestamp asc);

-- RLS (recommended)
alter table public.connected_pages enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;

-- connected_pages policies
drop policy if exists "connected_pages_select_own" on public.connected_pages;
create policy "connected_pages_select_own"
on public.connected_pages for select
using (auth.uid() = user_id);

drop policy if exists "connected_pages_modify_own" on public.connected_pages;
create policy "connected_pages_modify_own"
on public.connected_pages for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- conversations policies
drop policy if exists "conversations_select_own" on public.conversations;
create policy "conversations_select_own"
on public.conversations for select
using (auth.uid() = user_id);

drop policy if exists "conversations_modify_own" on public.conversations;
create policy "conversations_modify_own"
on public.conversations for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- messages policies (enforced via conversation ownership)
drop policy if exists "messages_select_via_conversation" on public.messages;
create policy "messages_select_via_conversation"
on public.messages for select
using (
  exists (
    select 1 from public.conversations c
    where c.id = messages.conversation_id
      and c.user_id = auth.uid()
  )
);

drop policy if exists "messages_modify_via_conversation" on public.messages;
create policy "messages_modify_via_conversation"
on public.messages for all
using (
  exists (
    select 1 from public.conversations c
    where c.id = messages.conversation_id
      and c.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.conversations c
    where c.id = messages.conversation_id
      and c.user_id = auth.uid()
  )
);

