
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { BookOpen, Search, Plus, Edit3, Trash2, Filter, Calendar, Book } from "lucide-react";
import { useNotesStore, type Note } from "@/store/notesStore";
import { legalCodes } from "@/data/legalCodes";
import { toast } from "sonner";

const Anotacoes = () => {
  const { notes, addNote, updateNote, deleteNote } = useNotesStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedCode, setSelectedCode] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  
  // Form state
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");
  const [codeId, setCodeId] = useState("");
  const [articleNumber, setArticleNumber] = useState("");

  // Reset form
  const resetForm = () => {
    setTitle("");
    setContent("");
    setCategory("");
    setCodeId("");
    setArticleNumber("");
    setEditingNote(null);
  };

  // Handle dialog close
  const handleDialogClose = () => {
    setIsDialogOpen(false);
    resetForm();
  };

  // Handle edit
  const handleEdit = (note: Note) => {
    setEditingNote(note);
    setTitle(note.title);
    setContent(note.content);
    setCategory(note.category);
    setCodeId(note.codeId || "");
    setArticleNumber(note.articleNumber || "");
    setIsDialogOpen(true);
  };

  // Handle save
  const handleSave = () => {
    if (!title.trim() || !content.trim()) {
      toast.error("Por favor, preencha título e conteúdo");
      return;
    }

    const noteData = {
      title: title.trim(),
      content: content.trim(),
      category: category.trim(),
      codeId: codeId || undefined,
      articleNumber: articleNumber || undefined,
    };

    if (editingNote) {
      updateNote(editingNote.id, noteData);
      toast.success("Anotação atualizada com sucesso!");
    } else {
      addNote(noteData);
      toast.success("Anotação criada com sucesso!");
    }

    handleDialogClose();
  };

  // Handle delete
  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja excluir esta anotação?")) {
      deleteNote(id);
      toast.success("Anotação excluída com sucesso!");
    }
  };

  // Filter notes
  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         note.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === "all" || note.category === selectedCategory;
    const matchesCode = selectedCode === "all" || note.codeId === selectedCode;
    
    return matchesSearch && matchesCategory && matchesCode;
  });

  // Get unique categories and codes
  const categories = Array.from(new Set(notes.map(note => note.category).filter(Boolean)));
  const usedCodes = Array.from(new Set(notes.map(note => note.codeId).filter(Boolean)));

  // Group notes by code and article
  const groupedNotes = filteredNotes.reduce((acc, note) => {
    const key = note.codeId ? `${note.codeId}-${note.articleNumber || 'geral'}` : 'geral';
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(note);
    return acc;
  }, {} as Record<string, Note[]>);

  return (
    <div className="min-h-screen flex flex-col dark bg-netflix-bg">
      <Header />
      
      <main className="flex-1 container pt-4 pb-6 animate-fade-in">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/40">
                <BookOpen className="h-8 w-8 text-blue-400" />
              </div>
              <div>
                <h1 className="text-3xl font-serif font-bold text-netflix-red">
                  Minhas Anotações
                </h1>
                <p className="text-gray-400 mt-1">
                  Organize suas anotações jurídicas
                </p>
              </div>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Anotação
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md bg-netflix-dark border-gray-700">
                <DialogHeader>
                  <DialogTitle className="text-white">
                    {editingNote ? "Editar Anotação" : "Nova Anotação"}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-2 block">
                      Título
                    </label>
                    <Input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Título da anotação"
                      className="bg-netflix-bg border-gray-600 text-white"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-2 block">
                      Categoria
                    </label>
                    <Input
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      placeholder="Ex: Direito Penal, Constitucional..."
                      className="bg-netflix-bg border-gray-600 text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium text-gray-300 mb-2 block">
                        Código
                      </label>
                      <Select value={codeId} onValueChange={setCodeId}>
                        <SelectTrigger className="bg-netflix-bg border-gray-600 text-white">
                          <SelectValue placeholder="Selecionar código" />
                        </SelectTrigger>
                        <SelectContent className="bg-netflix-dark border-gray-600">
                          <SelectItem value="" className="text-white">Nenhum</SelectItem>
                          {legalCodes.map(code => (
                            <SelectItem key={code.id} value={code.id} className="text-white">
                              {code.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-300 mb-2 block">
                        Artigo
                      </label>
                      <Input
                        value={articleNumber}
                        onChange={(e) => setArticleNumber(e.target.value)}
                        placeholder="Ex: 157"
                        className="bg-netflix-bg border-gray-600 text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-2 block">
                      Conteúdo
                    </label>
                    <Textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="Escreva sua anotação aqui..."
                      className="bg-netflix-bg border-gray-600 text-white min-h-[120px] resize-none"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button variant="outline" onClick={handleDialogClose}>
                      Cancelar
                    </Button>
                    <Button onClick={handleSave} className="bg-law-accent hover:bg-law-accent/80">
                      {editingNote ? "Atualizar" : "Salvar"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-6 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              <span>{notes.length} anotações</span>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <span>{categories.length} categorias</span>
            </div>
          </div>
        </motion.div>

        {/* Filters Section */}
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
                      placeholder="Buscar anotações..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-netflix-bg border-gray-600 text-white placeholder-gray-400"
                    />
                  </div>
                </div>
                
                <div className="md:w-48">
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="bg-netflix-bg border-gray-600 text-white">
                      <SelectValue placeholder="Categoria" />
                    </SelectTrigger>
                    <SelectContent className="bg-netflix-dark border-gray-600">
                      <SelectItem value="all" className="text-white">Todas as categorias</SelectItem>
                      {categories.map(cat => (
                        <SelectItem key={cat} value={cat} className="text-white">
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="md:w-48">
                  <Select value={selectedCode} onValueChange={setSelectedCode}>
                    <SelectTrigger className="bg-netflix-bg border-gray-600 text-white">
                      <SelectValue placeholder="Código" />
                    </SelectTrigger>
                    <SelectContent className="bg-netflix-dark border-gray-600">
                      <SelectItem value="all" className="text-white">Todos os códigos</SelectItem>
                      {usedCodes.map(codeId => {
                        const code = legalCodes.find(c => c.id === codeId);
                        return (
                          <SelectItem key={codeId} value={codeId} className="text-white">
                            {code?.title || codeId}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Notes Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="space-y-6"
        >
          {Object.entries(groupedNotes).map(([groupKey, groupNotes]) => {
            const isCodeGroup = groupKey !== 'geral';
            const [codeId, articleNumber] = groupKey.split('-');
            const code = isCodeGroup ? legalCodes.find(c => c.id === codeId) : null;
            
            return (
              <div key={groupKey} className="space-y-3">
                {isCodeGroup && (
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-full bg-law-accent/20">
                      <Book className="h-4 w-4 text-law-accent" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        {code?.title || codeId}
                      </h3>
                      {articleNumber !== 'geral' && (
                        <p className="text-sm text-gray-400">
                          Artigo {articleNumber}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {groupNotes.map((note, index) => (
                    <motion.div
                      key={note.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <Card className="h-full bg-gradient-to-br from-netflix-dark to-gray-900 border border-gray-700 hover:border-blue-500/50 transition-all duration-300">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="text-lg text-white mb-2 line-clamp-2">
                                {note.title}
                              </CardTitle>
                              <div className="flex items-center gap-2 mb-3">
                                {note.category && (
                                  <Badge className="text-xs bg-blue-500/20 text-blue-400 border-blue-500/30">
                                    {note.category}
                                  </Badge>
                                )}
                                {note.codeId && note.articleNumber && (
                                  <Badge variant="outline" className="text-xs text-gray-400 border-gray-600">
                                    Art. {note.articleNumber}
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-1 ml-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(note)}
                                className="h-8 w-8 p-0 text-gray-400 hover:text-blue-400"
                              >
                                <Edit3 className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(note.id)}
                                className="h-8 w-8 p-0 text-gray-400 hover:text-red-400"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </CardHeader>

                        <CardContent className="pt-0">
                          <p className="text-sm text-gray-300 line-clamp-4 leading-relaxed mb-4">
                            {note.content}
                          </p>
                          
                          <div className="flex items-center text-xs text-gray-500">
                            <Calendar className="h-3 w-3 mr-1" />
                            <span>
                              {new Date(note.createdAt).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>
            );
          })}
        </motion.div>

        {/* Empty State */}
        {filteredNotes.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center py-12"
          >
            <div className="p-4 rounded-full bg-gray-800/50 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <BookOpen className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-300 mb-2">
              {searchTerm || selectedCategory !== "all" || selectedCode !== "all" 
                ? "Nenhuma anotação encontrada" 
                : "Nenhuma anotação criada ainda"
              }
            </h3>
            <p className="text-gray-400 text-sm">
              {searchTerm || selectedCategory !== "all" || selectedCode !== "all"
                ? "Tente ajustar os filtros ou termo de busca"
                : "Crie sua primeira anotação clicando no botão acima"
              }
            </p>
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default Anotacoes;
