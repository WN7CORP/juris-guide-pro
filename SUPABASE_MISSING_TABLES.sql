
-- ============================================================================
-- TABELAS FALTANTES PARA O SISTEMA JURIS GUIDE
-- Execute este script no editor SQL do Supabase
-- ============================================================================

-- 1. TABELA USER_PROFILES
-- Para perfis de usuário (necessária para comentários)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS para user_profiles
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para user_profiles
CREATE POLICY "Usuários podem ver todos os perfis" ON public.user_profiles FOR SELECT USING (true);
CREATE POLICY "Usuários podem atualizar seu próprio perfil" ON public.user_profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Usuários podem inserir seu próprio perfil" ON public.user_profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Função para criar perfil automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles (id, username, avatar_url)
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    'https://api.dicebear.com/7.x/avataaars/svg?seed=' || new.id || '&backgroundColor=b6e3f4'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar perfil automaticamente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ============================================================================
-- 2. TABELA ARTICLE_COMMENTS
-- Para armazenar comentários dos usuários nos artigos
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.article_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    article_id TEXT NOT NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    tag TEXT DEFAULT 'observacao' CHECK (tag IN ('dica', 'duvida', 'observacao', 'correcao')),
    likes_count INTEGER DEFAULT 0,
    is_recommended BOOLEAN DEFAULT false,
    parent_id UUID REFERENCES public.article_comments(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS para article_comments
ALTER TABLE public.article_comments ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para article_comments
CREATE POLICY "Todos podem ver comentários" ON public.article_comments FOR SELECT USING (true);
CREATE POLICY "Usuários autenticados podem criar comentários" ON public.article_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Usuários podem editar seus próprios comentários" ON public.article_comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Usuários podem deletar seus próprios comentários" ON public.article_comments FOR DELETE USING (auth.uid() = user_id);

-- Índices para performance em article_comments
CREATE INDEX IF NOT EXISTS idx_article_comments_article_id ON public.article_comments(article_id);
CREATE INDEX IF NOT EXISTS idx_article_comments_user_id ON public.article_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_article_comments_created_at ON public.article_comments(created_at);
CREATE INDEX IF NOT EXISTS idx_article_comments_parent_id ON public.article_comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_article_comments_likes_count ON public.article_comments(likes_count);

-- ============================================================================
-- 3. TABELA COMMENT_LIKES
-- Para armazenar as curtidas dos comentários
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.comment_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    comment_id UUID NOT NULL REFERENCES public.article_comments(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(comment_id, user_id)
);

-- Habilitar RLS para comment_likes
ALTER TABLE public.comment_likes ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para comment_likes
CREATE POLICY "Todos podem ver curtidas" ON public.comment_likes FOR SELECT USING (true);
CREATE POLICY "Usuários autenticados podem curtir" ON public.comment_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Usuários podem remover suas próprias curtidas" ON public.comment_likes FOR DELETE USING (auth.uid() = user_id);

-- Índices para performance em comment_likes
CREATE INDEX IF NOT EXISTS idx_comment_likes_comment_id ON public.comment_likes(comment_id);
CREATE INDEX IF NOT EXISTS idx_comment_likes_user_id ON public.comment_likes(user_id);

-- ============================================================================
-- 4. FUNÇÃO PARA ATUALIZAR CONTADOR DE CURTIDAS
-- ============================================================================

CREATE OR REPLACE FUNCTION update_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.article_comments 
    SET likes_count = likes_count + 1 
    WHERE id = NEW.comment_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.article_comments 
    SET likes_count = GREATEST(likes_count - 1, 0)
    WHERE id = OLD.comment_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Triggers para atualizar contador de curtidas
DROP TRIGGER IF EXISTS trigger_update_likes_count_insert ON public.comment_likes;
DROP TRIGGER IF EXISTS trigger_update_likes_count_delete ON public.comment_likes;

CREATE TRIGGER trigger_update_likes_count_insert
    AFTER INSERT ON public.comment_likes
    FOR EACH ROW EXECUTE FUNCTION update_likes_count();

CREATE TRIGGER trigger_update_likes_count_delete
    AFTER DELETE ON public.comment_likes
    FOR EACH ROW EXECUTE FUNCTION update_likes_count();

-- ============================================================================
-- 5. TABELA USER_ANNOTATIONS
-- Para armazenar as anotações dos usuários nos artigos
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.user_annotations (
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
CREATE INDEX IF NOT EXISTS idx_user_annotations_user_id ON public.user_annotations(user_id);
CREATE INDEX IF NOT EXISTS idx_user_annotations_article_id ON public.user_annotations(article_id);
CREATE INDEX IF NOT EXISTS idx_user_annotations_updated_at ON public.user_annotations(updated_at);
CREATE INDEX IF NOT EXISTS idx_user_annotations_priority ON public.user_annotations(priority);
CREATE INDEX IF NOT EXISTS idx_user_annotations_is_favorite ON public.user_annotations(is_favorite);

-- ============================================================================
-- 6. TABELA USER_FAVORITES
-- Para armazenar os artigos favoritos dos usuários
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.user_favorites (
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
CREATE INDEX IF NOT EXISTS idx_user_favorites_user_id ON public.user_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_article_id ON public.user_favorites(article_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_created_at ON public.user_favorites(created_at);

-- ============================================================================
-- 7. FUNÇÃO PARA ATUALIZAR UPDATED_AT AUTOMATICAMENTE
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para atualizar updated_at
DROP TRIGGER IF EXISTS trigger_user_annotations_updated_at ON public.user_annotations;
DROP TRIGGER IF EXISTS trigger_article_comments_updated_at ON public.article_comments;
DROP TRIGGER IF EXISTS trigger_user_profiles_updated_at ON public.user_profiles;

CREATE TRIGGER trigger_user_annotations_updated_at
    BEFORE UPDATE ON public.user_annotations
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER trigger_article_comments_updated_at
    BEFORE UPDATE ON public.article_comments
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER trigger_user_profiles_updated_at
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================================
-- 8. COMENTÁRIOS PARA DOCUMENTAÇÃO
-- ============================================================================

COMMENT ON TABLE public.user_profiles IS 'Perfis de usuário do sistema';
COMMENT ON TABLE public.article_comments IS 'Comentários dos usuários em artigos jurídicos';
COMMENT ON TABLE public.comment_likes IS 'Curtidas dos comentários';
COMMENT ON TABLE public.user_annotations IS 'Anotações dos usuários em artigos jurídicos';
COMMENT ON TABLE public.user_favorites IS 'Artigos favoritos dos usuários';

-- ============================================================================
-- VERIFICAÇÃO DAS TABELAS CRIADAS
-- ============================================================================

-- Para verificar se as tabelas foram criadas corretamente:
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('user_profiles', 'article_comments', 'comment_likes', 'user_annotations', 'user_favorites');

-- Para verificar as políticas RLS:
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual FROM pg_policies WHERE tablename IN ('user_profiles', 'article_comments', 'comment_likes', 'user_annotations', 'user_favorites');
