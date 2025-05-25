
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { User, LogOut, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';

export const UserMenu = () => {
  const { user, signOut } = useAuth();
  
  if (!user) {
    return (
      <Link to="/auth">
        <Button variant="outline" size="sm">
          Entrar
        </Button>
      </Link>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="flex items-center gap-2">
          <User className="h-4 w-4" />
          {user.email?.split('@')[0] || 'Usuário'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem asChild>
          <Link to="/anotacoes" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Minhas Anotações
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={signOut} className="flex items-center gap-2">
          <LogOut className="h-4 w-4" />
          Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
