-- Tests 4: a first Microsoft sign-in links to the matching staff record.
begin;
create function _assert(cond boolean, msg text) returns void language plpgsql as $$
begin if cond is not true then raise exception 'TEST FAILED: %', msg; end if; end $$;

do $$
begin
  insert into staff (name, email) values ('Terri', 'Terri@MSS.example'), ('Danielle', 'danielle@mss.example');

  insert into auth.users (id, email, raw_app_meta_data)
    values ('00000000-0000-0000-0000-0000000000a1', 'terri@mss.example', '{"provider":"azure"}');
  perform _assert((select auth_user_id from staff where name = 'Terri') = '00000000-0000-0000-0000-0000000000a1',
                  'Microsoft sign-in links by email, ignoring case');

  insert into auth.users (id, email, raw_app_meta_data)
    values ('00000000-0000-0000-0000-0000000000a2', 'danielle@mss.example', '{"provider":"email"}');
  perform _assert((select auth_user_id from staff where name = 'Danielle') is null,
                  'email/password sign-ups are never linked automatically');

  insert into auth.users (id, email, raw_app_meta_data)
    values ('00000000-0000-0000-0000-0000000000a3', 'terri@mss.example', '{"provider":"azure"}');
  perform _assert((select auth_user_id from staff where name = 'Terri') = '00000000-0000-0000-0000-0000000000a1',
                  'an already linked staff record is never taken over');
end $$;
rollback;
