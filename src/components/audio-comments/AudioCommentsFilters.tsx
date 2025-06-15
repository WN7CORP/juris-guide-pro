
import { motion } from "framer-motion";
import { Search, Filter } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AudioCommentsFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedCode: string;
  setSelectedCode: (code: string) => void;
  availableCodes: Array<{ id: string; title: string }>;
}

const AudioCommentsFilters = ({ 
  searchTerm, 
  setSearchTerm, 
  selectedCode, 
  setSelectedCode, 
  availableCodes 
}: AudioCommentsFiltersProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="mb-8"
    >
      <Card className="bg-netflix-dark border-gray-700">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por artigo, número ou código..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-netflix-bg border-gray-600 text-white placeholder-gray-400"
                />
              </div>
            </div>
            
            <div className="md:w-64">
              <Select value={selectedCode} onValueChange={setSelectedCode}>
                <SelectTrigger className="bg-netflix-bg border-gray-600 text-white">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filtrar por código" />
                </SelectTrigger>
                <SelectContent className="bg-netflix-dark border-gray-600 z-50">
                  <SelectItem value="all" className="text-white hover:bg-gray-700 focus:bg-gray-700">
                    Todos os códigos
                  </SelectItem>
                  {availableCodes.map(code => (
                    <SelectItem key={code.id} value={code.id} className="text-white hover:bg-gray-700 focus:bg-gray-700">
                      {code.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default AudioCommentsFilters;
