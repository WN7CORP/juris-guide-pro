
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Scale, FileText, Gavel, Volume } from "lucide-react";
import { legalCodes } from "@/data/legalCodes";

interface StatItem {
  label: string;
  value: number;
  icon: React.ComponentType<any>;
  color: string;
}

export const StatisticsCounter = () => {
  const [stats, setStats] = useState<StatItem[]>([
    { label: "Códigos", value: 0, icon: Scale, color: "text-law-accent" },
    { label: "Leis", value: 0, icon: FileText, color: "text-amber-400" },
    { label: "Estatutos", value: 0, icon: Gavel, color: "text-netflix-red" },
    { label: "Comentários", value: 0, icon: Volume, color: "text-blue-400" }
  ]);

  useEffect(() => {
    // Calculate real statistics
    const codigosCount = legalCodes.filter(code => code.category === 'código').length;
    const leisCount = legalCodes.filter(code => code.category === 'lei').length;
    const estatutosCount = legalCodes.filter(code => code.category === 'estatuto').length;
    const comentariosCount = 150; // Estimated number of audio comments

    const realStats = [
      { label: "Códigos", value: codigosCount, icon: Scale, color: "text-law-accent" },
      { label: "Leis", value: leisCount, icon: FileText, color: "text-amber-400" },
      { label: "Estatutos", value: estatutosCount, icon: Gavel, color: "text-netflix-red" },
      { label: "Comentários", value: comentariosCount, icon: Volume, color: "text-blue-400" }
    ];

    // Animate counters
    const duration = 2000; // 2 seconds
    const steps = 60;
    const stepTime = duration / steps;

    realStats.forEach((stat, statIndex) => {
      let currentStep = 0;
      const increment = stat.value / steps;

      const interval = setInterval(() => {
        currentStep++;
        const currentValue = Math.min(Math.floor(increment * currentStep), stat.value);
        
        setStats(prevStats => 
          prevStats.map((prevStat, index) => 
            index === statIndex ? { ...prevStat, value: currentValue } : prevStat
          )
        );

        if (currentStep >= steps) {
          clearInterval(interval);
        }
      }, stepTime);
    });
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6"
    >
      {stats.map((stat, index) => {
        const IconComponent = stat.icon;
        return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.1 * index }}
            className="bg-background-dark/60 backdrop-blur-sm border border-gray-800/50 rounded-lg p-4 text-center"
          >
            <IconComponent className={`h-6 w-6 mx-auto mb-2 ${stat.color}`} />
            <div className="text-2xl font-bold text-white mb-1">
              {stat.value.toLocaleString()}
            </div>
            <div className="text-xs text-gray-400">
              {stat.label}
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
};

export default StatisticsCounter;
