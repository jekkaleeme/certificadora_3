import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";

const NotFound = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center max-w-md animate-fade-in">
        <div className="mb-8">
          <h1 className="text-9xl font-bold bg-gradient-meninas bg-clip-text text-transparent">
            404
          </h1>
        </div>
        
        <h2 className="text-3xl font-bold mb-4">Página não encontrada</h2>
        
        <p className="text-muted-foreground mb-8">
          Desculpe, a página que você está procurando não existe ou foi movida.
        </p>
        
        <div className="flex gap-4 justify-center">
          <Link to="/">
            <Button size="lg" className="gap-2 bg-gradient-meninas hover:opacity-90">
              <Home className="w-4 h-4" />
              Página Inicial
            </Button>
          </Link>
          
          <Button 
            variant="outline" 
            size="lg" 
            className="gap-2"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
