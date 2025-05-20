
import { cn } from "@/lib/utils";

interface ArticleContentProps {
  content: string;
  items?: string[];
  paragraphs?: string[];
  hasNumber: boolean;
}

export const ArticleContent = ({
  content,
  items,
  paragraphs,
  hasNumber
}: ArticleContentProps) => {
  // Split content by line breaks to respect original formatting
  const contentLines = content.split('\n').filter(line => line.trim() !== '');
  
  return (
    <>
      <div className={cn("legal-article-content whitespace-pre-line mb-3", !hasNumber && "text-center bg-red-500/10 p-3 rounded")}>
        {contentLines.map((line, index) => (
          <p key={index} className="mb-2.5">{line}</p>
        ))}
      </div>

      {items && items.length > 0 && (
        <div className="legal-article-section pl-4 mb-3 border-l-2 border-gray-700">
          {items.map((item, index) => (
            <p key={index} className="mb-1.5 text-sm">
              {item}
            </p>
          ))}
        </div>
      )}

      {paragraphs && paragraphs.length > 0 && (
        <div className="legal-article-section pl-4 mb-3 border-l-2 border-gray-700">
          {paragraphs.map((paragraph, index) => (
            <p key={index} className="mb-1.5 text-sm italic">
              {paragraph}
            </p>
          ))}
        </div>
      )}
    </>
  );
};

export default ArticleContent;
