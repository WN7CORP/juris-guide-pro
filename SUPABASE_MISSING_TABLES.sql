
-- ============================================================================
-- TABELAS FALTANTES PARA O SISTEMA JURIS GUIDE
-- Execute este script no editor SQL do Supabase
-- ============================================================================

-- 1. TABELA USER_ANNOTATIONS
-- Para armazenar as anotações dos usuários nos artigos
-- ============================================================================

CREATE TABLE public.user_annotations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    article_id TEXT NOT NULL,
    content TEXT NOT NULL,
    tags TEXT[] DEFAULT '{}',
    category TEXT DEFAULT 'general',
    color TEXT DEFAULT '#6366f1',
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    is_favorite BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS para user_annotations
ALTER TABLE public.user_annotations ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para user_annotations
CREATE POLICY "Usuários podem ver suas próprias anotações" ON public.user_annotations 
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem criar suas próprias anotações" ON public.user_annotations 
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar suas próprias anotações" ON public.user_annotations 
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar suas próprias anotações" ON public.user_annotations 
    FOR DELETE USING (auth.uid() = user_id);

-- Índices para performance em user_annotations
CREATE INDEX idx_user_annotations_user_id ON public.user_annotations(user_id);
CREATE INDEX idx_user_annotations_article_id ON public.user_annotations(article_id);
CREATE INDEX idx_user_annotations_updated_at ON public.user_annotations(updated_at);
CREATE INDEX idx_user_annotations_priority ON public.user_annotations(priority);
CREATE INDEX idx_user_annotations_is_favorite ON public.user_annotations(is_favorite);

-- ============================================================================
-- 2. TABELA USER_FAVORITES
-- Para armazenar os artigos favoritos dos usuários
-- ============================================================================

CREATE TABLE public.user_favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    article_id TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, article_id)
);

-- Habilitar RLS para user_favorites
ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para user_favorites
CREATE POLICY "Usuários podem ver seus próprios favoritos" ON public.user_favorites 
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem adicionar aos favoritos" ON public.user_favorites 
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem remover dos favoritos" ON public.user_favorites 
    FOR DELETE USING (auth.uid() = user_id);

-- Índices para performance em user_favorites
CREATE INDEX idx_user_favorites_user_id ON public.user_favorites(user_id);
CREATE INDEX idx_user_favorites_article_id ON public.user_favorites(article_id);
CREATE INDEX idx_user_favorites_created_at ON public.user_favorites(created_at);

-- ============================================================================
-- 3. FUNÇÃO PARA ATUALIZAR UPDATED_AT AUTOMATICAMENTE
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at em user_annotations
CREATE TRIGGER trigger_user_annotations_updated_at
    BEFORE UPDATE ON public.user_annotations
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================================
-- 4. COMENTÁRIOS PARA DOCUMENTAÇÃO
-- ============================================================================

COMMENT ON TABLE public.user_annotations IS 'Armazena anotações dos usuários em artigos jurídicos';
COMMENT ON TABLE public.user_favorites IS 'Armazena artigos favoritos dos usuários';

COMMENT ON COLUMN public.user_annotations.article_id IS 'ID do artigo (pode ser string ou número)';
COMMENT ON COLUMN public.user_annotations.tags IS 'Array de tags para categorização';
COMMENT ON COLUMN public.user_annotations.category IS 'Categoria da anotação (general, important, etc)';
COMMENT ON COLUMN public.user_annotations.color IS 'Cor hexadecimal para destacar a anotação';
COMMENT ON COLUMN public.user_annotations.priority IS 'Prioridade: low, medium, high';

COMMENT ON COLUMN public.user_favorites.article_id IS 'ID do artigo favorito (pode ser string ou número)';

-- ============================================================================
-- VERIFICAÇÃO DAS TABELAS CRIADAS
-- ============================================================================

-- Para verificar se as tabelas foram criadas corretamente, execute:
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('user_annotations', 'user_favorites');

-- Para verificar as políticas RLS:
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual FROM pg_policies WHERE tablename IN ('user_annotations', 'user_favorites');

