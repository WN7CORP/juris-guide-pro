
import { useState } from "react";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFavoritesStore } from "@/store/favoritesStore";
import { Button } from "@/components/ui/button";

interface Article {
  id: string;
  number?: string;
  title?: string;
  content: string;
  items?: string[];
  paragraphs?: string[];
  explanation?: string;
  formalExplanation?: string;
  practicalExample?: string;
}

interface ArticleViewProps {
  article: Article;
}

export const ArticleView = ({ article }: ArticleViewProps) => {
  const { isFavorite, addFavorite, removeFavorite } = useFavoritesStore();
  const articleIsFavorite = isFavorite(article.id);
  
  const toggleFavorite = () => {
    if (articleIsFavorite) {
      removeFavorite(article.id);
    } else {
      addFavorite(article.id);
    }
  };

  const hasExplanations = article.explanation || article.formalExplanation || article.practicalExample;

  return (
    <article className="legal-article">
      <div className="flex justify-between items-start mb-4">
        <div>
          {article.number && (
            <h3 className="legal-article-number">Art. {article.number}</h3>
          )}
          {article.title && !article.number && (
            <h4 className="legal-article-title">{article.title}</h4>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-law-accent hover:bg-background-dark"
          onClick={toggleFavorite}
        >
          {articleIsFavorite ? (
            <BookmarkCheck className="h-5 w-5" />
          ) : (
            <Bookmark className="h-5 w-5" />
          )}
          <span className="sr-only">
            {articleIsFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
          </span>
        </Button>
      </div>

      <div className="legal-article-content">{article.content}</div>

      {article.items && article.items.length > 0 && (
        <div className="legal-article-section mb-4">
          {article.items.map((item, index) => (
            <p key={index} className="mb-1">
              {item}
            </p>
          ))}
        </div>
      )}

      {article.paragraphs && article.paragraphs.length > 0 && (
        <div className="legal-article-section mb-4">
          {article.paragraphs.map((paragraph, index) => (
            <p key={index} className="mb-1 italic">
              {paragraph}
            </p>
          ))}
        </div>
      )}

      {hasExplanations && (
        <Tabs defaultValue={article.explanation ? "technical" : article.formalExplanation ? "formal" : "example"} className="mt-6">
          <TabsList className="w-full bg-background-dark">
            {article.explanation && (
              <TabsTrigger value="technical" className="flex-1">Explicação Técnica</TabsTrigger>
            )}
            {article.formalExplanation && (
              <TabsTrigger value="formal" className="flex-1">Explicação Formal</TabsTrigger>
            )}
            {article.practicalExample && (
              <TabsTrigger value="example" className="flex-1">Exemplo Prático</TabsTrigger>
            )}
          </TabsList>
          
          {article.explanation && (
            <TabsContent value="technical" className="mt-2 bg-background-dark p-4 rounded-md border border-gray-800">
              <h5 className="font-medium mb-2 text-white">Explicação Técnica:</h5>
              <p className="text-gray-300">{article.explanation}</p>
            </TabsContent>
          )}
          
          {article.formalExplanation && (
            <TabsContent value="formal" className="mt-2 bg-background-dark p-4 rounded-md border border-gray-800">
              <h5 className="font-medium mb-2 text-white">Explicação Formal:</h5>
              <p className="text-gray-300">{article.formalExplanation}</p>
            </TabsContent>
          )}
          
          {article.practicalExample && (
            <TabsContent value="example" className="mt-2 bg-background-dark p-4 rounded-md border border-gray-800">
              <h5 className="font-medium mb-2 text-white">Exemplo Prático:</h5>
              <p className="text-gray-300">{article.practicalExample}</p>
            </TabsContent>
          )}
        </Tabs>
      )}
    </article>
  );
};

export default ArticleView;
