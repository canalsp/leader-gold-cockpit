-- Estatisticas de cliques nos botoes de compartilhamento (site -> cockpit).
-- Rodar no Supabase SQL Editor.

ALTER TABLE public.posts
  ADD COLUMN IF NOT EXISTS share_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS share_counts_by_channel jsonb NOT NULL DEFAULT '{}'::jsonb;

COMMENT ON COLUMN public.posts.share_count IS 'Cliques nos icones de compartilhamento (intencao, nao share confirmado na rede).';
COMMENT ON COLUMN public.posts.share_counts_by_channel IS 'Detalhe por canal: whatsapp, linkedin, facebook, twitter, copy.';

CREATE TABLE IF NOT EXISTS public.page_share_stats (
  path text PRIMARY KEY,
  share_count integer NOT NULL DEFAULT 0,
  share_counts_by_channel jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.page_share_stats IS 'Cliques em compartilhar para paginas estaticas (landings, cases, home).';
