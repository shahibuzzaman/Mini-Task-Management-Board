-- Force adding the email column to profiles, since it appears the table existed before 
-- the create table if not exists statement in previous migrations, thus dropping the column schema.
alter table public.profiles 
  add column if not exists email text;
