
import React from "react";
import { 
  AlertDialog, 
  AlertDialogContent, 
  AlertDialogTitle, 
  AlertDialogDescription, 
  AlertDialogCancel, 
  AlertDialogAction 
} from "@/components/ui/alert-dialog";

interface ErrorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  errorMessage: string;
}

const ErrorDialog = ({ open, onOpenChange, errorMessage }: ErrorDialogProps) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-background-dark">
        <AlertDialogTitle>Erro</AlertDialogTitle>
        <AlertDialogDescription>
          {errorMessage}
        </AlertDialogDescription>
        <div className="flex justify-end">
          <AlertDialogCancel onClick={() => onOpenChange(false)}>
            Fechar
          </AlertDialogCancel>
          <AlertDialogAction onClick={() => window.location.reload()}>
            Tentar Novamente
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ErrorDialog;
