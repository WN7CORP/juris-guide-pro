
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { legalCodes, Article } from '@/data/legalCodes';
import { Search, Copy, Scale, ArrowLeftRight, FileText } from 'lucide-react';
import { motion } from 'framer-motion';

export const ArticleComparison = () => {
  const [leftArticle, setLeftArticle] = useState<Article | null>(null);
  const [rightArticle, setRightArticle] = useState<Article | null>(null);
  const [leftCodeId, setLeftCodeId] = useState<string>('');
  const [rightCodeId, setRightCodeId] = useState<string>('');
  const [searchLeft, setSearchLeft] = useState('');
  const [searchRight, setSearchRight] = useState('');

  const getFilteredArticles = (codeId: string, search: string) => {
    const code = legalCodes.find(c => c.id === codeId);
    if (!code) return [];
    
    return code.articles.filter(article => 
      article.number.toLowerCase().includes(search.toLowerCase()) ||
      article.content.toLowerCase().includes(search.toLowerCase()) ||
      (article.title && article.title.toLowerCase().includes(search.toLowerCase()))
    );
  };

  const selectArticle = (article: Article, side: 'left' | 'right') => {
    if (side === 'left') {
      setLeftArticle(article);
    } else {
      setRightArticle(article);
    }
  };

  const copyComparison = () => {
    if (!leftArticle || !rightArticle) return;
    
    const leftCode = legalCodes.find(c => c.id === leftCodeId);
    const rightCode = legalCodes.find(c => c.id === rightCodeId);
    
    const text = `
COMPARAÇÃO DE ARTIGOS

${leftCode?.title} - ${leftArticle.number}
${leftArticle.content}

${rightCode?.title} - ${rightArticle.number}
${rightArticle.content}

---
Comparação gerada pelo Vade Mecum Digital
    `.trim();
    
    navigator.clipboard.writeText(text);
  };

  const swapArticles = () => {
    const tempArticle = leftArticle;
    const tempCodeId = leftCodeId;
    const tempSearch = searchLeft;
    
    setLeftArticle(rightArticle);
    setLeftCodeId(rightCodeId);
    setSearchLeft(searchRight);
    
    setRightArticle(tempArticle);
    setRightCodeId(tempCodeId);
    setSearchRight(tempSearch);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-serif font-bold text-law-accent mb-2">
          Comparação de Artigos
        </h2>
        <p className="text-gray-400">
          Compare artigos lado a lado para identificar semelhanças e diferenças
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Side */}
        <Card className="bg-netflix-dark border-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-law-accent">
              <Scale className="h-5 w-5" />
              Artigo A
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select value={leftCodeId} onValueChange={setLeftCodeId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecionar código" />
              </SelectTrigger>
              <SelectContent>
                {legalCodes.map(code => (
                  <SelectItem key={code.id} value={code.id}>
                    {code.shortTitle} - {code.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {leftCodeId && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar artigo..."
                  value={searchLeft}
                  onChange={(e) => setSearchLeft(e.target.value)}
                  className="pl-10"
                />
              </div>
            )}

            {leftCodeId && (
              <div className="max-h-40 overflow-y-auto space-y-2">
                {getFilteredArticles(leftCodeId, searchLeft).slice(0, 10).map(article => (
                  <Button
                    key={article.id}
                    variant="ghost"
                    onClick={() => selectArticle(article, 'left')}
                    className={`w-full justify-start text-left h-auto p-3 ${
                      leftArticle?.id === article.id ? 'bg-law-accent/20 text-law-accent' : ''
                    }`}
                  >
                    <div>
                      <div className="font-medium">{article.number}</div>
                      <div className="text-sm text-gray-400 truncate">
                        {article.content.substring(0, 60)}...
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            )}

            {leftArticle && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-4 bg-netflix-bg rounded-lg border border-gray-700"
              >
                <Badge className="mb-3 bg-law-accent/20 text-law-accent">
                  {leftArticle.number}
                </Badge>
                <p className="text-gray-300 text-sm leading-relaxed">
                  {leftArticle.content}
                </p>
                {leftArticle.explanation && (
                  <div className="mt-3 pt-3 border-t border-gray-700">
                    <p className="text-xs text-gray-400 font-medium mb-1">Explicação:</p>
                    <p className="text-xs text-gray-400">{leftArticle.explanation}</p>
                  </div>
                )}
              </motion.div>
            )}
          </CardContent>
        </Card>

        {/* Right Side */}
        <Card className="bg-netflix-dark border-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-law-accent">
              <Scale className="h-5 w-5" />
              Artigo B
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select value={rightCodeId} onValueChange={setRightCodeId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecionar código" />
              </SelectTrigger>
              <SelectContent>
                {legalCodes.map(code => (
                  <SelectItem key={code.id} value={code.id}>
                    {code.shortTitle} - {code.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {rightCodeId && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar artigo..."
                  value={searchRight}
                  onChange={(e) => setSearchRight(e.target.value)}
                  className="pl-10"
                />
              </div>
            )}

            {rightCodeId && (
              <div className="max-h-40 overflow-y-auto space-y-2">
                {getFilteredArticles(rightCodeId, searchRight).slice(0, 10).map(article => (
                  <Button
                    key={article.id}
                    variant="ghost"
                    onClick={() => selectArticle(article, 'right')}
                    className={`w-full justify-start text-left h-auto p-3 ${
                      rightArticle?.id === article.id ? 'bg-law-accent/20 text-law-accent' : ''
                    }`}
                  >
                    <div>
                      <div className="font-medium">{article.number}</div>
                      <div className="text-sm text-gray-400 truncate">
                        {article.content.substring(0, 60)}...
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            )}

            {rightArticle && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-4 bg-netflix-bg rounded-lg border border-gray-700"
              >
                <Badge className="mb-3 bg-law-accent/20 text-law-accent">
                  {rightArticle.number}
                </Badge>
                <p className="text-gray-300 text-sm leading-relaxed">
                  {rightArticle.content}
                </p>
                {rightArticle.explanation && (
                  <div className="mt-3 pt-3 border-t border-gray-700">
                    <p className="text-xs text-gray-400 font-medium mb-1">Explicação:</p>
                    <p className="text-xs text-gray-400">{rightArticle.explanation}</p>
                  </div>
                )}
              </motion.div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      {leftArticle && rightArticle && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center gap-4 pt-4"
        >
          <Button 
            onClick={swapArticles}
            variant="outline"
            className="flex items-center gap-2"
          >
            <ArrowLeftRight className="h-4 w-4" />
            Trocar lados
          </Button>
          
          <Button 
            onClick={copyComparison}
            className="flex items-center gap-2 bg-law-accent hover:bg-law-accent/80"
          >
            <Copy className="h-4 w-4" />
            Copiar comparação
          </Button>
        </motion.div>
      )}
    </div>
  );
};
