
import { EnhancedCommentSystem } from './EnhancedCommentSystem';

interface MinimalCommentSystemProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  articleId: string;
  articleNumber?: string;
}

export const MinimalCommentSystem = (props: MinimalCommentSystemProps) => {
  return <EnhancedCommentSystem {...props} />;
};
