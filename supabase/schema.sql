-- Schema do site da Paróquia Santa Clara e São Francisco de Assis
-- Leitura pública (site) + escrita apenas por usuários autenticados (/admin)

-- Avisos da semana (aparecem na página inicial)
create table if not exists public.avisos (
  id uuid primary key default gen_random_uuid(),
  texto text not null,
  ativo boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.avisos enable row level security;

create policy "avisos leitura publica" on public.avisos
  for select using (true);

create policy "avisos escrita autenticada" on public.avisos
  for all to authenticated using (true) with check (true);

-- Álbuns de fotos de eventos
create table if not exists public.albuns (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  data_evento date,
  created_at timestamptz not null default now()
);

alter table public.albuns enable row level security;

create policy "albuns leitura publica" on public.albuns
  for select using (true);

create policy "albuns escrita autenticada" on public.albuns
  for all to authenticated using (true) with check (true);

-- Fotos (arquivos ficam no bucket "fotos" do Storage; aqui só o caminho)
create table if not exists public.fotos (
  id uuid primary key default gen_random_uuid(),
  album_id uuid not null references public.albuns (id) on delete cascade,
  path text not null,
  legenda text,
  created_at timestamptz not null default now()
);

alter table public.fotos enable row level security;

create policy "fotos leitura publica" on public.fotos
  for select using (true);

create policy "fotos escrita autenticada" on public.fotos
  for all to authenticated using (true) with check (true);

-- Bucket público para as imagens
insert into storage.buckets (id, name, public)
values ('fotos', 'fotos', true)
on conflict (id) do nothing;

create policy "storage fotos leitura publica" on storage.objects
  for select using (bucket_id = 'fotos');

create policy "storage fotos upload autenticado" on storage.objects
  for insert to authenticated with check (bucket_id = 'fotos');

create policy "storage fotos remocao autenticada" on storage.objects
  for delete to authenticated using (bucket_id = 'fotos');
