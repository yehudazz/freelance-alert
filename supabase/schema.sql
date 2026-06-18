-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- TABLES
-- ============================================================

-- profiles
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  full_name text,
  service_description text,
  skills text[] default '{}',
  bio text,
  reddit_username text,
  subscription_tier text default 'free' check (subscription_tier in ('free', 'starter', 'pro')),
  subscription_status text default 'active' check (subscription_status in ('active', 'cancelled', 'trialing')),
  stripe_customer_id text,
  notification_email text,
  notification_phone text,
  notify_via_email boolean default true,
  notify_via_sms boolean default false,
  created_at timestamptz default now()
);

-- keywords
create table public.keywords (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  keyword text not null,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- monitored_subreddits
create table public.monitored_subreddits (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  subreddit_name text not null,
  is_active boolean default true
);

-- leads
create table public.leads (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  platform text default 'reddit',
  post_id text not null,
  post_title text not null,
  post_body text,
  post_url text not null,
  author_username text,
  subreddit text,
  lead_score integer check (lead_score >= 1 and lead_score <= 10),
  score_reason text,
  has_budget_mentioned boolean default false,
  budget_amount text,
  urgency_level text check (urgency_level in ('low', 'medium', 'high')),
  drafted_message text,
  drafted_email_subject text,
  status text default 'new' check (status in ('new', 'viewed', 'sent', 'dismissed')),
  found_at timestamptz default now(),
  created_at timestamptz default now(),
  unique(user_id, post_id)
);

-- subscriptions
create table public.subscriptions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  stripe_subscription_id text not null,
  plan text check (plan in ('starter', 'pro')),
  status text,
  current_period_end timestamptz,
  created_at timestamptz default now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.profiles enable row level security;
alter table public.keywords enable row level security;
alter table public.monitored_subreddits enable row level security;
alter table public.leads enable row level security;
alter table public.subscriptions enable row level security;

-- ============================================================
-- RLS POLICIES: profiles
-- ============================================================

create policy "profiles: select own row"
  on public.profiles
  for select
  to authenticated
  using (id = auth.uid());

create policy "profiles: update own row"
  on public.profiles
  for update
  to authenticated
  using (id = auth.uid());

create policy "profiles: delete own row"
  on public.profiles
  for delete
  to authenticated
  using (id = auth.uid());

-- ============================================================
-- RLS POLICIES: keywords
-- ============================================================

create policy "keywords: select own rows"
  on public.keywords
  for select
  to authenticated
  using (user_id = auth.uid());

create policy "keywords: insert own rows"
  on public.keywords
  for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "keywords: update own rows"
  on public.keywords
  for update
  to authenticated
  using (user_id = auth.uid());

create policy "keywords: delete own rows"
  on public.keywords
  for delete
  to authenticated
  using (user_id = auth.uid());

-- ============================================================
-- RLS POLICIES: monitored_subreddits
-- ============================================================

create policy "monitored_subreddits: select own rows"
  on public.monitored_subreddits
  for select
  to authenticated
  using (user_id = auth.uid());

create policy "monitored_subreddits: insert own rows"
  on public.monitored_subreddits
  for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "monitored_subreddits: update own rows"
  on public.monitored_subreddits
  for update
  to authenticated
  using (user_id = auth.uid());

create policy "monitored_subreddits: delete own rows"
  on public.monitored_subreddits
  for delete
  to authenticated
  using (user_id = auth.uid());

-- ============================================================
-- RLS POLICIES: leads
-- ============================================================

create policy "leads: select own rows"
  on public.leads
  for select
  to authenticated
  using (user_id = auth.uid());

create policy "leads: insert own rows"
  on public.leads
  for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "leads: update own rows"
  on public.leads
  for update
  to authenticated
  using (user_id = auth.uid());

create policy "leads: delete own rows"
  on public.leads
  for delete
  to authenticated
  using (user_id = auth.uid());

-- ============================================================
-- RLS POLICIES: subscriptions
-- ============================================================

create policy "subscriptions: select own rows"
  on public.subscriptions
  for select
  to authenticated
  using (user_id = auth.uid());

-- ============================================================
-- TRIGGER: auto-create profile on user signup
-- ============================================================

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, notification_email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
