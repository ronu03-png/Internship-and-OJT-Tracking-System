-- =============================================================================
-- 03_auth_trigger.sql
-- Auth integration: mirror new auth.users into public.profiles.
-- Depends on: 01, 02
--
-- When a user signs up (or is created via the Admin API), Supabase inserts a
-- row into auth.users. This trigger copies the identity into public.profiles
-- and maps the role from the sign-up metadata.
--
-- Client sign-up should pass metadata, e.g.:
--   supabase.auth.signUp({
--     email, password,
--     options: { data: { full_name: 'Juan Dela Cruz', user_role: 'student' } }
--   })
-- =============================================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer          -- runs as table owner so it can write to public.profiles
set search_path = public  -- hardened search_path (prevents hijacking)
as $$
declare
  v_role      public.user_role;
  v_full_name text;
  v_raw       jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
begin
  -- Resolve full name from metadata, falling back to the email local-part.
  v_full_name := coalesce(
    nullif(v_raw ->> 'full_name', ''),
    nullif(v_raw ->> 'name', ''),
    split_part(new.email, '@', 1)
  );

  -- Safely coerce the requested role; default to 'student' if missing/invalid.
  begin
    v_role := (v_raw ->> 'user_role')::public.user_role;
  exception when others then
    v_role := 'student';
  end;
  if v_role is null then
    v_role := 'student';
  end if;

  insert into public.profiles (id, email, full_name, user_role, hte_id)
  values (
    new.id,
    new.email,
    v_full_name,
    v_role,
    -- Optional: link a supervisor to an HTE at creation time via metadata.
    nullif(v_raw ->> 'hte_id', '')::uuid
  )
  on conflict (id) do update
    set email     = excluded.email,
        full_name = excluded.full_name;

  return new;
end;
$$;

-- Fire once per newly created auth user.
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Optional: keep profiles.email synced if the auth email changes.
create or replace function public.handle_user_email_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.email is distinct from old.email then
    update public.profiles set email = new.email where id = new.id;
  end if;
  return new;
end;
$$;

drop trigger if exists on_auth_user_email_updated on auth.users;
create trigger on_auth_user_email_updated
  after update of email on auth.users
  for each row execute function public.handle_user_email_change();
