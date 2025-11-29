import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Calendar, User, LogIn, BarChart3, Users, LogOut, LayoutDashboard, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { userAPI, User as UserType } from "@/services/api";
import { toast } from "@/hooks/use-toast";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation(); // Para saber quando a rota mudou
  const [user, setUser] = useState<UserType | null>(null);

  // Verifica se o usuário está logado sempre que a rota mudar
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setUser(null);
        return;
      }

      try {
        // Busca os dados atualizados do usuário (incluindo role)
        const userData = await userAPI.getCurrent();
        setUser(userData);
      } catch (error) {
        console.log("Sessão inválida ou expirada", error);
        // Se der erro (token expirado), faz logout forçado
        localStorage.removeItem('token');
        setUser(null);
      }
    };

    checkAuth();
  }, [location.pathname]); // O array de dependência garante que o check roda ao navegar

  const handleLogout = () => {
    userAPI.logout();
    setUser(null);
    toast({
      title: "Saiu com sucesso",
      description: "Sua sessão foi encerrada.",
    });
    navigate("/");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          
          {/* LOGO */}
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center bg-primary/10 rounded-lg">
                <Calendar className="w-6 h-6 text-primary" />
            </div>
            <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent hidden sm:inline-block">
              Meninas Digitais
            </span>
          </Link>

          {/* MENU CENTRAL (Desktop) */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/events" className="text-foreground hover:text-primary transition-colors font-medium">
              Eventos
            </Link>
            <Link to="/about" className="text-foreground hover:text-primary transition-colors font-medium">
              Sobre
            </Link>
            
            {/* Links exclusivos para ADMIN */}
            {user?.role === 'admin' && (
              <>
                <Link to="/admin" className="text-foreground hover:text-primary transition-colors flex items-center gap-1 font-medium">
                  <Shield className="w-4 h-4" />
                  Admin
                </Link>
                <Link to="/admin/users" className="text-foreground hover:text-primary transition-colors flex items-center gap-1 font-medium">
                  <Users className="w-4 h-4" />
                  Usuários
                </Link>
              </>
            )}
          </div>

          {/* ÁREA DE AÇÃO (Direita) */}
          <div className="flex items-center gap-3">
            {user ? (
              // --- SE ESTIVER LOGADO ---
              <>
                <div className="hidden md:flex flex-col items-end mr-2">
                  <span className="text-sm font-semibold">{user.name}</span>
                  <span className="text-xs text-muted-foreground capitalize">
                    {user.role === 'admin' ? 'Administrador' : 'Participante'}
                  </span>
                </div>

                <Link to={user.role === 'admin' ? "/admin" : "/dashboard"}>
                  <Button variant="outline" size="sm" className="gap-2">
                    <LayoutDashboard className="w-4 h-4" />
                    <span className="hidden sm:inline">Painel</span>
                  </Button>
                </Link>
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleLogout}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  title="Sair"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </>
            ) : (
              // --- SE NÃO ESTIVER LOGADO ---
              <>
                <Link to="/auth">
                  <Button variant="ghost" size="sm" className="gap-2">
                    <LogIn className="w-4 h-4" />
                    <span className="hidden sm:inline">Entrar</span>
                  </Button>
                </Link>
                <Link to="/auth">
                  <Button size="sm" className="gap-2 bg-gradient-primary hover:opacity-90 shadow-button">
                    <User className="w-4 h-4" />
                    <span className="hidden sm:inline">Cadastrar</span>
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;