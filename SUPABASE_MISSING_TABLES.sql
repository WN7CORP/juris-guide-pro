
-- ============================================================================
-- TABELAS COMPLETAS PARA O SISTEMA JURIS GUIDE
-- Execute este script no editor SQL do Supabase
-- ============================================================================

-- 1. TABELA USER_PROFILES
-- Para armazenar os perfis dos usuários
-- ============================================================================

CREATE TABLE public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS para user_profiles
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para user_profiles
CREATE POLICY "Usuários podem ver seus próprios perfis" ON public.user_profiles 
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Usuários podem criar seus próprios perfis" ON public.user_profiles 
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Usuários podem atualizar seus próprios perfis" ON public.user_profiles 
    FOR UPDATE USING (auth.uid() = id);

-- Índices para performance em user_profiles
CREATE INDEX idx_user_profiles_username ON public.user_profiles(username);
CREATE INDEX idx_user_profiles_updated_at ON public.user_profiles(updated_at);

-- ============================================================================
-- 2. TABELA USER_ANNOTATIONS
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
-- 3. TABELA USER_FAVORITES
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
-- 4. TABELA COMMENTS
-- Para armazenar os comentários dos usuários nos artigos
-- ============================================================================

CREATE TABLE public.comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    article_id TEXT NOT NULL,
    content TEXT NOT NULL,
    tag TEXT NOT NULL CHECK (tag IN ('dica', 'duvida', 'observacao', 'correcao')),
    likes_count INTEGER DEFAULT 0,
    is_recommended BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS para comments
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para comments
CREATE POLICY "Todos podem ver comentários" ON public.comments 
    FOR SELECT USING (true);

CREATE POLICY "Usuários autenticados podem criar comentários" ON public.comments 
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seus próprios comentários" ON public.comments 
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar seus próprios comentários" ON public.comments 
    FOR DELETE USING (auth.uid() = user_id);

-- Índices para performance em comments
CREATE INDEX idx_comments_user_id ON public.comments(user_id);
CREATE INDEX idx_comments_article_id ON public.comments(article_id);
CREATE INDEX idx_comments_created_at ON public.comments(created_at);
CREATE INDEX idx_comments_likes_count ON public.comments(likes_count);
CREATE INDEX idx_comments_tag ON public.comments(tag);

-- ============================================================================
-- 5. TABELA COMMENT_LIKES
-- Para armazenar os likes dos usuários nos comentários
-- ============================================================================

CREATE TABLE public.comment_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    comment_id UUID NOT NULL REFERENCES public.comments(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, comment_id)
);

-- Habilitar RLS para comment_likes
ALTER TABLE public.comment_likes ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para comment_likes
CREATE POLICY "Usuários podem ver likes" ON public.comment_likes 
    FOR SELECT USING (true);

CREATE POLICY "Usuários autenticados podem dar like" ON public.comment_likes 
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem remover seus próprios likes" ON public.comment_likes 
    FOR DELETE USING (auth.uid() = user_id);

-- Índices para performance em comment_likes
CREATE INDEX idx_comment_likes_user_id ON public.comment_likes(user_id);
CREATE INDEX idx_comment_likes_comment_id ON public.comment_likes(comment_id);

-- ============================================================================
-- 6. FUNÇÕES AUXILIARES
-- ============================================================================

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Função para atualizar contagem de likes nos comentários
CREATE OR REPLACE FUNCTION public.update_comment_likes_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.comments 
        SET likes_count = likes_count + 1 
        WHERE id = NEW.comment_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.comments 
        SET likes_count = likes_count - 1 
        WHERE id = OLD.comment_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 7. TRIGGERS
-- ============================================================================

-- Trigger para atualizar updated_at em user_profiles
CREATE TRIGGER trigger_user_profiles_updated_at
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Trigger para atualizar updated_at em user_annotations
CREATE TRIGGER trigger_user_annotations_updated_at
    BEFORE UPDATE ON public.user_annotations
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Trigger para atualizar updated_at em comments
CREATE TRIGGER trigger_comments_updated_at
    BEFORE UPDATE ON public.comments
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Trigger para atualizar contagem de likes
CREATE TRIGGER trigger_comment_likes_count
    AFTER INSERT OR DELETE ON public.comment_likes
    FOR EACH ROW EXECUTE FUNCTION public.update_comment_likes_count();

-- ============================================================================
-- 8. COMENTÁRIOS PARA DOCUMENTAÇÃO
-- ============================================================================

COMMENT ON TABLE public.user_profiles IS 'Perfis dos usuários do sistema';
COMMENT ON TABLE public.user_annotations IS 'Anotações dos usuários em artigos jurídicos';
COMMENT ON TABLE public.user_favorites IS 'Artigos favoritos dos usuários';
COMMENT ON TABLE public.comments IS 'Comentários dos usuários nos artigos';
COMMENT ON TABLE public.comment_likes IS 'Likes dos usuários nos comentários';

-- ============================================================================
-- VERIFICAÇÃO DAS TABELAS CRIADAS
-- ============================================================================

-- Para verificar se as tabelas foram criadas corretamente, execute:
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('user_profiles', 'user_annotations', 'user_favorites', 'comments', 'comment_likes');

-- Para verificar as políticas RLS:
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual FROM pg_policies WHERE tablename IN ('user_profiles', 'user_annotations', 'user_favorites', 'comments', 'comment_likes');
