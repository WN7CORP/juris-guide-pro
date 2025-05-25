
import { useAuth } from '@/hooks/useAuth';
import { User } from 'lucide-react';
import { Link } from 'react-router-dom';

export const UserMenu = () => {
  const { user } = useAuth();
  
  return (
    <Link to={user ? "/profile" : "/auth"}>
      <div className="flex flex-col items-center justify-center gap-1 p-2 rounded-lg transition-all duration-200 text-gray-300 hover:text-white hover:bg-gray-800/50">
        <User className="h-5 w-5" />
        <span className="text-xs font-medium">Perfil</span>
      </div>
    </Link>
  );
};
