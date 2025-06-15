
import { Book, Headphones } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AudioPlayerTabsProps {
  activeSection: 'text' | 'audio';
  setActiveSection: (section: 'text' | 'audio') => void;
}

const AudioPlayerTabs = ({ activeSection, setActiveSection }: AudioPlayerTabsProps) => {
  return (
    <div className="flex bg-netflix-dark border-b border-gray-700 flex-shrink-0">
      <Button
        variant={activeSection === 'text' ? 'default' : 'ghost'}
        onClick={() => setActiveSection('text')}
        className={`flex-1 rounded-none border-b-2 ${
          activeSection === 'text' 
            ? 'border-cyan-400 bg-cyan-500/10 text-cyan-400' 
            : 'border-transparent text-gray-400'
        }`}
      >
        <Book className="h-4 w-4 mr-2" />
        Texto do Artigo
      </Button>
      <Button
        variant={activeSection === 'audio' ? 'default' : 'ghost'}
        onClick={() => setActiveSection('audio')}
        className={`flex-1 rounded-none border-b-2 ${
          activeSection === 'audio' 
            ? 'border-cyan-400 bg-cyan-500/10 text-cyan-400' 
            : 'border-transparent text-gray-400'
        }`}
      >
        <Headphones className="h-4 w-4 mr-2" />
        Comentário
      </Button>
    </div>
  );
};

export default AudioPlayerTabs;
