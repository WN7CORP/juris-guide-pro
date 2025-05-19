
import { Volume } from "lucide-react";
import { Card } from "@/components/ui/card";

interface EmptyAudioListProps {
  message?: string;
}

const EmptyAudioList = ({ message = "Não há comentários em áudio disponíveis para este código legal." }: EmptyAudioListProps) => {
  return (
    <Card className="p-4 mb-6 bg-background-dark border border-gray-800">
      <div className="flex flex-col items-center justify-center py-4 text-center">
        <Volume className="h-8 w-8 text-gray-500 mb-2" />
        <h3 className="text-lg font-serif font-bold text-law-accent mb-2">
          Artigos Comentados
        </h3>
        <p className="text-gray-400 text-sm">
          {message}
        </p>
      </div>
    </Card>
  );
};

export default EmptyAudioList;
