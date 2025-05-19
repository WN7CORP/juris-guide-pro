
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { MobileFooter } from "@/components/MobileFooter";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { BookOpen, ChevronDown, CirclePlay, Info, Search, Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getAllLegalCodes, getLegalCodesByCategory, getPopularLegalCodes } from "@/services/legalCodeService";

const Index = () => {
  const [allCodes, setAllCodes] = useState<{id: string, title: string, count: number}[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadCodes = async () => {
      try {
        const codes = await getAllLegalCodes();
        setAllCodes(codes);
      } catch (error) {
        console.error("Error loading legal codes:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadCodes();
  }, []);
  
  const popularCodes = getPopularLegalCodes();
  const codesByCategory = getLegalCodesByCategory();

  return (
    <div className="min-h-screen flex flex-col dark">
      <Header />
      
      <main className="flex-1 container py-6 pb-20 md:pb-6 px-4">
        {/* Hero Section */}
        <section className="mb-8">
          <div className="bg-gradient-to-br from-netflix-bg via-netflix-dark to-netflix-bg rounded-lg p-6 mb-6">
            <h1 className="text-4xl font-serif font-bold text-netflix-red mb-2">
              Vade Mecum Digital
            </h1>
            <p className="text-gray-300 mb-4 max-w-2xl">
              Seu guia jurídico digital completo. Navegue pelos principais códigos e estatutos 
              com explicações técnicas, formais e exemplos práticos.
            </p>
            <div className="flex flex-wrap gap-3 mt-4">
              <Button asChild className="bg-netflix-red hover:bg-netflix-red/90">
                <Link to="/pesquisar">
                  <Search className="mr-2 h-4 w-4" />
                  Pesquisar Legislação
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/favoritos">
                  <Bookmark className="mr-2 h-4 w-4" />
                  Meus Favoritos
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Popular Codes Section */}
        <section className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-serif font-bold text-white">
              <CirclePlay className="inline-block mr-2 h-6 w-6 text-netflix-red" />
              Códigos Populares
            </h2>
            <Link to="/codigos" className="text-netflix-red hover:underline text-sm">
              Ver todos
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {popularCodes.map((code) => (
              <Card key={code.id} className="bg-netflix-dark border border-gray-800 hover:border-gray-700 transition-all">
                <CardHeader className="pb-2">
                  <CardTitle className="text-netflix-red font-serif">{code.title}</CardTitle>
                </CardHeader>
                <CardContent className="pb-3">
                  <CardDescription className="text-gray-400 line-clamp-2">
                    {code.description}
                  </CardDescription>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full bg-gray-800 hover:bg-gray-700">
                    <Link to={`/codigos/${code.id}`}>
                      <BookOpen className="mr-2 h-4 w-4" />
                      Acessar
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </section>

        {/* Browse by Categories Section */}
        <section className="mb-8">
          <h2 className="text-2xl font-serif font-bold text-white mb-4">
            <Info className="inline-block mr-2 h-6 w-6 text-netflix-red" />
            Códigos por Categoria
          </h2>
          
          <Tabs defaultValue="direito-civil" className="w-full">
            <TabsList className="mb-4 bg-netflix-bg border border-gray-800">
              {codesByCategory.map((category) => (
                <TabsTrigger key={category.category} value={category.category.toLowerCase().replace(/\s+/g, '-')}>
                  {category.category}
                </TabsTrigger>
              ))}
            </TabsList>

            {codesByCategory.map((category) => (
              <TabsContent 
                key={category.category} 
                value={category.category.toLowerCase().replace(/\s+/g, '-')} 
                className="border border-gray-800 rounded-md p-4 bg-netflix-dark/50"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {category.codes.map((code) => (
                    <Link
                      key={code.id}
                      to={`/codigos/${code.id}`}
                      className="p-3 bg-netflix-dark border border-gray-800 rounded-md hover:border-gray-700 transition-all flex items-center justify-between"
                    >
                      <span className="font-medium text-gray-200">{code.title}</span>
                      <BookOpen className="h-4 w-4 text-netflix-red" />
                    </Link>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </section>

        {/* All Legal Codes Section */}
        <section>
          <h2 className="text-2xl font-serif font-bold text-white mb-4">
            <BookOpen className="inline-block mr-2 h-6 w-6 text-netflix-red" />
            Todos os Códigos e Estatutos
          </h2>
          
          <div className="border border-gray-800 rounded-md bg-netflix-dark/50 overflow-hidden">
            <ScrollArea className="h-[400px]">
              {loading ? (
                <div className="p-6 text-center">Carregando...</div>
              ) : (
                <div className="p-4">
                  <Collapsible>
                    <CollapsibleTrigger asChild>
                      <div className="flex justify-between items-center p-2 mb-3 cursor-pointer hover:bg-gray-800/50 rounded-md">
                        <h3 className="text-lg font-medium text-gray-200">Códigos</h3>
                        <ChevronDown className="h-5 w-5" />
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
                        {allCodes
                          .filter(code => code.id.includes("Código"))
                          .map(code => (
                            <Link
                              key={code.id}
                              to={`/codigos/${code.id}`}
                              className="flex items-center justify-between p-3 bg-netflix-bg border border-gray-800 rounded-md hover:border-gray-700"
                            >
                              <span className="text-gray-200">{code.title}</span>
                              <Badge variant="outline" className="ml-2">{code.count} artigos</Badge>
                            </Link>
                          ))}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>

                  <Collapsible>
                    <CollapsibleTrigger asChild>
                      <div className="flex justify-between items-center p-2 mb-3 cursor-pointer hover:bg-gray-800/50 rounded-md">
                        <h3 className="text-lg font-medium text-gray-200">Estatutos</h3>
                        <ChevronDown className="h-5 w-5" />
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {allCodes
                          .filter(code => code.id.includes("Estatuto"))
                          .map(code => (
                            <Link
                              key={code.id}
                              to={`/codigos/${code.id}`}
                              className="flex items-center justify-between p-3 bg-netflix-bg border border-gray-800 rounded-md hover:border-gray-700"
                            >
                              <span className="text-gray-200">{code.title}</span>
                              <Badge variant="outline" className="ml-2">{code.count} artigos</Badge>
                            </Link>
                          ))}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>

                  <Collapsible>
                    <CollapsibleTrigger asChild>
                      <div className="flex justify-between items-center p-2 mb-3 cursor-pointer hover:bg-gray-800/50 rounded-md">
                        <h3 className="text-lg font-medium text-gray-200">Constituição</h3>
                        <ChevronDown className="h-5 w-5" />
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {allCodes
                          .filter(code => code.id.includes("Constituicao"))
                          .map(code => (
                            <Link
                              key={code.id}
                              to={`/codigos/${code.id}`}
                              className="flex items-center justify-between p-3 bg-netflix-bg border border-gray-800 rounded-md hover:border-gray-700"
                            >
                              <span className="text-gray-200">{code.title}</span>
                              <Badge variant="outline" className="ml-2">{code.count} artigos</Badge>
                            </Link>
                          ))}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </div>
              )}
            </ScrollArea>
          </div>
        </section>
      </main>
      
      <MobileFooter />
    </div>
  );
};

export default Index;
