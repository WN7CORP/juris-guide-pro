
-- Execute estes comandos SQL no Supabase Dashboard > SQL Editor

-- 1. Primeiro, limpar estruturas existentes se houver problemas
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP TABLE IF EXISTS public.comment_likes;
DROP TABLE IF EXISTS public.article_comments;
DROP TABLE IF EXISTS public.user_profiles;

-- 2. Criar tabela de perfis de usuário
CREATE TABLE public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT NOT NULL UNIQUE CHECK (length(username) >= 3 AND length(username) <= 30),
    avatar_url TEXT DEFAULT 'https://api.dicebear.com/7.x/avataaars/svg?seed=user1&backgroundColor=b6e3f4',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para user_profiles
CREATE POLICY "Usuários podem ver todos os perfis" ON public.user_profiles FOR SELECT USING (true);
CREATE POLICY "Usuários podem atualizar seu próprio perfil" ON public.user_profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Usuários podem inserir seu próprio perfil" ON public.user_profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- 3. Função para criar perfil automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  base_username TEXT;
  final_username TEXT;
  counter INTEGER := 1;
BEGIN
  -- Gerar username base do email
  base_username := LEFT(COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)), 20);
  
  -- Remover caracteres especiais
  base_username := regexp_replace(base_username, '[^a-zA-Z0-9_-]', '', 'g');
  
  -- Garantir que não está vazio
  IF base_username = '' OR base_username IS NULL THEN
    base_username := 'user';
  END IF;
  
  final_username := base_username;
  
  -- Verificar se username já existe e gerar um único se necessário
  WHILE EXISTS (SELECT 1 FROM public.user_profiles WHERE username = final_username) LOOP
    final_username := base_username || counter;
    counter := counter + 1;
  END LOOP;
  
  -- Inserir perfil
  INSERT INTO public.user_profiles (id, username, avatar_url)
  VALUES (
    new.id, 
    final_username,
    'https://api.dicebear.com/7.x/avataaars/svg?seed=' || new.id || '&backgroundColor=b6e3f4'
  );
  
  RETURN new;
EXCEPTION
  WHEN OTHERS THEN
    -- Log do erro mas não falhar a criação do usuário
    RAISE WARNING 'Erro ao criar perfil para usuário %: %', new.id, SQLERRM;
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar perfil automaticamente
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 4. Criar tabela de comentários
CREATE TABLE public.article_comments (
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
CREATE POLICY "Todos podem ver comentários" ON public.article_comments FOR SELECT USING (true);
CREATE POLICY "Usuários autenticados podem criar comentários" ON public.article_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Usuários podem editar seus próprios comentários" ON public.article_comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Usuários podem deletar seus próprios comentários" ON public.article_comments FOR DELETE USING (auth.uid() = user_id);

-- Índices para performance
CREATE INDEX idx_article_comments_article_id ON public.article_comments(article_id);
CREATE INDEX idx_article_comments_user_id ON public.article_comments(user_id);
CREATE INDEX idx_article_comments_created_at ON public.article_comments(created_at);

-- 5. Criar tabela de curtidas de comentários
CREATE TABLE public.comment_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    comment_id UUID NOT NULL REFERENCES public.article_comments(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(comment_id, user_id)
);

-- Habilitar RLS
ALTER TABLE public.comment_likes ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para comment_likes
CREATE POLICY "Todos podem ver curtidas" ON public.comment_likes FOR SELECT USING (true);
CREATE POLICY "Usuários autenticados podem curtir" ON public.comment_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Usuários podem remover suas próprias curtidas" ON public.comment_likes FOR DELETE USING (auth.uid() = user_id);

-- Índices para performance
CREATE INDEX idx_comment_likes_comment_id ON public.comment_likes(comment_id);
CREATE INDEX idx_comment_likes_user_id ON public.comment_likes(user_id);

-- 6. Função para atualizar contador de curtidas
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
CREATE TRIGGER trigger_update_likes_count_insert
    AFTER INSERT ON public.comment_likes
    FOR EACH ROW EXECUTE FUNCTION update_likes_count();

CREATE TRIGGER trigger_update_likes_count_delete
    AFTER DELETE ON public.comment_likes
    FOR EACH ROW EXECUTE FUNCTION update_likes_count();

-- 7. Verificação final
SELECT 'Setup completo! Tabelas criadas:' as status;
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('user_profiles', 'article_comments', 'comment_likes');
