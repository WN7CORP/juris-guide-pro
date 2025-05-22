
import React from "react";
import { TableCell, TableRow, Table, TableHeader, TableHead, TableBody } from "@/components/ui/table";
import { BookOpen, Table2, TableOfContents } from "lucide-react";
import { Link } from "react-router-dom";
import { LegalArticle } from "@/services/legalCodeService";
import { cn } from "@/lib/utils";

interface LegalCodeTableProps {
  articles: LegalArticle[];
  codeId: string;
  isLoading?: boolean;
  variant?: "default" | "compact" | "statute";
}

export const LegalCodeTable = ({
  articles,
  codeId,
  isLoading = false,
  variant = "default",
}: LegalCodeTableProps) => {
  if (isLoading) {
    return (
      <div className="w-full py-10 text-center">
        <div className="animate-spin mx-auto mb-4">
          <TableOfContents className="h-8 w-8 text-law-accent" />
        </div>
        <p className="text-gray-400">Carregando artigos...</p>
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className="w-full py-10 text-center border border-gray-800 rounded-lg">
        <Table2 className="h-12 w-12 text-gray-600 mx-auto mb-4" />
        <p className="text-gray-400">Nenhum artigo encontrado</p>
      </div>
    );
  }

  const isStatute = variant === "statute";
  const isCompact = variant === "compact";

  return (
    <div className={cn(
      "w-full border border-gray-800 rounded-lg overflow-hidden",
      isStatute && "border-amber-900/30 bg-amber-950/10"
    )}>
      <Table>
        <TableHeader className={cn(
          "bg-netflix-dark",
          isStatute && "bg-amber-950/30"
        )}>
          <TableRow>
            <TableHead className="w-[100px]">Número</TableHead>
            <TableHead>Conteúdo</TableHead>
            <TableHead className="w-[100px] text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {articles.map((article) => (
            <TableRow 
              key={article.id} 
              className={cn(
                "hover:bg-gray-900/50",
                isStatute && "hover:bg-amber-950/20"
              )}
            >
              <TableCell className="font-medium">
                {article.numero || `Art. ${article.id}`}
              </TableCell>
              <TableCell>
                <p className={cn(
                  "line-clamp-2", 
                  isCompact ? "text-sm" : "text-base"
                )}>
                  {article.artigo}
                </p>
              </TableCell>
              <TableCell className="text-right">
                <Link
                  to={`/codigos/${codeId}/artigo/${article.id}`}
                  className={cn(
                    "inline-flex items-center justify-center px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
                    "bg-law-accent/20 text-law-accent hover:bg-law-accent hover:text-white",
                    isStatute && "bg-amber-600/20 text-amber-400 hover:bg-amber-600 hover:text-white"
                  )}
                >
                  <BookOpen className="h-3.5 w-3.5 mr-1" />
                  Ver
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default LegalCodeTable;
