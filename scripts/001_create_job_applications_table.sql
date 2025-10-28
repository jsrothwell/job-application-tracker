-- Create job applications table with user association
create table if not exists public.job_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  company text not null,
  position text not null,
  status text not null check (status in ('Applied', 'Interview', 'Offer', 'Rejected', 'Follow-up')),
  date_applied date not null default current_date,
  salary text,
  location text,
  notes text,
  job_url text,
  posting_online boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table public.job_applications enable row level security;

-- Create RLS policies for job applications
create policy "Users can view their own job applications"
  on public.job_applications for select
  using (auth.uid() = user_id);

create policy "Users can insert their own job applications"
  on public.job_applications for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own job applications"
  on public.job_applications for update
  using (auth.uid() = user_id);

create policy "Users can delete their own job applications"
  on public.job_applications for delete
  using (auth.uid() = user_id);

-- Create updated_at trigger
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$;

create trigger job_applications_updated_at
  before update on public.job_applications
  for each row
  execute function public.handle_updated_at();
