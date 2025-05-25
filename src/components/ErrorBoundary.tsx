
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-netflix-bg flex items-center justify-center p-4">
          <Card className="max-w-lg w-full bg-gray-800/60 border-gray-700/50">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <AlertTriangle className="h-12 w-12 text-yellow-500" />
              </div>
              <CardTitle className="text-white">Algo deu errado</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-center">
              <p className="text-gray-300">
                Ocorreu um erro inesperado. Tente recarregar a página ou entre em contato com o suporte.
              </p>
              <div className="flex gap-2 justify-center">
                <Button onClick={this.handleReset} variant="outline" className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Tentar novamente
                </Button>
                <Button onClick={() => window.location.reload()} className="bg-law-accent hover:bg-law-accent/90">
                  Recarregar página
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
