
import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { BookOpen, BookmarkCheck, FileText, Scale } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export type LegalCategory = "códigos" | "estatutos" | "constituição" | "leis";

interface CodeGroup {
  id: string;
  title: string;
  category: LegalCategory;
  icon: JSX.Element;
}

interface AudioCategorySelectorProps {
  codes: CodeGroup[];
  onSelectCode: (codeId: string) => void;
  currentCodeId: string | null;
}

export const AudioCategorySelector = ({
  codes,
  onSelectCode,
  currentCodeId
}: AudioCategorySelectorProps) => {
  // Group codes by category
  const categories = codes.reduce((acc, code) => {
    if (!acc[code.category]) {
      acc[code.category] = [];
    }
    acc[code.category].push(code);
    return acc;
  }, {} as Record<LegalCategory, CodeGroup[]>);

  // Default selected category
  const [selectedCategory, setSelectedCategory] = useState<LegalCategory>("códigos");

  return (
    <div>
      <Tabs 
        defaultValue="códigos" 
        className="w-full" 
        onValueChange={(value) => setSelectedCategory(value as LegalCategory)}
      >
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="códigos" className="data-[state=active]:bg-blue-800/20">
            <BookOpen className="h-4 w-4 mr-1 text-blue-400" />
            <span className="hidden sm:inline">Códigos</span>
          </TabsTrigger>
          <TabsTrigger value="estatutos" className="data-[state=active]:bg-green-800/20">
            <BookmarkCheck className="h-4 w-4 mr-1 text-green-400" />
            <span className="hidden sm:inline">Estatutos</span>
          </TabsTrigger>
          <TabsTrigger value="constituição" className="data-[state=active]:bg-amber-800/20">
            <FileText className="h-4 w-4 mr-1 text-amber-400" />
            <span className="hidden sm:inline">Constituição</span>
          </TabsTrigger>
          <TabsTrigger value="leis" className="data-[state=active]:bg-red-800/20">
            <Scale className="h-4 w-4 mr-1 text-red-400" />
            <span className="hidden sm:inline">Leis</span>
          </TabsTrigger>
        </TabsList>

        {(Object.keys(categories) as LegalCategory[]).map(category => (
          <TabsContent key={category} value={category} className="mt-0">
            <Accordion 
              type="single" 
              collapsible 
              className="border rounded-lg border-gray-800"
            >
              {categories[category]?.map(code => (
                <AccordionItem key={code.id} value={code.id} className="border-b border-gray-800 last:border-0">
                  <AccordionTrigger
                    className={cn(
                      "px-4 hover:bg-gray-800/30",
                      currentCodeId === code.id ? "bg-gray-800/40 text-law-accent" : ""
                    )}
                    onClick={() => onSelectCode(code.id)}
                  >
                    <div className="flex items-center gap-2">
                      {code.icon}
                      <span>{code.title}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4">
                    <div className="py-2 text-sm text-gray-400">
                      Clique para ver os artigos com comentários em áudio.
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}

              {!categories[category]?.length && (
                <div className="p-4 text-center text-gray-500">
                  Nenhum código encontrado nesta categoria.
                </div>
              )}
            </Accordion>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default AudioCategorySelector;
