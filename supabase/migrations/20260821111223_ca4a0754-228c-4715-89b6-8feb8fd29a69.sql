UPDATE public.room_items
SET purchase_date = created_at::date
WHERE purchase_date IS NULL;

UPDATE public.shared_items
SET purchase_date = created_at::date
WHERE purchase_date IS NULL;

CREATE OR REPLACE FUNCTION public.inventory_name_slug(item_name text)
RETURNS text
LANGUAGE sql
IMMUTABLE
STRICT
SET search_path = public
AS $$
  SELECT trim(both '-' from regexp_replace(upper(item_name), '[^A-Z0-9]+', '-', 'g'))
$$;

WITH combined AS (
  SELECT 'room'::text AS source, id, name, purchase_date, created_at
  FROM public.room_items
  UNION ALL
  SELECT 'shared'::text AS source, id, name, purchase_date, created_at
  FROM public.shared_items
), numbered AS (
  SELECT source, id,
    public.inventory_name_slug(name) || '-' || to_char(purchase_date, 'DDMMYY') || '-' ||
    lpad(row_number() OVER (
      PARTITION BY public.inventory_name_slug(name), purchase_date
      ORDER BY created_at, source, id
    )::text, 2, '0') AS generated_code
  FROM combined
)
UPDATE public.room_items item
SET code = numbered.generated_code
FROM numbered
WHERE numbered.source = 'room' AND numbered.id = item.id;

WITH combined AS (
  SELECT 'room'::text AS source, id, name, purchase_date, created_at
  FROM public.room_items
  UNION ALL
  SELECT 'shared'::text AS source, id, name, purchase_date, created_at
  FROM public.shared_items
), numbered AS (
  SELECT source, id,
    public.inventory_name_slug(name) || '-' || to_char(purchase_date, 'DDMMYY') || '-' ||
    lpad(row_number() OVER (
      PARTITION BY public.inventory_name_slug(name), purchase_date
      ORDER BY created_at, source, id
    )::text, 2, '0') AS generated_code
  FROM combined
)
UPDATE public.shared_items item
SET code = numbered.generated_code
FROM numbered
WHERE numbered.source = 'shared' AND numbered.id = item.id;

ALTER TABLE public.room_items
  ALTER COLUMN purchase_date SET NOT NULL,
  ALTER COLUMN code SET NOT NULL;

ALTER TABLE public.shared_items
  ALTER COLUMN purchase_date SET NOT NULL,
  ALTER COLUMN code SET NOT NULL;

CREATE UNIQUE INDEX room_items_code_unique ON public.room_items (code);
CREATE UNIQUE INDEX shared_items_code_unique ON public.shared_items (code);

CREATE OR REPLACE FUNCTION public.set_inventory_code()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  code_prefix text;
  next_number integer;
BEGIN
  IF NEW.purchase_date IS NULL THEN
    RAISE EXCEPTION 'Tanggal pembelian wajib diisi';
  END IF;

  code_prefix := public.inventory_name_slug(NEW.name) || '-' || to_char(NEW.purchase_date, 'DDMMYY');
  IF public.inventory_name_slug(NEW.name) = '' THEN
    RAISE EXCEPTION 'Nama barang harus mengandung huruf atau angka';
  END IF;

  IF TG_OP = 'UPDATE'
     AND NEW.name IS NOT DISTINCT FROM OLD.name
     AND NEW.purchase_date IS NOT DISTINCT FROM OLD.purchase_date THEN
    NEW.code := OLD.code;
    RETURN NEW;
  END IF;

  PERFORM pg_advisory_xact_lock(hashtextextended(code_prefix, 0));

  SELECT COALESCE(max(sequence_number), 0) + 1
  INTO next_number
  FROM (
    SELECT CASE WHEN code ~ ('^' || regexp_replace(code_prefix, '([\\.\\+\\*\\?\\[\\^\\]\\$\\(\\)\\{\\}=!<>|:\\-])', '\\\1', 'g') || '-[0-9]+$')
      THEN substring(code from '([0-9]+)$')::integer ELSE NULL END AS sequence_number
    FROM public.room_items
    WHERE code LIKE code_prefix || '-%'
      AND (TG_TABLE_NAME <> 'room_items' OR id <> NEW.id)
    UNION ALL
    SELECT CASE WHEN code ~ ('^' || regexp_replace(code_prefix, '([\\.\\+\\*\\?\\[\\^\\]\\$\\(\\)\\{\\}=!<>|:\\-])', '\\\1', 'g') || '-[0-9]+$')
      THEN substring(code from '([0-9]+)$')::integer ELSE NULL END
    FROM public.shared_items
    WHERE code LIKE code_prefix || '-%'
      AND (TG_TABLE_NAME <> 'shared_items' OR id <> NEW.id)
  ) existing_codes;

  NEW.code := code_prefix || '-' || lpad(next_number::text, 2, '0');
  RETURN NEW;
END;
$$;

CREATE TRIGGER room_items_set_inventory_code
BEFORE INSERT OR UPDATE OF name, purchase_date, code ON public.room_items
FOR EACH ROW EXECUTE FUNCTION public.set_inventory_code();

CREATE TRIGGER shared_items_set_inventory_code
BEFORE INSERT OR UPDATE OF name, purchase_date, code ON public.shared_items
FOR EACH ROW EXECUTE FUNCTION public.set_inventory_code();