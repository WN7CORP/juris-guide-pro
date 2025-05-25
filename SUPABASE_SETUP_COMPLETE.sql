-- Execute estes comandos SQL no Supabase Dashboard > SQL Editor

-- 1. Criar tabela de perfis de usuário
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT NOT NULL CHECK (length(username) >= 3 AND length(username) <= 30),
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para user_profiles
DROP POLICY IF EXISTS "Usuários podem ver todos os perfis" ON public.user_profiles;
CREATE POLICY "Usuários podem ver todos os perfis" ON public.user_profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Usuários podem atualizar seu próprio perfil" ON public.user_profiles;
CREATE POLICY "Usuários podem atualizar seu próprio perfil" ON public.user_profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Usuários podem inserir seu próprio perfil" ON public.user_profiles;
CREATE POLICY "Usuários podem inserir seu próprio perfil" ON public.user_profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Função para criar perfil automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles (id, username, avatar_url)
  VALUES (
    new.id, 
    LEFT(COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)), 30),
    'https://api.dicebear.com/7.x/avataaars/svg?seed=user1&backgroundColor=b6e3f4'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar perfil automaticamente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 2. Criar tabela de comentários
CREATE TABLE IF NOT EXISTS public.article_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    article_id TEXT NOT NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    tag TEXT DEFAULT 'observacao' CHECK (tag IN ('dica', 'duvida', 'observacao', 'correcao')),
    likes_count INTEGER DEFAULT 0,
    is_recommended BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS
ALTER TABLE public.article_comments ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para article_comments
DROP POLICY IF EXISTS "Todos podem ver comentários" ON public.article_comments;
CREATE POLICY "Todos podem ver comentários" ON public.article_comments FOR SELECT USING (true);

DROP POLICY IF EXISTS "Usuários autenticados podem criar comentários" ON public.article_comments;
CREATE POLICY "Usuários autenticados podem criar comentários" ON public.article_comments FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem editar seus próprios comentários" ON public.article_comments;
CREATE POLICY "Usuários podem editar seus próprios comentários" ON public.article_comments FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem deletar seus próprios comentários" ON public.article_comments;
CREATE POLICY "Usuários podem deletar seus próprios comentários" ON public.article_comments FOR DELETE USING (auth.uid() = user_id);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_article_comments_article_id ON public.article_comments(article_id);
CREATE INDEX IF NOT EXISTS idx_article_comments_user_id ON public.article_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_article_comments_created_at ON public.article_comments(created_at);

-- 3. Criar tabela de curtidas de comentários
CREATE TABLE IF NOT EXISTS public.comment_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    comment_id UUID NOT NULL REFERENCES public.article_comments(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(comment_id, user_id)
);

-- Habilitar RLS
ALTER TABLE public.comment_likes ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para comment_likes
DROP POLICY IF EXISTS "Todos podem ver curtidas" ON public.comment_likes;
CREATE POLICY "Todos podem ver curtidas" ON public.comment_likes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Usuários autenticados podem curtir" ON public.comment_likes;
CREATE POLICY "Usuários autenticados podem curtir" ON public.comment_likes FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem remover suas próprias curtidas" ON public.comment_likes;
CREATE POLICY "Usuários podem remover suas próprias curtidas" ON public.comment_likes FOR DELETE USING (auth.uid() = user_id);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_comment_likes_comment_id ON public.comment_likes(comment_id);
CREATE INDEX IF NOT EXISTS idx_comment_likes_user_id ON public.comment_likes(user_id);

-- 4. Função para atualizar contador de curtidas
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
    SET likes_count = likes_count - 1 
    WHERE id = OLD.comment_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Triggers para atualizar contador de curtidas
DROP TRIGGER IF EXISTS trigger_update_likes_count_insert ON public.comment_likes;
CREATE TRIGGER trigger_update_likes_count_insert
    AFTER INSERT ON public.comment_likes
    FOR EACH ROW EXECUTE FUNCTION update_likes_count();

DROP TRIGGER IF EXISTS trigger_update_likes_count_delete ON public.comment_likes;
CREATE TRIGGER trigger_update_likes_count_delete
    AFTER DELETE ON public.comment_likes
    FOR EACH ROW EXECUTE FUNCTION update_likes_count();
