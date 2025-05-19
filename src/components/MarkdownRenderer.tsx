
import { Suspense, lazy } from 'react';

// Lazy load ReactMarkdown and its plugins
const ReactMarkdown = lazy(() => import('react-markdown'));
const remarkGfm = lazy(() => import('remark-gfm'));

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export const MarkdownRenderer = ({ content, className = '' }: MarkdownRendererProps) => {
  // Return a fallback while loading the markdown renderer
  return (
    <Suspense fallback={<div className={className}>{content}</div>}>
      <ReactMarkdown 
        remarkPlugins={[remarkGfm]}
        className={`prose prose-invert prose-sm max-w-none ${className}`}
      >
        {content}
      </ReactMarkdown>
    </Suspense>
  );
};

export default MarkdownRenderer;
