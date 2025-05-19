
import { AlertCircle } from "lucide-react";

interface AudioErrorMessageProps {
  errorMessage: string;
}

const AudioErrorMessage = ({ errorMessage }: AudioErrorMessageProps) => {
  if (!errorMessage) return null;
  
  return (
    <div className="mb-4 p-3 bg-red-900/20 border border-red-800 rounded-md text-sm text-red-400 flex items-center gap-2">
      <AlertCircle className="h-4 w-4 text-red-400" />
      <span>Erro ao reproduzir áudio: {errorMessage}</span>
    </div>
  );
};

export default AudioErrorMessage;
