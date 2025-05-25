
import { Button } from "@/components/ui/button";
import { Search, Bookmark, Clock, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export const QuickActions = () => {
  const navigate = useNavigate();

  const actions = [
    {
      icon: Search,
      label: "Pesquisar",
      action: () => navigate("/pesquisar"),
      color: "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20"
    },
    {
      icon: Bookmark,
      label: "Favoritos",
      action: () => navigate("/favoritos"),
      color: "bg-green-500/10 text-green-500 hover:bg-green-500/20"
    },
    {
      icon: Clock,
      label: "Recentes",
      action: () => {
        const recentCodes = JSON.parse(localStorage.getItem('recentCodes') || '[]');
        if (recentCodes.length > 0) {
          navigate(`/codigos/${recentCodes[0]}`);
        }
      },
      color: "bg-orange-500/10 text-orange-500 hover:bg-orange-500/20"
    },
    {
      icon: TrendingUp,
      label: "Populares",
      action: () => navigate("/codigos"),
      color: "bg-purple-500/10 text-purple-500 hover:bg-purple-500/20"
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {actions.map((action, index) => (
        <motion.div
          key={action.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Button
            variant="ghost"
            onClick={action.action}
            className={`w-full h-20 flex flex-col gap-2 ${action.color}`}
          >
            <action.icon className="h-6 w-6" />
            <span className="text-xs font-medium">{action.label}</span>
          </Button>
        </motion.div>
      ))}
    </div>
  );
};
