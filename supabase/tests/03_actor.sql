-- Tests 3: the audit log names the signed-in staff member.
begin;
create function _assert(cond boolean, msg text) returns void language plpgsql as $$
begin if cond is not true then raise exception 'TEST FAILED: %', msg; end if; end $$;

-- Pretend someone is signed in (Supabase's auth.uid() reads the request's token).
create or replace function auth.uid() returns uuid language sql stable as
  $$ select nullif(current_setting('test.uid', true), '')::uuid $$;

do $$
declare v_job uuid;
begin
  insert into staff (name, auth_user_id) values ('Terri', '00000000-0000-0000-0000-000000000001');
  perform set_config('test.uid', '00000000-0000-0000-0000-000000000001', true);
  insert into jobs (job_ref) values ('A-1') returning id into v_job;
  perform _assert((select actor_kind = 'staff' and actor_label = 'Terri' from event_log
                    where job_id = v_job and action = 'insert'), 'signed-in staff member recorded');

  perform set_config('app.actor_kind', 'bot', true);
  perform set_config('app.actor_label', 'Chase bot', true);
  update jobs set crm_ref = 'X' where id = v_job;
  perform _assert((select actor_label = 'Chase bot' from event_log
                    where job_id = v_job and action = 'update'), 'explicit actor wins');
end $$;
rollback;
