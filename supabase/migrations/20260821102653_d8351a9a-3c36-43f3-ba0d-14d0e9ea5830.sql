CREATE TABLE public.other_incomes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  income_date date NOT NULL DEFAULT CURRENT_DATE,
  description text,
  payer text,
  payment_method text NOT NULL DEFAULT 'Transfer Bank',
  amount numeric NOT NULL DEFAULT 0,
  attachments jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.other_incomes TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.other_incomes TO anon;
GRANT ALL ON public.other_incomes TO service_role;

ALTER TABLE public.other_incomes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public full access to other_incomes" ON public.other_incomes
  FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

CREATE TRIGGER other_incomes_updated_at BEFORE UPDATE ON public.other_incomes
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.room_items ADD COLUMN IF NOT EXISTS code text;
ALTER TABLE public.shared_items ADD COLUMN IF NOT EXISTS code text;

WITH numbered AS (
  SELECT id,
         upper(regexp_replace(substr(regexp_replace(name, '[^A-Za-z]', '', 'g'), 1, 3), '\s', '', 'g')) AS abbr,
         to_char(purchase_date, 'DDMMYY') AS d,
         row_number() OVER (
           PARTITION BY upper(substr(regexp_replace(name, '[^A-Za-z]', '', 'g'), 1, 3)), purchase_date
           ORDER BY created_at, id
         ) AS seq
  FROM public.room_items
  WHERE purchase_date IS NOT NULL AND code IS NULL
)
UPDATE public.room_items r
SET code = n.abbr || '-' || n.d || '-' || lpad(n.seq::text, 2, '0')
FROM numbered n
WHERE r.id = n.id AND n.abbr <> '';

WITH numbered AS (
  SELECT id,
         upper(substr(regexp_replace(name, '[^A-Za-z]', '', 'g'), 1, 3)) AS abbr,
         to_char(purchase_date, 'DDMMYY') AS d,
         row_number() OVER (
           PARTITION BY upper(substr(regexp_replace(name, '[^A-Za-z]', '', 'g'), 1, 3)), purchase_date
           ORDER BY created_at, id
         ) AS seq
  FROM public.shared_items
  WHERE purchase_date IS NOT NULL AND code IS NULL
)
UPDATE public.shared_items s
SET code = n.abbr || '-' || n.d || '-' || lpad(n.seq::text, 2, '0')
FROM numbered n
WHERE s.id = n.id AND n.abbr <> '';