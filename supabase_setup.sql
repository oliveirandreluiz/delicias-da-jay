-- Execute este script no Supabase SQL Editor
-- Settings > SQL Editor > New query > cole este código > Run

create table if not exists receitas (
  id    integer primary key default 1,
  dados jsonb  not null
);

create table if not exists produtos (
  id    integer primary key default 1,
  dados jsonb  not null
);

-- Permite leitura e escrita sem login (o app usa a chave anon)
alter table receitas enable row level security;
alter table produtos  enable row level security;

create policy "acesso publico receitas" on receitas for all using (true) with check (true);
create policy "acesso publico produtos" on produtos  for all using (true) with check (true);
