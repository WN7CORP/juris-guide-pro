
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator 
} from '@/components/ui/dropdown-menu';
import { User, LogOut, StickyNote, Headphones, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';

export const UserMenu = () => {
  const { user, signOut } = useAuth();
  
  if (!user) {
    return (
      <Link to="/auth">
        <Button variant="outline" size="sm" className="text-sm">
          Entrar
        </Button>
      </Link>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="flex items-center gap-2 hover:bg-gray-800/50">
          <User className="h-4 w-4" />
          <span className="hidden md:inline">
            {user.email?.split('@')[0] || 'Usuário'}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 bg-netflix-dark border-gray-700">
        <DropdownMenuItem asChild>
          <Link to="/anotacoes" className="flex items-center gap-2 cursor-pointer">
            <StickyNote className="h-4 w-4" />
            Minhas Anotações
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/audio-comentarios" className="flex items-center gap-2 cursor-pointer">
            <Headphones className="h-4 w-4" />
            Comentários
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-gray-700" />
        <DropdownMenuItem onClick={signOut} className="flex items-center gap-2 cursor-pointer text-red-400 hover:text-red-300">
          <LogOut className="h-4 w-4" />
          Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
