-- Pacote semi-automatico Instagram (legenda + imagem ajustada no cockpit).
-- Rodar no Supabase SQL Editor apos posts-cms.sql.

ALTER TABLE public.posts
  ADD COLUMN IF NOT EXISTS instagram_prepare boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS instagram_draft jsonb;

COMMENT ON COLUMN public.posts.instagram_prepare IS 'Se true, o cockpit gera pacote Instagram (legenda/hashtags/imagem) ao salvar ou sob demanda.';
COMMENT ON COLUMN public.posts.instagram_draft IS 'Ultimo rascunho gerado: format, caption, hashtags, blog_url, generated_at.';
