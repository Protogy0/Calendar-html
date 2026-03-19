-- Aged Care CMS — Supabase Schema
-- Run this once in: Supabase Dashboard → SQL Editor → New Query

-- ─── RESIDENTS ────────────────────────────────────────────────────────────────
create table public.residents (
  id               uuid primary key default gen_random_uuid(),
  first_name       text not null,
  last_name        text not null,
  dob              date,
  room_number      text,
  care_level       text,
  admission_date   date,
  gp               text,
  gp_phone         text,
  next_of_kin      text,
  nok_relation     text,
  nok_phone        text,
  allergies        text,
  medical_history  text,
  dni              boolean default false,
  dnr              boolean default false,
  created_at       timestamptz default now()
);

-- ─── MEDICATIONS ──────────────────────────────────────────────────────────────
create table public.medications (
  id           uuid primary key default gen_random_uuid(),
  resident_id  uuid references public.residents(id) on delete cascade,
  name         text not null,
  dose         text,
  route        text,
  frequency    text,
  times        jsonb default '[]',
  indication   text,
  prescriber   text,
  start_date   date,
  active       boolean default true,
  created_at   timestamptz default now()
);

-- ─── MAR RECORDS ──────────────────────────────────────────────────────────────
create table public.mar_records (
  id             uuid primary key default gen_random_uuid(),
  medication_id  uuid references public.medications(id) on delete cascade,
  resident_id    uuid references public.residents(id) on delete cascade,
  date           date not null,
  scheduled_time text not null,
  status         text,
  updated_at     timestamptz default now(),
  unique (medication_id, resident_id, date, scheduled_time)
);

-- ─── CLINICAL NOTES ───────────────────────────────────────────────────────────
create table public.clinical_notes (
  id           uuid primary key default gen_random_uuid(),
  resident_id  uuid references public.residents(id) on delete cascade,
  type         text,
  content      text not null,
  author       text,
  created_at   timestamptz default now()
);

-- ─── VITALS ───────────────────────────────────────────────────────────────────
create table public.vitals (
  id           uuid primary key default gen_random_uuid(),
  resident_id  uuid references public.residents(id) on delete cascade,
  date         date,
  time         text,
  bp           text,
  pulse        text,
  temp         text,
  spo2         text,
  rr           text,
  bsl          text,
  weight       text,
  notes        text,
  author       text,
  created_at   timestamptz default now()
);

-- ─── APPOINTMENTS ─────────────────────────────────────────────────────────────
create table public.appointments (
  id             uuid primary key default gen_random_uuid(),
  title          text not null,
  start          date not null,
  resident_name  text,
  type           text,
  location       text,
  notes          text,
  created_at     timestamptz default now()
);

-- ─── ROW LEVEL SECURITY ───────────────────────────────────────────────────────
-- Any authenticated staff member has full read/write access to all tables.

alter table public.residents      enable row level security;
alter table public.medications    enable row level security;
alter table public.mar_records    enable row level security;
alter table public.clinical_notes enable row level security;
alter table public.vitals         enable row level security;
alter table public.appointments   enable row level security;

create policy "Authenticated staff full access" on public.residents
  for all to authenticated using (true) with check (true);

create policy "Authenticated staff full access" on public.medications
  for all to authenticated using (true) with check (true);

create policy "Authenticated staff full access" on public.mar_records
  for all to authenticated using (true) with check (true);

create policy "Authenticated staff full access" on public.clinical_notes
  for all to authenticated using (true) with check (true);

create policy "Authenticated staff full access" on public.vitals
  for all to authenticated using (true) with check (true);

create policy "Authenticated staff full access" on public.appointments
  for all to authenticated using (true) with check (true);
