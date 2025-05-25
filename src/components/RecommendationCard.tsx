
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, BookOpen, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

interface RecommendationCardProps {
  title: string;
  description: string;
  category: string;
  href: string;
  readTime?: string;
  popularity?: number;
  isNew?: boolean;
}

export const RecommendationCard = ({
  title,
  description,
  category,
  href,
  readTime,
  popularity,
  isNew
}: RecommendationCardProps) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Link to={href}>
        <Card className="h-full hover:shadow-md transition-all duration-200 border border-gray-800 bg-netflix-dark">
          <CardContent className="p-4">
            <div className="flex justify-between items-start mb-2">
              <Badge variant="secondary" className="text-xs bg-law-accent/10 text-law-accent">
                {category}
              </Badge>
              {isNew && (
                <Badge className="text-xs bg-green-500/10 text-green-500">
                  Novo
                </Badge>
              )}
            </div>
            
            <h3 className="font-semibold text-sm mb-2 line-clamp-2 text-white">
              {title}
            </h3>
            
            <p className="text-xs text-gray-400 line-clamp-2 mb-3">
              {description}
            </p>
            
            <div className="flex items-center gap-3 text-xs text-gray-500">
              {readTime && (
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {readTime}
                </div>
              )}
              
              {popularity && (
                <div className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {popularity}
                </div>
              )}
              
              <div className="flex items-center gap-1">
                <BookOpen className="h-3 w-3" />
                Estudar
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
};
