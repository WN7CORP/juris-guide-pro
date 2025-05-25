
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Database, ExternalLink, Copy, CheckCircle } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface DatabaseSetupGuideProps {
  onRetry: () => void;
}

const SQL_SETUP_CONTENT = `-- Execute no Supabase Dashboard > SQL Editor

-- 1. Criar tabela de perfis de usuário
CREATE TABLE public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT NOT NULL UNIQUE CHECK (length(username) >= 3 AND length(username) <= 30),
    avatar_url TEXT DEFAULT 'https://api.dicebear.com/7.x/avataaars/svg?seed=user1&backgroundColor=b6e3f4',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Usuários podem ver todos os perfis" ON public.user_profiles FOR SELECT USING (true);
CREATE POLICY "Usuários podem atualizar seu próprio perfil" ON public.user_profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Usuários podem inserir seu próprio perfil" ON public.user_profiles FOR INSERT WITH CHECK (auth.uid() = id);`;

export const DatabaseSetupGuide = ({ onRetry }: DatabaseSetupGuideProps) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(SQL_SETUP_CONTENT);
      setCopied(true);
      toast.success('SQL copiado para a área de transferência!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Erro ao copiar SQL');
    }
  };

  return (
    <div className="min-h-screen bg-netflix-bg flex items-center justify-center p-4">
      <div className="w-full max-w-4xl space-y-6">
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader className="text-center">
            <Database className="w-16 h-16 text-law-accent mx-auto mb-4" />
            <CardTitle className="text-2xl text-white">
              Configuração do Banco de Dados Necessária
            </CardTitle>
            <CardDescription className="text-gray-300">
              Execute o script SQL abaixo no Supabase Dashboard para configurar as tabelas necessárias
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Passos */}
            <div className="bg-gray-900/50 border border-gray-600 rounded-lg p-4">
              <h3 className="text-white font-medium mb-3">Passos para configurar:</h3>
              <ol className="text-gray-300 space-y-2 list-decimal list-inside">
                <li>Copie o código SQL abaixo</li>
                <li>Acesse o <strong>Supabase Dashboard</strong></li>
                <li>Vá para <strong>SQL Editor</strong></li>
                <li>Cole e execute o código SQL</li>
                <li>Clique em "Configuração Completa" abaixo</li>
              </ol>
            </div>

            {/* SQL Code */}
            <div className="relative">
              <div className="bg-gray-900 border border-gray-600 rounded-lg overflow-hidden">
                <div className="flex items-center justify-between p-3 border-b border-gray-600">
                  <span className="text-sm text-gray-400">SUPABASE_SETUP.sql</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={copyToClipboard}
                    className="border-gray-600 text-gray-300 hover:bg-gray-700"
                  >
                    {copied ? (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Copiado!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-2" />
                        Copiar SQL
                      </>
                    )}
                  </Button>
                </div>
                <pre className="p-4 text-sm text-gray-300 overflow-x-auto">
                  <code>{SQL_SETUP_CONTENT}</code>
                </pre>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                onClick={onRetry}
                className="flex-1 bg-law-accent hover:bg-law-accent/90"
              >
                Configuração Completa - Continuar
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => window.open('https://supabase.com/dashboard', '_blank')}
                className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Abrir Supabase Dashboard
              </Button>
            </div>

            {/* Warning */}
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
              <p className="text-yellow-300 text-sm">
                <strong>Importante:</strong> Certifique-se de executar todo o código SQL no Supabase antes de continuar. 
                Sem essas tabelas, a autenticação não funcionará corretamente.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
