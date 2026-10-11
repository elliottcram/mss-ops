-- =====================================================================
-- Audit log: when the app doesn't say who made a change, use the signed-in
-- staff member. Bots and emailed links still set app.actor_kind /
-- app.actor_label explicitly, and those win.
-- =====================================================================

create or replace function log_change() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  v_old jsonb; v_new jsonb; v_changes jsonb; v_row jsonb; v_job uuid;
  v_kind text  := nullif(current_setting('app.actor_kind', true), '');
  v_label text := nullif(current_setting('app.actor_label', true), '');
begin
  if v_kind is null and auth.uid() is not null then
    select 'staff', s.name into v_kind, v_label from staff s where s.auth_user_id = auth.uid();
  end if;

  if tg_op = 'INSERT' then
    v_new := to_jsonb(new); v_changes := v_new; v_row := v_new;
  elsif tg_op = 'UPDATE' then
    v_old := to_jsonb(old); v_new := to_jsonb(new); v_row := v_new;
    select jsonb_object_agg(key, jsonb_build_object('from', v_old->key, 'to', v_new->key))
      into v_changes
      from jsonb_each(v_new)
     where v_new->key is distinct from v_old->key and key <> 'updated_at';
    if v_changes is null then return new; end if;
  else
    v_row := to_jsonb(old); v_changes := v_row;
  end if;
  v_job := coalesce(v_row->>'job_id', case when tg_table_name = 'jobs' then v_row->>'id' end)::uuid;
  insert into event_log (job_id, entity, entity_id, action, actor_kind, actor_label, changes)
  values (v_job, tg_table_name, (v_row->>'id')::uuid, lower(tg_op),
          coalesce(v_kind, 'system')::actor_kind, v_label, v_changes);
  return coalesce(new, old);
end $$;
revoke execute on function log_change() from public, anon, authenticated;
