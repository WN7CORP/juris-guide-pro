
import { useState } from "react";
import { Article } from "@/data/legalCodes";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFavoritesStore } from "@/store/favoritesStore";
import { Button } from "@/components/ui/button";

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

  return (
    <article className="legal-article">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="legal-article-number">{article.number}</h3>
          {article.title && (
            <h4 className="legal-article-title">{article.title}</h4>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-law-accent"
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

      {(article.explanation || article.practicalExample) && (
        <Tabs defaultValue="explanation" className="mt-6">
          <TabsList className="w-full">
            <TabsTrigger value="explanation" className="flex-1">Explicação</TabsTrigger>
            <TabsTrigger value="example" className="flex-1">Exemplo Prático</TabsTrigger>
          </TabsList>
          {article.explanation && (
            <TabsContent value="explanation" className="mt-2 bg-accent/50 p-4 rounded-md">
              <h5 className="font-medium mb-2">Explicação:</h5>
              <p>{article.explanation}</p>
            </TabsContent>
          )}
          {article.practicalExample && (
            <TabsContent value="example" className="mt-2 bg-accent/50 p-4 rounded-md">
              <h5 className="font-medium mb-2">Exemplo Prático:</h5>
              <p>{article.practicalExample}</p>
            </TabsContent>
          )}
        </Tabs>
      )}
    </article>
  );
};

export default ArticleView;
