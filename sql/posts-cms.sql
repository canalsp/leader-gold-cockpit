-- Rodar no Supabase SQL Editor após já existir public.posts.
-- Ajuste nomes se sua tabela for outra.

-- Novos posts criados no cockpit podem não ter legacy_id
ALTER TABLE public.posts
  ALTER COLUMN legacy_id DROP NOT NULL;

ALTER TABLE public.posts
  ADD COLUMN IF NOT EXISTS tags text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS categories text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS author_name text,
  ADD COLUMN IF NOT EXISTS meta_title text,
  ADD COLUMN IF NOT EXISTS meta_description text,
  ADD COLUMN IF NOT EXISTS focus_keyword text,
  ADD COLUMN IF NOT EXISTS seo_ai_report text;

-- Garantir slug único para novos posts
CREATE UNIQUE INDEX IF NOT EXISTS posts_slug_key ON public.posts (slug);

-- Bucket de imagens (crie no Dashboard → Storage → New bucket "post-images", marque público)
-- Ou use SQL (Supabase permite criar bucket via API); o upload do cockpit usa SUPABASE_STORAGE_BUCKET.

COMMENT ON COLUMN public.posts.seo_ai_report IS 'Sugestões de IA (meta, palavras-chave); revisão SERP completa exige API de busca.';
