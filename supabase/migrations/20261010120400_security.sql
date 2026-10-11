-- =====================================================================
-- Row-level security.
-- Supabase publishes every table in "public" through its API, so without
-- this anyone holding the public (anon) key could read the data.
--
-- Rules for now:
--  * Only signed-in users who are active rows in "staff" can read or write.
--  * The audit log is read-only to staff; only the log_change() trigger writes it.
--  * Emailed no-account links (installer and homeowner forms) never touch the
--    tables directly. The app's server checks the link and writes with the
--    service role, which bypasses RLS.
-- Finer per-role rules (e.g. surveyors only see their own jobs) come later.
-- =====================================================================

create function is_staff() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from staff where auth_user_id = auth.uid() and active)
$$;

do $$
declare t record;
begin
  for t in select tablename from pg_tables where schemaname = 'public' loop
    execute format('alter table public.%I enable row level security', t.tablename);
    if t.tablename = 'event_log' then
      execute format('create policy staff_read on public.%I for select to authenticated using (is_staff())',
                     t.tablename);
    else
      execute format('create policy staff_all on public.%I for all to authenticated using (is_staff()) with check (is_staff())',
                     t.tablename);
    end if;
  end loop;
end $$;

-- Nothing for anonymous visitors.
revoke all on all tables in schema public from anon;
