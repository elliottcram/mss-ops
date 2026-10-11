-- =====================================================================
-- Microsoft 365 sign-in: the first time someone signs in with their work
-- account, connect them to the staff record with the same email.
-- Only Microsoft (Entra ID) sign-ins are linked this way, and only to a
-- staff record that isn't linked yet. Staff are still added by hand first,
-- so a work account with no staff record can sign in but sees nothing.
-- =====================================================================

create schema if not exists private;

create function private.link_staff_to_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.raw_app_meta_data->>'provider' = 'azure' and new.email is not null then
    update public.staff
       set auth_user_id = new.id
     where auth_user_id is null
       and active
       and lower(email) = lower(new.email);
  end if;
  return new;
end $$;
revoke execute on function private.link_staff_to_user() from public, anon, authenticated;

create trigger link_staff_on_signup
  after insert on auth.users
  for each row execute function private.link_staff_to_user();
