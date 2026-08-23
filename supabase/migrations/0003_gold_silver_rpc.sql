-- ============================================================
-- set_gold_silver_rate — lets the daily cron job (app/api/cron/gold-price,
-- gated by CRON_SECRET at the route level, not by Postgres auth) write the
-- cached rate without the app needing the service-role key at runtime.
-- SECURITY DEFINER + pinned search_path, same pattern as is_staff()/
-- is_admin() in 0001_init.sql - narrowly scoped to this one upsert rather
-- than granting broad write access.
-- ============================================================
create or replace function public.set_gold_silver_rate(rate jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into settings (key, value, updated_at)
  values ('gold_silver_rate', rate, now())
  on conflict (key) do update set value = excluded.value, updated_at = now();
end;
$$;

grant execute on function public.set_gold_silver_rate(jsonb) to anon, authenticated;
